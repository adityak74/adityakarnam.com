import * as React from "react"
import { C, Slider, Note, svgBase, svgMono, svgText } from "./Ch3_ui"

// The four documents are the ones in the embenx hybrid_search example. The ranks are invented to match its comment
// ("dense query favors doc1; BM25 query 'lazy' favors doc2 and doc4"). The fusion constant is set to 1 so the slider visibly matters; the common textbook value is 60, which flattens the differences.
const DOCS = [
  { id: "doc1", text: "The quick brown fox", dense: 1 as number | null, bm25: null as number | null },
  { id: "doc2", text: "Jumps over the lazy dog", dense: 3, bm25: 1 },
  { id: "doc3", text: "The fox is brown", dense: 2, bm25: null },
  { id: "doc4", text: "Dogs are lazy", dense: 4, bm25: 2 },
]
const K = 1

const Ch4_Hybrid = () => {
  const [wd, setWd] = React.useState(50)
  const d = wd / 100, sp = 1 - d
  const rows = DOCS.map(x => ({ ...x, f: (x.dense ? d / (K + x.dense) : 0) + (x.bm25 ? sp / (K + x.bm25) : 0) })).sort((a, b) => b.f - a.f)
  const max = Math.max(...rows.map(r => r.f), 1e-9)
  return (
    <div>
      <svg viewBox="0 0 400 190" style={svgBase} role="img" aria-label={`Hybrid search fusion with dense weight ${d.toFixed(2)} and sparse weight ${sp.toFixed(2)}. Ranked result: ${rows.map(r => r.id).join(", ")}.`}>
        <title>Fusing dense and keyword rankings</title>
        <text x="4" y="12" style={svgMono(10)} fill={C.secondary}>FUSED RANK · DOC · DENSE RANK · KEYWORD RANK</text>
        {rows.map((r, i) => {
          const y = 22 + i * 40
          return (
            <g key={r.id}>
              <text x="4" y={y + 14} style={svgMono(11)} fill={i === 0 ? C.clay : C.ink}>{i + 1}</text>
              <text x="24" y={y + 14} style={svgText(12)} fill={C.ink}>{r.id}: {r.text}</text>
              <rect x="24" y={y + 20} width={Math.max(2, (r.f / max) * 250)} height="8" fill={i === 0 ? C.clay : C.blue} />
              <text x="396" y={y + 27} textAnchor="end" style={svgMono(10)} fill={C.secondary}>D{r.dense ?? "-"} · K{r.bm25 ?? "-"}</text>
            </g>
          )
        })}
      </svg>
      <div style={{ marginTop: 12 }}>
        <Slider id="hyb-w" label="Dense weight" min={0} max={100} step={10} value={wd} onChange={setWd} display={`${d.toFixed(1)} dense / ${sp.toFixed(1)} keyword`} />
      </div>
      <Note>
        Query: a vector that matches doc1, plus the word "lazy". At 1.0 only meaning counts and doc1 wins. At 0.0 only the keyword counts and doc2 wins. In between, documents that rank in both lists rise. Schematic: the ranks are invented to match the example's comments, and the fusion constant is 1 (textbook value 60) so the effect is visible.
      </Note>
    </div>
  )
}
export default Ch4_Hybrid
