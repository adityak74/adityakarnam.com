# Value Lab data contract

The current file is `src/data/value-lab/current.json`. Keep it versioned and human-reviewable.

```json
{
  "schemaVersion": 1,
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
    "points": [{ "configurationId": "provider-model__harness__medium", "x": 1.21, "y": 0.612 }]
  }],
  "methodology": { "summary": "How the current figures were produced.", "assumptions": [], "sources": [] },
  "history": [{ "date": "2026-07-13", "label": "Initial snapshot", "href": "#" }]
}
```

Required top-level fields: `schemaVersion`, `updatedAt`, `title`, `subtitle`, `recommendation`, `insights`, `configurations`, `charts`, `methodology`.

Optional top-level fields: `positioning`, `status`, `alternatives`, `controls`, and `history`. `recommendation.configurationId` may be `null` while the pipeline has no publishable recommendation.

Evidence values are: `official_verified`, `independently_reproduced`, `first_party_measured`, `vendor_reported`, `community_observed`, `estimated`, and `experimental`.

The renderer may add optional fields, but must fail visibly for unsupported `charts[].type` values rather than silently dropping data.

Supported chart types are `bar` for score-only benchmark data and `scatter` when sourced task-cost inputs exist. Bar points use `value`, `low`, and `high`; scatter points use `x` and `y`.
