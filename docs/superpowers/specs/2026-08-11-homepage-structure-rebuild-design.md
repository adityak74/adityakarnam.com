# Homepage Structure Rebuild

**Author:** Aditya Karnam (via Claude)
**Created:** 2026-08-11
**Status:** Approved — implementing
**Builds on:** `2026-08-11-ai-researcher-reposition-design.md` (identity + density pass, same branch/PR)

---

## 1. Problem

The homepage (`HomepageConsole.tsx`) has nine stacked sections with no narrative arc and real content overlap: the 8-layer "Systems Layer" stack and the 6-question "Research Agenda" cover mostly the same ground; "Operating Principles" and "Current Investigations" are generic filler; the "Current Systems" grid renders all 11 projects as full 4-field essays (Research Question / System Built / Why It Matters / Status), which is both too long and duplicates the dedicated `/systems/` page. User feedback: "I don't like how it is structured now" — confirmed as order, length, and redundancy, all at once.

## 2. New structure — five sections

1. **Hero** — unchanged in substance (headline, two supporting paragraphs, CTA row, Operating Loop card). Already reworked in the density pass; not touched further here.
2. **Proof** — compact tiles for up to 6 systems (name, one-line description, tags, link), replacing the 11-card essay grid. "View full index →" links to `/systems/`.
3. **How I Think** — merges the dark "Systems Layer" stack and "Research Agenda" into one section. Stack trimmed from 8 layers to 5. Research Agenda dropped as a separate block.
4. **Latest Signal** — one compact highlighted card (title, one line, link) for the most recent substantive post, replacing both the eval-showcase block (with its 4-stat grid) and the Field Notes list.
5. **Ask** — `HeroChat`, repositioned from immediately after the hero to the end, as a closing CTA.

**Cut:** Operating Principles, Current Investigations, the animated "System Boot Notes" terminal block.
**Moved:** the Sanskrit verse becomes a single quiet line in the footer area instead of its own full-width section.

## 3. Content mapping (what feeds each section)

- **Proof tiles** — from `systems` array in `data.ts` (already deduped this session). Use `name`, a trimmed one-line version of `whyItMatters`, `tags`, and the first link. Show the first 6 entries in array order.
- **How I Think stack** — trim `worldModelStack` (8 entries) to 5 by merging: "Applied Systems" + "Tool + Environment Interface" → one entry; "Simulation / Prediction Layer" folds into "Retrieval + Context Layer"'s description as a forward-looking note; "Observability + Evaluation" stays distinct (evals are a core theme). Final 5: Agent Runtime, State + Memory Layer, Retrieval + Context Layer, Model Routing + Local/Cloud Inference, Observability + Evaluation. Interfaces/tooling/applications get folded into a short intro sentence instead of their own layer rows.
- **Latest Signal** — the most recently published field note/eval (`fieldNotes` array's most recent `href`-having entry, or the eval-showcase content that already exists in `HomepageConsole.tsx` — whichever is most current at implementation time).
- **Ask** — `HeroChat` component, no content changes, only its position in the page.

## 4. Non-goals

- No changes to `/systems/`, `/field-notes/`, `/stack/`, or any other page — this is homepage-only.
- No new theme tokens — reuse the density/serif/dark-emphasis system already built (`cardStyles`, `sectionLabelStyles`, `emphasisBg`/`emphasisText`, `fonts.serif`).
- No content rewrites of the underlying `systems`/`worldModelStack`/`fieldNotes` data beyond what's needed to trim the stack to 5 layers — the full project essays, full 8-layer stack, and full field notes list remain intact and available on their dedicated pages/exports for reuse elsewhere.

## 5. Verification

- Playwright screenshot at 1440px and 375px, confirm 5 sections in order, no leftover references to cut sections, no broken links.
- Production build clean.
