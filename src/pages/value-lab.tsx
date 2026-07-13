import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import Seo from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import valueLab from "../data/value-lab/current.json"
import {
  Divider,
  Panel,
  TagList,
  TwoColumnGrid,
  WorldModelHero,
  WorldModelPageShell,
  WorldModelSection,
  labPalette,
  styles,
} from "../components/world-model/pages-systems-stack-now/WorldModelPageChrome"

type Accent = "cyan" | "green" | "slate"

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
}>
const history = valueLab.history as Array<{ date: string; label: string }>
const charts = valueLab.charts as unknown as Array<{
  id: string
  title: string
  type: string
  points: Array<{
    configurationId: string
    label?: string
    value?: number
    low?: number
    high?: number
    x?: number
    y?: number
  }>
}>

const formatMarkdown = () => {
  const lines = [
    `# ${valueLab.title}`,
    "",
    valueLab.positioning,
    "",
    `Updated: ${valueLab.updatedAt}`,
    `Status: ${valueLab.status}`,
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
        `- [${configuration.model}](${configuration.sourceUrl}) · ${configuration.harness} · ${configuration.reasoningEffort} effort · ${configuration.benchmark}@${configuration.benchmarkVersion}: ${(configuration.score * 100).toFixed(1)}%${configuration.confidenceIntervalLow !== undefined && configuration.confidenceIntervalHigh !== undefined ? ` (${(configuration.confidenceIntervalLow * 100).toFixed(1)}–${(configuration.confidenceIntervalHigh * 100).toFixed(1)}%)` : ""} · ${evidenceLabels[configuration.evidence] ?? configuration.evidence}`
      )
    )
  }

  if (valueLab.charts.length > 0) {
    lines.push("", "## Charts", "", ...valueLab.charts.map(chart => `- ${chart.title}: ${chart.points.length} data points (${chart.type})`))
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
        background: copied ? labPalette.green : "transparent",
        border: `1px solid ${labPalette.border}`,
        borderRadius: "999px",
        color: labPalette.text,
        cursor: "pointer",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.76rem",
        padding: "0.55rem 0.85rem",
      }}
    >
      {copied ? "Copied Markdown" : "Copy as Markdown"}
    </button>
  )
}

const ScatterPlaceholder = ({ message }: { message?: string }) => (
  <div
    style={{
      alignItems: "center",
      background: "rgba(242, 240, 236, 0.75)",
      border: `1px dashed ${labPalette.border}`,
      borderRadius: "10px",
      display: "flex",
      minHeight: "250px",
      padding: "1.5rem",
    }}
  >
    <div>
      <span style={styles.label}>Awaiting data</span>
      <p style={{ color: labPalette.body, lineHeight: 1.6, margin: 0, maxWidth: "34rem" }}>
        {message ?? <>Add verified configuration rows to <code>src/data/value-lab/current.json</code>. The performance–cost frontier will appear here automatically on the next build.</>}
      </p>
    </div>
  </div>
)

const ScoreBarChart = ({ chart }: { chart: (typeof charts)[number] }) => (
  <div style={{ display: "grid", gap: "0.8rem" }}>
    {chart.points.map(point => (
      <div key={point.configurationId}>
        <div style={{ alignItems: "baseline", display: "flex", gap: "1rem", justifyContent: "space-between" }}>
          <span style={{ color: labPalette.heading, fontSize: "0.9rem" }}>{point.label}</span>
          <span style={{ color: labPalette.cyan, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
            {((point.value ?? 0) * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{ background: labPalette.panelSoft, borderRadius: "999px", height: "8px", marginTop: "0.35rem", overflow: "hidden" }}>
          <div style={{ background: labPalette.cyan, borderRadius: "999px", height: "100%", width: `${(point.value ?? 0) * 100}%` }} />
        </div>
        {point.low !== undefined && point.high !== undefined ? (
          <small style={{ color: labPalette.slate, fontFamily: "'JetBrains Mono', monospace" }}>
            interval {(point.low * 100).toFixed(1)}–{(point.high * 100).toFixed(1)}%
          </small>
        ) : null}
      </div>
    ))}
  </div>
)

const ChartView = () => {
  const chart = charts[0]
  if (!chart) return <ScatterPlaceholder message="No chart data was generated for this snapshot." />
  if (chart.type === "bar") return <ScoreBarChart chart={chart} />
  if (chart.type === "scatter" && chart.points.length === 0) return <ScatterPlaceholder />
  return <ScatterPlaceholder message={`Unsupported chart type “${chart.type}”. Add a renderer before publishing this data.`} />
}

const ValueLabPage = (_props: PageProps) => (
  <Layout>
    <WorldModelPageShell>
      <WorldModelHero
        eyebrow="Coding Agent Value Lab"
        title={valueLab.title}
        description={valueLab.subtitle}
        aside={
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
              <div>
                <span style={styles.label}>Decision lens</span>
                <p style={{ color: labPalette.heading, fontSize: "1.15rem", lineHeight: 1.4, margin: 0 }}>
                  {valueLab.positioning}
                </p>
              </div>
              <CopyMarkdownButton />
            </div>
            <TagList items={[valueLab.status, `Updated ${valueLab.updatedAt}`, "Evidence-first"]} />
          </div>
        }
      />

      <Divider />

      <WorldModelSection eyebrow="Recommendation" title={valueLab.recommendation.title} description={valueLab.recommendation.summary}>
        <Panel accent="cyan">
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            {valueLab.recommendation.metrics.map(metric => (
              <div key={metric.label}>
                <span style={styles.label}>{metric.label}</span>
                <div style={{ color: labPalette.heading, fontFamily: "'JetBrains Mono', monospace", fontSize: "1.4rem" }}>{metric.value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </WorldModelSection>

      <WorldModelSection eyebrow="Research controls" title="Ask the page a practical question." description="The controls are part of the data contract now; the research pipeline can connect them to filtered recommendations as coverage grows.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
          {[...valueLab.controls.workloads, ...valueLab.controls.accessModes, ...valueLab.controls.goals].map(control => (
            <span key={control.id} style={{ border: `1px solid ${labPalette.border}`, borderRadius: "999px", color: labPalette.body, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.76rem", padding: "0.55rem 0.8rem" }}>{control.label}</span>
          ))}
        </div>
      </WorldModelSection>

      <WorldModelSection eyebrow="Today's insights" title="What the research layer is designed to surface.">
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {valueLab.insights.map(insight => (
            <Panel key={insight.id} accent={insight.accent as Accent}>
              <span style={styles.label}>{insight.label}</span>
              <h3 style={{ color: labPalette.heading, fontSize: "1.2rem", lineHeight: 1.25, margin: 0 }}>{insight.title}</h3>
              <p style={{ color: labPalette.body, lineHeight: 1.6 }}>{insight.body}</p>
              <small style={{ color: labPalette.slate, fontFamily: "'JetBrains Mono', monospace" }}>{evidenceLabels[insight.evidence] ?? insight.evidence}</small>
            </Panel>
          ))}
          {valueLab.insights.length === 0 ? (
            <Panel accent="slate">
              <span style={styles.label}>Research boundary</span>
              <h3 style={{ color: labPalette.heading, fontSize: "1.2rem", lineHeight: 1.25, margin: 0 }}>Cost conclusions are waiting for sourced run usage.</h3>
              <p style={{ color: labPalette.body, lineHeight: 1.6 }}>The current benchmark publishes measured accuracy, but not the token usage required to calculate cost per evaluated task.</p>
            </Panel>
          ) : null}
        </div>
      </WorldModelSection>

      <WorldModelSection eyebrow="Measured comparison" title={charts[0]?.title ?? "Measured performance"} description="Configurations remain tied to the exact model, harness, benchmark version, evaluation date, and evidence source.">
        <ChartView />
      </WorldModelSection>

      <WorldModelSection eyebrow="Methodology" title="Useful ranges over false precision." description={valueLab.methodology.summary}>
        <TwoColumnGrid>
          <Panel accent="green">
            <span style={styles.label}>Assumptions</span>
            <ul style={{ color: labPalette.body, lineHeight: 1.7, margin: 0, paddingLeft: "1.2rem" }}>
              {valueLab.methodology.assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}
            </ul>
          </Panel>
          <Panel accent="slate">
            <span style={styles.label}>Raw data</span>
            <p style={{ color: labPalette.body, lineHeight: 1.6, marginTop: 0 }}>
              Every published claim will retain its benchmark version, harness, reasoning level, evidence class, date, and source.
            </p>
            <span style={{ color: labPalette.cyan }}>Data contract is versioned with the page</span>
            {sources.length > 0 ? (
              <div style={{ display: "grid", gap: "0.45rem", marginTop: "1rem" }}>
                {sources.map(source => <a key={source.url} href={source.url} rel="noreferrer" target="_blank" style={{ color: labPalette.cyan }}>{source.label}</a>)}
              </div>
            ) : null}
          </Panel>
        </TwoColumnGrid>
      </WorldModelSection>
    </WorldModelPageShell>
  </Layout>
)

export default ValueLabPage

export const Head: HeadFC = () => (
  <Seo title="Coding Agent Value Lab" description={valueLab.subtitle} pathname="/value-lab/" />
)
