import * as React from "react"
import { C, Btn, Row, Note, label } from "./Ch5_ui"

// Sizes (~1.3 MB core, ~5.5 MB agent) and the feature list come from the Quecto page.
const LAYERS = [
  { k: "Core", mb: 1.3, items: ["Send a prompt to an OpenAI-compatible endpoint", "Return the response, buffered or streamed", "Two direct dependencies: ureq and serde_json", "No async runtime"], why: "Model transport only. If something goes wrong here, there is very little code to blame." },
  { k: "Agent", mb: 5.5, items: ["Tool loop with an approval gate", "Sandbox for commands", "SQLite session store: resume, undo, diff", "Manifest parsing (flavors)"], why: "Everything with policy in it lives one layer up, so the core stays small." },
]

export default function Ch5_QuectoLayers() {
  const [k, setK] = React.useState(0)
  const L = LAYERS[k]
  const W = 640, scale = (W - 170) / 5.5
  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <svg viewBox={`0 0 ${W} 100`} role="img" aria-label="Binary sizes: core about 1.3 megabytes, agent about 5.5 megabytes" style={{ width: "100%", height: "auto", display: "block" }}>
        <title>Quecto binary sizes</title>
        {LAYERS.map((l, j) => (
          <g key={l.k}>
            <text x={0} y={30 + j * 40} fontSize={16} fontFamily={C.mono} fill={C.sec}>{l.k.toUpperCase()}</text>
            <rect x={70} y={14 + j * 40} width={l.mb * scale} height={26} fill={j === 0 ? C.blue : C.clay} opacity={j === k ? 1 : 0.35} />
            <text x={78 + l.mb * scale} y={32 + j * 40} fontSize={16} fontFamily={C.mono} fill={C.ink}>~{l.mb} MB</text>
          </g>
        ))}
      </svg>
      <Row>
        {LAYERS.map((l, j) => <Btn key={l.k} on={k === j} onClick={() => setK(j)}>{l.k}</Btn>)}
      </Row>
      <div style={{ ...label, margin: "12px 0 4px" }}>What is inside</div>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.6 }}>{L.items.map(t => <li key={t}>{t}</li>)}</ul>
      <Note>{L.why}</Note>
    </div>
  )
}
