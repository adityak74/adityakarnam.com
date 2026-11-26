import * as React from "react"
import { C, Note, label } from "./Ch5_ui"

// Eight components and their descriptions come from "What is an AI agent harness" (anatomy section).
const PARTS = [
  { t: "Model interface", d: "Provider, model, reasoning mode and parameters.", e: "The harness can swap this and keep everything else." },
  { t: "Context manager", d: "Instructions, history, retrieved files and compression.", e: "It decides what the model gets to see on each call." },
  { t: "Tool layer", d: "Schemas, permissions, execution and error responses.", e: "Models propose actions here; the harness decides which reach the machine." },
  { t: "State and memory", d: "What persists across steps or sessions.", e: "In Quecto, sessions live in SQLite so you can resume, diff and undo." },
  { t: "Control loop", d: "Observe, reason, act and repeat.", e: "In Quecto it is a sequential loop with a max_steps limit." },
  { t: "Verification layer", d: "Tests, judges, linters and success checks.", e: "Decides whether the work is actually done." },
  { t: "Recovery policy", d: "Retries, replanning and fallback models.", e: "What happens after a failed check." },
  { t: "Budget manager", d: "Tokens, turns, time and monetary cost.", e: "Chapter 6 shows why the token budget changes results." },
]

export default function Ch5_HarnessAnatomy() {
  const [k, setK] = React.useState(2)
  const p = PARTS[k]
  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <div role="group" aria-label="Eight harness components" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
        {PARTS.map((q, j) => (
          <button
            key={q.t}
            type="button"
            aria-pressed={j === k}
            onClick={() => setK(j)}
            style={{ textAlign: "left", cursor: "pointer", padding: "10px 10px", minHeight: 64, borderRadius: 4, background: j === k ? C.paper : "transparent", border: `1px solid ${j === k ? C.clay : C.line}`, color: C.ink, fontFamily: C.sans }}
          >
            <span style={{ ...label, color: j === k ? C.clay : C.sec, display: "block" }}>{j + 1}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{q.t}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite" style={{ marginTop: 12, borderLeft: `2px solid ${C.clay}`, paddingLeft: 12 }}>
        <div style={{ fontFamily: C.serif, fontSize: 20 }}>{p.t}</div>
        <Note>{p.d} {p.e}</Note>
      </div>
    </div>
  )
}
