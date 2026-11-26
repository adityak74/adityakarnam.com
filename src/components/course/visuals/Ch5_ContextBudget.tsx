import * as React from "react"
import { C, Btn, Row, Note, Schematic, label } from "./Ch5_ui"

// Sizes are abstract units, not tokens: the point is the shape, not the numbers.
const SIZES = [3, 1, 4, 2, 1, 3, 2, 4, 1, 2]
const SYS = 2
const WINDOWS = [10, 16, 24]

export default function Ch5_ContextBudget() {
  const [n, setN] = React.useState(0)
  const [win, setWin] = React.useState(1)
  const [drop, setDrop] = React.useState(true)
  const cap = WINDOWS[win]
  const turns = SIZES.slice(0, n).map((s, i) => ({ s, i }))
  const total = SYS + turns.reduce((a, t) => a + t.s, 0)
  // drop oldest turns until the rest fits; instructions stay pinned
  let used = total
  const dropped = new Set<number>()
  if (drop) for (const t of turns) { if (used <= cap) break; dropped.add(t.i); used -= t.s }
  const over = !drop && total > cap
  const W = 640, U = W / Math.max(cap, total)
  let x = 0
  const seg = (w: number, fill: string, key: string, text: string, dim?: boolean) => {
    const r = <g key={key}><rect x={x} y={20} width={w * U - 2} height={44} fill={fill} opacity={dim ? 0.35 : 1} stroke={C.paper} /><text x={x + 4} y={46} fontSize={11} fontFamily={C.mono} fill={C.paper}>{text}</text></g>
    x += w * U
    return r
  }
  const kept = [seg(SYS, C.ink, "s", "SYS")]
  turns.forEach(t => { if (!dropped.has(t.i)) kept.push(seg(t.s, t.i % 2 ? C.blue : C.clay, `t${t.i}`, `T${t.i + 1}`)) })
  const capX = cap * U
  const msg = over
    ? "Nothing was removed, so the prompt is bigger than the window. In practice the call fails or the model never sees part of it."
    : dropped.size
    ? `The window is full, so the oldest ${dropped.size} turn${dropped.size > 1 ? "s were" : " was"} dropped. The model no longer sees them, so anything it needed from there is gone.`
    : n === 0
    ? "Only the instructions are in the window. Add turns, as an agent would while it works."
    : "Everything still fits. Each turn adds the model's message and the tool result to the window."

  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <svg viewBox={`0 0 ${W} 96`} role="img" aria-label={`Context window usage: ${Math.min(used, total)} of ${cap} units`} style={{ width: "100%", height: "auto", display: "block" }}>
        <title>Context window fill</title>
        <rect x={0} y={20} width={capX} height={44} fill="none" stroke={C.sec} strokeDasharray="4 3" />
        {kept}
        <line x1={capX} x2={capX} y1={10} y2={74} stroke={C.clay} strokeWidth={2} />
        <text x={Math.min(capX, W) - 4} y={88} textAnchor="end" fontSize={16} fontFamily={C.mono} fill={C.clay}>WINDOW LIMIT</text>
        {over && <text x={4} y={88} fontSize={16} fontFamily={C.mono} fill={C.clay}>OVER BY {total - cap}</text>}
      </svg>
      <div style={{ ...label, marginTop: 4 }}>{over ? total : used} of {cap} units used, {n} turn{n === 1 ? "" : "s"}</div>
      <Note>{msg}</Note>
      <Row>
        <Btn onClick={() => setN(n + 1)} disabled={n >= SIZES.length}>Add a turn</Btn>
        <Btn onClick={() => setN(0)}>Reset</Btn>
      </Row>
      <Row gap={8}>
        <span style={{ ...label, marginTop: 10 }}>Window</span>
        {["Small", "Medium", "Large"].map((w, j) => <Btn key={w} on={win === j} onClick={() => setWin(j)}>{w}</Btn>)}
      </Row>
      <Row gap={8}>
        <span style={{ ...label, marginTop: 10 }}>Policy</span>
        <Btn on={drop} onClick={() => setDrop(true)}>Drop oldest</Btn>
        <Btn on={!drop} onClick={() => setDrop(false)}>Keep all</Btn>
      </Row>
      <Schematic />
    </div>
  )
}
