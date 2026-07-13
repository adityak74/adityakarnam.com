---
name: value-lab
description: Use when Coding Agent Value Lab needs new benchmark or pricing research, a scheduled evidence refresh, source revalidation, JSON regeneration, recommendation or chart updates, or a page/schema change.
---

# Coding Agent Value Lab

Operate the complete research-to-publication loop for `/value-lab/`. Treat the page as a stable renderer; treat primary-source evidence and deterministic calculations as the product.

## Choose the run mode

| Request | Required work |
|---|---|
| “Refresh/update/run Value Lab” | Execute the full research run below. Never start at `current.json`. |
| New raw bundle supplied | Validate, normalize, calculate, generate, gate, snapshot, rebuild. |
| Data-only correction | Re-run from preserved raw evidence; do not hand-edit derived values. |
| New metric/chart/section | Update contract, tests, pipeline, renderer, then execute a full run. |
| UI-only styling change | Preserve JSON contract; verify desktop/mobile and Markdown export. |

## Full research run — mandatory

1. Read [research-workflow.md](references/research-workflow.md), [source-registry.md](references/source-registry.md), and [data-contract.md](references/data-contract.md).
2. Inspect the prior `current.json`, latest snapshot, source manifest, open integrity notices, and unrelated worktree changes.
3. Create `data/value-lab/raw/YYYY-MM-DD/`. Fetch every in-scope official benchmark, pricing, plan, release-note, and integrity source. Save immutable raw responses plus retrieval metadata before extracting numbers.
4. Build `bundle.json` exactly as specified in the research workflow. Every record must reference a collected `sourceId`.
5. Validate and generate with:

   ```bash
   python3 .codex/skills/value-lab/scripts/value_lab_pipeline.py \
     data/value-lab/raw/YYYY-MM-DD/bundle.json \
     --previous src/data/value-lab/current.json \
     --current src/data/value-lab/current.json \
     --snapshot-root src/data/value-lab/snapshots \
     --gate-output data/value-lab/review/YYYY-MM-DD/gate.json
   ```

6. Stop for human review when the gate exits `2`. Do not weaken or bypass the gate. Correct extraction errors from raw evidence; do not edit generated numbers.
7. Update the renderer only when generated fields require a capability it does not support. A normal research refresh changes data, raw evidence, snapshots, and review output—not page components.
8. Verify deterministic tests, skill validation, Gatsby build, page rendering, source links, visible uncertainty/evidence labels, and Copy as Markdown output.
9. Commit the raw bundle, generated data, dated snapshot, gate report, skill changes, and any required renderer changes. Preserve unrelated files.

## Research rules

- Browse current sources on every run; do not trust remembered prices, limits, model names, or leaderboard rows.
- Use official benchmark/operator/provider pages first. Use papers or reproducible repositories second. Never use search snippets as the stored evidence.
- Keep model, harness, reasoning effort, benchmark version, run configuration, and evaluation date separate.
- Never compare raw scores across benchmark versions. The pipeline groups Pareto frontiers by `benchmark@version`.
- Preserve unavailable, retracted, or changed sources in history and trigger review; never silently delete them.
- Leave unknown prices, tokens, quotas, or effort levels as `null`/absent. Never infer subscription token allowances from anecdotes.
- Generate facts deterministically. An LLM may rewrite prose only from an insight's `facts` and `sourceRunIds`.
- Never publish prompts, repository contents, account identifiers, credentials, or private telemetry.

## Subagent and model routing

Use one agent per independent source family; require structured output and source URLs. Name the model and effort in every delegation prompt.

- `gpt-5.6-luna`, low: source inventory, URL/access checks, schema validation, JSON formatting, link completeness.
- `gpt-5.6-luna`, medium: extract one official leaderboard or one provider's pricing/plan records into the raw-bundle schema.
- `gpt-5.6-terra`, medium: reconcile aliases, release notes, benchmark versions, and integrity notices across sources.
- `gpt-5.6-terra`, high: implement a new metric, collector shape, renderer capability, or cross-source consistency fix.
- `gpt-5.6-sol`, high: only for disputed methodology, ambiguous benchmark comparability, substantial pipeline architecture, or a difficult integrity incident.

Do not use `gpt-5.6-sol` for routine collection, formatting, validation, or data-only refreshes. Keep agent write sets disjoint. The main agent must independently run deterministic validation and inspect the publication gate.

## Renderer contract

- `src/data/value-lab/current.json` is generated current state.
- `src/data/value-lab/snapshots/YYYY-MM-DD/<run-id>.json` is immutable history.
- Keep research values out of `src/pages/value-lab.tsx`.
- Preserve `WorldModelPageShell`, `WorldModelHero`, `WorldModelSection`, `Panel`, responsive grids, evidence labels, source links, and Copy as Markdown.
- Fail visibly for unsupported chart types or missing required fields.

## Verification

Run:

```bash
python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v
python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab
npm run build
```

Completion requires: raw evidence preserved, bundle valid, deterministic output, version isolation, grounded insights, immutable snapshot, gate reviewed, page rebuilt, Markdown export checked, and only intended files committed.
