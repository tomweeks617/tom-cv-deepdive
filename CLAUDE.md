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

Next.js App Router + TypeScript + Tailwind v4, deployed on Vercel. One page, one API route. **No RAG, no database, no auth** — the AI chat (Phase 3) concatenates all of `/content/*.md` into a prompt-cached system prompt via the official `@anthropic-ai/sdk` and streams responses. Don't introduce vector stores, LangChain, or datastores — this is a deliberate, documented decision.

Key locations:

- `config/site.ts` — profile data, contact, example chat questions (edit chips here)
- `config/cv.ts` — structured CV data driving the on-page CV components
- `components/` — Hero + `cv/` section components; `chat/` arrives in Phase 3
- `content/` — (Phase 2) markdown knowledge base written *for the model*; deliberately separate from the on-page CV, which is written for skimming recruiters. This duplication is intentional — don't unify them.
- `claude/DESIGN.md` — design doc and progress tracker
- `CV/` — original CV source (markdown + PDF); `public/tom_weeks_cv.pdf` is a copy for download

## Conventions

- The AI assistant speaks about Tom in the **third person** and is clearly labelled as AI.
- Tom's phone number stays off the webpage (email only); it lives only in the PDF.
- Styling uses CSS custom-property tokens defined in `app/globals.css` (`--accent`, `--muted`, etc.) mapped into Tailwind via `@theme inline` — use the token classes (`text-accent`, `border-border`, …), not raw colours.
- Model/config values (e.g. `ANTHROPIC_MODEL`) come from env vars, never hardcoded.
