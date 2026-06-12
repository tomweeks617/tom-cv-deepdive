import { createHash } from "crypto";
import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadCvContent } from "@/lib/context";
import { buildSystemPrompt } from "@/lib/prompts";
import { logEvent } from "@/lib/log";

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

// Coarse per-visitor grouping for the question log without storing raw
// IPs. Not reversible in practice, but not salted either — treat it as
// pseudonymous, not anonymous.
function visitorId(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 12);
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
      { error: "Too many requests. Please wait a minute and try again." },
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
      { error: "The assistant isn't configured yet. Please try again later." },
      { status: 500 }
    );
  }

  // Question log — the single most valuable future dataset: what do
  // recruiters actually ask? after() defers it past the response so it
  // adds no latency; Vercel keeps the function alive until it settles.
  after(() =>
    logEvent({
      event: "chat_question",
      visitor: visitorId(ip),
      turn: messages.filter((m) => m.role === "user").length,
      question: messages[messages.length - 1].content,
    })
  );

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

  // Usage log once the answer completes. The cache_* fields confirm
  // prompt caching is hitting (cache_read > 0 after the first request).
  // Stream errors are already logged by the stream handler below.
  after(async () => {
    try {
      const msg = await stream.finalMessage();
      await logEvent({
        event: "chat_answer",
        visitor: visitorId(ip),
        answer: msg.content
          .filter((block) => block.type === "text")
          .map((block) => block.text)
          .join(""),
        model: msg.model,
        stop_reason: msg.stop_reason,
        input_tokens: msg.usage.input_tokens,
        output_tokens: msg.usage.output_tokens,
        cache_read_input_tokens: msg.usage.cache_read_input_tokens,
        cache_creation_input_tokens: msg.usage.cache_creation_input_tokens,
      });
    } catch {
      // finalMessage rejects when the stream errored; already logged.
    }
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
