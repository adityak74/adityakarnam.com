import * as React from "react"
import { C, Btn, Row, Note, label } from "./Ch5_ui"

// All numbers are from the BudgetBench explainer post. null = not run / not shown in the post.
const TIERS = ["2K", "4K", "8K", "16K", "32K"]
type Series = { n: string; color: string; v: (number | null)[] }
const DATA = {
  lme: {
    title: "LongMemEval oracle, 500 questions, gpt-4o-mini",
    lo: 0.3, hi: 0.75,
    series: [
      { n: "Truncation", color: C.sec, v: [0.38, 0.57, 0.65, null, null] },
      { n: "RAG", color: C.clay, v: [0.646, 0.686, 0.686, null, null] },
      { n: "Lean retrieval", color: C.blue, v: [0.664, 0.686, 0.682, null, null] },
    ] as Series[],
    notes: [
      "At 2K, truncation scored 0.380 while RAG scored 0.646. Retrieval at 2K (0.646) is about what truncation needs 8K to reach (0.650).",
      "At 4K truncation climbs to 0.570. Both retrieval variants meet at 0.686.",
      "At 8K truncation catches up at 0.650. The retrieval variants stay flat, and their intervals overlap, so they cannot be separated.",
      "Not shown: this study only ran 2K, 4K and 8K, so there are no numbers for 16K.",
      "Not shown: this study only ran 2K, 4K and 8K, so there are no numbers for 32K.",
    ],
  },
  lb: {
    title: "LongBench v2 pilot, 89 items, qwen2.5:1.5b",
    lo: 0.2, hi: 0.4,
    series: [
      { n: "Truncation", color: C.sec, v: [0.29, 0.27, 0.27, 0.33, 0.33] },
      { n: "Summary", color: C.blue, v: [0.3, 0.24, 0.26, 0.29, 0.31] },
      { n: "RAG", color: C.clay, v: [0.3, 0.31, 0.35, 0.34, 0.31] },
    ] as Series[],
    notes: [
      "At 2K the three strategies sit between 0.29 and 0.30.",
      "At 4K summary drops to 0.24. More budget made it worse.",
      "At 8K RAG peaks at 0.35.",
      "At 16K truncation rises to 0.33 and RAG slips to 0.34.",
      "At 32K RAG falls back to 0.31. The post says the bootstrap intervals overlap heavily, so this is not a ranking.",
    ],
  },
}

export default function Ch6_BudgetSweep() {
  const [ds, setDs] = React.useState<"lme" | "lb">("lme")
  const [t, setT] = React.useState(0)
  const D = DATA[ds]
  const W = 640, H = 220, L = 60, R = 22, T0 = 12, B = 34
  const x = (i: number) => L + (i * (W - L - R)) / 4
  const y = (v: number) => T0 + ((D.hi - v) / (D.hi - D.lo)) * (H - T0 - B)
  const ticks = ds === "lme" ? [0.3, 0.45, 0.6, 0.75] : [0.2, 0.25, 0.3, 0.35, 0.4]
  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <Row>
        <Btn on={ds === "lme"} onClick={() => setDs("lme")}>LongMemEval</Btn>
        <Btn on={ds === "lb"} onClick={() => setDs("lb")}>LongBench v2 pilot</Btn>
      </Row>
      <div style={{ ...label, margin: "12px 0 6px" }}>{D.title}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Score against token budget. ${D.title}. Selected budget ${TIERS[t]}.`} style={{ width: "100%", height: "auto", display: "block" }}>
        <title>Score by budget tier</title>
        {ticks.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={C.line} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize={18} fontFamily={C.mono} fill={C.sec}>{v.toFixed(2)}</text>
          </g>
        ))}
        {TIERS.map((tt, i) => <text key={tt} x={x(i)} y={H - 10} textAnchor="middle" fontSize={18} fontFamily={C.mono} fill={i === t ? C.clay : C.sec}>{tt}</text>)}
        <line x1={x(t)} x2={x(t)} y1={T0} y2={H - B} stroke={C.clay} strokeWidth={2} />
        {D.series.map(s => {
          const pts = s.v.map((v, i) => (v === null ? null : [x(i), y(v)] as [number, number]))
          return (
            <g key={s.n}>
              <polyline points={pts.filter(Boolean).map(p => p!.join(",")).join(" ")} fill="none" stroke={s.color} strokeWidth={2} />
              {pts.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r={i === t ? 6 : 3.5} fill={s.color} stroke={C.paper} />)}
            </g>
          )
        })}
      </svg>
      <label style={{ ...label, display: "block", marginTop: 8 }} htmlFor="bb-tier">Budget per call: <span style={{ color: C.clay }}>{TIERS[t]}</span></label>
      <input id="bb-tier" type="range" min={0} max={4} step={1} value={t} onChange={e => setT(+e.target.value)} aria-valuetext={`${TIERS[t]} tokens`} style={{ width: "100%", accentColor: C.clay }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
        {D.series.map(s => (
          <div key={s.n} style={{ borderTop: `3px solid ${s.color}`, paddingTop: 6 }}>
            <div style={label}>{s.n}</div>
            <div style={{ fontFamily: C.mono, fontSize: 18 }}>{s.v[t] === null ? "not run" : s.v[t]!.toFixed(ds === "lme" ? 3 : 2)}</div>
          </div>
        ))}
      </div>
      <Note>{D.notes[t]}</Note>
      <div style={{ ...label, marginTop: 6 }}>Vertical axis does not start at zero. Values copied from the BudgetBench post.</div>
    </div>
  )
}
