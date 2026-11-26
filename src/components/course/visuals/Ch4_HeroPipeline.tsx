import * as React from "react"
import { C, Btn, Row, Note, svgBase, svgMono, svgText, useStepper } from "./Ch3_ui"

const STAGES = [
  { tag: "BROWSER", title: "HeroChat sends the messages and the chosen persona", note: "Credentials never reach the browser. It only talks to POST /api/hero-chat." },
  { tag: "FUNCTION", title: "Pages Function: limits, cache, prompt", note: "Rate limit of 20 requests per 10 minutes per IP, a 10 minute response cache, the last 10 turns capped at 2,000 characters each, and a system prompt that says answer only from the provided sources, never invent achievements or metrics, and stay under 150 words." },
  { tag: "RETRIEVE", title: "AI Search embeds the query and fetches chunks", note: "One managed call embeds the query (qwen3-embedding-0.6b), retrieves matching chunks and generates the answer." },
  { tag: "FILTER", title: "Keep only chunks scoring 0.4 or more", note: "Each returned chunk is mapped to a source link, and anything below the 0.4 relevance score is dropped." },
  { tag: "ANSWER", title: "Grounded answer, or the safe fallback", note: "" },
]

const Ch4_HeroPipeline = () => {
  const s = useStepper(STAGES.length, 1800)
  const [inCorpus, setIn] = React.useState(true)
  const rh = 34
  const chartY = STAGES.length * rh + 14
  const showChunks = s.step >= 3
  return (
    <div ref={s.ref}>
      <svg viewBox={`0 0 400 ${chartY + 70}`} style={svgBase} role="img" aria-label={`Request path of the hero RAG chat. Current stage: ${STAGES[s.step].title}.`}>
        <title>Request-time path of the hero RAG chat</title>
        {STAGES.map((g, i) => {
          const y = i * rh + 4
          const on = i === s.step
          return (
            <g key={g.tag}>
              <rect x="2" y={y} width="396" height={rh - 8} fill={on ? C.paper : "none"} stroke={on ? C.clay : C.hairline} strokeWidth={on ? 1.5 : 1} />
              <text x="10" y={y + 18} style={svgMono(10)} fill={on ? C.clay : i < s.step ? C.blue : C.secondary}>{g.tag}</text>
              <text x="86" y={y + 18} style={svgText(11)} fill={on || i < s.step ? C.ink : C.secondary}>{g.title.length > 46 ? g.title.slice(0, 45) + "…" : g.title}</text>
            </g>
          )
        })}
        {showChunks && (
          <g>
            <text x="4" y={chartY + 8} style={svgMono(10)} fill={C.secondary}>RELEVANCE SCORE (0 TO 1)</text>
            <line x1="24" y1={chartY + 14} x2="24" y2={chartY + 62} stroke={C.hairline} />
            <line x1={24 + 0.4 * 350} y1={chartY + 14} x2={24 + 0.4 * 350} y2={chartY + 62} stroke={C.clay} strokeDasharray="3 3" />
            <text x={24 + 0.4 * 350 + 4} y={chartY + 26} style={svgMono(10)} fill={C.clay}>THRESHOLD 0.4</text>
            {inCorpus ? [0.624, 0.566].map((v, i) => (
              <g key={v}>
                <rect x="24" y={chartY + 30 + i * 16} width={v * 350} height="10" fill={C.blue} />
                <text x={24 + v * 350 + 6} y={chartY + 39 + i * 16} style={svgMono(10)} fill={C.ink}>{v}</text>
              </g>
            )) : <text x="30" y={chartY + 48} style={svgText(11)} fill={C.secondary}>No chunk clears 0.4</text>}
          </g>
        )}
      </svg>
      <Row>
        <Btn pressed={inCorpus} onClick={() => setIn(true)}>Question is in the corpus</Btn>
        <Btn pressed={!inCorpus} onClick={() => setIn(false)}>Question is not in the corpus</Btn>
      </Row>
      <Row>
        <Btn onClick={s.prev} disabled={s.step === 0}>Back</Btn>
        <Btn onClick={s.next} disabled={s.step === STAGES.length - 1}>Step</Btn>
        {!s.reduced && <Btn onClick={s.toggle} pressed={s.playing}>{s.playing ? "Pause" : "Play"}</Btn>}
        <Btn onClick={s.reset}>Reset</Btn>
      </Row>
      <Note>
        <b>{STAGES[s.step].title}.</b>{" "}
        {s.step < 4 ? STAGES[s.step].note : inCorpus
          ? "The answer is shown with links to the sources that cleared the threshold. The 0.624 and 0.566 scores are the ones shown in the post's playground screenshot for the query \"what is subagent-fleet\"."
          : "If the AI Search call fails, or nothing clears the threshold, the reply is a static per-persona fallback plus default links, flagged fallback: true. Never a raw error and never an invented answer."}
      </Note>
    </div>
  )
}
export default Ch4_HeroPipeline
