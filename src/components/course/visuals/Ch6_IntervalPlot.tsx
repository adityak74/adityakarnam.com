import * as React from "react"
import { C, Note, label } from "./Ch5_ui"

// Paired deltas against full context at 32K, with bootstrap intervals, from the BudgetBench explainer post.
const ROWS = [
  { n: "Local 1.5B: RAG 8K", d: 0.02, lo: -0.08, hi: 0.12 },
  { n: "Hosted: RAG 32K", d: -0.01, lo: -0.04, hi: 0.02 },
  { n: "Hosted: Lean retrieval 32K", d: -0.02, lo: -0.05, hi: 0.0 },
  { n: "Hosted: RAG 8K", d: -0.07, lo: -0.17, hi: 0.02 },
  { n: "Hosted: Lean retrieval 8K", d: -0.09, lo: -0.2, hi: 0.02 },
  { n: "Hosted: Truncation 8K", d: -0.2, lo: -0.34, hi: -0.07 },
]

export default function Ch6_IntervalPlot() {
  const [k, setK] = React.useState(5)
  const W = 640, L = 140, R = 16, lo = -0.36, hi = 0.14
  const x = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R)
  const H = 40 + ROWS.length * 34
  const r = ROWS[k]
  const clear = r.hi < 0 || r.lo > 0
  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Paired score differences against full context, with intervals. Only hosted truncation at 8K has an interval that excludes zero." style={{ width: "100%", height: "auto", display: "block" }}>
        <title>Differences against full context with intervals</title>
        <line x1={x(0)} x2={x(0)} y1={6} y2={H - 26} stroke={C.ink} strokeWidth={1.5} />
        <text x={x(0)} y={H - 8} textAnchor="middle" fontSize={18} fontFamily={C.mono} fill={C.ink}>0</text>
        {[-0.3, -0.2, -0.1, 0.1].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={6} y2={H - 26} stroke={C.line} /><text x={x(v)} y={H - 8} textAnchor="middle" fontSize={18} fontFamily={C.mono} fill={C.sec}>{v}</text></g>)}
        {ROWS.map((q, i) => {
          const yy = 22 + i * 34
          const ok = q.hi < 0 || q.lo > 0
          const col = ok ? C.clay : C.blue
          return (
            <g key={q.n} onClick={() => setK(i)} style={{ cursor: "pointer" }}>
              <rect x={0} y={yy - 15} width={W} height={30} fill={i === k ? C.paper : "transparent"} />
              <text x={4} y={yy + 4} fontSize={17} fontFamily={C.mono} fill={i === k ? C.ink : C.sec}>{q.n.replace("Hosted: ", "").replace("Local 1.5B: ", "Local ").replace("Lean retrieval", "Lean")}</text>
              <line x1={x(q.lo)} x2={x(q.hi)} y1={yy} y2={yy} stroke={col} strokeWidth={3} />
              <circle cx={x(q.d)} cy={yy} r={5} fill={col} stroke={C.paper} />
            </g>
          )
        })}
      </svg>
      <div role="group" aria-label="Choose a row" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {ROWS.map((q, i) => (
          <button key={q.n} type="button" aria-pressed={i === k} onClick={() => setK(i)} style={{ ...label, cursor: "pointer", minHeight: 40, padding: "8px 10px", borderRadius: 4, border: `1px solid ${i === k ? C.clay : C.line}`, background: i === k ? C.paper : "transparent", color: i === k ? C.clay : C.ink }}>{q.n.replace("Hosted: ", "").replace("Local 1.5B: ", "Local ")}</button>
        ))}
      </div>
      <Note>
        {r.n}: difference {r.d > 0 ? "+" : ""}{r.d.toFixed(2)}, interval [{r.lo.toFixed(2)}, {r.hi.toFixed(2)}].{" "}
        {clear ? "The interval excludes zero, so this loss is real at this sample size." : "The interval includes zero, so this does not show a difference. It does not show equivalence either."}
      </Note>
      <div style={{ ...label, marginTop: 6 }}>Zero line = same as full context. Rows without a prefix are the hosted model. Clay = interval excludes zero. Blue = includes zero. Values from the BudgetBench post.</div>
    </div>
  )
}
