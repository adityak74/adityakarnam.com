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

export type RankedBarChartData = ChartBase & {
  type: "ranked_bar" | "bar"
  points: Array<{
    configurationId: string
    label: string
    value: number
    low?: number
    high?: number
    sourceRunIds?: string[]
  }>
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

export type ValueLabChart = RankedBarChartData | DumbbellChartData | CoverageChartData | LegacyScatterChartData | UnsupportedChartData

export const isRankedBarChart = (chart: ValueLabChart): chart is RankedBarChartData =>
  (chart.type === "ranked_bar" || chart.type === "bar") && Array.isArray(chart.points)

export const isDumbbellChart = (chart: ValueLabChart): chart is DumbbellChartData =>
  chart.type === "dumbbell" && Array.isArray(chart.points)

export const isCoverageChart = (chart: ValueLabChart): chart is CoverageChartData =>
  chart.type === "coverage" && Array.isArray(chart.points)

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
          </Panel>
        </div>
      ))}
    </div>
  )
}

export const RankedBarChart = ({ chart }: { chart: RankedBarChartData }) => (
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

export const ChartView = ({ chart }: { chart: ValueLabChart }) => {
  if (isRankedBarChart(chart)) return <RankedBarChart chart={chart} />
  if (isDumbbellChart(chart)) return <HarnessDumbbellChart chart={chart} />
  if (isCoverageChart(chart)) return <CoverageChart chart={chart} />
  if (isLegacyScatterChart(chart) && chart.points.length === 0) return <EmptyChart message="No performance–cost points were generated for this snapshot." />
  return <UnsupportedChart chart={chart} />
}
