# CV Deep Dive — Design & Progress

An interactive version of Tom Weeks' CV. Recruiters and hiring managers can read the CV on a clean webpage, download the PDF, and ask an AI assistant questions about Tom's experience — answered only from content Tom has written.

**Goal:** a polished, simple, production-quality MVP buildable over a few weekends by one engineer. Simplicity and maintainability beat sophistication everywhere.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js (App Router) on Vercel             │
│                                             │
│  /            Static page: hero, CV, chat   │
│  /api/chat    Route handler                 │
│                 ├─ reads /content/*.md      │
│                 ├─ builds cached sys prompt │
│                 └─ streams text to client   │
│                                             │
│  /content/*.md     AI knowledge base        │
│  /public/cv.pdf    Download artifact        │
└──────────────┬──────────────────────────────┘
               │  Anthropic TypeScript SDK
               ▼
        Claude API (streaming, prompt caching)
```

- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Vercel, official `@anthropic-ai/sdk`.
- **No** database, auth, vector store, LangChain, analytics tooling, or background jobs. Conversation history lives in browser memory only.

## Key decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **No retrieval/RAG — concatenate all markdown into the system prompt** | Knowledge base is ~8–15k tokens vs a 1M context window. Concatenation has zero retrieval failures by construction; prompt caching makes it ~free. RAG only worth discussing >100k tokens. |
| 2 | **Content in `/content/*.md`, loaded server-side** | Editing the knowledge base = git commit + auto-deploy. No CMS. |
| 3 | **On-page CV is hand-built components, NOT rendered from `/content`** | Content files are written for the model (verbose, story-shaped); the visual CV is written for a skimming recruiter (terse, designed). One source for both makes both worse. Accepted duplication. |
| 4 | **Third-person AI assistant, clearly labelled — not a first-person "digital Tom"** | Transparency builds trust with recruiters; first-person impersonation reads as gimmicky. Includes "AI can make mistakes" disclaimer. *(Confirmed by Tom, 2026-06-11.)* |
| 5 | **Model: `claude-opus-4-8` default, configurable via `ANTHROPIC_MODEL` env var** | Answer quality is the product. Sonnet 4.6 / Haiku 4.5 are cost levers Tom can trial by flipping the env var. No `thinking` param (off by default, right for fast Q&A); `output_config.effort: "medium"` — **Opus-only**, the route omits it for other models (Haiku rejects it with a 400). *Tom is currently running Haiku 4.5 for cost (2026-06-11).* |
| 6 | **Prompt caching via `cache_control` breakpoint on last system block** | System prompt is byte-identical across requests → ~90% input cost reduction. Gotcha: Opus 4.8 minimum cacheable prefix is 4096 tokens — a stub knowledge base silently won't cache. |
| 7 | **Grounding via system prompt rules, tested adversarially** | Answer only from `<cv_content>`; if absent, say so and point to Tom's email. Decline off-topic requests (doubles as abuse/prompt-injection mitigation). |
| 8 | **No conversation persistence or question logging in MVP** | Recruiter sessions are short. Logging "what do recruiters ask" is the #1 future enhancement, deliberately out of scope (no datastores). |
| 9 | **Cost protection > cost optimisation** | Anthropic Console spend limit (~$25/mo) is the real backstop. Plus `max_tokens` ~1024, message length ≤1000 chars, ≤20 turns, send last ~8 turns only, best-effort in-memory per-IP rate limit. ~2¢/question on Opus. |
| 10 | **Phone number stays off the webpage** | Email is the public contact channel; phone remains in the downloadable PDF only. Mild privacy hygiene for a public site. |
| 11 | **Example questions live in `config/site.ts`** | Editing chips is a one-line typed-array change. |

## Folder structure

```
/app
  layout.tsx, page.tsx, globals.css
  api/chat/route.ts          ← the one API route (Phase 3)
/components
  Hero.tsx
  cv/                        ← CV section components
  chat/                      ← Chat.tsx, Message.tsx, PromptChips.tsx (Phase 3)
/content                     ← AI knowledge base (Phase 2)
  summary.md  skills.md  checkout.md  stenn.md
  ocado.md  wickes.md  education.md
/lib
  context.ts  prompts.ts  use-chat.ts   (Phase 3)
/config
  site.ts                    ← name, title, email, example questions
/public
  tom_weeks_cv.pdf, og-image.png, favicon
/claude
  DESIGN.md                  ← this document
/CV                          ← original CV source (md + pdf)
```

## System prompt shape (Phase 3)

```
[Persona + grounding rules]
<cv_content> ...all 7 markdown files, XML-tagged by source... </cv_content>
[Behavioural instructions: formatting, refusal policy, off-topic handling]
   ↑ cache_control: {type: "ephemeral"} on the last system block
[messages: trimmed history + new question]   ← only varying part
```

Rules: third person about Tom; answer only from content; cite the role/company; refuse off-topic politely; never invent numbers/employers/details.

---

## Phased plan & progress

### Phase 0 — Scaffold + deploy
- [x] Next.js + TypeScript + Tailwind scaffold *(2026-06-11)*
- [ ] Push to GitHub, connect Vercel *(Tom — Vercel connect is manual)*
- [ ] Custom domain

### Phase 1 — Static site (shippable on its own)
- [x] `config/site.ts` with profile data + example questions *(2026-06-11)*
- [x] Hero: name, title, summary, download CV button *(2026-06-11)*
- [x] CV sections: experience, skills, education *(2026-06-11)*
- [x] PDF in `/public`, download wired up *(2026-06-11)*
- [x] Responsive pass (mobile-first) *(2026-06-11)*
- [x] Metadata + OpenGraph tags *(2026-06-11)*
- [ ] OG image (designed: name, title, one metric) — TODO
- [ ] Favicon (replace Next default) — TODO
- [x] `npm run build` passes *(2026-06-11)*

### Phase 2 — Knowledge base (writing, not coding — quality ceiling of the product)
- [x] Draft all 7 `/content/*.md` files from the CV (facts only, nothing invented) *(2026-06-11)*
- [ ] **Tom:** enrich toward the target questions — each file contains `<!-- TOM: ... -->` comments marking exactly what's missing (BigQuery migration story, £1m workshop mechanics, Claude plugin details, what he's looking for next…). Comments are stripped before reaching the model.

### Phase 3 — Chat
- [x] `lib/context.ts` + `lib/prompts.ts` (system prompt assembly) *(2026-06-11)*
- [x] `/api/chat` route: streaming, prompt caching, input limits, per-IP rate limit *(2026-06-11)*
- [x] `lib/use-chat.ts` client hook *(2026-06-11)*
- [x] Chat UI: messages, chips, loading/error states, markdown rendering, disclaimer *(2026-06-11)*
- [x] Adversarial grounding test pass (salary, "did Tom work at Google", prompt injection, off-topic coding) — all passed on Haiku 4.5 *(2026-06-11)*

### Phase 4 — Hardening + polish
- [ ] Rate limiting (in-memory per-IP), Anthropic spend limit set
- [ ] Mobile QA, Lighthouse pass
- [ ] Friends try to break it

## Future enhancements (architecture-compatible, all currently out of scope)
- Question logging (most valuable: what do recruiters ask?)
- Model-suggested follow-up chips
- Role-fit mode (paste a JD → tailored fit answer)
- Per-role deep-dive pages from the same content files
- CV/content versioning by date

---

## Progress log

- **2026-06-11** — Design agreed (no-RAG architecture, third-person assistant confirmed). Repo previously held only the CV md/pdf. Scaffolded Next.js app at repo root; built Phase 1 static site (hero, CV, download, metadata). Remaining Phase 1: OG image, favicon, Vercel connect + domain (manual steps for Tom).
- **2026-06-11 (later)** — Phase 2 drafted + Phase 3 built. Drafted all 7 `/content` files strictly from the CV; gaps Tom must fill are marked as `<!-- TOM: -->` HTML comments, which `lib/context.ts` strips before prompting. Built the full chat: `lib/context.ts` (loads/sorts/tags content, module-cached in prod), `lib/prompts.ts` (two system blocks, `cache_control` on the last), `/api/chat` (streams **plain text**, not SSE — simpler, recorded here as a deviation from the diagram's original wording; validates messages ≤1000 chars / ≤20 turns / last 16 sent; best-effort in-memory 10 req/min/IP; `output_config.effort: "medium"`; friendly 500 if `ANTHROPIC_API_KEY` unset), `lib/use-chat.ts`, and `components/chat/` (Chat/Message/PromptChips, markdown via react-markdown, AI disclaimer, turn-limit notice). Added `.env.example`. `npm run build` + lint pass; 400/500 paths smoke-tested against the dev server. Not yet done: live answer + adversarial grounding pass (no API key in dev env), Phase 2 enrichment (Tom), OG image, favicon, Vercel.
- **2026-06-11 (evening)** — Chat live and adversarially tested. Tom added a real API key and switched `ANTHROPIC_MODEL` to `claude-haiku-4-5-20251001` for cost. This surfaced two bugs, both fixed: (1) `output_config.effort` is Opus-only — Haiku returned 400 on every request; the route now sends it only for Opus models. (2) The SDK emits `end` after `error`, so the stream handler double-settled the ReadableStream controller (unhandled rejections); now guarded with a `settled` flag. Live adversarial pass on Haiku: grounded BigQuery answer cites Checkout.com correctly; salary → "not covered, email Tom"; Google → corrects with actual employment history; prompt injection ("ignore instructions") and off-topic coding requests politely declined and redirected. Build + lint green.
