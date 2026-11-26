import * as React from "react"
import { C, Btn, Row, Note, svgBase, svgMono } from "./Ch3_ui"

// Numbers from "Distilling Ornith-1.5-9B", HumanEval, 164 problems, measured on the author's own harness.
const DATA = {
  shipped: { reached: 125, trunc: 39, label: "Shipped oQ4" },
  distilled: { reached: 145, trunc: 19, label: "Distilled oQ4" },
} as const

const Ch3_Termination = () => {
  const [m, setM] = React.useState<"shipped" | "distilled">("shipped")
  const { reached, trunc } = DATA[m]
  const cols = 14
  const cell = 24
  return (
    <div>
      <svg viewBox={`0 0 ${cols * cell + 4} ${Math.ceil(164 / cols) * cell + 4}`} style={svgBase} role="img" aria-label={`164 HumanEval problems as a grid. ${reached} reached an answer and ${trunc} ran out of token budget mid-reasoning for the ${DATA[m].label} model.`}>
        <title>HumanEval problems that reached an answer versus ran out of budget</title>
        {Array.from({ length: 164 }, (_, i) => {
          const x = (i % cols) * cell + 2, y = Math.floor(i / cols) * cell + 2
          const cut = i >= reached
          return <rect key={i} x={x} y={y} width={cell - 4} height={cell - 4} fill={cut ? C.clay : C.paper} stroke={cut ? C.clay : C.blue} strokeWidth="1" />
        })}
      </svg>
      <Row>
        <Btn pressed={m === "shipped"} onClick={() => setM("shipped")}>Shipped 4-bit</Btn>
        <Btn pressed={m === "distilled"} onClick={() => setM("distilled")}>Distilled 4-bit</Btn>
      </Row>
      <Note>
        {DATA[m].label}: <b>{reached}</b> of 164 problems reached an answer (blue outline). <b style={{ color: C.clay }}>{trunc}</b> were cut off mid-reasoning (clay). That is {Math.round((trunc / 164) * 100)}% truncated.
      </Note>
      <div style={{ ...svgMono(12), color: C.secondary, textTransform: "uppercase", marginTop: 8 }}>Source: distilling Ornith-9B post. Each square is one problem.</div>
    </div>
  )
}
export default Ch3_Termination
