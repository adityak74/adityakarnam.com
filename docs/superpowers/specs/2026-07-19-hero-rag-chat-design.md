# Hero RAG Chat — Design

## Problem

The homepage hero currently ends in a static intro plus a link to a separate `/ask` page (`AskMyWorkPage`), which offers a single-turn Q&A box and a persona "lens" selector, both backed by OpenRouter and a hand-curated 3-item `PROJECTS` list (`research-context.ts`). This works but is disconnected from the site's actual writing, is single-turn only, and lives a click away from the hero.

We want a ChatGPT/Claude-style multi-turn chat directly in the hero, grounded in a broader curated set of the site's own content (blog posts + project pages), that both answers questions and helps different visitor types (recruiters, engineers, researchers) navigate to the right pages. It replaces `/ask` entirely.

## Goals

- Multi-turn chat embedded in the homepage hero (not a separate page).
- Answers grounded in real retrieval (RAG) over curated site content, not a fixed hand-written blurb.
- Persona-adaptive tone/depth (recruiter vs researcher vs engineer, etc.), reusing the existing `VisitorLens` concept.
- Every answer cites and links its sources — that's the "navigation" mechanism, not a separate router.
- New posts become searchable automatically without a manual registration step.
- Graceful degradation when retrieval/generation is unavailable, matching the existing fallback pattern.

## Non-goals

- No server-side persistence of chat history across visits or devices — conversation state lives in the browser only, cleared on reload.
- No admin UI for curating the corpus — inclusion is rule-based (see Content Index below).
- No support for autoblog-tagged (AI-generated) posts in the corpus.
- Not replacing OpenRouter/Workers AI with a custom fine-tuned model.

## Architecture

Three pieces, built on Cloudflare's managed **AI Search** (formerly AutoRAG) product rather than hand-rolled embeddings/Vectorize — AI Search already does chunking, embedding, indexing, retrieval, and generation behind one instance, which removes an entire layer of custom code and API-shape risk:

### 1. Content sync (build/CI-time)

A script (`scripts/sync-rag-corpus.mjs`) that:

1. Discovers curated sources automatically:
   - All posts under `content/posts/**` whose frontmatter tags do **not** include `autoblog` (same filter already used in the Thoughts-listing autoblog hide feature).
   - A fixed list of key project pages (subagent-fleet, embenx, ai-toolkit, leanlearn, cc-creativity-skills), mirroring today's `PROJECTS` array in `research-context.ts`.
2. Strips frontmatter from each source, keeping title + body as plain markdown.
3. Writes each source to a local build directory as `{slug}.md`, then uploads it to a dedicated Cloudflare R2 bucket (`adityakarnam-rag-corpus`) via `wrangler r2 object put`. The R2 object key is exactly the post's slug, so the Pages Function can reconstruct the canonical URL from it later (`https://adityakarnam.com/{slug}/`) with no separate lookup table.
4. Triggers an AI Search sync job (`wrangler ai-search jobs create hero-chat`) so the instance re-indexes immediately rather than waiting for its default 6-hour schedule.
5. Runs a full re-sync every time (rewrite all curated files) rather than an incremental diff — the corpus is small (~15-20 sources), so simplicity wins over incremental complexity. AI Search's own sync job only re-embeds files that actually changed, so this is cheap even as a full rewrite.

**Trigger:** a GitHub Actions workflow scoped with `paths: ["content/posts/**"]`, firing when a PR merges into `main` (i.e. the resulting push to `main` touches that path). Config files, `gatsby-config.ts`, `package.json`, CI/tooling changes, etc. are outside that path and never trigger a sync — only actual content additions/edits do. Uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets. This runs independently of the Cloudflare Pages build (which only builds the static Gatsby site) — the two are decoupled; the Pages Function simply queries whatever AI Search currently has indexed at request time.

Writing a new post requires no manual step: as long as it isn't tagged `autoblog`, the next push to `main` syncs it to R2 and triggers re-indexing automatically.

**One-time infra setup** (not part of the automatic pipeline, done once): create the R2 bucket, create the AI Search instance connected to it (with the smallest embedding model, `@cf/baai/bge-small-en-v1.5`, and a small instruct model for generation), and configure the R2 service API token AI Search needs to read the bucket.

### 2. Query-time retrieval + generation (Cloudflare Pages Function)

Extends the existing `/api/ask-my-work.ts` pattern into a new `/api/hero-chat.ts`:

1. Accepts `{ messages: {role, content}[], persona: VisitorLens }` — full conversation history, sent fresh each request (stateless server, stateful client).
2. Prepends a persona-specific system message (tone/depth guidance, grounded-answer rules, "say you don't have enough context" guardrail — same wording style as today's OpenRouter prompts) to the conversation.
3. Calls the AI Search instance's REST query endpoint with the full message list. AI Search handles embedding the query, retrieving relevant chunks, and generating the answer in one call.
4. Maps each returned chunk's `item.key` (the R2 object key, i.e. `{slug}.md`) back to a real site URL and dedupes by source document.
5. Returns `{ text, sources, fallback }` — `sources` are the deduplicated links built from the chunks actually used, rendered as link chips in the UI.

**Guardrails carried over from the existing implementation:**
- If the AI Search call fails, or returns no chunks above a reasonable relevance score, fall back to static per-persona fallback text (extending today's `LENS_FALLBACKS`) plus a safe default source list (home, `/systems/`, `/blog/`) — never show a raw error.
- 10-minute in-memory cache keyed on normalized question, same TTL pattern as today.
- New: a simple per-IP request cap in the function to bound cost under abuse (didn't exist before because usage was effectively zero).

### 3. Hero Chat UI

Replaces the static hero copy/CTA area in `HomepageConsole` with a chat panel:

- Message list (user/assistant bubbles) + input box, styled consistently with the existing design tokens/cardStyles already used in `HomepageConsole`.
- Persona quick-picks above the input (Recruiter, Researcher, Engineer, Founder, OSS Contributor) — reusing `VisitorLens`. Selecting one changes the system-prompt persona sent with each request; it does not reset the conversation.
- Each assistant message renders its `sources` as clickable chips underneath (same visual pattern as today's `AskMyWorkPage` source links) — this is the full extent of "navigation": answers always link to the pages they drew from.
- Conversation state (`messages`, `persona`) lives in React `useState` only. No `localStorage`/session persistence. Reload = fresh chat.
- `/ask` route and `AskMyWorkPage` component are removed. The route redirects to `/`.

## Data flow

```
User types message
  -> client appends to local message history
  -> POST /api/hero-chat { messages, persona }
       -> prepend persona system message
       -> call AI Search instance (embeds query, retrieves chunks, generates answer)
       -> map chunk item.key -> site URL, dedupe sources
       -> cache + return { text, sources, fallback }
  -> client appends assistant message + source chips
```

## Error handling

| Failure | Behavior |
|---|---|
| AI Search call fails (network/5xx) | Return persona fallback text + default sources, `fallback: true` |
| AI Search returns no chunks above a reasonable relevance score | Same fallback path, wording indicates limited context rather than inventing an answer |
| Rate limit exceeded (per-IP) | 429 with a short client-side message ("Too many questions — try again in a bit") |
| No CLOUDFLARE_API_TOKEN at sync time (CI) | GitHub Action fails loudly (CI failure, not silent) — this is a build-time path, safe to fail hard |

## Testing

- Unit tests for the content-discovery filter (autoblog exclusion) reusing whatever test pattern already covers the Thoughts-listing filter.
- Unit tests for frontmatter stripping (boundary cases: very short posts, posts with code blocks) and for the `item.key` -> site URL mapping.
- Manual verification of the Pages Function against the real AI Search instance (once synced) for: a well-covered question, an out-of-corpus question (fallback path), and a persona-switch mid-conversation.
- Manual browser check of the hero chat: multi-turn follow-up, persona switching, source-chip links resolve to real pages, `/ask` redirects to `/`.

## Open items for the implementation plan

- Exact generation model choice for the AI Search instance (pick smallest instruct model that stays coherent for ~120-200 word grounded answers, e.g. `@cf/meta/llama-3.1-8b-instruct-fp8`).
- Confirm the exact AI Search REST query endpoint/response shape against the live API during implementation (docs describe an OpenAI-compatible `messages` request returning `choices` + `chunks`, but the precise endpoint path should be verified with a real call before finalizing).
- R2 service API token setup for the AI Search instance (one-time, dashboard step per Cloudflare's AI Search R2 data source docs).
- Whether the per-IP rate limit uses Cloudflare's own rate-limiting rules (if available on the plan) or an in-function counter.
