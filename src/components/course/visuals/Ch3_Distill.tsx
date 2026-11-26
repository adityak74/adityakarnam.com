import * as React from "react"
import { C, Btn, Row, Note, svgBase, svgMono, svgText, useStepper } from "./Ch3_ui"

const STAGES = [
  { tag: "1 PROMPTS", title: "Build a prompt pool from datasets", note: "Questions and coding problems that have a checkable answer." },
  { tag: "2 TEACH", title: "Two teachers write answers with reasoning", note: "Qwen3.6-35B-A3B-4bit covers knowledge and truthfulness. Ornith-1.5-35B-A3B-4bit covers code and does the bulk of the generation because it is cheaper. 3,974 traces were generated." },
  { tag: "3 VERIFY", title: "Keep only answers that check out", note: "Multiple choice must match the gold letter, open QA must match gold aliases, code must pass its dataset's unit tests. Anything sharing a 13-gram with a test set is dropped. 1,672 of 3,974 traces survived, a 58% rejection rate." },
  { tag: "4 TRAIN", title: "Rank-32 LoRA on the bf16 student", note: "Student: Ornith-1.5-9B in full precision. 3,200 steps, 1.76M tokens, one M4 Pro." },
  { tag: "5 FUSE", title: "Merge the adapters back into bf16", note: "Adapters are folded into the base weights, so the result is a normal full-precision model." },
  { tag: "6 QUANTIZE", title: "Quantize last, to the 4-bit oQ4 map", note: "The quantizer starts from the improved checkpoint. Result: 4.9 GB." },
]

const Ch3_Distill = () => {
  const s = useStepper(STAGES.length, 1800)
  const [keep, setKeep] = React.useState(true)
  const rowH = 38
  return (
    <div ref={s.ref}>
      <svg viewBox={`0 0 400 ${STAGES.length * rowH + 8}`} style={svgBase} role="img" aria-label={`Distillation pipeline in six stages. Current stage: ${STAGES[s.step].title}.`}>
        <title>Two-teacher distillation pipeline</title>
        {STAGES.map((g, i) => {
          const y = i * rowH + 4
          const on = i === s.step
          const done = i < s.step
          return (
            <g key={g.tag}>
              <rect x="2" y={y} width="396" height={rowH - 8} fill={on ? C.paper : "none"} stroke={on ? C.clay : C.hairline} strokeWidth={on ? 1.5 : 1} />
              <text x="10" y={y + 21} style={svgMono(10)} fill={on ? C.clay : done ? C.blue : C.secondary}>{g.tag}</text>
              <text x="92" y={y + 21} style={svgText(11)} fill={on || done ? C.ink : C.secondary}>{g.title.length > 44 ? g.title.slice(0, 43) + "…" : g.title}</text>
            </g>
          )
        })}
      </svg>
      <Row>
        <Btn onClick={s.prev} disabled={s.step === 0}>Back</Btn>
        <Btn onClick={s.next} disabled={s.step === STAGES.length - 1}>Step</Btn>
        {!s.reduced && <Btn onClick={s.toggle} pressed={s.playing}>{s.playing ? "Pause" : "Play"}</Btn>}
        <Btn onClick={s.reset}>Reset</Btn>
      </Row>
      <Note><b>{STAGES[s.step].title}.</b> {STAGES[s.step].note}</Note>
      <div style={{ borderTop: `1px solid ${C.hairline}`, marginTop: 16, paddingTop: 12 }}>
        <div style={{ fontFamily: C.mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.secondary }}>What the student is trained to write</div>
        <Row>
          <Btn pressed={keep} onClick={() => setKeep(true)}>Reasoning kept</Btn>
          <Btn pressed={!keep} onClick={() => setKeep(false)}>Answer only</Btn>
        </Row>
        <pre style={{ fontFamily: C.mono, fontSize: 12, lineHeight: 1.6, background: C.paper, border: `1px solid ${C.hairline}`, borderRadius: 4, padding: 12, margin: "12px 0 0", whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: C.ink }}>
          {keep ? "<think>\n  teacher's full reasoning trace\n</think>\nfinal answer" : "<think>\n</think>\nfinal answer"}
        </pre>
        <Note>
          {keep
            ? "The chat template already opens a <think> block. Training on intact traces teaches the student to reason and then close it. In the post this kept 50% of samples at a 1024-token cap."
            : "Answer-only targets would keep 99% of samples, but the student would learn to emit </think> immediately and stop reasoning, which is the behaviour it is served with."}
        </Note>
      </div>
    </div>
  )
}
export default Ch3_Distill
