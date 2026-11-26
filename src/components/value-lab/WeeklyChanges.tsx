import * as React from "react"
import { ed, Section } from "../world-model/pages-systems-stack-now/editorial"

const mono = ed.mono
const labPalette = { heading: ed.ink, body: ed.secondary, border: ed.hairline, cyan: ed.secondary, link: ed.clay }
const styles = {
  label: { color: ed.secondary, fontFamily: mono, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" } as React.CSSProperties,
}

export type WeeklyChangeMarker = "up" | "down" | "same" | "star"

export type WeeklyChange = {
  id: string
  marker: WeeklyChangeMarker
  headline: string
  evidence: string
  sourceRunIds: string[]
  sources: Array<{ label: string; url: string }>
}

export type WeeklyChangesData = {
  title: string
  baselineDate: string | null
  currentDate: string
  status: "baseline" | "compared"
  items: WeeklyChange[]
}

const markerGlyph = (marker: WeeklyChangeMarker) => {
  switch (marker) {
    case "up":
      return "↑"
    case "down":
      return "↓"
    case "same":
      return "↔"
    case "star":
      return "*"
    default:
      throw new Error(`Unsupported weekly change marker: ${String(marker)}`)
  }
}

const emptyMessage = (data: WeeklyChangesData) => data.status === "baseline"
  ? "Baseline established. The next research refresh will report material changes."
  : "No material tracked changes this week."

export const formatWeeklyChangesMarkdown = (
  data: WeeklyChangesData,
  evidenceLabels: Record<string, string>,
) => {
  if (data.items.length === 0) return emptyMessage(data)
  return data.items.map(item => {
    const links = item.sources
      .map((source, index) => `[${index + 1}](${source.url})`)
      .join(" ")
    return `${markerGlyph(item.marker)} ${item.headline} · ${evidenceLabels[item.evidence] ?? item.evidence}${links ? ` · ${links}` : ""}`
  }).join("\n")
}

type WeeklyChangesProps = {
  data: WeeklyChangesData
  evidenceLabels: Record<string, string>
}

const WeeklyChanges = ({ data, evidenceLabels }: WeeklyChangesProps) => {
  const period = data.status === "compared" && data.baselineDate
    ? `${data.baselineDate} → ${data.currentDate}`
    : `Baseline · ${data.currentDate}`

  return (
    <Section label="This week in coding agents" title={data.title}>
      <p style={{ color: labPalette.body, fontFamily: mono, fontSize: "12px", letterSpacing: "0.06em", margin: "0 0 1rem", textTransform: "uppercase" }}>{period}</p>
      <div style={{ borderTop: `1px solid ${labPalette.border}`, paddingTop: "1.25rem" }}>
        {data.items.length === 0 ? (
          <p style={{ color: labPalette.body, lineHeight: 1.65, margin: 0 }}>
            {emptyMessage(data)}
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {data.items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  borderBottom: index < data.items.length - 1 ? `1px solid ${labPalette.border}` : "none",
                  display: "grid",
                  gap: "0.45rem",
                  gridTemplateColumns: "2rem minmax(0, 1fr)",
                  paddingBottom: index < data.items.length - 1 ? "1rem" : 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ color: labPalette.cyan, fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontSize: "1.3rem" }}
                >
                  {markerGlyph(item.marker)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: labPalette.heading, fontSize: "1.05rem", lineHeight: 1.5, margin: 0 }}>
                    {item.headline}
                  </p>
                  <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.4rem" }}>
                    <span style={styles.label}>{evidenceLabels[item.evidence] ?? item.evidence}</span>
                    {item.sources.map((source, sourceIndex) => (
                      <a
                        key={source.url}
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                        style={{ color: labPalette.link, fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontSize: "12px" }}
                      >
                        Source {sourceIndex + 1}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}

export default WeeklyChanges
