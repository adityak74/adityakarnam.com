# Value Lab Weekly Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an automatically generated, evidence-linked “What’s Changed Since Last Week?” summary to the top of the Value Lab page and preserve it in every future refresh.

**Architecture:** Extend the deterministic Python publication pipeline so it compares the new publication with the prior dated publication and emits a schema-3 `weeklyChanges` object. Render that object through a focused React component and reuse the same records in Markdown export; keep all comparison logic and provenance resolution out of the browser.

**Tech Stack:** Python 3 standard library and `unittest`, Gatsby 5, React 18, TypeScript 5, JSON publication data.

## Global Constraints

- Render at most four change records immediately below the Value Lab hero and above the dashboard.
- Use only the markers `up`, `down`, `same`, and `star`, displayed as `↑`, `↓`, `↔`, and `⭐`.
- Compare only stable configuration identities within the same `benchmark@version`.
- Every claim must retain resolvable current or prior run IDs plus deduplicated HTTPS source links.
- A missing or same-day prior publication produces the explicit baseline state; a valid comparison with no candidates produces the explicit no-material-change state.
- Keep the renderer presentation-only and include identical records near the top of Copy as Markdown.
- Do not generate provider-wide pricing claims from evaluated task-cost evidence.
- Preserve all existing seven dashboard cards, supported charts, evidence labels, gates, and unrelated worktree files.

---

## Execution preflight

Before Task 1, create the feature branch that will contain the already committed design and plan plus all implementation commits:

```bash
rtk git switch -c feat/value-lab-weekly-changes
```

Expected: the new branch starts from current `main`, which is based on `origin/main` plus the focused design and plan commits; do not push local `main`.

---

### Task 1: Generate deterministic weekly comparisons

**Files:**
- Modify: `.codex/skills/value-lab/scripts/value_lab_pipeline.py`
- Test: `.codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py`

**Interfaces:**
- Consumes: `build_publication(normalized: dict[str, Any], previous: dict[str, Any] | None = None)` and the schema-2 or schema-3 prior publication passed with `--previous`.
- Produces: `build_weekly_changes(current: dict[str, Any], previous: dict[str, Any] | None) -> dict[str, Any]` and schema-3 `publication["weeklyChanges"]`.

- [ ] **Step 1: Write failing baseline and deterministic-comparison tests**

Add tests that establish the public behavior before implementation:

```python
def test_weekly_changes_uses_baseline_without_older_publication(self):
    publication = build_publication(normalize_bundle(sample_bundle()))
    self.assertEqual(publication["schemaVersion"], 3)
    self.assertEqual(publication["weeklyChanges"], {
        "title": "What's Changed Since Last Week?",
        "baselineDate": None,
        "currentDate": "2026-07-13",
        "status": "baseline",
        "items": [],
    })

def test_same_day_previous_publication_is_not_a_weekly_comparison(self):
    previous = build_publication(normalize_bundle(sample_bundle()))
    current = build_publication(normalize_bundle(sample_bundle()), previous)
    self.assertEqual(current["weeklyChanges"]["status"], "baseline")

def test_weekly_changes_are_deterministic_and_capped_at_four(self):
    previous_bundle = sample_bundle()
    previous_bundle["run"].update({"runId": "2026-07-06T120000Z", "retrievedAt": "2026-07-06T12:00:00Z"})
    previous = build_publication(normalize_bundle(previous_bundle))
    current_a = build_publication(normalize_bundle(sample_bundle()), previous)
    current_b = build_publication(normalize_bundle(sample_bundle()), previous)
    self.assertEqual(current_a["weeklyChanges"], current_b["weeklyChanges"])
    self.assertLessEqual(len(current_a["weeklyChanges"]["items"]), 4)
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v
```

Expected: FAIL because `build_publication` does not accept `previous`, schema version is `2`, and `weeklyChanges` is absent.

- [ ] **Step 3: Add focused comparison helpers**

Implement these boundaries in `value_lab_pipeline.py`:

```python
WEEKLY_CHANGE_MARKERS = {"up", "down", "same", "star"}
WEEKLY_CHANGE_LIMIT = 4
MEANINGFUL_COST_CHANGE = 0.01

def _configurations_by_id(publication: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        item["id"]: item for item in publication.get("configurations", [])
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    }

def _weekly_sources(*configurations: dict[str, Any] | None) -> list[dict[str, str]]:
    links: dict[str, str] = {}
    for configuration in configurations:
        if not configuration:
            continue
        if isinstance(configuration.get("sourceUrl"), str):
            links[configuration["sourceUrl"]] = f"{configuration.get('model', 'Configuration')} benchmark"
        if isinstance(configuration.get("priceSourceUrl"), str):
            links[configuration["priceSourceUrl"]] = f"{configuration.get('model', 'Configuration')} pricing"
    return [{"label": links[url], "url": url} for url in sorted(links)]

def _weekly_item(
    *, item_id: str, marker: str, headline: str, evidence: str,
    configurations: list[dict[str, Any]], priority: int,
) -> dict[str, Any]:
    return {
        "id": item_id,
        "marker": marker,
        "headline": headline,
        "evidence": evidence,
        "sourceRunIds": sorted({item["runId"] for item in configurations}),
        "sources": _weekly_sources(*configurations),
        "_priority": priority,
    }
```

Add `_leader_map(publication)`, `_frontier_map(publication)`, and `build_weekly_changes(current, previous)`. `build_weekly_changes` must:

1. return `baseline` when `previous` is absent or `previous.updatedAt >= current.updatedAt`;
2. compare frontier membership only for cohort keys present in both publications;
3. compare leaders only inside identical `(benchmark, benchmarkVersion)` keys;
4. emit `star` when the recommendation changes to a resolvable configuration;
5. compare task cost only for the same configuration ID and emit a change at an absolute relative delta of at least `MEANINGFUL_COST_CHANGE`;
6. sort candidates by `(_priority, id)`, deduplicate by `id`, strip `_priority`, and cap at `WEEKLY_CHANGE_LIMIT`.

Use precise task-cost copy:

```python
direction = "fell" if delta < 0 else "rose"
marker = "down" if delta < 0 else "up"
headline = f"{current_config['model']} measured task cost {direction} by {abs(delta) * 100:.1f}%."
```

Change publication construction to build the existing fields first, set `schemaVersion` to `3`, then assign:

```python
publication["weeklyChanges"] = build_weekly_changes(publication, previous)
return publication
```

- [ ] **Step 4: Run the Task 1 tests and verify GREEN**

Run:

```bash
rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v
```

Expected: all tests pass, including baseline, same-day, determinism, version isolation, and four-item cap.

- [ ] **Step 5: Commit Task 1**

```bash
rtk git add .codex/skills/value-lab/scripts/value_lab_pipeline.py .codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py
rtk git commit -m "Generate Value Lab weekly changes"
```

---

### Task 2: Validate weekly-change provenance and wire the prior publication into the CLI

**Files:**
- Modify: `.codex/skills/value-lab/scripts/value_lab_pipeline.py`
- Test: `.codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py`

**Interfaces:**
- Consumes: Task 1 `weeklyChanges` shape and `build_publication(normalized, previous)`.
- Produces: `validate_publication_visuals(publication, normalized_runs=None, previous=None)` validation of current and prior lineage.

- [ ] **Step 1: Write failing validation and CLI-order tests**

```python
def test_weekly_change_validation_rejects_unknown_marker_and_run(self):
    prior_bundle = sample_bundle()
    prior_bundle["run"].update({"runId": "2026-07-06T120000Z", "retrievedAt": "2026-07-06T12:00:00Z"})
    previous = build_publication(normalize_bundle(prior_bundle))
    publication = build_publication(normalize_bundle(sample_bundle()), previous)
    item = publication["weeklyChanges"]["items"][0]
    item["marker"] = "new"
    item["sourceRunIds"] = ["sha256:unknown"]
    errors = validate_publication_visuals(publication, previous=previous)
    self.assertTrue(any("weeklyChanges" in error and "marker" in error for error in errors))
    self.assertTrue(any("weeklyChanges" in error and "sourceRunIds" in error for error in errors))

def test_weekly_change_validation_rejects_non_https_sources(self):
    publication = build_publication(normalize_bundle(sample_bundle()))
    publication["weeklyChanges"] = {
        "title": "What's Changed Since Last Week?", "baselineDate": "2026-07-06",
        "currentDate": "2026-07-13", "status": "compared",
        "items": [{"id": "bad", "marker": "up", "headline": "Bad source.",
                   "evidence": "official_verified", "sourceRunIds": [],
                   "sources": [{"label": "Bad", "url": "http://example.com"}]}],
    }
    errors = validate_publication_visuals(publication)
    self.assertTrue(any("weeklyChanges" in error and "HTTPS" in error for error in errors))
```

- [ ] **Step 2: Run the new validation tests and verify RED**

Run the two test methods with `rtk python3 -m unittest ... -v`.

Expected: FAIL because `previous` is not accepted and weekly changes are not validated.

- [ ] **Step 3: Implement validation and correct CLI data flow**

Extend the validator signature:

```python
def validate_publication_visuals(
    publication: dict[str, Any],
    normalized_runs: list[dict[str, Any]] | None = None,
    previous: dict[str, Any] | None = None,
) -> list[str]:
```

Build `available_weekly_run_ids` from current normalized runs plus `previous.configurations[].runId`. Validate schema version `3`, dates, status, item count, unique IDs, marker vocabulary, evidence vocabulary, run lineage, and non-empty deduplicated HTTPS sources. Require `baselineDate is None` and `items == []` for baseline state.

In `main()`, load the prior publication before generation:

```python
previous = json.loads(args.previous.read_text()) if args.previous and args.previous.exists() else None
normalized = normalize_bundle(bundle)
publication = build_publication(normalized, previous)
visual_errors = validate_publication_visuals(publication, normalized["benchmarkRuns"], previous)
```

Remove the later duplicate `previous` load and leave the existing review gate call unchanged.

- [ ] **Step 4: Run the complete Python suite**

```bash
rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v
```

Expected: all tests pass.

- [ ] **Step 5: Commit Task 2**

```bash
rtk git add .codex/skills/value-lab/scripts/value_lab_pipeline.py .codex/skills/value-lab/scripts/tests/test_value_lab_pipeline.py
rtk git commit -m "Validate Value Lab weekly provenance"
```

---

### Task 3: Render the weekly summary and export identical Markdown

**Files:**
- Create: `src/components/value-lab/WeeklyChanges.tsx`
- Modify: `src/pages/value-lab.tsx`
- Verify: `src/data/value-lab/current.json`

**Interfaces:**
- Consumes: schema-3 `weeklyChanges` generated by Tasks 1–2.
- Produces: `WeeklyChanges` React component and `formatWeeklyChangesMarkdown(weeklyChanges)`.

- [ ] **Step 1: Create the typed presentation component**

Define and export:

```tsx
export type WeeklyChange = {
  id: string
  marker: "up" | "down" | "same" | "star"
  headline: string
  evidence: string
  sourceRunIds: string[]
  sources: Array<{ label: string; url: string }>
}

export type WeeklyChangesData = {
  title: string
  baselineDate: string | null
  currentDate: string
  status: "baseline" | "compared"
  items: WeeklyChange[]
}

const markerGlyph = { up: "↑", down: "↓", same: "↔", star: "⭐" } as const
```

Render a `WorldModelSection` with eyebrow `This week in coding agents`, the generated title, the comparison period, and a `Panel`. Baseline copy is `Baseline established. The next research refresh will report material changes.` Compared-empty copy is `No material tracked changes this week.` Each populated row renders the glyph, headline, evidence label, and numbered source links with safe `target="_blank" rel="noreferrer"` attributes. Throw on an unsupported marker so malformed data fails visibly.

- [ ] **Step 2: Place it directly below the hero**

In `src/pages/value-lab.tsx`, type the imported JSON field and insert:

```tsx
const weeklyChanges = ((valueLab as unknown) as { weeklyChanges: WeeklyChangesData }).weeklyChanges

// Immediately after WorldModelHero:
<WeeklyChanges data={weeklyChanges} evidenceLabels={evidenceLabels} />
```

Keep the dashboard, recommendation, controls, insights, charts, methodology, and SEO order otherwise unchanged.

- [ ] **Step 3: Add Markdown parity near the top of the export**

After the status lines in `formatMarkdown`, insert:

```tsx
`## ${weeklyChanges.title}`,
"",
weeklyChanges.status === "baseline"
  ? "Baseline established. The next research refresh will report material changes."
  : weeklyChanges.items.length === 0
    ? "No material tracked changes this week."
    : weeklyChanges.items.map(item => {
        const marker = { up: "↑", down: "↓", same: "↔", star: "⭐" }[item.marker]
        const links = item.sources.map((source, index) => `[${index + 1}](${source.url})`).join(" ")
        return `${marker} ${item.headline} · ${evidenceLabels[item.evidence] ?? item.evidence}${links ? ` · ${links}` : ""}`
      }).join("\n"),
"",
```

- [ ] **Step 4: Run the production build**

```bash
rtk npm run build
```

Expected: Gatsby builds `/value-lab/` successfully with no TypeScript or GraphQL errors.

- [ ] **Step 5: Commit Task 3**

```bash
rtk git add src/components/value-lab/WeeklyChanges.tsx src/pages/value-lab.tsx
rtk git commit -m "Show Value Lab weekly changes"
```

---

### Task 4: Regenerate publication data and teach the Value Lab skill

**Files:**
- Modify: `src/data/value-lab/current.json`
- Create: `src/data/value-lab/snapshots/2026-07-13/2026-07-13t120000z-v3.json`
- Modify: `data/value-lab/review/2026-07-13/gate.json`
- Modify: `.codex/skills/value-lab/SKILL.md`
- Modify: `.codex/skills/value-lab/references/data-contract.md`
- Modify: `.codex/skills/value-lab/references/research-workflow.md`

**Interfaces:**
- Consumes: schema-3 pipeline and the preserved `data/value-lab/raw/2026-07-13/bundle.json`.
- Produces: generated schema-3 current publication, immutable snapshot, review gate, and refresh instructions.

- [ ] **Step 1: Update the contract and workflow**

Document `schemaVersion: 3`, the required `weeklyChanges` object, marker/status enums, four-item limit, current/prior run lineage, embedded HTTPS sources, baseline state, and Markdown parity. Update the workflow publication checklist so weekly changes are reviewed before dashboard cards.

- [ ] **Step 2: Update the skill’s mandatory full-run and renderer checks**

Add requirements to preserve/pass the prior publication, generate and validate the weekly comparison, review each claim against its source links, and test populated, no-material-change, and baseline states on desktop/mobile and in Copy as Markdown. Replace schema-2-only wording with schema-3 while retaining the seven-card requirements.

- [ ] **Step 3: Regenerate from preserved raw evidence**

Run:

```bash
rtk python3 .codex/skills/value-lab/scripts/value_lab_pipeline.py \
  data/value-lab/raw/2026-07-13/bundle.json \
  --previous src/data/value-lab/current.json \
  --current src/data/value-lab/current.json \
  --snapshot-root src/data/value-lab/snapshots \
  --gate-output data/value-lab/review/2026-07-13/gate.json
```

Expected: schema-3 current output and a new `-v3.json` snapshot. Because the prior publication has the same date, `weeklyChanges.status` is `baseline`. The command may exit `2` only if the existing review gate detects a material issue; inspect rather than bypass it.

- [ ] **Step 4: Run deterministic and skill validation**

```bash
rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v
rtk python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab
rtk npm run build
```

Expected: Python tests pass, skill validation prints `Skill is valid!`, and Gatsby builds successfully.

- [ ] **Step 5: Commit generated data and skill changes**

```bash
rtk git add .codex/skills/value-lab/SKILL.md .codex/skills/value-lab/references/data-contract.md .codex/skills/value-lab/references/research-workflow.md src/data/value-lab/current.json src/data/value-lab/snapshots/2026-07-13 data/value-lab/review/2026-07-13/gate.json
rtk git commit -m "Publish Value Lab weekly baseline"
```

---

### Task 5: Verify the page and open the pull request

**Files:**
- Verify: generated `/value-lab/` desktop and mobile rendering
- Verify: all committed files and PR diff

**Interfaces:**
- Consumes: completed schema, pipeline, renderer, publication, and skill changes.
- Produces: pushed feature branch and GitHub pull request targeting `main`.

- [ ] **Step 1: Confirm the implementation is isolated on the feature branch**

```bash
rtk git branch --show-current
rtk git log --oneline origin/main..HEAD
```

Expected: current branch is `feat/value-lab-weekly-changes`, and the range contains only the weekly-change design, plan, and implementation commits.

- [ ] **Step 2: Inspect desktop and mobile states**

Serve the production build and inspect `/value-lab/` at approximately `1440×1000` and `390×844`. Confirm the section is below the hero, all copy wraps without horizontal overflow, provenance links are visible, baseline copy is explicit, and the existing dashboard/cards/charts remain intact.

- [ ] **Step 3: Verify Markdown export**

Trigger Copy as Markdown and confirm the weekly heading and baseline message occur before the recommendation. For a temporary local compared fixture, confirm glyphs, headlines, evidence labels, and source links match the visible rows; do not commit the fixture.

- [ ] **Step 4: Run final verification from a clean index**

```bash
rtk python3 -m unittest discover -s .codex/skills/value-lab/scripts/tests -v
rtk python3 /Users/adityakarnam/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/value-lab
rtk npm run build
rtk git diff --check origin/main...HEAD
rtk git status --short --branch
```

Expected: all tests and build pass, no whitespace errors, and only the user’s pre-existing untracked files remain outside the committed feature diff.

- [ ] **Step 5: Review, push, and create the PR**

```bash
rtk git push -u origin feat/value-lab-weekly-changes
rtk gh pr create --base main --head feat/value-lab-weekly-changes \
  --title "Add weekly changes to Coding Agent Value Lab" \
  --body "Adds a deterministic, evidence-linked weekly change summary above the Value Lab dashboard; updates Markdown export, schema/pipeline validation, generated publication data, and the Value Lab refresh skill."
```

Expected: GitHub returns the new pull request URL.
