import * as React from "react"
import { C, Btn, Row, Slider, Note, svgBase, svgMono, svgText } from "./Ch3_ui"

const fmt = (n: number) => n.toLocaleString("en-US")

/** LoRA: one frozen d x d matrix W plus two thin trainable matrices B (d x r) and A (r x d). */
const Ch3_LoRA = () => {
  const [r, setR] = React.useState(32)
  const [d, setD] = React.useState(4096)
  const full = d * d
  const lora = 2 * d * r
  const pct = (lora / full) * 100
  const t = 4 + (r / 64) * 34 // visual thickness of the thin matrices
  return (
    <div>
      <svg viewBox="0 0 400 210" style={svgBase} role="img" aria-label="Diagram of LoRA. A large square matrix W is frozen. Next to it, a tall thin matrix B and a wide thin matrix A are trainable. Their product has the same shape as W and is added to it. The thin matrices get thicker as rank increases.">
        <title>LoRA: a frozen matrix plus two thin trainable matrices</title>
        <rect x="10" y="30" width="130" height="130" fill={C.paper} stroke={C.ink} strokeWidth="1.5" />
        <text x="75" y="92" textAnchor="middle" style={svgText(20)} fill={C.ink}>W</text>
        <text x="75" y="112" textAnchor="middle" style={svgMono(10)} fill={C.secondary}>FROZEN</text>
        <text x="75" y="178" textAnchor="middle" style={svgMono(10)} fill={C.secondary}>d × d</text>
        <text x="158" y="100" textAnchor="middle" style={svgText(20)} fill={C.ink}>+</text>
        <rect x="176" y="30" width={t} height="130" fill={C.clay} />
        <text x={176 + t / 2} y="178" textAnchor="middle" style={svgMono(10)} fill={C.clay}>B: d × r</text>
        <text x={176 + t + 18} y="100" textAnchor="middle" style={svgText(18)} fill={C.ink}>×</text>
        <rect x={176 + t + 36} y="30" width="130" height={t} fill={C.clay} />
        <text x={176 + t + 36} y="26" style={svgMono(10)} fill={C.clay}>A: r × d</text>
        <text x="300" y="196" textAnchor="middle" style={svgMono(10)} fill={C.clay}>TRAINABLE</text>
      </svg>
      <Row>
        <Slider id="lora-r" label="Rank r" min={1} max={64} value={r} onChange={setR} />
        <span style={{ display: "flex", gap: 8 }} role="group" aria-label="Matrix width d">
          {[1024, 2048, 4096].map(v => <Btn key={v} pressed={d === v} onClick={() => setD(v)}>d={fmt(v)}</Btn>)}
        </span>
      </Row>
      <Note>
        Full matrix: <b>{fmt(full)}</b> weights. LoRA adds <b>{fmt(lora)}</b> trainable weights (2 × d × r), which is <b>{pct.toFixed(2)}%</b> of the matrix.
        {r === 32 ? " Rank 32 is the rank used in the Ornith distillation post." : ""}
      </Note>
    </div>
  )
}
export default Ch3_LoRA
