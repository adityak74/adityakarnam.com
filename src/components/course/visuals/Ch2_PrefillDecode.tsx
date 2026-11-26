import * as React from "react"
import { C, btn, row, svgBox, svgText, readout, mono, useReducedMotion, useTicker } from "./Ch1_ui"

// Schematic: one request, one forward pass per step. Pass 1 handles the whole prompt; every later pass handles one token.
const GEN = 6

export default function PrefillDecode() {
  const [n, setN] = React.useState(5)
  const [pass, setPass] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  useTicker(playing && !reduced, 900, () => setPass(p => (p >= GEN ? (setPlaying(false), p) : p + 1)), ref)
  const processed = pass === 0 ? 0 : pass === 1 ? n : 1
  const cache = pass === 0 ? 0 : n + pass - 1
  const total = n + GEN
  const w = Math.min(34, 330 / total)
  const cells = Array.from({ length: total }, (_, i) => i)
  return (
    <div ref={ref}>
      <svg viewBox="0 0 360 130" style={svgBox} role="img" aria-label={`Schematic of one request. Prompt of ${n} tokens. Pass ${pass}: ${processed} tokens processed, ${cache} tokens in the KV cache.`}>
        <title>Prefill processes the whole prompt in one pass, decode adds one token per pass</title>
        {cells.map(i => {
          const isPrompt = i < n
          const gi = i - n + 1 // generated token index, 1-based
          const exists = isPrompt || (pass >= 1 && gi <= pass)
          const active = pass === 1 ? isPrompt : pass > 1 && gi === pass - 1 && !isPrompt
          const x = 15 + i * w
          if (!exists) return <rect key={i} x={x} y="30" width={w - 4} height="30" rx="3" fill="none" stroke={C.hairline} strokeDasharray="2 3" />
          return (
            <g key={i}>
              <rect x={x} y="30" width={w - 4} height="30" rx="3" fill={active ? (isPrompt ? C.blue : C.clay) : C.paper} stroke={isPrompt ? C.blue : C.clay} strokeWidth="1.5" />
            </g>
          )
        })}
        <text x="15" y="22" style={{ ...svgText, fill: C.blue }}>prompt ({n})</text>
        <text x="345" y="22" textAnchor="end" style={{ ...svgText, fill: C.clay }}>generated</text>
        <rect x="15" y="84" width={Math.max(0, (cache / total) * 330)} height="14" fill={C.panel} stroke={C.secondary} />
        <text x="15" y="80" style={svgText}>KV cache entries: {cache}</text>
        <text x="15" y="124" style={svgText}>schematic, not to scale</text>
      </svg>
      <div style={row}>
        <button type="button" style={btn(false)} onClick={() => { setPlaying(false); setPass(p => Math.min(GEN, p + 1)) }} disabled={pass >= GEN}>Next pass</button>
        <button type="button" style={btn(false)} onClick={() => { setPlaying(false); setPass(0) }}>Reset</button>
        {!reduced && <button type="button" style={btn(playing)} aria-pressed={playing} onClick={() => { if (pass >= GEN) setPass(0); setPlaying(v => !v) }}>{playing ? "Pause" : "Play"}</button>}
        <label style={{ ...mono, display: "flex", alignItems: "center", gap: 8 }}>
          Prompt tokens: {n}
          <input type="range" min={2} max={10} value={n} onChange={e => { setN(Number(e.target.value)); setPass(0); setPlaying(false) }} style={{ accentColor: C.clay }} />
        </label>
      </div>
      <p style={readout} role="status">
        {pass === 0 ? "Press Next pass to start." : pass === 1 ? `Pass 1 (prefill): all ${n} prompt tokens go through together, and the first new token comes out.` : `Pass ${pass} (decode): 1 token goes through, reading ${cache} cached entries, and the next token comes out.`}
      </p>
    </div>
  )
}
