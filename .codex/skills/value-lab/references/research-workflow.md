# Value Lab research workflow

## Contents

1. Run layout
2. Collection protocol
3. Raw bundle schema
4. Validation and normalization
5. Calculations and insights
6. Publication gate
7. Page handoff

## 1. Run layout

Use the retrieval date as the run directory. Never overwrite a previous raw run.

```text
data/value-lab/
├── raw/YYYY-MM-DD/
│   ├── bundle.json
│   ├── terminal-bench-2-1.html
│   ├── swe-bench-verified.html
│   ├── provider-pricing.html
│   └── source-manifest.json
└── review/YYYY-MM-DD/
    └── gate.json

src/data/value-lab/
├── current.json
└── snapshots/YYYY-MM-DD/<run-id>.json
```

Raw files are evidence. Generated files are reproducible views of that evidence.

## 2. Collection protocol

### Discover

1. Start from `source-registry.md`.
2. Search the official domain for the current canonical page, release notes, and integrity notices.
3. Confirm the page date, benchmark version, and whether a newer official version exists.
4. Record redirects or replacements in the source manifest.

### Fetch

For each source:

1. Open the official page, JSON endpoint, repository artifact, or downloadable dataset.
2. Save the original response without rewriting it.
3. Compute or record a content hash when the fetch mechanism permits it.
4. Record `retrievedAt`, final URL, HTTP/access status, source kind, and evidence class.
5. If blocked or unavailable, add `accessible: false`; do not substitute an unofficial mirror silently.

### Extract

Extract only fields visible in the saved artifact. Preserve displayed strings in raw evidence and convert them in `bundle.json`:

- percentages to decimal scores (`79.1%` → `0.791`);
- prices to USD per million tokens;
- dates to ISO 8601;
- missing values to absent fields or `null`;
- model, harness, effort, benchmark, and version to separate fields.

One source-family subagent may extract records, but another agent or the main agent must check the structured output against the saved artifact.

## 3. Raw bundle schema

```json
{
  "run": {
    "runId": "2026-07-13T120000Z",
    "retrievedAt": "2026-07-13T12:00:00Z"
  },
  "sources": [{
    "id": "terminal-bench-2-1",
    "kind": "benchmark",
    "url": "https://www.tbench.ai/leaderboard/terminal-bench/2.1",
    "retrievedAt": "2026-07-13T12:00:00Z",
    "accessible": true,
    "rawPath": "data/value-lab/raw/2026-07-13/terminal-bench-2-1.html",
    "evidence": "official_verified"
  }],
  "benchmarkRuns": [{
    "provider": "OpenAI",
    "model": "Exact model label",
    "harness": "Exact agent/harness label",
    "reasoningEffort": "unknown",
    "benchmark": "terminal-bench",
    "benchmarkVersion": "2.1",
    "score": 0.791,
    "taskCount": 89,
    "evaluatedAt": "2026-05-06",
    "sourceId": "terminal-bench-2-1",
    "evidence": "official_verified"
  }],
  "prices": [{
    "provider": "OpenAI",
    "model": "Exact model label",
    "inputPerMillionUsd": 0,
    "cachedInputPerMillionUsd": 0,
    "outputPerMillionUsd": 0,
    "effectiveFrom": "2026-07-13",
    "sourceId": "openai-api-pricing"
  }],
  "plans": [],
  "quotaObservations": [],
  "integrityNotices": []
}
```

If a benchmark row lacks token counts, keep it publishable for measured performance but omit API-cost conclusions. Do not estimate token counts from another model or run.

## 4. Validation and normalization

The pipeline checks:

- required collections and fields;
- source IDs, accessibility, and HTTPS URLs;
- score range `[0, 1]`;
- non-negative prices;
- duplicate run identity;
- allowed evidence labels;
- stable configuration IDs;
- active integrity notices;
- Wilson intervals when task counts exist.

Fix errors in `bundle.json` only when the saved raw evidence supports the correction. If the official source is ambiguous, keep the record out of public output and document it in the gate report.

## 5. Calculations and insights

The deterministic script computes supported metrics only when inputs exist:

- uncached + cached input + output API cost;
- expected solved tasks per dollar;
- Wilson confidence intervals;
- performance-cost Pareto frontier within exact benchmark versions;
- practical-equivalence value recommendation;
- near-equivalent lower-cost insights;
- historical score, price, and recommendation changes.

Insight prose must be derivable from `facts`. `sourceRunIds` must resolve to normalized benchmark runs.

## 6. Publication gate

Require human review when any condition is true:

- leaderboard score changes by more than five percentage points;
- price changes by more than 20%;
- recommendation changes;
- an official source is unavailable;
- more than 10% of records fail validation;
- a result is retracted or has an active integrity notice;
- a new benchmark version would make prior direct comparisons invalid;
- generated diff is unexpectedly large or introduces unsupported chart data.

Exit code `2` means “valid output generated, review required.” It is not a pipeline failure and must not be converted to success automatically.

## 7. Page handoff

After the gate passes or receives explicit human approval:

1. Inspect `current.json` against `data-contract.md`.
2. Confirm all public values originate from normalized records.
3. Confirm source links, evidence labels, benchmark versions, and uncertainty are visible.
4. Verify Copy as Markdown includes recommendation, configuration rows, chart summaries, history, and citations.
5. Change the page only if the JSON introduces a new supported concept.
