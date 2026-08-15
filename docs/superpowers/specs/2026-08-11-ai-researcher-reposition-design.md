# AI Researcher Repositioning + Density Redesign

**Author:** Aditya Karnam (via Claude)
**Created:** 2026-08-11
**Reference:** https://arjunjaggi.com/
**Status:** Approved — implementing

---

## 1. Problem

The homepage and shared theme currently brand Aditya as a "World Model Infrastructure Builder / Lab." The intended positioning is **AI Researcher**. Separately, the site (especially the homepage) is visually much airier than intended: giant rounded white cards, oversized section padding, and inconsistent font sizing make the page feel empty and roughly 2.3x taller than the reference for comparable content.

The reference site (arjunjaggi.com) is not actually dark-mode — it's a light cream page (`rgb(242,239,230)`, near-identical family to this site's `#FAF9F7`) that alternates with near-black full-bleed emphasis sections. It pairs a serif display headline (Newsreader) with a sans body (Archivo) and uses very small (9-11px), letter-spaced monospace labels as section eyebrows. Its accent color (`rgb(194,84,58)`) is close to this site's existing accent (`#C2522D`).

## 2. Goals

1. Reposition personal identity/branding from "World Model Infrastructure Builder" to "AI Researcher," without losing the keyword content (agent runtimes, memory, retrieval, model routing, local inference, evals) that today's SEO growth plan (`docs/seo-growth-plan-2026.md`) identifies as the site's only proven ranking signal.
2. Tighten visual density sitewide (padding, margins, line-height) to remove the "empty, airy" feeling, borrowing the reference's rhythm.
3. Add a serif display headline + tight mono-label pairing similar to the reference, without a full palette change (colors are already close).
4. Add 1-2 dark full-bleed emphasis sections on the homepage for visual rhythm, matching the reference's alternating pattern.

## 3. Non-goals

- No changes to individual blog post titles, descriptions, or content.
- No changes to the agent-memory / MLX content pillars (`/awesome-agentic-memory/`, MLX posts) — these are the site's proven SEO assets per `docs/seo-growth-plan-2026.md` and must not be touched.
- No URL/slug restructuring.
- No full dark-mode toggle or global background inversion — the reference itself is a light page.
- No rewrite of individual project write-up pages' body content (systems.tsx detail views) beyond what's needed for identity consistency.

## 4. Positioning changes

**Files:** `src/components/world-model/data.ts` (`siteIdentity`), `gatsby-config.ts` (`siteMetadata`: `siteTitleAlt`, `siteDescription`, manifest `name`/`description`), `src/components/world-model/HomepageConsole.tsx` (hero copy).

- `siteIdentity.title`: "World Model Infrastructure Builder" → "AI Researcher"
- `siteIdentity.labName`: "World Model Infrastructure Lab" → something researcher-framed (e.g. "AI Research Notes" or similar eyebrow label — final copy decided during implementation, kept short, mono-cased)
- `siteIdentity.tagline` / `supportingLine` / `subtitle`: reframe around research + applied systems building rather than "world-model-driven AI" jargon. Keep the concrete technical nouns (memory, retrieval, routing, local inference, evals) since those carry the SEO signal — just don't lead with "world model."
- `gatsby-config.ts` `siteDescription` (the sitewide meta fallback used by pages with empty excerpts, per the meta-description bug documented in `docs/seo-growth-plan-2026.md` §3.2): rewrite to lead with "AI researcher" while retaining the same technical noun list, so pages relying on the fallback don't lose their existing keyword relevance.
- Link the existing `/ai-research.tsx` page (papers, citations) more prominently from the new identity block — it already exists and directly supports the AI-researcher framing; do not build a new page.
- Nav/header copy: check `src/@lekoarts/gatsby-theme-minimal-blog/components/header.tsx` for any "world model" references and update.

## 5. Visual system changes

**Files:** `src/gatsby-plugin-theme-ui/index.ts` (shared tokens — affects all pages), `src/components/world-model/HomepageConsole.tsx`, `src/components/world-model/pages-field-notes-about/primitives.tsx`, `gatsby-ssr.tsx` (font loading).

### Typography
- Add **Newsreader** (variable serif, Google Fonts, free) via the existing font-loading mechanism in `gatsby-ssr.tsx`, used for `h1`/hero display headline only (not all headings, to limit scope/risk).
- Keep existing sans (Styrene A/B stack) for body and sub-headings.
- Reuse existing **JetBrains Mono** (already loaded) for section eyebrow labels — do not add IBM Plex Mono, same visual effect without another font-weight download.
- Section label pattern: uppercase, letter-spaced (~0.06-0.08em), genuinely small (11-12px, not the current 14px `sectionLabelStyles`), muted secondary color.

### Density
- Cut `HomepageConsole.tsx` hero `px`/`py` roughly in half (currently `px: [4,5,6], py: [5,6,7]`).
- Reduce inter-section `mb` values sitewide in the theme (currently `[6,7]`-scale gaps between major blocks) to a tighter, more consistent rhythm.
- Tighten `lineHeights.body` slightly if it reads loose in practice (currently 1.7) — verify visually, adjust only if needed.
- Replace the large rounded white `cardStyles` boxes (border-radius 16px, heavy box-shadow) used for the systems grid and stack layers with tighter bordered rows — smaller radius, thinner border, no drop shadow, less internal padding.

### Dark emphasis sections
- Add a warm near-black background (`~#1B1914`, matching the reference's `rgb(27,25,20)` family) as a new theme color token (e.g. `emphasisBg`) with a corresponding light-text token.
- Apply it to 1-2 homepage sections — best candidates: the `worldModelStack` layer list (rename away from "world model" framing) or `operatingPrinciples` — as full-bleed dark blocks, breaking up the otherwise uniform cream page the way the reference alternates.

## 6. Pages affected

- **Homepage** (`HomepageConsole.tsx` + `data.ts`): primary target for both positioning and density/dark-section changes.
- **Sitewide via theme tokens** (`gatsby-plugin-theme-ui/index.ts`): spacing/line-height tightening propagates to about, field-notes, stack, now, status pages — incidentally fixing spacing issues already visible in prior audit screenshots in the repo root (about-*, field-notes-*, stack-mobile-*, etc. from an earlier unlanded pass).
- **`ai-research.tsx`**: no content changes, just a stronger inbound link from the homepage identity block.
- **Header/footer**: copy check only, no structural change.

## 7. Risks

- **SEO fallback regression**: `siteDescription` is used as the meta-description fallback for pages with empty MDX excerpts (confirmed root cause of a prior CTR collapse, `docs/seo-growth-plan-2026.md` §3.2). The rewritten description must keep the same technical noun list so affected pages don't lose keyword relevance. Verify by checking which live pages currently fall back to it before publishing.
- **Font loading cost**: adding Newsreader adds one more font-family request. Scope it to `h1` only and check bundle/load impact isn't material (single family, standard Google Fonts CDN, already have a working font-loading pattern in `gatsby-ssr.tsx`).
- **Theme-token blast radius**: `gatsby-plugin-theme-ui/index.ts` is shared sitewide. Spacing/line-height edits must be checked across at least homepage, about, and one blog post page (desktop + mobile) before considering done, since a token change here silently touches every page.

## 8. Verification

- Playwright screenshots (desktop 1440px + mobile 375px) of homepage, about, field-notes, stack before/after, compared against the reference site's density.
- Confirm `siteDescription`/`siteTitleAlt` no longer contain "world model" and still contain the core technical nouns.
- Confirm no broken build (`gatsby build` or dev server smoke test) after theme/font changes.
- Confirm `/ai-research.tsx` is linked from the homepage identity block and loads correctly.
