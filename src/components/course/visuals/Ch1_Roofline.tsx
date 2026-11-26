import * as React from "react"
import { C, btn, row, svgBox, svgText, readout, mono } from "./Ch1_ui"

// Schematic roofline in log-log space. x = tokens that share each read of the weights
// (operations per byte moved rises with it). Ridge placed at ~80x the batch-1 level,
// matching the ~80x GEMM/GEMV gap measured in the roofline post. Not to scale.
const MAXS = 12 // log2 of 4096
const RIDGE = Math.log2(80)
const X0 = 44, X1 = 340, Y0 = 24, Y1 = 176
const xm = (s: number) => X0 + ((X1 - X0) * s) / MAXS
const ym = (p: number) => Y1 - ((Y1 - Y0) * p) / (RIDGE + 0.3)

export default function Roofline() {
  const [s, setS] = React.useState(0)
  const perf = Math.min(s, RIDGE)
  const bound = s < RIDGE
  const tokens = Math.round(Math.pow(2, s))
  return (
    <div>
      <svg viewBox="0 0 360 228" style={svgBox} role="img" aria-label="Schematic roofline chart. Throughput rises along a sloped memory line until a flat compute ceiling. The dot moves with the number of tokens processed per read of the weights.">
        <title>Schematic roofline: memory-bound slope, then compute ceiling</title>
        <rect x="0" y="0" width="360" height="228" fill="none" />
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={C.hairline} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.hairline} />
        <polyline fill="none" stroke={C.blue} strokeWidth="2" points={`${xm(0)},${ym(0)} ${xm(RIDGE)},${ym(RIDGE)} ${X1},${ym(RIDGE)}`} />
        <line x1={xm(RIDGE)} y1={ym(RIDGE)} x2={xm(RIDGE)} y2={Y1} stroke={C.hairline} strokeDasharray="3 3" />
        <text x={xm(RIDGE)} y={Y1 + 12} textAnchor="middle" style={svgText}>ridge</text>
        <text x={xm(2.2)} y={ym(2.9)} style={{ ...svgText, fill: C.blue }} transform={`rotate(-32 ${xm(2.2)} ${ym(2.9)})`}>memory limit</text>
        <text x={xm(8.6)} y={ym(RIDGE) - 6} textAnchor="middle" style={{ ...svgText, fill: C.blue }}>compute limit</text>
        <text x={X0} y={Y1 + 26} style={svgText}>1 token</text>
        <text x={X1} y={Y1 + 26} textAnchor="end" style={svgText}>4096 tokens per weight read</text>
        <text x="4" y={Y0 + 4} style={svgText}>speed</text>
        <line x1={xm(s)} y1={ym(perf)} x2={xm(s)} y2={Y1} stroke={C.clay} strokeDasharray="2 3" />
        <circle cx={xm(s)} cy={ym(perf)} r="6" fill={C.clay} />
        <text x="4" y="222" style={svgText}>schematic, not to scale</text>
      </svg>
      <div style={row}>
        <label style={{ ...mono, display: "flex", flexDirection: "column", gap: 4, flex: "1 1 220px" }}>
          Tokens processed per read of the weights: {tokens}
          <input type="range" min={0} max={MAXS} step={0.05} value={s} onChange={e => setS(Number(e.target.value))} style={{ width: "100%", accentColor: C.clay }} />
        </label>
        <button type="button" style={btn(s === 0)} onClick={() => setS(0)}>Decode (1)</button>
        <button type="button" style={btn(s === 10)} onClick={() => setS(10)}>Prefill (1024)</button>
      </div>
      <p style={readout}>
        <strong>{bound ? "Memory-bound." : "Compute-bound."}</strong>{" "}
        {bound ? "The chip waits for bytes. Doing more arithmetic per byte would make it faster." : "The chip is busy with arithmetic. Extra bandwidth would not help."}
      </p>
    </div>
  )
}
