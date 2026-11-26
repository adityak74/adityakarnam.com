import * as React from "react"
import { Link } from "gatsby"
import { CHAPTERS } from "../chapters"
import { useDone } from "../CourseShell"

const c = { paper: "#FAF9F6", ink: "#141413", sec: "#5E5D59", hair: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C" }
const mono = "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace"
const sans = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const serif = "Fraunces, Georgia, serif"

const Roadmap = () => {
  const { done } = useDone()
  const [hot, setHot] = React.useState<number | null>(null)
  const rungs = [...CHAPTERS].reverse() // Factories at the top, Silicon at the bottom
  return (
    <ol aria-label="The seven layers, Silicon at the bottom" style={{ listStyle: "none", margin: 0, padding: 0, fontFamily: sans }}>
      {rungs.map((ch, i) => {
        const isDone = done.includes(ch.slug)
        const active = hot === ch.n
        return (
          <li key={ch.n} style={{ marginBottom: 6, marginLeft: `${(rungs.length - 1 - i) * 0}px` }}>
            <Link
              to={`/course/${ch.slug}/`}
              onMouseEnter={() => setHot(ch.n)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(ch.n)} onBlur={() => setHot(null)}
              style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 10, alignItems: "baseline", padding: "12px 14px", background: active ? c.paper : c.panel, border: `1px solid ${active ? c.clay : c.hair}`, borderRadius: 4, textDecoration: "none", color: c.ink }}
            >
              <span style={{ fontFamily: mono, fontSize: 12, color: c.clay }}>{ch.n}</span>
              <span>
                <span style={{ fontFamily: serif, fontSize: 18 }}>{ch.layer}</span>
                <span style={{ display: "block", fontSize: 14, lineHeight: 1.5, color: c.sec, marginTop: 2 }}>{active ? ch.blurb : ch.title}</span>
              </span>
              <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: isDone ? c.blue : c.sec, whiteSpace: "nowrap" }}>
                {isDone ? <span aria-label="completed">&#10003; </span> : null}{ch.minutes} min
              </span>
            </Link>
          </li>
        )
      })}
      <li style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: c.sec, marginTop: 8 }}>Hardware at the bottom, software factories at the top. Schematic, not to scale.</li>
    </ol>
  )
}
export default Roadmap
