import * as React from "react"
import { C, btn, row, svgBox, svgText, readout, mono, useReducedMotion, useTicker } from "./Ch1_ui"

// Schematic of one speculative round. Draft proposes k tokens one by one, target checks all in one pass.
export default function Speculative() {
  const [k, setK] = React.useState(4)
  const [m, setM] = React.useState(2)
  const [stage, setStage] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const last = k + 2
  const acc = Math.min(m, k)
  useTicker(playing && !reduced, 800, () => setStage(s => (s >= last ? (setPlaying(false), s) : s + 1)), ref)
  const drafted = Math.min(stage, k)
  const verified = stage >= k + 1
  const done = stage >= k + 2
  const w = 40
  const slots = Array.from({ length: k }, (_, i) => i)
  const gained = acc + 1
  const msg =
    stage === 0 ? "Start. The draft model is small and fast; the target model is large."
    : stage <= k ? `Draft pass ${stage} of ${k}: the small model proposes token ${stage}.`
    : stage === k + 1 ? `Verify: one pass of the target model checks all ${k} proposals at once.`
    : `Result: ${acc} proposal${acc === 1 ? "" : "s"} kept, plus 1 token from the target model, so ${gained} tokens for one target pass.`
  return (
    <div ref={ref}>
      <svg viewBox="0 0 360 150" style={svgBox} role="img" aria-label={`Schematic of one speculative decoding round with ${k} draft tokens, ${acc} accepted.`}>
        <title>Draft model proposes tokens, target model verifies them in one pass</title>
        <text x="8" y="20" style={svgText}>draft proposes</text>
        {slots.map(i => {
          const shown = i < drafted
          const ok = i < acc
          const stroke = verified && shown ? (ok ? C.blue : C.clay) : C.secondary
          return (
            <g key={i}>
              <rect x={8 + i * w} y="28" width={w - 6} height="30" rx="3" fill={verified && shown ? (ok ? C.blue : "none") : "none"} stroke={shown ? stroke : C.hairline} strokeDasharray={shown ? undefined : "2 3"} strokeWidth="1.5" opacity={verified && shown && !ok && done ? 0.5 : 1} />
              {verified && shown && <text x={8 + i * w + (w - 6) / 2} y="47" textAnchor="middle" style={{ ...svgText, fill: ok ? C.paper : C.clay, fontSize: 12 }}>{ok ? "ok" : "x"}</text>}
            </g>
          )
        })}
        <text x="8" y="86" style={svgText}>target pass: {verified ? "1 (verifies all)" : "waiting"}</text>
        <rect x="8" y="92" width={Math.max(0, k * w - 6)} height="10" rx="2" fill={verified ? C.blue : "none"} stroke={verified ? C.blue : C.hairline} />
        {done && (
          <g>
            <text x="8" y="124" style={{ ...svgText, fill: C.ink }}>kept: {acc} + 1 from target = {gained} tokens</text>
          </g>
        )}
        <text x="8" y="145" style={svgText}>schematic, not to scale</text>
      </svg>
      <div style={row}>
        <button type="button" style={btn(false)} disabled={stage >= last} onClick={() => { setPlaying(false); setStage(s => Math.min(last, s + 1)) }}>Next step</button>
        <button type="button" style={btn(false)} onClick={() => { setPlaying(false); setStage(0) }}>Reset</button>
        {!reduced && <button type="button" style={btn(playing)} aria-pressed={playing} onClick={() => { if (stage >= last) setStage(0); setPlaying(v => !v) }}>{playing ? "Pause" : "Play"}</button>}
      </div>
      <div style={row}>
        <label style={{ ...mono, display: "flex", alignItems: "center", gap: 8 }}>
          Draft tokens: {k}
          <input type="range" min={1} max={8} value={k} onChange={e => { const v = Number(e.target.value); setK(v); setM(x => Math.min(x, v)); setStage(0); setPlaying(false) }} style={{ accentColor: C.clay }} />
        </label>
        <label style={{ ...mono, display: "flex", alignItems: "center", gap: 8 }}>
          Target agrees with first: {acc}
          <input type="range" min={0} max={k} value={acc} onChange={e => { setM(Number(e.target.value)); setStage(0); setPlaying(false) }} style={{ accentColor: C.clay }} />
        </label>
      </div>
      <p style={readout} role="status">{msg}</p>
    </div>
  )
}
