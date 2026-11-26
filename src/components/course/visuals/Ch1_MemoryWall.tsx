import * as React from "react"
import { C, btn, row, svgBox, svgText, readout } from "./Ch1_ui"

// 4,096-token context, Qwen3-8B-4bit, M5 Pro 48 GB (batch concurrency post table)
const D = [
  { b: 1, t: 50.2, g: 6.5, p: 12.6 },
  { b: 2, t: 87.8, g: 7.7, p: 15.0 },
  { b: 4, t: 126.8, g: 10.4, p: 20.2 },
  { b: 8, t: 138.9, g: 16.0, p: 31.1 },
  { b: 16, t: 97.7, g: 27.5, p: 53.3 },
  { b: 32, t: 40.0, g: 50.3, p: 97.6 },
]
const BASE = 150, TOP = 20, H = BASE - TOP

export default function MemoryWall() {
  const [i, setI] = React.useState(3)
  const d = D[i]
  return (
    <div>
      <div style={row} role="group" aria-label="Batch size">
        {D.map((x, k) => <button key={x.b} type="button" style={btn(k === i)} aria-pressed={k === i} onClick={() => setI(k)}>Batch {x.b}</button>)}
      </div>
      <svg viewBox="0 0 360 190" style={svgBox} role="img" aria-label={`Bars show aggregate tokens per second by batch size; dots show memory use as a percent of RAM. Selected batch ${d.b}: ${d.t} tokens per second, ${d.p} percent of memory.`}>
        <title>Throughput and memory use versus batch size at 4,096 context</title>
        <line x1="20" y1={BASE} x2="350" y2={BASE} stroke={C.hairline} />
        {D.map((x, k) => {
          const cx = 20 + 55 * k + 27
          const h = (x.t / 150) * H
          const sel = k === i
          return (
            <g key={x.b}>
              <rect x={cx - 18} y={BASE - h} width="36" height={h} fill={C.blue} opacity={sel ? 1 : 0.45} rx="2" />
              <circle cx={cx} cy={BASE - (x.p / 100) * H} r={sel ? 6 : 4} fill={C.clay} />
              <text x={cx} y={BASE + 14} textAnchor="middle" style={svgText}>{x.b}</text>
            </g>
          )
        })}
        <text x="20" y="12" style={{ ...svgText, fill: C.blue }}>bars: tok/s</text>
        <text x="130" y="12" style={{ ...svgText, fill: C.clay }}>dots: % of 48 GB RAM</text>
        <text x="20" y="184" style={svgText}>batch size (concurrent requests), measured</text>
      </svg>
      <p style={readout}>
        Batch {d.b}: {d.t} tok/s total, peak memory {d.g} GB ({d.p}% of 48 GB), which is {(d.t / d.b).toFixed(2)} tok/s per request (total divided by batch).
      </p>
    </div>
  )
}
