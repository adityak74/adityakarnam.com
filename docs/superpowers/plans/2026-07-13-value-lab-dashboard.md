# Value Lab Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a data-generated dashboard of visible cards and graphs to the Coding Agent Value Lab while preserving evidence integrity and JSON-only routine refreshes.

**Architecture:** Extend the deterministic Python pipeline to generate typed dashboard cards and three chart datasets from normalized benchmark records. Keep React as a presentation-only renderer by moving visualization components into a focused module, and regenerate the live JSON as schema version 2 with an immutable versioned snapshot.

**Tech Stack:** Python 3 standard library and `unittest`; Gatsby, React 18, TypeScript, CSS/SVG primitives; JSON publication artifacts.

## Global Constraints

- Never infer missing cost, token, quota, or causal claims.
- Never rank or compare records across benchmark versions.
- Preserve source/run references and published uncertainty.
- Use no new runtime dependencies or general-purpose chart library.
- Routine research refreshes must update JSON artifacts without requiring React edits.
- Keep PR #63 open and unmerged.

---

### Task 1: Generate and validate dashboard presentation data

**Files:**
- Modify: `.codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py`
- Modify: `.codex/skills/value-lab/scripts/value_lab_pipeline.py`

**Interfaces:**
- Consumes: normalized benchmark runs from `normalize_bundle(bundle)`.
- Produces: `_build_dashboard_cards(runs, sources, updated_at) -> list[dict]`, `_build_harness_chart(configurations) -> dict`, `_build_coverage_chart(configurations) -> dict`, and `validate_publication_visuals(publication) -> list[str]`.
- Produces: `build_publication()` output with `schemaVersion: 2`, seven `dashboardCards` grouped as `summary` or `supporting`, and chart types `ranked_bar`, `dumbbell`, and `coverage`.

- [ ] **Step 1: Write failing pipeline tests**

Add tests that assert the exact generated contract:

```python
def test_dashboard_cards_are_generated_from_publishable_runs(self):
    publication = build_publication(normalize_bundle(sample_bundle()))
    cards = {card["id"]: card for card in publication["dashboardCards"]}
    self.assertEqual(publication["schemaVersion"], 2)
    self.assertEqual(cards["leader"]["value"], "61.0%")
    self.assertEqual(cards["measured-configurations"]["value"], "2")
    self.assertEqual(cards["leader-gap"]["value"], "1.0 pts")
    self.assertEqual(cards["evidence-health"]["value"], "2/2 verified")
    self.assertTrue(cards["leader"]["sourceRunIds"])
    self.assertEqual(len(publication["dashboardCards"]), 7)
    self.assertEqual(sum(card["group"] == "summary" for card in publication["dashboardCards"]), 4)
    self.assertEqual(sum(card["group"] == "supporting" for card in publication["dashboardCards"]), 3)

def test_dashboard_charts_include_rank_harness_and_coverage(self):
    publication = build_publication(normalize_bundle(sample_bundle()))
    charts = {chart["id"]: chart for chart in publication["charts"]}
    self.assertEqual(charts["measured-performance"]["type"], "ranked_bar")
    self.assertEqual(charts["harness-comparison"]["type"], "dumbbell")
    self.assertEqual(charts["research-coverage"]["type"], "coverage")
    self.assertEqual(charts["research-coverage"]["points"][1]["value"], 2)
    self.assertEqual(charts["research-coverage"]["points"][2]["value"], 0)

def test_harness_chart_never_pairs_different_benchmark_versions(self):
    bundle = sample_bundle()
    bundle["benchmarkRuns"][1]["benchmarkVersion"] = "2.0"
    chart = _build_harness_chart(build_publication(normalize_bundle(bundle))["configurations"])
    self.assertEqual(chart["points"], [])

def test_publication_visual_validation_rejects_malformed_shapes(self):
    publication = build_publication(normalize_bundle(sample_bundle()))
    publication["dashboardCards"][0].pop("sourceRunIds")
    publication["charts"][0]["type"] = "unknown"
    errors = validate_publication_visuals(publication)
    self.assertTrue(any("sourceRunIds" in error for error in errors))
    self.assertTrue(any("unknown chart type" in error for error in errors))
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -p 'test_*.py' -v
```

Expected: new tests fail because dashboard helpers and schema version 2 do not exist.

- [ ] **Step 3: Implement deterministic card generation**

Add `_build_dashboard_cards` using publishable runs sorted by score. Generate stable cards with this shape:

```python
{
    "id": "leader",
    "label": "Measured leader",
    "value": f"{leader['score'] * 100:.1f}%",
    "detail": f"{leader['model']} · {leader['harness']} · interval {leader['confidenceIntervalLow'] * 100:.1f}–{leader['confidenceIntervalHigh'] * 100:.1f}%",
    "accent": "cyan",
    "evidence": leader["evidence"],
    "sourceRunIds": [leader["runId"]],
}
```

Generate `measured-configurations`, `leader-gap`, and `evidence-health` summary cards from the same filtered set. Generate supporting cards for `top-three`, `largest-harness-difference`, and `research-coverage`; their values and detail must come from the same ranked, harness, and coverage datasets emitted by the pipeline. Add `group: "summary"` to the first four cards and `group: "supporting"` to the last three. Use `Unavailable` and a neutral explanation when fewer than two runs exist. Evidence health counts only accessible, non-warning runs whose evidence is `official_verified`, `independently_reproduced`, or `first_party_measured`.

- [ ] **Step 4: Implement deterministic chart generation**

Change measured performance to `ranked_bar`. Implement `_build_harness_chart` by grouping on `(provider, model, reasoningEffort, benchmark, benchmarkVersion)` and emitting only groups with at least two harnesses:

```python
{
    "id": configuration_group_id,
    "label": model,
    "benchmark": f"{benchmark}@{version}",
    "left": {"label": low["harness"], "value": low["score"]},
    "right": {"label": high["harness"], "value": high["score"]},
    "delta": round(high["score"] - low["score"], 6),
    "sourceRunIds": [low["runId"], high["runId"]],
}
```

Implement research coverage points for `Collected`, `Measured`, `Cost-ready`, and `Value-ready`. `Value-ready` is zero until a sourced recommendation configuration exists.

- [ ] **Step 5: Validate publication shapes before writing**

`validate_publication_visuals` must require all card fields, reject unsupported chart types, require type-specific point fields, and verify that all referenced run IDs are present in normalized publishable runs. Call it in `main()` after `build_publication`; write failures into the existing gate and exit `2` without publishing.

- [ ] **Step 6: Add schema-versioned snapshot names**

Add:

```python
def snapshot_filename(bundle: dict[str, Any], publication: dict[str, Any]) -> str:
    return f"{slug(bundle['run']['runId'])}-v{publication['schemaVersion']}.json"
```

Use it in `main()` so the schema-2 publication creates a new immutable snapshot while retaining the schema-1 snapshot.

- [ ] **Step 7: Run the pipeline tests and verify GREEN**

Run the full unittest command. Expected: all existing and new tests pass with zero failures.

- [ ] **Step 8: Commit the pipeline increment**

```bash
git add .codex/skills/value-lab/scripts/value_lab_pipeline.py .codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py
git commit -m "Generate Value Lab dashboard data"
```

---

### Task 2: Update the Value Lab skill and contract

**Files:**
- Modify: `.codex/skills/value-lab/SKILL.md`
- Modify: `.codex/skills/value-lab/references/data-contract.md`
- Modify: `.codex/skills/value-lab/references/research-workflow.md`

**Interfaces:**
- Consumes: schema-2 `dashboardCards` and chart contracts from Task 1.
- Produces: operational instructions for future JSON-only dashboard refreshes and renderer-capability changes.

- [ ] **Step 1: Update the data contract**

Document required `dashboardCards` fields and the three new chart point shapes. Replace the supported `bar` wording with `ranked_bar`, `dumbbell`, and `coverage`; retain `scatter` for future cost-ready datasets.

- [ ] **Step 2: Update the skill workflow**

Require every full run to generate and validate cards, ranked performance, harness comparisons, research coverage, and Markdown summaries. State that missing comparison or cost evidence produces explicit empty/zero states. Add desktop/mobile card and graph checks to completion requirements.

- [ ] **Step 3: Preserve model routing limits**

Specify `gpt-5.6-luna` low for visual JSON/schema validation and routine refresh checks, and `gpt-5.6-terra` high for introducing a new card/chart renderer. Keep `gpt-5.6-sol` restricted to substantial methodology or architecture disputes.

- [ ] **Step 4: Update the research handoff**

In `research-workflow.md`, add dashboard cards and all chart datasets to the generated publication checklist. Require source/run references in every derived visual claim.

- [ ] **Step 5: Validate the skill**

Run:

```bash
python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab
```

Expected: `Skill is valid!`

- [ ] **Step 6: Sync the user-level skill and commit**

```bash
cp -R .codex/skills/value-lab/. /Users/adityakarnam/.codex/skills/value-lab/
git add .codex/skills/value-lab
git commit -m "Teach Value Lab skill to publish dashboards"
```

---

### Task 3: Render visible dashboard cards and all graph types

**Files:**
- Create: `src/components/value-lab/ValueLabVisuals.tsx`
- Modify: `src/pages/value-lab.tsx`

**Interfaces:**
- Consumes: `DashboardCard[]` and `ValueLabChart[]` from generated JSON.
- Produces: `DashboardCardGrid`, `RankedBarChart`, `HarnessDumbbellChart`, `CoverageChart`, and `ChartView` React components.

- [ ] **Step 1: Verify the current renderer lacks the new labels**

Run:

```bash
rg -n 'Measured leader|Harness comparison|Research coverage' src/pages/value-lab.tsx
```

Expected: no matches.

- [ ] **Step 2: Create focused visualization types and components**

Define discriminated chart types and a `DashboardCard` interface in `ValueLabVisuals.tsx`. Build cards with CSS Grid using `repeat(auto-fit, minmax(210px, 1fr))`. Use CSS bars for ranking and coverage, and an accessible inline SVG line plus endpoint labels for each dumbbell row. Every chart receives a heading and explanatory copy from JSON, and unsupported types render a visible error panel.

- [ ] **Step 3: Replace the single-chart renderer**

Import the new module in `value-lab.tsx`. Add the four-card summary immediately after the hero. Map every generated chart into a separate `WorldModelSection`; do not select only `charts[0]`.

- [ ] **Step 4: Add supporting evidence cards**

Use generated dashboard data to render top-three, harness-difference, and coverage summaries below the graphs. Derive display-only ordering from generated chart point order; do not recompute scores, deltas, or evidence conclusions in React.

- [ ] **Step 5: Expand Copy as Markdown**

Add a `Dashboard` table with card values/details/evidence, followed by typed graph summaries. Ranked rows include score and interval; dumbbell rows include both harness values and neutral observed difference; coverage rows include label and count.

- [ ] **Step 6: Build and inspect generated HTML**

Run:

```bash
npm run build
rg -n 'Measured leader|Harness comparison|Research coverage|Copy as Markdown' public/value-lab/index.html
```

Expected: build exit `0` and all four labels present in static HTML.

- [ ] **Step 7: Commit the renderer increment**

```bash
git add src/components/value-lab/ValueLabVisuals.tsx src/pages/value-lab.tsx
git commit -m "Render Value Lab dashboard cards and graphs"
```

---

### Task 4: Regenerate the first live dashboard snapshot

**Files:**
- Modify: `src/data/value-lab/current.json`
- Create: `src/data/value-lab/snapshots/2026-07-13/2026-07-13t063508z-v2.json`
- Modify: `data/value-lab/review/2026-07-13/gate.json`

**Interfaces:**
- Consumes: `data/value-lab/raw/2026-07-13/bundle.json` and the schema-2 pipeline.
- Produces: generated current publication, immutable snapshot, and review gate.

- [ ] **Step 1: Run the pipeline from preserved raw evidence**

```bash
python3 .codex/skills/value-lab/scripts/value_lab_pipeline.py \
  data/value-lab/raw/2026-07-13/bundle.json \
  --previous src/data/value-lab/current.json \
  --current src/data/value-lab/current.json \
  --snapshot-root src/data/value-lab/snapshots \
  --gate-output data/value-lab/review/2026-07-13/gate.json
```

Expected: exit `0`, schema-2 snapshot created, and `requiresReview` remains false because measured facts and recommendation identity did not change.

- [ ] **Step 2: Inspect generated evidence boundaries**

Run:

```bash
jq '{schemaVersion, dashboardCards, charts: [.charts[] | {id, type, pointCount: (.points | length)}], recommendation}' src/data/value-lab/current.json
```

Expected: seven dashboard cards (four summary and three supporting), non-empty ranking/harness/coverage charts, and a null recommendation configuration while cost usage remains unavailable.

- [ ] **Step 3: Commit generated artifacts**

```bash
git add src/data/value-lab/current.json src/data/value-lab/snapshots/2026-07-13/2026-07-13t063508z-v2.json data/value-lab/review/2026-07-13/gate.json
git commit -m "Publish first live Value Lab dashboard snapshot"
```

---

### Task 5: Verify visually and update PR #63

**Files:**
- Verify only: all files changed in Tasks 1–4.

**Interfaces:**
- Consumes: completed schema, renderer, skill, and live artifacts.
- Produces: verified pushed branch and updated unmerged PR #63.

- [ ] **Step 1: Run all deterministic checks**

```bash
python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -p 'test_*.py' -v
python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab
git diff --check
npm run build
```

Expected: tests and validator pass, diff check is empty, and build exits `0`.

- [ ] **Step 2: Inspect desktop and mobile rendering**

Serve the production build and use the browser at desktop and mobile widths. Confirm four summary cards, all three graphs, readable uncertainty labels, one-column mobile cards, no horizontal overflow, source links, and no console errors.

- [ ] **Step 3: Verify Copy as Markdown**

Click `Copy as Markdown`, read the clipboard, and confirm it contains `## Dashboard`, ranked score intervals, harness comparisons, research coverage, and official source links.

- [ ] **Step 4: Audit the final branch**

```bash
git status --short
git diff main...HEAD --stat
git log --oneline main..HEAD
```

Expected: only intended tracked files are in branch commits; unrelated local screenshots and notes remain untracked and untouched.

- [ ] **Step 5: Push and update the PR**

```bash
git push
gh pr edit 63 --body 'Adds the schema-2 Value Lab dashboard: generated summary cards, ranked performance with uncertainty, same-model harness comparisons, research coverage, responsive rendering, expanded Markdown export, updated skill instructions, deterministic tests, and the first live dashboard snapshot. Cost and value recommendations remain pending because official per-run usage is unavailable. Verification includes the full pipeline test suite, skill validation, Gatsby production build, desktop and mobile inspection, and clipboard output. This PR remains intentionally unmerged.'
gh pr view 63 --json url,mergeable,mergeStateStatus,statusCheckRollup
```

Expected: PR #63 shows the dashboard increment and remains open. Do not invoke `gh pr merge`.
