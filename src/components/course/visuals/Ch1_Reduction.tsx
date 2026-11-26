import * as React from "react"
import { C, btn, row, readout, mono } from "./Ch1_ui"

// Real float32 arithmetic via Math.fround. Same six numbers, three summation orders.
const V = [16777216, 1, 1, 1, 1, -16777216]
const f = Math.fround
const seq = (a: number[]) => a.reduce((s, x) => f(s + x), 0)
const ORDERS = [
  { id: "ltr", name: "Left to right", sum: () => seq(V), steps: () => V },
  { id: "rtl", name: "Right to left", sum: () => seq([...V].reverse()), steps: () => [...V].reverse() },
  {
    id: "pair", name: "In pairs", steps: () => V,
    sum: () => { const p = [f(V[0] + V[1]), f(V[2] + V[3]), f(V[4] + V[5])]; return f(f(p[0] + p[1]) + p[2]) },
  },
]
const show = (x: number) => x.toLocaleString("en-US")

export default function Reduction() {
  const [id, setId] = React.useState("ltr")
  const o = ORDERS.find(x => x.id === id)!
  const all = ORDERS.map(x => x.sum())
  return (
    <div>
      <div style={{ ...mono, marginBottom: 8 }} aria-label="The numbers being added">Add: {V.map(show).join("  +  ")}</div>
      <div style={row} role="group" aria-label="Order of addition">
        {ORDERS.map(x => <button key={x.id} type="button" style={btn(x.id === id)} aria-pressed={x.id === id} onClick={() => setId(x.id)}>{x.name}</button>)}
      </div>
      <div role="status" style={{ fontFamily: C.serif, fontSize: 40, color: C.clay, lineHeight: 1.1, margin: "8px 0" }}>= {show(o.sum())}</div>
      <p style={readout}>
        The true sum is 4. In 32-bit floating point the three orders give {all.map(show).join(", ")}. Each is a correct run of the arithmetic; the rounding just happens in a different place.
      </p>
    </div>
  )
}
