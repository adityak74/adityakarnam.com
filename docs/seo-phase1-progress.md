# Phase 1 Progress Log

**Started:** 2026-08-11
**Plan:** `docs/seo-growth-plan-2026.md`
**Baseline at start:** ~55 impressions/day · 0.43% CTR (90d) · avg position 20.7 · 233 indexed URLs

---

## Status board

| # | Workstream | Status | Verified |
|---|---|---|---|
| 1 | Page-level SEO frontmatter plumbing | Complete | Yes — grep of built HTML |
| 2 | Sitewide `og:url` fix | Complete (incidental) | Yes — now matches canonical |
| 3 | Remove 0-star GitHub badge | Complete | Yes — absent from built HTML |
| 4 | SEO copy manifest (11 pages) | Complete (v2) | Char counts + source truthfulness |
| 5 | Autoblog corpus deletion | Complete — **166**, not 168 | Yes — sitemap 233 → 67 |
| 6 | Apply copy to frontmatter | Complete — 10 pages + `/spotlight/` | Yes — all page-specific |
| 7 | Competitive positioning research | Complete | Live SERP + GitHub API |
| 8 | Duplicate-H1 fix (`hideTitle`) | Complete | Yes — every page now `h1=1` |

### Final build verification

```
sitemap URLs:      233 → 67   (exactly 166 removed)
deleted-slug leaks: 0
H1 per page:        1  (was 2 on 7 pages)
descriptions:       12/12 page-specific (was 2/12)
og:url == canonical: yes
build exit:         0
```

---

## 1. Page SEO frontmatter plumbing — COMPLETE

**Problem.** `/awesome-agentic-memory/` (27,306 impressions, 0.12% CTR) shipped the sitewide default meta description — a generic personal bio — instead of anything about agent memory.

**Why.** Three compounding causes:
- The theme's page template derives description from `page.excerpt`.
- That page's MDX opens with a large styled JSX block, so `excerpt` resolved empty.
- `Seo` silently falls back to `siteDescription` when description is empty.

Worse, the `page` content type had **no `description` field at all**. The theme's `onCreateNode` (in `@lekoarts/gatsby-theme-minimal-blog-core`) builds `MdxPage` nodes by copying only `title`/`slug`/`defer`/`contentFilePath`/`timeToRead`/`wordCount` — it never reads `description` from frontmatter, even though its `MdxPost` branch does. Adding frontmatter alone would have silently done nothing.

**Fix.**

| File | Change |
|---|---|
| `gatsby-node.ts` | Added `createSchemaCustomization` + `createResolvers` |
| `src/@lekoarts/gatsby-theme-minimal-blog-core/templates/page-query.tsx` | New shadow — selects the new fields |
| `src/@lekoarts/gatsby-theme-minimal-blog/components/page.tsx` | New shadow — `Head` forwards description/canonical |

- `createSchemaCustomization` re-declares the `Page` **interface** (not just `MdxPage`) with `description`, `keywords`, `canonicalUrl`. It must be on the interface because `page-query.tsx` queries the interface. Gatsby merges same-named type definitions, so this adds fields without redefining the theme's.
- `createResolvers` on `MdxPage` supplies values by walking to the parent `Mdx` node via `context.nodeModel.getNodeById({ id: source.parent })` and reading `frontmatter[field]`.
- `Head` now passes `description={page.description || page.excerpt}` — excerpt is the fallback only — plus `pathname` and `canonicalUrl`.

**Proof** (built HTML, `public/awesome-agentic-memory/index.html`):

```
<meta name="description" content="PLACEHOLDER_SEO_TEST"
<meta name="keywords" content="agentic memory, agent memory systems"
<meta property="og:url" content="https://adityakarnam.com/awesome-agentic-memory"
```

No `node_modules/` edits — all via Gatsby theme shadowing.

## 2. Sitewide `og:url` fix — COMPLETE (incidental)

Discovered while fixing #1: `og:url` was emitting bare `https://adityakarnam.com` on **every page**. Every link shared to X / LinkedIn / Slack resolved to the homepage card regardless of what was actually shared. Now page-specific.

## 3. Star badge removal — APPLIED, VERIFICATION PENDING

`content/pages/awesome-agentic-memory/index.mdx` displayed, in the hero directly under the H1:

```
img.shields.io/github/stars/aviskaar/awesome-agentic-memory?...&label=Stars
```

The backing repo has **0 stars**, so the page advertised "Stars: 0" as one of the first things a visitor saw. Removed.

The `awesome.re` badge was **kept** — conventional for awesome-style lists and not a strict claim of official inclusion. Revisit if a stricter line is preferred.

> Not yet build-verified. A verification build was deliberately deferred because the deletion agent was mid-`gatsby build`; concurrent builds collide on the shared `.cache/` and `public/` directories.

## 4. SEO copy manifest — V2 IN PROGRESS

Manifest at `docs/seo-copy-manifest.md`. Copy-only; no source files edited by that agent.

v1 covered 11 pages. All claims were verified against actual component source rather than invented — e.g. the awesome list's "50+" was counted (49 named entries), and the prompt-grader rubric was read out of the component (`hasStoryGoal`, `hasVoiceAndPOV`, etc.).

Sample of v1 output:

| Page | Old | New |
|---|---|---|
| `/awesome-agentic-memory/` | *no description — inherited sitewide bio* | `Curated list of AI agent memory: 10 memory frameworks, 10 MCP servers, 10 agent frameworks, 8 vector DBs, knowledge graphs and NeurIPS-era papers.` (146 ch) |
| `/ai-toolkit/prompt-grader/` | title rendered 77 ch, truncated | `Prompt Grader: Score and Rewrite Prompts` (56 rendered) |
| `/mlx-non-determinism-apple-silicon/` | title rendered 89 ch, heavily truncated | `MLX Non-Determinism on Apple Silicon` (52 rendered) |

**Key finding:** only 2 of 11 pages had any `description` at all. The generic-bio problem was site-wide, not isolated to one page.

**v2 revisions requested:**
1. Re-pitch `/awesome-agentic-memory/` away from the "awesome list" head term toward practitioner-comparison intent (see §7).
2. Drop entry #7 — that post is in the deletion set.
3. Normalize all `canonicalUrl` values to trailing slash. `gatsby-config.ts` sets `trailingSlash: 'always'`; five values lacked it and would have pointed canonicals at redirecting URLs.
4. Add a Phase 2 positioning note.

## 5. Autoblog deletion + PR — IN PROGRESS

**Scope.** 186 posts total; **168 tagged `autoblog`**, 18 curated. Audit found **22 duplicate clusters covering 61 posts**, plus 105 singletons.

**Approach changed mid-flight.** Initially implemented as reversible `noindex` + sitemap exclusion, since deletion is destructive and unapproved. Owner then explicitly authorized hard deletion, so the agent was redirected to `git rm` (recoverable from git history) and to open a PR.

Agent instructions include: fix internal links from surviving content to deleted slugs, check `content/rag-project-pages.json` and `scripts/generate-thoughts-data.mjs` for references, verify `npm run build` passes, confirm sitemap shrinkage, and stop-and-report if its own count disagrees with 168.

**Deleted despite having signal** (flagged for visibility):
- `/ai-era-technology-leaders-redefining-success-productivity/` — 661 impressions, position 3.6, **0 clicks**. Highest-ranking autoblog page; deleted per owner instruction. Position 3.6 with zero clicks is itself a negative quality signal.

**Expected side effect.** Raw impressions will dip before quality gains land. This is anticipated — do not reverse course during the dip.

## 6. Apply copy to frontmatter — BLOCKED

Waiting on the deletion PR so two agents don't edit the same files concurrently. On unblock: apply all page/post frontmatter blocks with trailing slashes normalized, rebuild, and grep built HTML to confirm every meta tag resolves.

## 7. Competitive positioning — COMPLETE, CHANGES PHASE 2

Live SERP check plus GitHub API star counts:

| Repo | Stars |
|---|---|
| topoteretes/awesome-ai-memory | 835 |
| TsinghuaC3I/Awesome-Memory-for-Agents | 631 |
| TeleAI-UAGI/Awesome-Agent-Memory | 575 |
| AgentMemoryWorld/Awesome-Agent-Memory | 183 |
| **aviskaar/awesome-agentic-memory** (mirrored by our page) | **0** |

In a live search for "awesome agent memory," the page ranked **last**, below eight GitHub repos. 10+ established competitors exist, several from research labs (Tsinghua, TeleAI).

**Nuance that matters:** GSC shows the page at **position 4.6** for `awesome agent memory` and 6.2 for `awesome ai memory` — genuinely page 1 for head terms. It loses the *click*, not the ranking, because it sits beside an 835-star repo. **This is a credibility gap, not a rankings gap.** The practitioner long tail (`agent memory framework`, `agent memory systems`, `ai agent memory database`) is the real weakness at position 29–60.

**The exploitable gap.** Every top competitor is a **paper list** — taxonomies, architecture, retrieval, forgetting, consolidation. Purely academic. This page catalogs **shipping software**: 10 MCP servers, 8 vector DBs, 10 agent frameworks, a coding-agent comparison table. Nobody in the top 8 answers *"which agent memory system should I actually use in production, and why."*

**Implication for Phase 2.** Stop contesting `awesome agent memory` as the primary term — that is a fight against 100× social proof, and copy cannot win it. Re-aim at `mem0 alternatives`, `mem0 vs letta vs zep`, `best agent memory for production`, `mcp memory server comparison`. Lower volume, far higher intent, structurally unserved by the incumbents. **A longer list loses to 835 stars; a verdict does not.** The page needs opinion and benchmarks, not more entries.

---

## Honest assessment

Phase 1 repairs a badly leaking page. Expect CTR to move from 0.12% toward 2–4%, halting the demotion cycle and recovering position. That is necessary but not sufficient.

It does **not** put 1M in reach, and the competitive finding makes that firmer: the agent-memory head terms are capped by research-lab repos regardless of copy quality. Real growth depends on Phase 2 — the practitioner-comparison angle, plus new pillars so the site is not one page away from zero traffic.

## Count correction — 166, not 168

The original figure of 168 came from `grep -rl autoblog content/posts`, which matches the word **anywhere in a file**, including body prose. Two matches were curated posts that merely discuss autoblogging:

| File | Why it matched |
|---|---|
| `content/posts/ai-blog-generator-n8n-results/` | The post is *about* the autoblog experiment — 362 impressions, on the KEEP list |
| `content/posts/hero_rag_chat_architecture_2026-07-20/` | Body text plus an inline SVG label reading `skip autoblog-tagged` |

Deleting on the grep count would have destroyed `/ai-blog-generator-n8n-results/`. The correct selector is `autoblog` present in the frontmatter `tags` list, parsed as YAML: **166 autoblog / 21 curated / 187 directories** (186 `.mdx` + 1 `.md`).

Cross-check: 67 surviving sitemap URLs + 166 deleted = 233, the original count. Exact.

**Lesson:** never select files for deletion with a substring grep. Parse the field.

## Duplicate H1s (found during verification)

Seven pages rendered **two `<h1>` elements** — one from the theme's page component (`page.title`) and one from the page's own hero, either in JSX or inside an imported React component. This predated the work, but changing the titles made the two disagree (e.g. theme `Prompt Grader: Score and Rewrite Prompts` vs component `📊 Prompt Grader & Rewriter`), which is worse than a consistent duplicate.

Fixed by adding an opt-in `hideTitle` frontmatter flag through the same schema → query → component path as the SEO fields. Pages that render their own hero set `hideTitle: true`; the theme heading is suppressed and the hero becomes the sole H1. Visual design is unchanged. Every page now reports `h1=1`.

## Open items

- [ ] Merge PR and deploy
- [ ] Request re-indexing for the changed pages in GSC
- [ ] Revise `docs/seo-growth-plan-2026.md` Phase 2 with the positioning finding
- [ ] Re-baseline GSC ~14 days post-merge; watch CTR as the leading indicator
- [ ] Expect an impressions dip as 166 URLs drop out — do not reverse course
- [ ] Phase 2: add benchmarks/verdict content to `/awesome-agentic-memory/`
- [ ] Decide whether `awesome.re` badge stays
- [ ] Consider gitignoring the ~25 stray screenshots and `.playwright-mcp/` / `.wrangler/`
