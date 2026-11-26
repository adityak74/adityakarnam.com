import * as React from "react"
import { C, btn, row, svgBox, svgText, readout } from "./Ch1_ui"

// Decode tok/s, Qwen3-8B-4bit, M5 Pro, median of 7 reps (long-context post)
const CTX = [512, 2048, 8192, 16384, 32768, 65536]
const TPS: Record<string, number[]> = {
  fp16: [55.65, 53.61, 45.2, 36.85, 16.59, 10.19],
  "8-bit": [53.02, 51.39, 41.03, 35.18, 26.98, 15.93],
  "4-bit": [53.41, 51.23, 45.52, 40.3, 31.56, 17.55],
}
// Geometry from the post: 36 layers, 8 KV heads, head_dim 128. K and V, 2 bytes each at fp16.
const FRAC: Record<string, number> = { fp16: 1, "8-bit": 0.5, "4-bit": 0.25 }

export default function KVCache() {
  const [ci, setCi] = React.useState(0)
  const [k, setK] = React.useState("fp16")
  const ctx = CTX[ci]
  const tps = TPS[k][ci]
  return (
    <div>
      <div style={row} role="group" aria-label="KV cache precision">
        {Object.keys(TPS).map(x => <button key={x} type="button" style={btn(x === k)} aria-pressed={x === k} onClick={() => setK(x)}>KV {x}</button>)}
      </div>
      <label style={{ fontFamily: C.mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.secondary, display: "block" }}>
        Context length: {ctx.toLocaleString("en-US")} tokens
        <input type="range" min={0} max={CTX.length - 1} step={1} value={ci} onChange={e => setCi(Number(e.target.value))} style={{ width: "100%", accentColor: C.clay }} />
      </label>
      <svg viewBox="0 0 360 56" style={svgBox} role="img" aria-label={`At ${ctx} tokens of context with ${k} KV cache: decode ${tps} tokens per second.`}>
        <title>Decode speed falls as context grows</title>
        <text x="0" y="14" style={svgText}>Decode speed (measured)</text>
        <rect x="0" y="20" width="340" height="18" fill="none" stroke={C.hairline} />
        <rect x="0" y="20" width={(tps / 60) * 340} height="18" fill={C.blue} />
        <text x="0" y="54" style={{ ...svgText, fill: C.ink }}>{tps} tok/s</text>
      </svg>
      <p style={readout}>
        Decode speeds are the post&apos;s measured medians, one value per context length and KV precision.
      </p>
    </div>
  )
}
