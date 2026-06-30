# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"CV Deep Dive" — an interactive version of Tom Weeks' CV: a static CV webpage plus an AI chat (Claude API) that answers recruiter questions grounded only in markdown content Tom has written.

**Read `claude/DESIGN.md` first** — it holds the full architecture, key decisions with rationale, the phased plan, and a progress log. Keep it updated as work progresses (tick checkboxes, append to the progress log, record new decisions in the decisions table).

## Commands

- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build (Next.js 16, Turbopack); must pass before considering work done
- `npm run lint` — ESLint
- No test suite.

## Architecture (the short version)

Next.js App Router + TypeScript + Tailwind v4, deployed on Vercel. One page (`app/page.tsx`), one API route (`app/api/chat/route.ts`). **No RAG, no database, no auth** — the AI chat concatenates all of `/content/*.md` into a prompt-cached system prompt via the official `@anthropic-ai/sdk` and streams plain text (not SSE) to the client. Don't introduce vector stores, LangChain, or datastores — this is a deliberate, documented decision.

Key locations:

- `config/site.ts` — profile data, contact, example chat questions (edit chips here)
- `config/cv.ts` — structured CV data driving the on-page CV components
- `components/` — Hero + `cv/` section components; `chat/` for Chat, Message, PromptChips
- `content/` — markdown knowledge base written *for the model*; deliberately separate from the on-page CV. This duplication is intentional — don't unify them.
- `lib/context.ts` — loads and concatenates `/content/*.md`, strips `<!-- -->` comments, wraps each file in an XML tag named after the file (`<checkout>…</checkout>`). Module-level cached in production so the string is byte-identical across requests (required for prompt caching to hit).
- `lib/prompts.ts` — builds the two-block system prompt; `cache_control: {type: "ephemeral"}` sits on the last block so the whole prefix is cached.
- `lib/use-chat.ts` — client hook; reads the streaming plain-text response via `ReadableStream`, appends chunks to the last assistant message in state.
- `lib/log.ts` — logs `chat_question` / `chat_answer` events to stdout and optionally to Axiom. Called via `after()` in the route so it never adds latency.
- `claude/DESIGN.md` — design doc and progress tracker
- `public/tom_weeks_cv.pdf` — the canonical CV artifact (served for download); when Tom updates his CV, replace this file and propagate changes to `config/cv.ts` and `/content`

## Environment variables

Defined in `.env.example`; copy to `.env.local` for local dev. Set the same vars in Vercel.

- `ANTHROPIC_API_KEY` — required; chat returns a 500 without it
- `ANTHROPIC_MODEL` — optional, defaults to `claude-opus-4-8`; swap to `claude-sonnet-4-6` or `claude-haiku-4-5-20251001` to reduce cost
- `AXIOM_TOKEN` / `AXIOM_DATASET` — optional; without them logs go to stdout only (~1h retention on Vercel Hobby)

## Conventions

- The AI assistant speaks about Tom in the **third person** and is clearly labelled as AI.
- Tom's phone number stays off the webpage (email only); it lives only in the PDF.
- Styling uses CSS custom-property tokens defined in `app/globals.css` (`--accent`, `--muted`, etc.) mapped into Tailwind via `@theme inline` — use the token classes (`text-accent`, `border-border`, …), not raw colours.
- Model/config values (e.g. `ANTHROPIC_MODEL`) come from env vars, never hardcoded.
- `<!-- TOM: … -->` HTML comments in `/content/*.md` are editorial TODOs for Tom; `lib/context.ts` strips them before they reach the model. Don't remove them programmatically except via that stripping logic.

## Known gotchas

- **`output_config.effort: "medium"` is Opus-only.** Haiku and Sonnet return a 400 if it's included. The route guards this with `model.includes("opus")`.
- **Prompt caching requires ≥4096 tokens (Opus) / ≥1024 tokens (Sonnet/Haiku).** A thin knowledge base silently won't cache; check `cache_creation_input_tokens` in the `chat_answer` log to confirm.
- **The Anthropic SDK emits `end` even after `error`.** The stream handler in `/api/chat/route.ts` guards against double-settling with a `settled` flag — preserve this pattern if editing the stream logic.
- **In-memory rate limit resets on redeploy/cold start** and is per-serverless-instance. It's best-effort; the Anthropic Console spend limit is the real backstop (see DESIGN.md decision 9).
