# Value Lab data contract

The current file is `src/data/value-lab/current.json`. Keep it versioned and human-reviewable.

```json
{
  "schemaVersion": 2,
  "updatedAt": "2026-07-13",
  "title": "Coding Agent Value Lab",
  "subtitle": "Benchmarks tell you who scored highest. Value Lab tells you what to use.",
  "recommendation": {
    "eyebrow": "Current default",
    "title": "Use the balanced configuration by default.",
    "summary": "A short evidence-backed decision statement.",
    "configurationId": "provider-model__harness__medium",
    "metrics": [{ "label": "Measured score", "value": "61.2%" }]
  },
  "controls": {
    "workloads": [{ "id": "general-coding", "label": "General coding" }],
    "accessModes": [{ "id": "api", "label": "API" }],
    "goals": [{ "id": "value", "label": "Best value" }]
  },
  "insights": [{
    "id": "balanced-default",
    "label": "Practical default",
    "title": "A concise finding",
    "body": "Evidence-backed explanation.",
    "accent": "cyan",
    "evidence": "estimated"
  }],
  "dashboardCards": [{
    "id": "leader",
    "label": "Measured leader",
    "value": "61.2%",
    "detail": "Model · harness · interval 58.0–64.4%",
    "accent": "cyan",
    "evidence": "official_verified",
    "sourceRunIds": ["sha256:..."],
    "group": "summary"
  }],
  "configurations": [{
    "id": "provider-model__harness__medium",
    "model": "Example model",
    "harness": "Example harness",
    "reasoningEffort": "medium",
    "benchmark": "terminal-bench",
    "benchmarkVersion": "2.1",
    "score": 0.612,
    "costPerTaskUsd": 1.21,
    "medianRuntimeSeconds": 644,
    "evidence": "official_verified",
    "sourceUrl": "https://example.com"
  }],
  "charts": [{
    "id": "performance-cost",
    "title": "Performance versus cost",
    "type": "scatter",
    "xLabel": "Cost per task (USD)",
    "yLabel": "Benchmark pass rate",
    "points": [{ "configurationId": "provider-model__harness__medium", "x": 1.21, "y": 0.612, "sourceRunIds": ["sha256:..."] }]
  }],
  "methodology": { "summary": "How the current figures were produced.", "assumptions": [], "sources": [] },
  "history": [{ "date": "2026-07-13", "label": "Initial snapshot", "href": "#" }]
}
```

Required top-level fields: `schemaVersion`, `updatedAt`, `title`, `subtitle`, `recommendation`, `insights`, `dashboardCards`, `configurations`, `charts`, `methodology`.

`schemaVersion` is `2` for the dashboard contract. `dashboardCards` contains seven cards: four in the `summary` group and three in the `supporting` group. Every card requires `id`, `label`, `value`, `detail`, `accent`, `evidence`, `sourceRunIds`, and `group`. `group` must be `summary` or `supporting`; every ID in `sourceRunIds` must resolve to a normalized configuration `runId`. A card with unavailable evidence remains present and uses an explicit value such as `Unavailable`, an empty `sourceRunIds` array, and a detail explaining what evidence is missing.

Optional top-level fields: `positioning`, `status`, `alternatives`, `controls`, and `history`. `recommendation.configurationId` may be `null` while the pipeline has no publishable recommendation.

Evidence values are: `official_verified`, `independently_reproduced`, `first_party_measured`, `vendor_reported`, `community_observed`, `estimated`, and `experimental`.

The renderer may add optional fields, but must fail visibly for unsupported `charts[].type` values rather than silently dropping data.

Supported chart types are `ranked_bar`, `dumbbell`, and `coverage`. `scatter` is retained for future cost-ready datasets; it must not be synthesized when task-cost inputs are absent. Unsupported types must fail visibly rather than being silently dropped.

Chart point shapes:

- `ranked_bar`: `{ "configurationId": "...", "label": "Model · harness", "value": 0.612, "low": 0.580, "high": 0.644, "sourceRunIds": ["sha256:..."] }`. `value`, `low`, and `high` are decimal pass rates.
- `dumbbell`: `{ "id": "...", "label": "Model", "benchmark": "terminal-bench@2.1", "left": { "label": "Harness A", "value": 0.590 }, "right": { "label": "Harness B", "value": 0.612 }, "delta": 0.022, "sourceRunIds": ["sha256:...", "sha256:..."] }`. Endpoints must be comparable runs from the same benchmark version.
- `coverage`: `{ "label": "Collected", "value": 2, "sourceRunIds": ["sha256:...", "sha256:..."] }`. Values are non-negative stage counts for `Collected`, `Measured`, `Cost-ready`, or `Value-ready`.
- `scatter` (future cost-ready data): `{ "configurationId": "...", "x": 1.21, "y": 0.612, "sourceRunIds": ["sha256:..."] }`, where `x` is cost per task in USD and `y` is pass rate.

All derived chart claims require resolvable source/run references. Empty comparison datasets and missing cost evidence must be represented explicitly: use an empty `dumbbell.points` array when no comparable harness pair exists, and zero `Cost-ready`/`Value-ready` coverage (plus an unavailable card state) when those inputs are absent.
