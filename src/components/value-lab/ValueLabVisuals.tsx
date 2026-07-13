import * as React from "react"
import { Panel, labPalette, styles } from "../world-model/pages-systems-stack-now/WorldModelPageChrome"

export type DashboardCard = {
  id: string
  label: string
  value: string
  detail: string
  accent: string
  evidence: string
  sourceRunIds: string[]
  group: "summary" | "supporting"
}

type ChartBase = {
  id: string
  title: string
  description?: string
  xLabel?: string
  yLabel?: string
}

type RankingPoint = {
  configurationId: string
  label: string
  value: number
  low?: number
  high?: number
}

export type RankedBarChartData = ChartBase & {
  type: "ranked_bar"
  points: Array<{
    sourceRunIds: string[]
  } & RankingPoint>
}

export type LegacyBarChartData = ChartBase & {
  type: "bar"
  points: RankingPoint[]
}

export type DumbbellChartData = ChartBase & {
  type: "dumbbell"
  points: Array<{
    id: string
    label: string
    benchmark?: string
    left: { label: string; value: number }
    right: { label: string; value: number }
    delta: number
    sourceRunIds: string[]
  }>
}

export type CoverageChartData = ChartBase & {
  type: "coverage"
  points: Array<{
    label: string
    value: number
    sourceRunIds: string[]
  }>
}

export type ScatterChartData = ChartBase & {
  type: "scatter"
  points: Array<{
    configurationId: string
    x: number
    y: number
    sourceRunIds: string[]
    priceSourceId: string
    priceSourceUrl: string
    priceEffectiveFrom: string
  }>
}

export type LegacyScatterChartData = ChartBase & {
  type: "scatter"
  points: Array<{
    configurationId: string
    x?: number | null
    y?: number
  }>
}

export type UnsupportedChartData = ChartBase & {
  type: string
  points?: unknown[]
}

export type ValueLabChart = RankedBarChartData | LegacyBarChartData | DumbbellChartData | CoverageChartData | ScatterChartData | LegacyScatterChartData | UnsupportedChartData

export const isRankedBarChart = (chart: ValueLabChart): chart is RankedBarChartData =>
  chart.type === "ranked_bar" && Array.isArray(chart.points)

export const isLegacyBarChart = (chart: ValueLabChart): chart is LegacyBarChartData =>
  chart.type === "bar" && Array.isArray(chart.points)

export const isDumbbellChart = (chart: ValueLabChart): chart is DumbbellChartData =>
  chart.type === "dumbbell" && Array.isArray(chart.points)

export const isCoverageChart = (chart: ValueLabChart): chart is CoverageChartData =>
  chart.type === "coverage" && Array.isArray(chart.points)

export const isScatterChart = (chart: ValueLabChart): chart is ScatterChartData =>
  chart.type === "scatter" && Array.isArray(chart.points) && chart.points.every(point =>
    typeof point === "object" && point !== null && (() => {
      const candidate = point as Partial<ScatterChartData["points"][number]>
      return typeof candidate.configurationId === "string"
        && candidate.configurationId.length > 0
        && typeof candidate.x === "number"
        && Number.isFinite(candidate.x)
        && candidate.x >= 0
        && typeof candidate.y === "number"
        && Number.isFinite(candidate.y)
        && candidate.y >= 0
        && candidate.y <= 1
        && Array.isArray(candidate.sourceRunIds)
        && candidate.sourceRunIds.length === 1
        && candidate.sourceRunIds.every(runId => typeof runId === "string" && runId.startsWith("sha256:"))
        && typeof candidate.priceSourceId === "string"
        && candidate.priceSourceId.length > 0
        && typeof candidate.priceSourceUrl === "string"
        && candidate.priceSourceUrl.startsWith("https://")
        && typeof candidate.priceEffectiveFrom === "string"
        && /^\d{4}-\d{2}-\d{2}$/.test(candidate.priceEffectiveFrom)
    })()
  )

export const isLegacyScatterChart = (chart: ValueLabChart): chart is LegacyScatterChartData =>
  chart.type === "scatter" && Array.isArray(chart.points)

const evidenceLabels: Record<string, string> = {
  official_verified: "Official verified",
  independently_reproduced: "Independently reproduced",
  first_party_measured: "First-party measured",
  vendor_reported: "Vendor reported",
  community_observed: "Community observed",
  estimated: "Estimated",
}

const percentage = (value: number) => `${(value * 100).toFixed(1)}%`
const points = (value: number) => `${(value * 100).toFixed(1)} pts`
const boundedPercent = (value: number) => Math.max(0, Math.min(100, value * 100))

const panelAccent = (accent: string): "cyan" | "green" | "slate" => {
  if (accent === "cyan") return "cyan"
  if (accent === "green") return "green"
  return "slate"
}

const ChartIntro = ({ chart }: { chart: ChartBase }) => (
  <div style={{ marginBottom: "1rem" }}>
    <h3 style={{ color: labPalette.heading, fontSize: "1.1rem", lineHeight: 1.3, margin: 0 }}>{chart.title}</h3>
    {chart.description || chart.yLabel ? (
      <p style={{ color: labPalette.body, lineHeight: 1.55, margin: "0.35rem 0 0" }}>{chart.description ?? chart.yLabel}</p>
    ) : null}
  </div>
)

export const SourceRunDetails = ({ sourceRunIds }: { sourceRunIds: string[] }) => (
  <details style={{ color: labPalette.slate, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", marginTop: "0.65rem" }}>
    <summary style={{ cursor: "pointer" }}>{sourceRunIds.length} source run{sourceRunIds.length === 1 ? "" : "s"}</summary>
    <code style={{ display: "block", lineHeight: 1.5, marginTop: "0.4rem", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
      {sourceRunIds.length > 0 ? sourceRunIds.join("\n") : "No source run IDs supplied."}
    </code>
  </details>
)

export const DashboardCardGrid = ({ cards }: { cards: DashboardCard[] }) => {
  if (cards.length === 0) return null

  return (
    <div role="list" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
      {cards.map(card => (
        <div key={card.id} role="listitem">
          <Panel accent={panelAccent(card.accent)}>
            <span style={styles.label}>{card.label}</span>
            <div style={{ color: labPalette.heading, fontFamily: "'JetBrains Mono', monospace", fontSize: "1.35rem", lineHeight: 1.25 }}>{card.value}</div>
            <p style={{ color: labPalette.body, lineHeight: 1.55, margin: "0.7rem 0" }}>{card.detail}</p>
            <small style={{ color: labPalette.slate, fontFamily: "'JetBrains Mono', monospace" }}>{evidenceLabels[card.evidence] ?? card.evidence}</small>
            <SourceRunDetails sourceRunIds={card.sourceRunIds} />
          </Panel>
        </div>
      ))}
    </div>
  )
}

export const RankedBarChart = ({ chart }: { chart: RankedBarChartData | LegacyBarChartData }) => (
  <Panel accent="cyan">
    <ChartIntro chart={chart} />
    <div aria-label={`${chart.title} ranking`} style={{ display: "grid", gap: "0.9rem" }}>
      {chart.points.map(point => (
        <div key={point.configurationId}>
          <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "0.35rem 1rem", justifyContent: "space-between" }}>
            <span style={{ color: labPalette.heading, fontSize: "0.9rem" }}>{point.label}</span>
            <span style={{ color: labPalette.cyan, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{percentage(point.value)}</span>
          </div>
          <div aria-hidden="true" style={{ background: labPalette.panelSoft, borderRadius: "999px", height: "8px", marginTop: "0.35rem", overflow: "hidden" }}>
            <div style={{ background: labPalette.cyan, borderRadius: "999px", height: "100%", width: `${boundedPercent(point.value)}%` }} />
          </div>
          {point.low !== undefined && point.high !== undefined ? (
            <small style={{ color: labPalette.slate, fontFamily: "'JetBrains Mono', monospace" }}>Interval {percentage(point.low)}–{percentage(point.high)}</small>
          ) : null}
          {chart.type === "ranked_bar" ? <SourceRunDetails sourceRunIds={point.sourceRunIds} /> : null}
        </div>
      ))}
    </div>
  </Panel>
)

export const HarnessDumbbellChart = ({ chart }: { chart: DumbbellChartData }) => (
  <Panel accent="green">
    <ChartIntro chart={chart} />
    <div style={{ display: "grid", gap: "1.1rem" }}>
      {chart.points.map(point => {
        const left = boundedPercent(point.left.value)
        const right = boundedPercent(point.right.value)
        const start = Math.min(left, right)
        const end = Math.max(left, right)
        const description = `${point.label}: ${point.left.label} ${percentage(point.left.value)}; ${point.right.label} ${percentage(point.right.value)}; observed difference ${points(point.delta)}.`

        return (
          <div key={point.id}>
            <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "0.35rem 0.8rem", justifyContent: "space-between" }}>
              <span style={{ color: labPalette.heading, fontSize: "0.9rem" }}>{point.label}</span>
              {point.benchmark ? <small style={{ color: labPalette.slate, fontFamily: "'JetBrains Mono', monospace" }}>{point.benchmark}</small> : null}
            </div>
            <svg aria-label={description} role="img" viewBox="0 0 100 18" style={{ display: "block", height: "38px", margin: "0.25rem 0", overflow: "visible", width: "100%" }}>
              <title>{description}</title>
              <line stroke={labPalette.border} strokeWidth="1" x1="0" x2="100" y1="9" y2="9" />
              <line stroke={labPalette.green} strokeWidth="2.5" x1={start} x2={end} y1="9" y2="9" />
              <circle cx={left} cy="9" fill={labPalette.cyan} r="3" />
              <circle cx={right} cy="9" fill={labPalette.green} r="3" />
            </svg>
            <div style={{ color: labPalette.body, display: "flex", flexWrap: "wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.76rem", gap: "0.35rem 1rem", justifyContent: "space-between" }}>
              <span>{point.left.label} {percentage(point.left.value)}</span>
              <span>{point.right.label} {percentage(point.right.value)}</span>
              <span style={{ color: labPalette.slate }}>Observed difference {points(point.delta)}</span>
            </div>
            <SourceRunDetails sourceRunIds={point.sourceRunIds} />
          </div>
        )
      })}
    </div>
  </Panel>
)

export const CoverageChart = ({ chart }: { chart: CoverageChartData }) => {
  const maximum = Math.max(1, ...chart.points.map(point => point.value))

  return (
    <Panel accent="slate">
      <ChartIntro chart={chart} />
      <div aria-label={`${chart.title} stages`} style={{ display: "grid", gap: "0.9rem" }}>
        {chart.points.map(point => (
          <div key={point.label}>
            <div style={{ alignItems: "baseline", display: "flex", gap: "1rem", justifyContent: "space-between" }}>
              <span style={{ color: labPalette.heading, fontSize: "0.9rem" }}>{point.label}</span>
              <span style={{ color: labPalette.heading, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem" }}>{point.value}</span>
            </div>
            <div aria-hidden="true" style={{ background: labPalette.panelSoft, borderRadius: "999px", height: "8px", marginTop: "0.35rem", overflow: "hidden" }}>
              <div style={{ background: labPalette.slate, borderRadius: "999px", height: "100%", width: `${(point.value / maximum) * 100}%` }} />
            </div>
            <SourceRunDetails sourceRunIds={point.sourceRunIds} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

const EmptyChart = ({ message }: { message: string }) => (
  <Panel accent="slate">
    <p style={{ color: labPalette.body, lineHeight: 1.6, margin: 0 }}>{message}</p>
  </Panel>
)

const UnsupportedChart = ({ chart }: { chart: ChartBase & { type: string } }) => (
  <div role="alert">
    <Panel accent="slate">
      <span style={styles.label}>Unsupported chart type</span>
      <p style={{ color: labPalette.body, lineHeight: 1.6, margin: 0 }}>Chart “{chart.title}” uses unsupported type “{chart.type}”. Add a renderer before publishing this data.</p>
    </Panel>
  </div>
)

const ScatterChart = ({ chart }: { chart: ScatterChartData }) => {
  const xValues = chart.points.map(point => point.x)
  const yValues = chart.points.map(point => point.y)
  const xMinimum = Math.min(...xValues)
  const xMaximum = Math.max(...xValues)
  const yMinimum = Math.min(...yValues)
  const yMaximum = Math.max(...yValues)
  const xSpan = xMaximum - xMinimum || 1
  const ySpan = yMaximum - yMinimum || 1
  const xPosition = (value: number) => 12 + ((value - xMinimum) / xSpan) * 80
  const yPosition = (value: number) => 88 - ((value - yMinimum) / ySpan) * 76
  const description = `${chart.title}. Each point plots generated API cost per evaluated task on the horizontal axis and the published benchmark pass rate on the vertical axis. ${chart.points.map(point => `${point.configurationId}: $${point.x.toFixed(2)} per task, ${percentage(point.y)}, benchmark run ${point.sourceRunIds.join(", ")}, pricing source ${point.priceSourceId} effective ${point.priceEffectiveFrom}.`).join(" ")}`

  return (
    <Panel accent="green">
      <ChartIntro chart={chart} />
      <svg aria-describedby={`${chart.id}-description`} aria-labelledby={`${chart.id}-title`} role="img" viewBox="0 0 100 100" style={{ display: "block", height: "auto", maxWidth: "42rem", width: "100%" }}>
        <title id={`${chart.id}-title`}>{chart.title}</title>
        <desc id={`${chart.id}-description`}>{description}</desc>
        <line stroke={labPalette.border} strokeWidth="1" x1="12" x2="92" y1="88" y2="88" />
        <line stroke={labPalette.border} strokeWidth="1" x1="12" x2="12" y1="12" y2="88" />
        <text fill={labPalette.slate} fontSize="3" textAnchor="middle" x="52" y="98">{chart.xLabel}</text>
        <text fill={labPalette.slate} fontSize="3" textAnchor="middle" transform="rotate(-90 3 50)" x="3" y="50">{chart.yLabel}</text>
        {chart.points.map(point => (
          <circle aria-label={`${point.configurationId}: $${point.x.toFixed(2)} per task and ${percentage(point.y)}`} cx={xPosition(point.x)} cy={yPosition(point.y)} fill={labPalette.cyan} key={point.configurationId} r="3.2" stroke={labPalette.panel} strokeWidth="1.25" />
        ))}
      </svg>
      <div aria-label={`${chart.title} point details`} style={{ display: "grid", gap: "0.8rem", marginTop: "1rem" }}>
        {chart.points.map(point => (
          <div key={point.configurationId} style={{ borderTop: `1px solid ${labPalette.border}`, paddingTop: "0.75rem" }}>
            <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "0.35rem 1rem", justifyContent: "space-between" }}>
              <span style={{ color: labPalette.heading, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>{point.configurationId}</span>
              <span style={{ color: labPalette.cyan, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" }}>${point.x.toFixed(2)} · {percentage(point.y)}</span>
            </div>
            <small style={{ color: labPalette.slate, display: "block", lineHeight: 1.5, marginTop: "0.3rem" }}>
              Pricing: <a href={point.priceSourceUrl} rel="noreferrer" target="_blank" style={{ color: labPalette.cyan }}>{point.priceSourceId}</a> · effective {point.priceEffectiveFrom}
            </small>
            <SourceRunDetails sourceRunIds={point.sourceRunIds} />
          </div>
        ))}
      </div>
    </Panel>
  )
}

export const ChartView = ({ chart }: { chart: ValueLabChart }) => {
  if (isRankedBarChart(chart)) return <RankedBarChart chart={chart} />
  if (isLegacyBarChart(chart)) return <RankedBarChart chart={chart} />
  if (isDumbbellChart(chart)) return <HarnessDumbbellChart chart={chart} />
  if (isCoverageChart(chart)) return <CoverageChart chart={chart} />
  if (isScatterChart(chart) && chart.points.length === 0) return <EmptyChart message="No performance–cost points were generated for this snapshot." />
  if (isScatterChart(chart)) return <ScatterChart chart={chart} />
  if (isLegacyScatterChart(chart) && chart.points.length === 0) return <EmptyChart message="No performance–cost points were generated for this snapshot." />
  return <UnsupportedChart chart={chart} />
}
