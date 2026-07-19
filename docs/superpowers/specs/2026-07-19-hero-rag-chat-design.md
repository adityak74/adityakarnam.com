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

Three pieces, all extending existing patterns in this repo rather than introducing new frameworks:

### 1. Content Index (build/CI-time)

A script (`scripts/reindex-embeddings.ts`) that:

1. Discovers curated sources automatically:
   - All posts under `content/posts/**` whose frontmatter tags do **not** include `autoblog` (same filter already used in the Thoughts-listing autoblog hide feature).
   - A fixed list of key project pages (subagent-fleet, embenx, ai-toolkit, leanlearn, cc-creativity-skills), mirroring today's `PROJECTS` array in `research-context.ts`.
2. Chunks each source's body text into passages (~300-500 tokens each, paragraph-aligned).
3. Calls the Cloudflare Workers AI REST API with the smallest/cheapest available text-embedding model (`@cf/baai/bge-small-en-v1.5`) to embed each chunk.
4. Upserts all vectors into a Cloudflare Vectorize index via the Cloudflare REST API, using deterministic vector IDs (`{slug}#{chunkIndex}`) so reruns overwrite cleanly instead of accumulating duplicates.
5. Runs a full rebuild every time (delete-and-recreate or upsert-all) rather than an incremental diff — the corpus is small (~15-20 sources), so simplicity wins over incremental complexity.

**Trigger:** a GitHub Actions workflow scoped with `paths: ["content/posts/**"]`, firing when a PR merges into `main` (i.e. the resulting push to `main` touches that path). Config files, `gatsby-config.ts`, `package.json`, CI/tooling changes, etc. are outside that path and never trigger a reindex — only actual content additions/edits do. Uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets. This runs independently of the Cloudflare Pages build (which only builds the static Gatsby site) — the two are decoupled; the Pages Function simply queries whatever is currently in Vectorize at request time.

Writing a new post requires no manual step: as long as it isn't tagged `autoblog`, the next push to `main` re-embeds it automatically.

### 2. Query-time retrieval + generation (Cloudflare Pages Function)

Extends the existing `/api/ask-my-work.ts` pattern into a new `/api/hero-chat.ts`:

1. Accepts `{ messages: {role, content}[], persona: VisitorLens }` — full conversation history, sent fresh each request (stateless server, stateful client).
2. Embeds the latest user message via the same Workers AI embedding model.
3. Queries Vectorize for the top-k (e.g. 4) most similar passages.
4. Assembles a prompt: system instructions (grounded-answer rules, persona tone, "say you don't have enough context" guardrail — same wording style as today's OpenRouter prompts) + retrieved passages + recent conversation history.
5. Calls Cloudflare Workers AI text generation (e.g. a Llama 3.x instruct model) for the reply.
6. Returns `{ text, sources, fallback }` — `sources` are the deduplicated URLs/labels of the passages actually used, rendered as link chips in the UI.

**Guardrails carried over from the existing implementation:**
- If Workers AI/Vectorize calls fail, or return low-similarity results, fall back to static per-persona fallback text (extending today's `LENS_FALLBACKS`) plus a safe default source list (home, `/systems/`, `/blog/`) — never show a raw error.
- 10-minute in-memory cache keyed on normalized question, same TTL pattern as today.
- New: a simple per-IP request cap in the function to bound Workers AI cost under abuse (didn't exist before because usage was effectively zero).

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
       -> embed latest message (Workers AI)
       -> query Vectorize (top-k passages)
       -> build grounded prompt (persona + passages + history)
       -> generate reply (Workers AI)
       -> cache + return { text, sources, fallback }
  -> client appends assistant message + source chips
```

## Error handling

| Failure | Behavior |
|---|---|
| Workers AI embedding call fails | Return persona fallback text + default sources, `fallback: true` |
| Vectorize query fails or returns nothing above similarity threshold | Same fallback path, wording indicates limited context rather than inventing an answer |
| Workers AI generation call fails | Same fallback path |
| Rate limit exceeded (per-IP) | 429 with a short client-side message ("Too many questions — try again in a bit") |
| No CLOUDFLARE_API_TOKEN at reindex time (CI) | GitHub Action fails loudly (CI failure, not silent) — this is a build-time path, safe to fail hard |

## Testing

- Unit tests for the content-discovery filter (autoblog exclusion) reusing whatever test pattern already covers the Thoughts-listing filter.
- Unit tests for chunking (boundary cases: very short posts, posts with code blocks).
- Manual verification of the Pages Function against a seeded Vectorize index (small fixture set) for: a well-covered question, an out-of-corpus question (fallback path), and a persona-switch mid-conversation.
- Manual browser check of the hero chat: multi-turn follow-up, persona switching, source-chip links resolve to real pages, `/ask` redirects to `/`.

## Open items for the implementation plan

- Exact Workers AI text-generation model choice (pick smallest instruct model that stays coherent for ~120-200 word grounded answers).
- Cloudflare account/Vectorize index provisioning (index creation, dimension config matching the embedding model) — one-time setup step, likely manual via `wrangler` or dashboard.
- Whether the per-IP rate limit uses Cloudflare's own rate-limiting rules (if available on the plan) or an in-function counter.
