import * as React from "react"
import { C, Btn, Row, Note, Schematic, label } from "./Ch5_ui"

const VARS = [
  { k: "strategy", n: "Memory strategy", a: "truncation", b: "retrieval" },
  { k: "budget", n: "Token budget", a: "2K", b: "8K" },
  { k: "model", n: "Model", a: "small model", b: "larger model" },
  { k: "decoding", n: "Decoding settings", a: "temperature 0", b: "temperature 0.7" },
]

export default function Ch6_FairComparison() {
  const [chg, setChg] = React.useState<Record<string, boolean>>({ strategy: true })
  const changed = VARS.filter(v => chg[v.k])
  const toggle = (k: string) => setChg(c => ({ ...c, [k]: !c[k] }))
  const n = changed.length
  const verdict =
    n === 0
      ? "Nothing differs. A and B are the same experiment, so any gap you see is noise. That is still useful: it tells you how much noise to expect."
      : n === 1
      ? `Only ${changed[0].n.toLowerCase()} differs. If B scores higher than A, there is exactly one thing it can be credited to.`
      : `${n} things differ. Suppose B scores higher. Was it ${changed.map(c => c.n.toLowerCase()).join(", or the ")}? The result cannot tell you, because every candidate changed together.`
  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <div style={{ ...label, marginBottom: 6 }}>Tick what you change between run A and run B</div>
      <div role="group" aria-label="Variables to change" style={{ display: "grid", gap: 6 }}>
        {VARS.map(v => (
          <label key={v.k} style={{ display: "grid", gridTemplateColumns: "28px 1fr", alignItems: "center", gap: 8, padding: "6px 8px", border: `1px solid ${chg[v.k] ? C.clay : C.line}`, borderRadius: 4, background: chg[v.k] ? C.paper : "transparent", cursor: "pointer", minHeight: 44 }}>
            <input type="checkbox" checked={!!chg[v.k]} onChange={() => toggle(v.k)} style={{ width: 20, height: 20, accentColor: C.clay }} />
            <span style={{ fontSize: 15 }}>
              <strong>{v.n}</strong>
              <span style={{ display: "block", fontFamily: C.mono, fontSize: 13, color: C.sec }}>A: {v.a}{chg[v.k] ? ` | B: ${v.b}` : ` | B: same`}</span>
            </span>
          </label>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <span style={label}>Variables changed</span>
        <span style={{ fontFamily: C.mono, fontSize: 20, color: n === 1 ? C.blue : n === 0 ? C.sec : C.clay }}>{n}</span>
        <span style={{ ...label, color: n === 1 ? C.blue : n === 0 ? C.sec : C.clay }}>{n === 1 ? "readable" : n === 0 ? "no comparison" : "unreadable"}</span>
      </div>
      <Note>{verdict}</Note>
      <Row>
        <Btn onClick={() => setChg({ budget: true })}>BudgetBench style: budget only</Btn>
        <Btn onClick={() => setChg({ strategy: true, model: true })}>Change two things</Btn>
      </Row>
      <Schematic />
    </div>
  )
}
