import Anthropic from "@anthropic-ai/sdk";
import { loadCvContent } from "@/lib/context";
import { buildSystemPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 20; // total user messages per conversation
const HISTORY_WINDOW = 16; // last ~8 exchanges sent to the model

// Best-effort in-memory rate limit. Resets on redeploy/cold start and is
// per-instance on serverless — the real backstop is the Anthropic Console
// spend limit (DESIGN.md, decision 9).
const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return false;
}

type IncomingMessage = { role: "user" | "assistant"; content: string };

function validateMessages(body: unknown): IncomingMessage[] | null {
  if (typeof body !== "object" || body === null) return null;
  const { messages } = body as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const valid: IncomingMessage[] = [];
  for (const m of messages) {
    if (
      typeof m !== "object" ||
      m === null ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.trim().length === 0 ||
      m.content.length > MAX_MESSAGE_CHARS
    ) {
      return null;
    }
    valid.push({ role: m.role, content: m.content });
  }

  if (valid[valid.length - 1].role !== "user") return null;
  if (valid.filter((m) => m.role === "user").length > MAX_TURNS) return null;
  return valid;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many requests — please wait a minute and try again." },
      { status: 429 }
    );
  }

  let messages: IncomingMessage[] | null;
  try {
    messages = validateMessages(await req.json());
  } catch {
    messages = null;
  }
  if (!messages) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    return Response.json(
      { error: "The assistant isn't configured yet — please try again later." },
      { status: 500 }
    );
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const system = buildSystemPrompt(await loadCvContent());
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

  const stream = client.messages.stream({
    model,
    max_tokens: 1024,
    // The effort parameter is Opus-only; Sonnet/Haiku reject it with a 400.
    ...(model.includes("opus") && {
      output_config: { effort: "medium" as const },
    }),
    system,
    messages: messages.slice(-HISTORY_WINDOW),
  });

  const encoder = new TextEncoder();
  // The SDK emits "end" even after "error", so settle exactly once.
  let settled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (text) => {
        if (!settled) controller.enqueue(encoder.encode(text));
      });
      stream.on("end", () => {
        if (settled) return;
        settled = true;
        controller.close();
      });
      stream.on("error", (err) => {
        console.error("anthropic stream error:", err);
        if (settled) return;
        settled = true;
        controller.error(err);
      });
    },
    cancel() {
      settled = true;
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
