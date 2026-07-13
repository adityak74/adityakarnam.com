# Value Lab Dashboard Design

## Objective

Make the Coding Agent Value Lab immediately legible as a live research dashboard by adding visible summary cards and multiple graphs. Preserve the existing landing-page visual language and keep research calculations out of the React page.

## Scope

This increment adds a data-generated dashboard layer to the existing Value Lab research pipeline and renderer. It does not add inferred cost estimates, cross-version benchmark comparisons, interactive filtering, or a general-purpose charting framework.

## Architecture

The deterministic Value Lab pipeline remains the only place that converts validated research records into public facts. It will generate two new presentation datasets:

- `dashboardCards`: compact, sourced summaries such as the leader, measured configuration count, first-to-second gap, and evidence health.
- Additional `charts`: ranked performance, same-model harness comparisons, and research coverage.

The React page renders these supported structures without recalculating research conclusions. A routine research refresh changes raw evidence, generated JSON, snapshots, and the review gate. React changes only when a new card or chart capability is introduced.

## Dashboard cards

The first row contains four cards:

1. Leading configuration, score, and uncertainty.
2. Number of measured configurations and benchmark identity.
3. Gap between the first- and second-ranked configurations.
4. Evidence health, source count, and refresh date.

Supporting cards below the graphs show:

- The top three measured configurations.
- The largest observed harness difference among directly comparable runs of the same model and benchmark version.
- Research coverage, including an explicit explanation that cost/value ranking remains pending while official per-run usage is unavailable.

Every generated card includes a stable ID, label, primary value, explanatory text, evidence level, accent, and relevant source/run references. Missing evidence produces an explicit unavailable state rather than a guessed value.

## Graphs

### Ranked performance

A horizontal bar chart ranks all measured configurations by score. Each row shows the model and harness, score percentage, and published uncertainty interval. The chart remains benchmark-version isolated.

### Harness comparison

A paired-point or dumbbell chart compares the same model across harnesses only when at least two directly comparable runs exist on the same benchmark version. It shows observed score differences without claiming that the harness alone caused the difference.

### Research coverage

A compact coverage graph shows how many configurations have measured performance, cost-ready usage, and sufficient evidence for a value recommendation. It makes absent cost data visible instead of leaving an apparently empty chart area.

All chart records include a stable type and typed point shape. Unsupported chart types fail visibly in the renderer and validation tests.

## Responsive presentation

- Desktop: four summary cards in one row, followed by full-width graph panels.
- Tablet: two-column card grid.
- Mobile: one-column cards and vertically stacked chart labels with no required horizontal scrolling.
- Existing `WorldModelPageShell`, section, panel, color, typography, and evidence-label patterns remain in use.

## Copy as Markdown

The Markdown export includes:

- Dashboard card labels, values, context, and evidence status.
- Ranked performance with score and uncertainty.
- Harness comparisons with neutral observed-difference language.
- Research coverage and the reason cost/value ranking is pending.
- Existing sources and methodology content.

## Skill changes

The repo-level and user-level Value Lab skill will require:

- Generating and validating dashboard cards and all supported graph datasets.
- Treating routine visual refreshes as JSON-only updates.
- Updating the renderer, schema, tests, and Markdown export only when a new visualization capability is introduced.
- Desktop and mobile visual checks for cards, graphs, evidence labels, and empty states.
- Continued prohibition on fabricated cost, token, quota, or causal claims.
- `gpt-5.6-luna` for routine source/schema checks and `gpt-5.6-terra` at high reasoning for new renderer or visualization capabilities. `gpt-5.6-sol` remains reserved for substantial methodology or architecture disputes.

## Error handling and integrity

- Empty or incomplete datasets produce explicit coverage and unavailable states.
- Cards and graph points retain source/run references.
- Benchmark versions are never mixed in rankings or comparisons.
- An inaccessible or retracted source continues to trigger the existing review gate.
- A malformed card or chart fails deterministic validation before publication.

## Testing and acceptance criteria

The increment is complete when:

- Pipeline tests cover card generation, ranking, uncertainty, harness pairing, coverage counts, deterministic output, and malformed visualization data.
- The current live Terminal-Bench snapshot generates four summary cards and all three graph sections without inventing cost data.
- The Gatsby build succeeds and `/value-lab/` visibly renders cards and graphs at desktop and mobile widths.
- Copy as Markdown contains the card and graph summaries.
- The skill validator passes and the installed user-level skill matches the repo-level skill.
- Only intended files are committed and PR #63 remains unmerged.
