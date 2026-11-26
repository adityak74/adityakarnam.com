import * as React from "react"
import { C, Btn, Row, Slider, Note, svgBase, svgMono, svgText } from "./Ch3_ui"

// Toy 2D "embedding" space, unit square, origin bottom-left. Schematic, not real embeddings.
const PTS: { l: string; u: number; v: number }[] = [
  { l: "LoRA", u: 0.22, v: 0.82 }, { l: "adapter", u: 0.3, v: 0.7 }, { l: "rank", u: 0.16, v: 0.6 }, { l: "distillation", u: 0.4, v: 0.9 },
  { l: "embedding", u: 0.6, v: 0.62 }, { l: "cosine", u: 0.74, v: 0.7 }, { l: "vector index", u: 0.5, v: 0.52 }, { l: "neighbour", u: 0.84, v: 0.8 },
  { l: "token budget", u: 0.85, v: 0.3 }, { l: "context window", u: 0.7, v: 0.22 }, { l: "cache", u: 0.58, v: 0.12 }, { l: "chunk", u: 0.92, v: 0.18 },
]
const PRESETS = [
  { name: "train cheaply", u: 0.2, v: 0.7 },
  { name: "find similar text", u: 0.65, v: 0.6 },
  { name: "fit in the window", u: 0.78, v: 0.25 },
]
const W = 400, H = 300
const sx = (u: number) => 20 + u * (W - 40)
const sy = (v: number) => H - 20 - v * (H - 40)

const Ch4_Embeddings = () => {
  const [q, setQ] = React.useState({ u: 0.2, v: 0.7 })
  const [k, setK] = React.useState(3)
  const [cos, setCos] = React.useState(false)
  const scored = PTS.map(p => {
    const dist = Math.hypot(p.u - q.u, p.v - q.v)
    const c = (p.u * q.u + p.v * q.v) / (Math.hypot(p.u, p.v) * Math.hypot(q.u, q.v) || 1)
    return { ...p, score: cos ? c : dist }
  }).sort((a, b) => (cos ? b.score - a.score : a.score - b.score))
  const top = scored.slice(0, k)
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H
    setQ({ u: Math.min(1, Math.max(0, (x - 20) / (W - 40))), v: Math.min(1, Math.max(0, (H - 20 - y) / (H - 40))) })
  }
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ ...svgBase, cursor: "crosshair", touchAction: "manipulation" }} onClick={onClick} role="img" aria-label={`Toy two-dimensional embedding space with 12 labelled points in three clusters. A query point is placed in the space. The ${k} nearest points by ${cos ? "cosine similarity" : "distance"} are highlighted: ${top.map(t => t.l).join(", ")}.`}>
        <title>Embeddings as points, nearest neighbours highlighted</title>
        <rect x="1" y="1" width={W - 2} height={H - 2} fill={C.paper} stroke={C.hairline} />
        {top.map((t, i) => <line key={t.l} x1={sx(q.u)} y1={sy(q.v)} x2={sx(t.u)} y2={sy(t.v)} stroke={C.blue} strokeWidth="1" strokeDasharray="3 3" opacity={0.7 - i * 0.05} />)}
        {cos && <line x1={sx(0)} y1={sy(0)} x2={sx(q.u / Math.hypot(q.u, q.v))} y2={sy(q.v / Math.hypot(q.u, q.v))} stroke={C.clay} strokeWidth="1" opacity="0.5" />}
        {PTS.map(p => {
          const hit = top.findIndex(t => t.l === p.l)
          return (
            <g key={p.l}>
              <circle cx={sx(p.u)} cy={sy(p.v)} r={hit >= 0 ? 6 : 4} fill={hit >= 0 ? C.blue : C.secondary} />
              <text x={sx(p.u) + (p.u > 0.7 ? -8 : 8)} textAnchor={p.u > 0.7 ? "end" : "start"} y={sy(p.v) + 4} style={svgText(11)} fill={hit >= 0 ? C.ink : C.secondary}>{hit >= 0 ? `${hit + 1}. ` : ""}{p.l}</text>
            </g>
          )
        })}
        <rect x={sx(q.u) - 5} y={sy(q.v) - 5} width="10" height="10" fill={C.clay} />
        <text x={sx(q.u) + (q.u > 0.75 ? -9 : 9)} textAnchor={q.u > 0.75 ? "end" : "start"} y={sy(q.v) - 8} style={svgMono(10)} fill={C.clay}>QUERY</text>
      </svg>
      <Row>
        {PRESETS.map(p => <Btn key={p.name} pressed={Math.abs(q.u - p.u) < 0.005 && Math.abs(q.v - p.v) < 0.005} onClick={() => setQ({ u: p.u, v: p.v })}>{p.name}</Btn>)}
      </Row>
      <Row>
        <Slider id="emb-x" label="Query x" min={0} max={100} value={Math.round(q.u * 100)} onChange={v => setQ(s => ({ ...s, u: v / 100 }))} />
        <Slider id="emb-y" label="Query y" min={0} max={100} value={Math.round(q.v * 100)} onChange={v => setQ(s => ({ ...s, v: v / 100 }))} />
      </Row>
      <Row>
        <Slider id="emb-k" label="k (neighbours returned)" min={1} max={6} value={k} onChange={setK} />
        <span style={{ display: "flex", gap: 8 }} role="group" aria-label="Similarity measure">
          <Btn pressed={!cos} onClick={() => setCos(false)}>Distance</Btn>
          <Btn pressed={cos} onClick={() => setCos(true)}>Cosine</Btn>
        </span>
      </Row>
      <Note>
        Top {k} by {cos ? "cosine similarity (angle from the origin, ignoring length)" : "straight-line distance"}: {top.map((t, i) => `${i + 1}. ${t.l}`).join(", ")}. Click the plot or use the sliders to move the query.
      </Note>
    </div>
  )
}
export default Ch4_Embeddings
