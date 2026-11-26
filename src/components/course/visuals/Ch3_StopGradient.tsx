import * as React from "react"
import { C, Btn, Row, Note, svgBase, svgMono, svgText, useStepper } from "./Ch3_ui"

/** Schematic of the MoE routing path and why a backward pass needs stop_gradient on integer indices (mlx-lm PR #1795). */
const Ch3_StopGradient = () => {
  const s = useStepper(3, 1800)
  const [guard, setGuard] = React.useState(false)
  const crash = s.step === 2 && !guard
  const box = (y: number, h: number, label: string, sub: string, hot = false, dashed = false, dim = false) => (
    <g opacity={dim ? 0.45 : 1}>
      <rect x="20" y={y} width="250" height={h} fill={C.paper} stroke={hot ? C.clay : C.ink} strokeWidth={hot ? 2 : 1} strokeDasharray={dashed ? "4 3" : undefined} />
      <text x="30" y={y + 20} style={svgText(12)} fill={C.ink}>{label}</text>
      <text x="30" y={y + 36} style={svgMono(10)} fill={C.secondary}>{sub}</text>
    </g>
  )
  const down = (y1: number, y2: number) => <line x1="145" y1={y1} x2="145" y2={y2} stroke={C.blue} strokeWidth="1.5" markerEnd="url(#sg-b)" />
  const up = (y1: number, y2: number) => <line x1="250" y1={y1} x2="250" y2={y2} stroke={C.clay} strokeWidth="1.5" markerEnd="url(#sg-c)" />
  return (
    <div ref={s.ref}>
      <svg viewBox="0 0 400 290" style={svgBase} role="img" aria-label="Flow of an MoE router. Router logits go through argpartition to produce integer top-k expert indices, which feed a gather step. In the backward pass, without stop_gradient the gather asks for a gradient with respect to the integer indices and raises an error. With stop_gradient the backward pass skips the indices.">
        <title>Why integer routing indices need stop_gradient</title>
        <defs>
          <marker id="sg-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={C.blue} /></marker>
          <marker id="sg-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={C.clay} /></marker>
        </defs>
        {box(8, 44, "Router logits", "floats, differentiable")}
        {box(78, 44, "argpartition: top-k indices", "integers", crash)}
        {box(148, 36, "mx.stop_gradient(...)", guard ? "barrier ON" : "barrier OFF (not added)", false, true, !guard)}
        {box(214, 44, "gather / take_along_axis", "picks the chosen experts' outputs")}
        {down(52, 78)}{down(122, 148)}{down(184, 214)}
        <text x="290" y="30" style={svgMono(10)} fill={C.blue}>FORWARD</text>
        <text x="290" y="42" style={svgMono(10)} fill={C.secondary}>works either way</text>
        {s.step >= 1 && up(214, guard ? 150 : 124)}
        {s.step >= 1 && <text x="290" y="238" style={svgMono(10)} fill={C.clay}>BACKWARD</text>}
        {crash && <text x="290" y="100" style={svgMono(10)} fill={C.clay}>VJP on indices?</text>}
        {crash && <text x="290" y="114" style={svgMono(10)} fill={C.clay}>ERROR</text>}
        {s.step === 2 && guard && <text x="290" y="170" style={svgMono(10)} fill={C.blue}>skipped, OK</text>}
      </svg>
      <Row>
        <Btn pressed={guard} onClick={() => setGuard(g => !g)}>{guard ? "stop_gradient: on" : "stop_gradient: off"}</Btn>
        <Btn onClick={s.prev} disabled={s.step === 0}>Back</Btn>
        <Btn onClick={s.next} disabled={s.step === 2}>Step</Btn>
        {!s.reduced && <Btn onClick={s.toggle} pressed={s.playing}>{s.playing ? "Pause" : "Play"}</Btn>}
        <Btn onClick={s.reset}>Reset</Btn>
      </Row>
      <Note>
        {s.step === 0 && "Forward pass only: logits, top-k indices, gather. Inference stops here, which is why the three models ran fine until someone trained them."}
        {s.step === 1 && "Training adds a backward pass. Gradients start at the loss and travel back up through the gather."}
        {s.step === 2 && (guard
          ? "The barrier tells autograd the indices are not differentiable, so it does not ask for a gradient with respect to them. Training continues."
          : "The gather asks for a gradient with respect to the integer indices. MLX refuses: \"[gather_axis] Cannot calculate VJP with respect to indices. Use stop_gradient on indices...\"")}
      </Note>
    </div>
  )
}
export default Ch3_StopGradient
