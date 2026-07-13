---
name: value-lab
description: Create or refresh the data-driven Coding Agent Value Lab page on adityakarnam.com. Use when research JSON, benchmark comparisons, pricing, quota estimates, recommendations, charts, evidence notes, or the Value Lab page need to be added or updated.
---

# Coding Agent Value Lab

Use this skill to keep `/value-lab/` as a stable Gatsby renderer whose changing content comes from `src/data/value-lab/current.json`.

## Core contract

- Treat `src/data/value-lab/current.json` as the source of truth for current research output.
- Preserve the existing landing-page language: `WorldModelPageShell`, `WorldModelHero`, `WorldModelSection`, `Panel`, the warm paper palette, grid texture, monospace eyebrows, responsive grids, and evidence-forward editorial tone.
- Keep rendering deterministic. Do not hard-code benchmark numbers, prices, recommendations, chart points, or source claims in the page component.
- Keep historical snapshots under `src/data/value-lab/snapshots/YYYY-MM-DD/` when supplied by the research pipeline.
- Read [the data contract](references/data-contract.md) before changing the JSON shape or renderer.

## Update workflow

1. Inspect the current branch, existing Value Lab files, `CODING_AGENT_VALUE_LAB.md`, and unrelated worktree changes. Do not delete or reset user files.
2. Validate `current.json`: required metadata, stable IDs, numeric ranges, dates, evidence labels, source URLs, and chart series must be valid. Reject malformed or unsupported data instead of inventing values.
3. Compare the incoming shape with the renderer's supported capabilities.
   - Data-only refresh: update JSON/snapshots only; rebuild and verify.
   - Existing field or series changed: update only the data mapping if the component already supports it.
   - New visual primitive, section type, or interaction: update the renderer/components and add a focused test or verification fixture.
4. Generate page sections from the data: recommendation hero, decision controls, insight cards, comparison table, charts, methodology/evidence notes, sources, and historical context when present.
5. Add or preserve a `Copy as Markdown` control. The copied summary must include the page date, recommendation, key metrics, evidence labels, and source links; it must not expose hidden raw telemetry or credentials.
6. Run the narrowest useful checks first, then `yarn build` for page changes. Report any pre-existing build/environment warning separately.
7. For requested repository work, commit the skill, data, page, and tests as a focused change and create a PR only after verification.

## Model and subagent routing

Use subagents only for bounded, independent work. Every delegation prompt must name the model and reasoning level:

- `gpt-5.6-luna`, low: file inventory, schema checks, JSON formatting, source/link completeness, and simple verification.
- `gpt-5.6-luna`, medium: routine data-only refresh review or Markdown serialization review.
- `gpt-5.6-terra`, medium: ordinary React/Gatsby component changes, responsive layout review, and test/build diagnosis.
- `gpt-5.6-terra`, high: cross-file schema-to-renderer integration or non-trivial UI behavior.
- `gpt-5.6-sol`, high: only for ambiguous architecture, substantial refactoring, difficult build failures, or research-methodology disputes.

Do not use `gpt-5.6-sol` for a data-only refresh. Do not spend a frontier model on formatting, inventory, or a single-field update. Subagents must own disjoint files, state that they are not alone in the worktree, and return changed paths plus verification results.

Suggested delegation split:

- Luna: validate incoming JSON and produce a concise schema diff.
- Terra: implement a new renderer capability or Copy as Markdown behavior.
- Sol: review only when the change crosses data architecture, methodology, and UI boundaries.

## Safety and evidence

- Never fabricate benchmark results, pricing, quota allowances, confidence intervals, or source URLs.
- Keep benchmark versions isolated unless the data explicitly supplies a documented normalization.
- Preserve evidence labels and uncertainty in user-visible output.
- Treat social posts as context, not primary numeric evidence.
- Do not collect or publish prompts, source code, account identifiers, credentials, or private telemetry.

## Completion checklist

- JSON validates against the data contract.
- Renderer contains no duplicated research values.
- Copy as Markdown includes the current recommendation and citations.
- Mobile and desktop layout remain responsive.
- Build/tests pass or failures are clearly identified.
- Only intended files are committed.
