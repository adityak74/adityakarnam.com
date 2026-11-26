import * as React from "react"
import { C, btn, row, svgBox, svgText, readout } from "./Ch1_ui"

// float16 GFLOP/s, Apple M5 Pro, mlx 0.32.0 (roofline post table)
const DATA = [
  { n: 1024, gemv: 354.4, gemm: 27985.6, r: "79.0x" },
  { n: 2048, gemv: 487.9, gemm: 30958.5, r: "63.5x" },
  { n: 4096, gemv: 387.9, gemm: 28780.5, r: "74.2x" },
  { n: 8192, gemv: 277.3, gemm: 30001.3, r: "108.2x" },
  { n: 12288, gemv: 283.7, gemm: 23990.7, r: "84.6x" },
]
const MAX = 31000
const fmt = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 1 })

export default function GemvGemm() {
  const [i, setI] = React.useState(0)
  const d = DATA[i]
  const w = (v: number) => Math.max(2, (v / MAX) * 250)
  return (
    <div>
      <div style={row} role="group" aria-label="Matrix size N">
        {DATA.map((x, k) => (
          <button key={x.n} type="button" style={btn(k === i)} aria-pressed={k === i} onClick={() => setI(k)}>N = {x.n.toLocaleString("en-US")}</button>
        ))}
      </div>
      <svg viewBox="0 0 360 120" style={svgBox} role="img" aria-label={`Bar chart, float16 throughput at N ${d.n}: matrix-vector ${fmt(d.gemv)} GFLOP/s, matrix-matrix ${fmt(d.gemm)} GFLOP/s, ratio ${d.r}`}>
        <title>Measured throughput, matrix-vector versus matrix-matrix</title>
        <text x="0" y="14" style={svgText}>GEMV, one token (decode)</text>
        <rect x="0" y="20" width={w(d.gemv)} height="22" fill={C.clay} rx="2" />
        <text x={w(d.gemv) + 6} y="36" style={{ ...svgText, fill: C.ink }}>{fmt(d.gemv)}</text>
        <text x="0" y="68" style={svgText}>GEMM, N tokens (prefill)</text>
        <rect x="0" y="74" width={w(d.gemm)} height="22" fill={C.blue} rx="2" />
        <text x={Math.min(w(d.gemm) + 6, 300)} y="90" style={{ ...svgText, fill: C.ink }}>{fmt(d.gemm)}</text>
        <text x="0" y="114" style={svgText}>GFLOP/s, float16, measured</text>
      </svg>
      <p style={readout}>At N = {d.n.toLocaleString("en-US")} the matrix-matrix multiply ran {d.r} faster than the matrix-vector one on the same chip.</p>
    </div>
  )
}
