import * as React from "react"
import { C, btn, row, svgBox, svgText, readout } from "./Ch1_ui"

// Median decode tok/s by num_draft_tokens, M5 Pro (speculative decoding post tables). acc = draft acceptance rate %.
const NDT = [0, 1, 2, 4, 8, 16]
type S = { tps: number[]; acc: (number | null)[] }
const SETS: Record<string, { label: string; structured: S; open: S }> = {
  a: {
    label: "Qwen3-8B + 0.6B draft",
    structured: { tps: [60.0, 80.4, 94.7, 51.8, 44.4, 48.6], acc: [null, 44.4, 59.7, 69.4, 75.0, 80.3] },
    open: { tps: [58.8, 49.4, 46.0, 38.3, 39.6, 25.2], acc: [null, 35.9, 49.7, 54.1, 60.3, 61.3] },
  },
  b: {
    label: "Qwen3.8-27B + 0.8B draft",
    structured: { tps: [17.9, 27.6, 35.1, 39.2, 27.6, 21.0], acc: [null, 44.1, 59.7, 70.6, 77.2, 79.7] },
    open: { tps: [18.1, 22.9, 23.7, 21.7, 12.0, 8.4], acc: [null, 32.8, 40.6, 47.5, 49.4, 50.6] },
  },
}

export default function SpecSweep() {
  const [s, setS] = React.useState("a")
  const [p, setP] = React.useState<"structured" | "open">("structured")
  const [i, setI] = React.useState(2)
  const d = SETS[s][p]
  const max = Math.max(...d.tps) * 1.1
  const base = d.tps[0]
  const BASE = 120, H = 90
  const pct = Math.round((d.tps[i] / base - 1) * 100)
  return (
    <div>
      <div style={row} role="group" aria-label="Model pair">
        {Object.entries(SETS).map(([id, x]) => <button key={id} type="button" style={btn(id === s)} aria-pressed={id === s} onClick={() => setS(id)}>{x.label}</button>)}
      </div>
      <div style={row} role="group" aria-label="Prompt type">
        <button type="button" style={btn(p === "structured")} aria-pressed={p === "structured"} onClick={() => setP("structured")}>Structured (code)</button>
        <button type="button" style={btn(p === "open")} aria-pressed={p === "open"} onClick={() => setP("open")}>Open-ended</button>
      </div>
      <svg viewBox="0 0 360 160" style={svgBox} role="img" aria-label={`Decode tokens per second by number of draft tokens. Selected ${NDT[i]} draft tokens: ${d.tps[i]} tokens per second against baseline ${base}.`}>
        <title>Decode speed versus number of draft tokens</title>
        <line x1="10" y1={BASE} x2="350" y2={BASE} stroke={C.hairline} />
        {NDT.map((n, k) => {
          const cx = 10 + 56 * k + 28
          const h = (d.tps[k] / max) * H
          const sel = k === i
          const win = d.tps[k] >= base
          return (
            <g key={n} onClick={() => setI(k)} style={{ cursor: "pointer" }}>
              <rect x={cx - 20} y={BASE - h} width="40" height={h} rx="2" fill={k === 0 ? C.secondary : win ? C.blue : C.clay} opacity={sel ? 1 : 0.5} />
              <text x={cx} y={BASE - h - 4} textAnchor="middle" style={{ ...svgText, fill: C.ink }}>{d.tps[k]}</text>
              <text x={cx} y={BASE + 14} textAnchor="middle" style={svgText}>{n === 0 ? "base" : n}</text>
            </g>
          )
        })}
        <line x1="10" y1={BASE - (base / max) * H} x2="350" y2={BASE - (base / max) * H} stroke={C.secondary} strokeDasharray="3 3" />
        <text x="10" y="156" style={svgText}>tok/s by draft tokens per round, measured</text>
      </svg>
      <div style={row} role="group" aria-label="Draft tokens per round">
        {NDT.map((n, k) => <button key={n} type="button" style={btn(k === i)} aria-pressed={k === i} onClick={() => setI(k)}>{n === 0 ? "Baseline" : `${n} draft`}</button>)}
      </div>
      <p style={readout}>
        {i === 0 ? `Baseline without a draft model: ${base} tok/s.` : `${NDT[i]} draft tokens: ${d.tps[i]} tok/s, ${pct >= 0 ? "+" : ""}${pct}% against the ${base} tok/s baseline. Draft acceptance rate ${d.acc[i]}%.`}
      </p>
    </div>
  )
}
