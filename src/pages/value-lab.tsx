/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import valueLab from "../data/value-lab/current.json"
import {
  ChartView,
  DashboardCardGrid,
  isCoverageChart,
  isDumbbellChart,
  isLegacyBarChart,
  isLegacyScatterChart,
  isRankedBarChart,
  isScatterChart,
  type DashboardCard,
  type ValueLabChart,
} from "../components/value-lab/ValueLabVisuals"
import WeeklyChanges, {
  formatWeeklyChangesMarkdown,
  type WeeklyChangesData,
} from "../components/value-lab/WeeklyChanges"
import { ed, Page, Title, Section, Prose, TextLink } from "../components/world-model/pages-systems-stack-now/editorial"

const mono = ed.mono
const label: React.CSSProperties = { color: ed.secondary, display: "block", fontFamily: mono, fontSize: "12px", letterSpacing: "0.06em", marginBottom: "0.5rem", textTransform: "uppercase" }
const rule: React.CSSProperties = { borderTop: `1px solid ${ed.hairline}`, padding: "1.25rem 0" }

const evidenceLabels: Record<string, string> = {
  official_verified: "Official verified",
  independently_reproduced: "Independently reproduced",
  first_party_measured: "First-party measured",
  vendor_reported: "Vendor reported",
  community_observed: "Community observed",
  estimated: "Estimated",
  experimental: "Experimental",
  methodology: "Methodology",
}

const sources = valueLab.methodology.sources as Array<{
  label: string
  url: string
  evidence?: string
  retrievedAt?: string
}>
const configurations = valueLab.configurations as Array<{
  id: string
  runId: string
  model: string
  harness: string
  reasoningEffort: string
  benchmark: string
  benchmarkVersion: string
  score: number
  confidenceIntervalLow?: number
  confidenceIntervalHigh?: number
  evidence: string
  sourceUrl: string
  costPerTaskUsd?: number | null
  priceSourceId?: string
  priceSourceUrl?: string
  priceEffectiveFrom?: string
}>
const history = valueLab.history as Array<{ date: string; label: string }>
const dashboardCards = ((valueLab as unknown) as { dashboardCards?: DashboardCard[] }).dashboardCards ?? []
const charts = valueLab.charts as unknown as ValueLabChart[]
const weeklyChanges = ((valueLab as unknown) as { weeklyChanges: WeeklyChangesData }).weeklyChanges

const formatMarkdown = () => {
  const lines = [
    `# ${valueLab.title}`,
    "",
    valueLab.positioning,
    "",
    `Updated: ${valueLab.updatedAt}`,
    `Status: ${valueLab.status}`,
    "",
    `## ${weeklyChanges.title}`,
    "",
    formatWeeklyChangesMarkdown(weeklyChanges, evidenceLabels),
    "",
    `## ${valueLab.recommendation.eyebrow}`,
    "",
    valueLab.recommendation.title,
    "",
    valueLab.recommendation.summary,
    "",
    "| Metric | Value |",
    "| --- | --- |",
    ...valueLab.recommendation.metrics.map(metric => `| ${metric.label} | ${metric.value} |`),
    "",
    "## Insights",
    "",
    ...valueLab.insights.flatMap(insight => [
      `### ${insight.title}`,
      "",
      `**${insight.label}** · ${evidenceLabels[insight.evidence] ?? insight.evidence}`,
      "",
      insight.body,
      "",
    ]),
    "## Methodology",
    "",
    valueLab.methodology.summary,
    "",
    ...valueLab.methodology.assumptions.map(assumption => `- ${assumption}`),
  ]

  if (configurations.length > 0) {
    lines.push(
      "",
      "## Configurations",
      "",
      ...configurations.map(configuration =>
        `- [${configuration.model}](${configuration.sourceUrl}) · ${configuration.harness} · ${configuration.reasoningEffort} effort · ${configuration.benchmark}@${configuration.benchmarkVersion}: ${(configuration.score * 100).toFixed(1)}%${configuration.confidenceIntervalLow !== undefined && configuration.confidenceIntervalHigh !== undefined ? ` (${(configuration.confidenceIntervalLow * 100).toFixed(1)}–${(configuration.confidenceIntervalHigh * 100).toFixed(1)}%)` : ""} · ${evidenceLabels[configuration.evidence] ?? configuration.evidence}${configuration.costPerTaskUsd !== null && configuration.costPerTaskUsd !== undefined ? ` · $${configuration.costPerTaskUsd.toFixed(6)} per task · benchmark run ${configuration.runId} · pricing [${configuration.priceSourceId}](${configuration.priceSourceUrl}) effective ${configuration.priceEffectiveFrom}` : ""}`
      )
    )
  }

  if (dashboardCards.length > 0) {
    lines.push(
      "",
      "## Dashboard",
      "",
      "| Card | Value | Detail | Evidence | Source run IDs |",
      "| --- | --- | --- | --- | --- |",
      ...dashboardCards.map(card => `| ${card.label} | ${card.value} | ${card.detail} | ${evidenceLabels[card.evidence] ?? card.evidence} | ${card.sourceRunIds.join(", ") || "None"} |`)
    )
  }

  if (charts.length > 0) {
    lines.push("", "## Charts")
    charts.forEach(chart => {
      lines.push("", `### ${chart.title}`, "")
      if (isRankedBarChart(chart)) {
        lines.push("| Configuration | Score | Interval | Source run IDs |", "| --- | --- | --- | --- |", ...chart.points.map(point => {
          const interval = point.low !== undefined && point.high !== undefined ? `${(point.low * 100).toFixed(1)}–${(point.high * 100).toFixed(1)}%` : "Not published"
          return `| ${point.label} | ${(point.value * 100).toFixed(1)}% | ${interval} | ${point.sourceRunIds.join(", ")} |`
        }))
      } else if (isLegacyBarChart(chart)) {
        lines.push("| Configuration | Score | Interval |", "| --- | --- | --- |", ...chart.points.map(point => {
          const interval = point.low !== undefined && point.high !== undefined ? `${(point.low * 100).toFixed(1)}–${(point.high * 100).toFixed(1)}%` : "Not published"
          return `| ${point.label} | ${(point.value * 100).toFixed(1)}% | ${interval} |`
        }))
      } else if (isDumbbellChart(chart)) {
        lines.push("| Configuration | Harness values | Observed difference | Source run IDs |", "| --- | --- | --- | --- |", ...chart.points.map(point =>
          `| ${point.label} | ${point.left.label}: ${(point.left.value * 100).toFixed(1)}%; ${point.right.label}: ${(point.right.value * 100).toFixed(1)}% | ${(point.delta * 100).toFixed(1)} pts | ${point.sourceRunIds.join(", ")} |`
        ))
      } else if (isCoverageChart(chart)) {
        lines.push("| Stage | Count | Source run IDs |", "| --- | --- | --- |", ...chart.points.map(point => `| ${point.label} | ${point.value} | ${point.sourceRunIds.join(", ") || "None"} |`))
      } else if (isScatterChart(chart)) {
        lines.push("| Configuration | Cost per task | Score | Benchmark run IDs | Pricing source | Effective from |", "| --- | --- | --- | --- | --- | --- |", ...chart.points.map(point =>
          `| ${point.configurationId} | $${point.x.toFixed(6)} | ${(point.y * 100).toFixed(1)}% | ${point.sourceRunIds.join(", ")} | [${point.priceSourceId}](${point.priceSourceUrl}) | ${point.priceEffectiveFrom} |`
        ))
      } else if (isLegacyScatterChart(chart)) {
        lines.push(`- ${chart.points.length} legacy scatter data points (${chart.type})`)
      } else {
        lines.push(`- ${Array.isArray(chart.points) ? chart.points.length : 0} data points (${chart.type})`)
      }
    })
  }

  if (history.length > 0) {
    lines.push("", "## History", "", ...history.map(snapshot => `- ${snapshot.date}: ${snapshot.label}`))
  }

  if (sources.length > 0) {
    lines.push(
      "",
      "## Sources",
      "",
      ...sources.map(source =>
        `- [${source.label}](${source.url})${source.evidence ? ` · ${evidenceLabels[source.evidence] ?? source.evidence}` : ""}${source.retrievedAt ? ` · retrieved ${source.retrievedAt}` : ""}`
      )
    )
  }

  return lines.join("\n")
}

const CopyMarkdownButton = () => {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    const markdown = formatMarkdown()
    try {
      await navigator.clipboard.writeText(markdown)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = markdown
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        background: "transparent",
        border: `1px solid ${ed.hairline}`,
        borderRadius: "4px",
        color: copied ? ed.clay : ed.ink,
        cursor: "pointer",
        fontFamily: mono,
        fontSize: "12px",
        letterSpacing: "0.06em",
        padding: "0.5rem 0.8rem",
        textTransform: "uppercase",
      }}
    >
      {copied ? "Copied" : "Copy as Markdown"}
    </button>
  )
}

const summaryCards = dashboardCards.filter(card => card.group === "summary")
const supportingCards = dashboardCards.filter(card => card.group === "supporting")

const ValueLabPage = (_props: PageProps) => (
  <Layout>
    <Page>
      <Title eyebrow="Coding Agent Value Lab" lede={valueLab.subtitle}>
        {valueLab.title}
      </Title>

      <Section>
        <Prose>
          <p>{valueLab.positioning}</p>
        </Prose>
        <p style={{ color: ed.secondary, fontFamily: mono, fontSize: "12px", letterSpacing: "0.06em", margin: "1rem 0", textTransform: "uppercase" }}>
          {valueLab.status} / Updated {valueLab.updatedAt}
        </p>
        <CopyMarkdownButton />
      </Section>

      <WeeklyChanges data={weeklyChanges} evidenceLabels={evidenceLabels} />

      {summaryCards.length > 0 ? (
        <Section label="Summary" title="Measured results">
          <DashboardCardGrid cards={summaryCards} />
        </Section>
      ) : null}

      <Section label="Recommendation" title={valueLab.recommendation.title}>
        <Prose>
          <p>{valueLab.recommendation.summary}</p>
        </Prose>
        <div style={{ ...rule, display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginTop: "1.5rem" }}>
          {valueLab.recommendation.metrics.map(metric => (
            <div key={metric.label}>
              <span style={label}>{metric.label}</span>
              <div style={{ color: ed.ink, fontFamily: mono, fontSize: "1.25rem" }}>{metric.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Filters" title="Workloads, access modes, goals">
        <Prose>
          <p>The data is meant to be sliced by these. They do not filter anything yet.</p>
        </Prose>
        <p style={{ color: ed.secondary, fontFamily: mono, fontSize: "12px", letterSpacing: "0.04em", lineHeight: 2, marginTop: "1rem" }}>
          {[...valueLab.controls.workloads, ...valueLab.controls.accessModes, ...valueLab.controls.goals].map(control => control.label).join(" / ")}
        </p>
      </Section>

      <Section label="Insights" title="What the data shows">
        {valueLab.insights.map(insight => (
          <div key={insight.id} style={rule}>
            <span style={label}>{insight.label}</span>
            <h3 style={{ color: ed.ink, fontFamily: ed.serif, fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.3, margin: "0 0 0.5rem" }}>{insight.title}</h3>
            <p style={{ color: ed.secondary, lineHeight: 1.65, margin: "0 0 0.5rem", maxWidth: "68ch" }}>{insight.body}</p>
            <small style={{ color: ed.secondary, fontFamily: mono, fontSize: "12px" }}>{evidenceLabels[insight.evidence] ?? insight.evidence}</small>
          </div>
        ))}
        {valueLab.insights.length === 0 ? (
          <div style={rule}>
            <h3 style={{ color: ed.ink, fontFamily: ed.serif, fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.3, margin: "0 0 0.5rem" }}>No cost conclusions yet</h3>
            <p style={{ color: ed.secondary, lineHeight: 1.65, margin: 0, maxWidth: "68ch" }}>
              The benchmark publishes measured accuracy but not the token usage needed to compute cost per evaluated task.
            </p>
          </div>
        ) : null}
      </Section>

      {charts.map(chart => (
        <Section key={chart.id} label="Measured comparison">
          <ChartView chart={chart} />
        </Section>
      ))}

      {supportingCards.length > 0 ? (
        <Section label="Supporting evidence" title="Context">
          <DashboardCardGrid cards={supportingCards} />
        </Section>
      ) : null}

      <Section label="Methodology" title="Ranges, not point estimates">
        <Prose>
          <p>{valueLab.methodology.summary}</p>
        </Prose>
        <div style={{ ...rule, marginTop: "1.5rem" }}>
          <span style={label}>Assumptions</span>
          <ul style={{ color: ed.secondary, lineHeight: 1.7, margin: 0, maxWidth: "68ch", paddingLeft: "1.2rem" }}>
            {valueLab.methodology.assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}
          </ul>
        </div>
        <div style={rule}>
          <span style={label}>Raw data</span>
          <Prose>
            <p>Each claim keeps its benchmark version, harness, reasoning level, evidence class, date and source. The data format is versioned with the page.</p>
          </Prose>
          {sources.length > 0 ? (
            <div style={{ display: "grid", gap: "0.4rem", marginTop: "1rem" }}>
              {sources.map(source => <span key={source.url}><TextLink href={source.url}>{source.label}</TextLink></span>)}
            </div>
          ) : null}
        </div>
      </Section>
    </Page>
  </Layout>
)

export default ValueLabPage

export const Head: HeadFC = () => (
  <Seo title="Coding Agent Value Lab" description={valueLab.subtitle} pathname="/value-lab/" />
)
