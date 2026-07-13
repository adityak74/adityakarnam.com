# Task 5 deterministic/static verification report

Date: 2026-07-13  
Worktree: `/Users/adityakarnam/Projects/adityakarnam.com/.worktrees/value-lab-dashboard`  
Branch: `feat/value-lab-dashboard`  
Result: `DONE_WITH_CONCERNS`

## Commands and results

All commands were run from the worktree with the required `rtk` prefix.

| Check | Command | Exit | Result/output |
| --- | --- | ---: | --- |
| Pipeline suite | `rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -p 'test_*.py' -v` | 0 | `Ran 21 tests in 0.003s`; `OK`; all 21 named tests passed. |
| Skill validator | `rtk python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab` | 0 | `Skill is valid!` |
| Whitespace check | `rtk git diff --check` | 0 | Empty output. |
| Production build | `rtk npm run build` | 0 | Gatsby completed; `/value-lab/` generated. |
| Static labels | `for label in 'Dashboard' 'Measured leader' 'Harness comparison' 'Research coverage' 'Copy as Markdown'; do if rtk rg -q --fixed-strings "$label" public/value-lab/index.html; then echo "PASS: $label"; else echo "FAIL: $label"; exit 1; fi; done` | 0 | Five `PASS` lines: Dashboard, Measured leader, Harness comparison, Research coverage, Copy as Markdown. |
| Generated contract/gate | `rtk jq -e '(.schemaVersion == 2) and ((.dashboardCards|length) == 7) and (([.dashboardCards[]|select(.group=="summary")]|length) == 4) and (([.dashboardCards[]|select(.group=="supporting")]|length) == 3) and ((.charts|length) == 3) and (all(.charts[]; (.points|type == "array" and length > 0))) and ((.methodology.sources|length) == 3)' src/data/value-lab/current.json && rtk jq -e '(.reasons|type == "array") and (.requiresReview == false)' data/value-lab/review/2026-07-13/gate.json` | 0 | Both expressions returned `true`. |
| Skill match | `cmp -s .codex/skills/value-lab/SKILL.md /Users/adityakarnam/.codex/skills/value-lab/SKILL.md` | 0 | Exact match. |
| Final diff check | `rtk git diff --check && rtk git status --porcelain=v1 --untracked-files=all` | 0 | `git diff --check` empty; status empty before this report was created. |

## Build warnings

The production build succeeded but emitted these non-fatal warnings:

- Gatsby reported that the non-page `post-query.tsx` GraphQL query will not run.
- Browserslist data is 20 months old and suggested updating `caniuse-lite`.
- Node emitted the `punycode` deprecation warning.
- Webpack reported large serialized strings affecting cache deserialization.

## Generated data evidence

- `src/data/value-lab/current.json`: schema version 2; 7 cards (4 `summary`, 3 `supporting`); 13 configurations; 3 official sources.
- Charts: `measured-performance` (`ranked_bar`, 13 points), `harness-comparison` (`dumbbell`, 6 points), and `research-coverage` (`coverage`, 4 points).
- `data/value-lab/review/2026-07-13/gate.json`: `reasons: []`, `requiresReview: false`.
- Official source URLs are present for the Terminal-Bench leaderboard, release note, and integrity update.

## Changed-file audit against `main`

Command: `rtk git diff main...HEAD --stat`

Output summary: 25 intended tracked files, `4,926 insertions(+), 1 deletion(-)`, covering the Value Lab skill/pipeline/tests, raw and reviewed data, dashboard renderer/data, site configuration, supporting page changes, and planning/spec documents.

Command: `rtk git log --oneline main..HEAD`

Output: 20 branch commits, including the dashboard renderer/provenance, generated snapshot, pipeline, skill, and related page commits. No merge or push was performed.

Command: `rtk git status --short` and `rtk git status --porcelain=v1 --untracked-files=all`

Output: clean after verification. The test-generated `.codex/skills/value-lab/**/__pycache__` directories were removed; no source or tracked files were edited by verification. This report is the requested verification artifact.

## Remaining controller-owned checks

Not run, per instruction:

- Browser desktop/mobile inspection: four summary cards, three graphs, uncertainty readability, responsive one-column cards, overflow, source-link behavior, and console errors.
- Browser clipboard check: click `Copy as Markdown` and inspect clipboard content for `## Dashboard`, ranked intervals, harness comparisons, research coverage, and official source links.
- GitHub/PR #63 checks: no `git push`, `gh pr edit`, `gh pr view`, PR mutation, or merge was performed.

The deterministic/static portion is complete. The remaining checks require the controller’s browser and GitHub side effects.

## Controller browser verification

- Chrome device emulation reported a `390px` viewport and `390px` document width with no horizontal overflow.
- Full-page desktop (`1440px`) and mobile (`390px`) screenshots visibly contain four summary cards, ranked performance, harness comparison, research coverage, three supporting cards, evidence labels, and provenance disclosures.
- The unique Copy as Markdown button changed state to `Copied Markdown` after activation.
- Headless Chrome denied a direct clipboard read because the document was not focused. Static bundle/HTML checks cover the Markdown section strings; the PR preview remains available for a manual clipboard-content check.

## Final whole-branch review fixes — RED/GREEN evidence

Result: `DONE`

### RED

Before changing the pipeline, `rtk python3 .codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py` ran 25 tests and failed four focused tests:

- `test_mixed_cost_readiness_preserves_exact_benchmark_and_pricing_lineage`: normalized cost-ready runs lacked `priceSourceId`.
- `test_visual_validation_requires_exact_card_and_chart_contract`: validation accepted fewer than seven cards and a missing required chart.
- `test_visual_validation_rejects_invalid_numeric_intervals_and_endpoint_semantics`: validation accepted invalid score shapes and endpoint bounds.
- `test_visual_validation_requires_scatter_source_run_and_price_lineage`: validation did not validate scatter provenance.

### GREEN

- Added a mixed cost-ready/measured-only fixture. The normalizer now retains the matched price record's `priceSourceId` and `priceEffectiveFrom`; cost-ready configurations, scatter points, and recommendations publish that provenance. Scatter points also carry their exact benchmark `sourceRunIds` and pricing URL.
- Hardened publication validation against the normalized runs passed by `main()`: exactly seven cards (4 summary/3 supporting), required IDs/types, card and point types, numeric bounds, ordered intervals, dumbbell endpoint semantics, and exact rank/coverage/scatter/recommendation source-run relationships.
- Replaced the sourced-scatter unsupported panel with an accessible SVG scatter graph plus visible point/provenance details. The page's Markdown export now includes cost, score, benchmark run IDs, pricing source links, and price effective dates when cost data exists.
- Left the current 13/0 supporting-card wording and every raw evidence/current/snapshot file unchanged.

| Check | Command | Exit | Evidence |
| --- | --- | ---: | --- |
| Pipeline suite | `rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v` | 0 | `Ran 25 tests`; `OK` |
| Cost-ready contract | `rtk python3 -c '...'` | 0 | `validate_publication_visuals(build_publication(normalized), normalized["benchmarkRuns"])` returned `[]` for the mixed fixture. |
| Skill validator | `rtk python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab` | 0 | `Skill is valid!` |
| Gatsby build | `rtk npm run build` | 0 | Production build completed and generated `/value-lab/`. |
| No-cost determinism | Pipeline to `/private/tmp/value-lab-final-current.json`, `rtk shasum -a 256`, and `rtk cmp -s` | 0 | Both files: `c2ed3de8a28d88acfdac4e8e06746d79efa7f39e21c5af3048ff4a5bf92daa76`; byte-identical. |

The build retained pre-existing non-fatal Gatsby/Browserlist/punycode/webpack warnings. No push or PR #63 action was performed.

## Coverage-provenance re-review fix — RED/GREEN evidence

Result: `DONE`

### RED

Before changing coverage validation, `rtk python3 .codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py` ran 27 tests and failed the two new focused mutations:

- `test_visual_validation_rejects_coverage_count_that_differs_from_source_runs`: a `Cost-ready` count of `0` with one valid source run was accepted.
- `test_visual_validation_rejects_coverage_runs_that_are_valid_but_ineligible`: a measured-only normalized run substituted into `Cost-ready` was accepted because it was a valid ID.

### GREEN

- Coverage validation now recomputes ordered eligible run IDs from normalized runs: publishable runs for `Collected` and `Measured`, the cost-ready subset for `Cost-ready`, and the recommendation-eligible cost-ready run for `Value-ready`.
- Every coverage point must now have `value == len(sourceRunIds)` and an exact ordered `sourceRunIds` match for its stage.
- The mixed readiness test now proves a single scatter point with exact configuration ID, benchmark run, pricing source URL/effective date, and excludes the measured-only run.
- `isScatterChart` now checks each point's numeric bounds and required provenance before passing it to the SVG renderer.

| Check | Command | Exit | Evidence |
| --- | --- | ---: | --- |
| Pipeline suite | `rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v` | 0 | `Ran 27 tests`; `OK` |
| Gatsby build | `rtk npm run build` | 0 | Production build completed, including the scatter type guard. |
| No-cost determinism | Pipeline to `/private/tmp/value-lab-coverage-current.json`, `rtk shasum -a 256`, and `rtk cmp -s` | 0 | Both files: `c2ed3de8a28d88acfdac4e8e06746d79efa7f39e21c5af3048ff4a5bf92daa76`; byte-identical. |

No raw evidence, `current.json`, or immutable snapshot was changed.
