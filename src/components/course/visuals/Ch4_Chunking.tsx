import * as React from "react"
import { C, Btn, Row, Slider, Note, svgBase, svgMono, svgText, useStepper } from "./Ch3_ui"

// Toy paper split into chunks, already ranked by relevance to a query. Schematic: sizes and scores are made up.
const CH = [
  { n: "Abstract", tok: 310, s: 0.91 }, { n: "Method: setup", tok: 420, s: 0.84 }, { n: "Results table", tok: 380, s: 0.77 },
  { n: "Limitations", tok: 250, s: 0.62 }, { n: "Method: details", tok: 520, s: 0.55 }, { n: "Introduction", tok: 340, s: 0.41 },
  { n: "Related work", tok: 460, s: 0.33 }, { n: "Acknowledgements", tok: 120, s: 0.18 },
]

const Ch4_Chunking = () => {
  const [budget, setBudget] = React.useState(1000)
  const s = useStepper(CH.length + 1, 1000)
  const setB = (v: number) => { setBudget(v); s.reset() }
  let used = 0
  const rows = CH.map((c, i) => {
    const decided = i < s.step
    let status: "in" | "skip" | "wait" = "wait"
    if (decided) { if (used + c.tok <= budget) { used += c.tok; status = "in" } else status = "skip" }
    return { ...c, status }
  })
  const total = CH.reduce((a, c) => a + c.tok, 0)
  const rh = 30, top = 44
  return (
    <div ref={s.ref}>
      <svg viewBox={`0 0 400 ${top + CH.length * rh + 6}`} style={svgBase} role="img" aria-label={`Eight document chunks ranked by relevance. With a budget of ${budget} tokens, ${used} tokens are packed into the prompt so far.`}>
        <title>Packing ranked chunks into a token budget</title>
        <text x="4" y="14" style={svgMono(10)} fill={C.secondary}>BUDGET {budget} · USED {used}</text>
        <rect x="4" y="22" width="392" height="12" fill={C.paper} stroke={C.hairline} />
        <rect x="4" y="22" width={Math.min(1, used / budget) * 392} height="12" fill={C.blue} />
        {rows.map((r, i) => {
          const y = top + i * rh
          const w = (r.tok / 520) * 120
          return (
            <g key={r.n} opacity={r.status === "wait" ? 0.5 : 1}>
              <text x="4" y={y + 17} style={svgMono(10)} fill={C.secondary}>#{i + 1}</text>
              <text x="30" y={y + 17} style={svgText(11)} fill={C.ink}>{r.n}</text>
              <rect x="150" y={y + 5} width={w} height="16" fill={r.status === "in" ? C.blue : "none"} stroke={r.status === "skip" ? C.clay : C.secondary} strokeDasharray={r.status === "skip" ? "3 2" : undefined} />
              <text x={150 + w + 6} y={y + 17} style={svgMono(10)} fill={C.secondary}>{r.tok} tok</text>
              <text x="396" y={y + 17} textAnchor="end" style={svgMono(10)} fill={r.status === "skip" ? C.clay : r.status === "in" ? C.blue : C.secondary}>{r.status === "in" ? "ADDED" : r.status === "skip" ? "NO FIT" : `SCORE ${r.s.toFixed(2)}`}</text>
            </g>
          )
        })}
      </svg>
      <Row>
        <Slider id="chunk-b" label="Token budget" min={300} max={total} step={100} value={budget} onChange={setB} />
      </Row>
      <Row>
        <Btn onClick={s.next} disabled={s.step >= CH.length}>Step</Btn>
        {!s.reduced && <Btn onClick={s.toggle} pressed={s.playing}>{s.playing ? "Pause" : "Play"}</Btn>}
        <Btn onClick={s.reset}>Reset</Btn>
      </Row>
      <Note>
        Chunks are taken best first. A chunk that would overflow the budget is skipped. The whole toy document is {total.toLocaleString("en-US")} tokens, so a smaller budget means leaving out lower-ranked chunks. Schematic: sizes and scores are invented.
      </Note>
    </div>
  )
}
export default Ch4_Chunking
