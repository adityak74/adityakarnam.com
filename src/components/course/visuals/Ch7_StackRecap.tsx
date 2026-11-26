import * as React from "react"
import { Link } from "gatsby"
import { CHAPTERS } from "../chapters"

const c = { paper: "#FAF9F6", ink: "#141413", sec: "#5E5D59", hair: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C" }
const mono = "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace"
const sans = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// What each layer does inside the factory. Each line restates something from the chapter's own sources.
const ROLE: Record<number, string> = {
  1: "On Apple Silicon memory is the system, so one runtime reserving too much can stop another from running.",
  2: "Ollama was the lowest-latency baseline on the author's M5 Pro, so the fleet nodes serve through Ollama.",
  3: "Model size is a choice: on that machine qwen3.5:2b looked like the practical default over 4b and 9b.",
  4: "embenx is the author's retrieval toolkit, the memory a factory's agents can draw on.",
  5: "Each role is an agent with its own model and its own list of tools.",
  6: "The head-to-head eval is what turned a feeling about local models into a number.",
  7: "Routing, cost and a plan: this chapter.",
}

const StackRecap = () => {
  const [sel, setSel] = React.useState(7)
  const [foc, setFoc] = React.useState(0)
  const rungs = [...CHAPTERS].reverse()
  const cur = CHAPTERS.find(x => x.n === sel)!
  return (
    <div style={{ fontFamily: sans, color: c.ink }}>
      <svg viewBox="0 0 360 252" role="group" aria-label="The seven layers of the stack, Factories on top" style={{ width: "100%", height: "auto", display: "block" }}>
        <title>The stack from Silicon to Factories</title>
        {rungs.map((ch, i) => {
          const y = 4 + i * 34
          const on = ch.n === sel
          return (
            <g key={ch.n} role="button" tabIndex={0} aria-pressed={on} aria-label={`${ch.n}. ${ch.layer}`} style={{ cursor: "pointer", outline: "none" }}
              onFocus={() => setFoc(ch.n)} onBlur={() => setFoc(0)} onClick={() => setSel(ch.n)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(ch.n) } }}>
              <rect x={4 + (7 - ch.n) * 0} y={y} width="352" height="30" rx="3" fill={on ? c.paper : c.panel} stroke={foc === ch.n ? c.blue : on ? c.clay : c.hair} strokeWidth={on || foc === ch.n ? 2 : 1} />
              <text x="16" y={y + 19} fontFamily={mono} fontSize="11" fill={on ? c.clay : c.sec}>{ch.n}</text>
              <text x="40" y={y + 19} fontFamily={sans} fontSize="13" fill={c.ink}>{ch.layer}</text>
              <text x="344" y={y + 19} textAnchor="end" fontFamily={mono} fontSize="10" fill={c.sec}>{ch.minutes} min</text>
            </g>
          )
        })}
      </svg>
      <div aria-live="polite" style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>
        <strong style={{ fontFamily: "Fraunces, Georgia, serif", fontWeight: 500 }}>{cur.layer}.</strong> {ROLE[cur.n]}{" "}
        {cur.n !== 7 ? <Link to={`/course/${cur.slug}/`} style={{ color: c.blue }}>Revisit chapter {cur.n}</Link> : null}
      </div>
      <p style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: c.sec, margin: "10px 0 0" }}>Schematic, not to scale</p>
    </div>
  )
}
export default StackRecap
