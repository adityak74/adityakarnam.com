# Value Lab Weekly Changes Design

## Goal

Add a concise, research-backed “What’s Changed Since Last Week?” section near the top of every Coding Agent Value Lab update. The section should make meaningful movement easy to scan, bookmark, share, and copy without introducing editorial claims that cannot be reproduced from preserved evidence.

## User experience

The section appears immediately below the Value Lab hero and above the dashboard. It contains no more than four ranked findings. Each finding starts with a stable visual marker:

- `↑` for an improvement, increase, or entry into a leading set;
- `↓` for a decrease, regression, or exit from a leading set;
- `↔` for meaningful continuity, such as an unchanged benchmark leader;
- `⭐` for a new or changed best-value recommendation.

Each row contains a short headline, an evidence label, and links to the sources supporting the comparison. The compact headline remains useful on mobile; supporting provenance may wrap beneath it.

The Copy as Markdown output places the same findings after the title, positioning, update date, and status, before the recommendation. Page copy and exported copy always come from the same structured records.

## Publication contract

The generated publication gains a required `weeklyChanges` object:

```json
{
  "weeklyChanges": {
    "title": "What's Changed Since Last Week?",
    "baselineDate": "2026-07-06",
    "currentDate": "2026-07-13",
    "status": "compared",
    "items": [
      {
        "id": "leader-unchanged-terminal-bench-2-1",
        "marker": "same",
        "headline": "Model A remained the Terminal-Bench 2.1 leader.",
        "evidence": "official_verified",
        "sourceRunIds": ["sha256:current", "sha256:baseline"]
      }
    ]
  }
}
```

`status` is `compared` when a prior publication is available and `baseline` otherwise. A baseline publication has an empty `items` array and renders a clear message that the initial baseline has been established and the next refresh will report changes. Missing history must never produce fabricated movement.

Every item requires `id`, `marker`, `headline`, `evidence`, and `sourceRunIds`. Markers are limited to `up`, `down`, `same`, and `star`. Referenced run IDs must resolve to either the current publication or the supplied prior publication. The renderer resolves source links from those runs; unsupported or unresolved evidence fails validation rather than disappearing.

This new required publication shape advances the schema version so consumers can distinguish it from the existing dashboard-only contract.

## Deterministic comparison rules

The pipeline generates candidates from the current publication and the publication supplied with `--previous`. Comparisons are limited to like-for-like benchmark versions and stable configuration identities.

Candidate families are:

1. Pareto frontier entry or exit, when both publications contain comparable performance-and-cost evidence.
2. Benchmark leader change or continuity within the same `benchmark@version` cohort.
3. Best-value recommendation change, including a newly available recommendation.
4. Comparable task-cost movement for the same configuration when both snapshots have cost and pricing provenance.

The section does not describe a provider-wide API price change unless the preserved publication evidence directly supports that claim. When only evaluated task cost is comparable, the headline says task cost changed.

Candidates are deduplicated, sorted by editorial importance in the order listed above except that a changed best-value recommendation uses the `star` marker and ranks before continuity, and capped at four. Stable IDs and deterministic tie-breakers ensure identical inputs produce byte-equivalent output.

Continuity is included only for a benchmark leader or recommendation; the section does not fill space with unchanged low-value facts. If a comparison yields no meaningful candidates, the renderer states that no material tracked changes were detected for the period.

## Pipeline and validation

Publication generation receives the prior publication, rather than adding comparison logic to React. The command-line pipeline already accepts `--previous`; that object becomes an explicit input to weekly-change generation before the publication is written.

Validation checks:

- required weekly-change fields and allowed markers/status values;
- current and baseline dates and their ordering;
- a maximum of four unique items;
- benchmark-version isolation;
- resolvable current or prior source-run lineage;
- evidence labels supported by the existing evidence vocabulary;
- an empty item list for baseline state;
- stable, deterministic output for identical current and prior inputs.

The normal change gate remains authoritative. Weekly-change generation does not bypass integrity notices, inaccessible sources, or human review requirements.

## Renderer behavior

The page renderer remains presentation-only. A focused weekly-change component consumes the generated object and renders the heading, period label, rows, evidence labels, and source links. It uses the existing Value Lab palette, panels, typography, and responsive layout.

The section is always visible:

- `compared` with items: render up to four findings;
- `compared` without items: render “No material tracked changes this week” with the comparison dates;
- `baseline`: render the baseline-established message.

The renderer must fail visibly if it receives an unknown marker or malformed record.

## Skill and documentation changes

The Value Lab skill will require every full refresh to:

- preserve and pass the prior publication as the comparison baseline;
- generate and validate `weeklyChanges`;
- review every headline against its referenced evidence;
- verify the section on desktop and mobile;
- verify that Copy as Markdown includes the same findings;
- preserve explicit baseline and no-material-change states.

The data contract and research workflow will document the schema, comparison semantics, and review requirements.

## Verification

Pipeline tests cover each candidate family, comparison isolation, ranking and capping, evidence resolution, baseline behavior, no-material-change behavior, and deterministic output. Renderer verification covers all three states at desktop and mobile widths and confirms source links and Markdown parity.

The existing Value Lab test suite, skill validation, and Gatsby production build must pass before completion. No live research refresh is required solely to add the capability; the current publication is regenerated from preserved evidence with an explicit baseline state if there is not yet an older comparable publication.

## Scope boundaries

This change does not add free-form editorial summaries, LLM-authored claims, cross-version benchmark comparisons, unsupported subscription-value conclusions, or runtime diff logic in the browser. It adds a deterministic comparison capability and the presentation needed to publish it.
