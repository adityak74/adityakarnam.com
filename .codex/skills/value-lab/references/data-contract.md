# Value Lab data contract

The current file is `src/data/value-lab/current.json`. Keep it versioned and human-reviewable.

```json
{
  "schemaVersion": 3,
  "updatedAt": "2026-07-13",
  "title": "Coding Agent Value Lab",
  "subtitle": "Benchmarks tell you who scored highest. Value Lab tells you what to use.",
  "weeklyChanges": {
    "title": "What's Changed Since Last Week?",
    "baselineDate": "2026-07-06",
    "currentDate": "2026-07-13",
    "status": "compared",
    "items": [{
      "id": "leader-unchanged-terminal-bench-2-1",
      "marker": "same",
      "headline": "Example model remained the leader on terminal-bench 2.1.",
      "evidence": "official_verified",
      "sourceRunIds": ["sha256:current", "sha256:baseline"],
      "sources": [{ "label": "Example model benchmark", "url": "https://example.com" }]
    }]
  },
  "recommendation": {
    "eyebrow": "Current default",
    "title": "Use the balanced configuration by default.",
    "summary": "A short evidence-backed decision statement.",
    "configurationId": "provider-model__harness__medium",
    "sourceRunIds": ["sha256:..."],
    "priceSourceId": "provider-api-pricing-2026-07",
    "priceEffectiveFrom": "2026-07-01",
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
    "sourceUrl": "https://example.com",
    "priceSourceId": "provider-api-pricing-2026-07",
    "priceSourceUrl": "https://example.com/pricing",
    "priceEffectiveFrom": "2026-07-01"
  }],
  "charts": [{
    "id": "performance-cost",
    "title": "Performance versus cost",
    "type": "scatter",
    "xLabel": "Cost per task (USD)",
    "yLabel": "Benchmark pass rate",
    "points": [{ "configurationId": "provider-model__harness__medium", "x": 1.21, "y": 0.612, "sourceRunIds": ["sha256:..."], "priceSourceId": "provider-api-pricing-2026-07", "priceSourceUrl": "https://example.com/pricing", "priceEffectiveFrom": "2026-07-01" }]
  }],
  "methodology": { "summary": "How the current figures were produced.", "assumptions": [], "sources": [] },
  "history": [{ "date": "2026-07-13", "label": "Initial snapshot", "href": "#" }]
}
```

Required top-level fields: `schemaVersion`, `updatedAt`, `title`, `subtitle`, `weeklyChanges`, `recommendation`, `insights`, `dashboardCards`, `configurations`, `charts`, `methodology`.

`schemaVersion` is `3` for the weekly-change dashboard contract. `weeklyChanges` is always present and contains at most four deterministic findings. `status` is `baseline` or `compared`; baseline output requires `baselineDate: null` and an empty `items` array. Compared output requires an earlier ISO `baselineDate`, may use an empty array when no material tracked changes exist, and never compares different benchmark versions.

Every weekly item requires `id`, `marker`, `headline`, `evidence`, `sourceRunIds`, and `sources`. `marker` is `up`, `down`, `same`, or `star`. Run IDs must resolve to the current or supplied prior publication. `sources` must be a non-empty, deduplicated list of matching HTTPS benchmark and pricing links embedded by the pipeline so the standalone current publication retains its comparison provenance. Task-cost evidence must be described as measured task-cost movement, not as a provider-wide API price change.

`dashboardCards` contains seven cards: four in the `summary` group and three in the `supporting` group. Every card requires `id`, `label`, `value`, `detail`, `accent`, `evidence`, `sourceRunIds`, and `group`. `group` must be `summary` or `supporting`; every ID in `sourceRunIds` must resolve to a normalized configuration `runId`. A card with unavailable evidence remains present and uses an explicit value such as `Unavailable`, an empty `sourceRunIds` array, and a detail explaining what evidence is missing.

Optional top-level fields: `positioning`, `status`, `alternatives`, `controls`, and `history`. `recommendation.configurationId` may be `null` while the pipeline has no publishable recommendation.

Evidence values are: `official_verified`, `independently_reproduced`, `first_party_measured`, `vendor_reported`, `community_observed`, `estimated`, and `experimental`.

The renderer may add optional fields, but must fail visibly for unsupported `charts[].type` values rather than silently dropping data.

Supported chart types are `ranked_bar`, `dumbbell`, `coverage`, and `scatter`. `performance-cost` is required when cost-ready configurations exist and must be absent when task-cost inputs are unavailable. Unsupported types must fail visibly rather than being silently dropped.

Chart point shapes:

- `ranked_bar`: `{ "configurationId": "...", "label": "Model · harness", "value": 0.612, "low": 0.580, "high": 0.644, "sourceRunIds": ["sha256:..."] }`. `value`, `low`, and `high` are decimal pass rates.
- `dumbbell`: `{ "id": "...", "label": "Model", "benchmark": "terminal-bench@2.1", "left": { "label": "Harness A", "value": 0.590 }, "right": { "label": "Harness B", "value": 0.612 }, "delta": 0.022, "sourceRunIds": ["sha256:...", "sha256:..."] }`. Endpoints must be comparable runs from the same benchmark version.
- `coverage`: `{ "label": "Collected", "value": 2, "sourceRunIds": ["sha256:...", "sha256:..."] }`. Values are non-negative stage counts for `Collected`, `Measured`, `Cost-ready`, or `Value-ready`.
- `scatter`: `{ "configurationId": "...", "x": 1.21, "y": 0.612, "sourceRunIds": ["sha256:..."], "priceSourceId": "...", "priceSourceUrl": "https://...", "priceEffectiveFrom": "2026-07-01" }`, where `x` is a non-negative cost per task in USD, `y` is a decimal pass rate, the single run ID is the exact benchmark run, and the pricing fields are the effective-dated source used for that cost join.

All derived chart claims require resolvable source/run references. `ranked_bar` intervals must remain in `[0, 1]` and ordered around the displayed value. Dumbbell endpoints must share provider, model, reasoning effort, benchmark, and benchmark version. Cost-ready configurations and non-null recommendations repeat the exact `priceSourceId` and `priceEffectiveFrom` of their normalized run. Empty comparison datasets and missing cost evidence must be represented explicitly: use an empty `dumbbell.points` array when no comparable harness pair exists, and zero `Cost-ready`/`Value-ready` coverage (plus an unavailable card state) when those inputs are absent.
