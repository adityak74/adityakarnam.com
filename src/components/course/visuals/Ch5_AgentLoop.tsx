import * as React from "react"
import { C, Btn, Row, Note, Schematic, label } from "./Ch5_ui"

type Msg = { role: string; text: string }
type Step = { node: number; note: string; add?: Msg; gate?: boolean }

const NODES = ["Model", "Permission gate", "Tool", "Context"]

const build = (decision: "allow" | "deny" | null): Step[] => {
  const s: Step[] = [
    { node: 3, note: "The loop starts with a context: the instructions and your task. The model only ever sees this list." },
    { node: 0, add: { role: "assistant", text: "call read_file(test_math.py)" }, note: "The model reads the context and proposes a tool call. It has not run anything yet. It only wrote text." },
    { node: 1, note: "The gate checks the call against policy. Reading a file is low risk, so the answer is allow." },
    { node: 2, add: { role: "tool", text: "file contents" }, note: "The tool runs and its result is appended to the context. The loop then goes back to the model." },
    { node: 0, add: { role: "assistant", text: "call apply_patch(...)" }, note: "The model has more context now, so it proposes an edit. Editing is riskier than reading." },
    { node: 1, gate: true, note: "The policy answer for a disk write is ask. You are the gate: approve or deny, then press Next." },
  ]
  if (decision === "allow") {
    s.push({ node: 2, add: { role: "tool", text: "patch applied" }, note: "Approved. The tool runs and the result goes into the context." })
    s.push({ node: 0, add: { role: "assistant", text: "final answer (no tool call)" }, note: "The model answers in plain text without a tool call. That ends the loop." })
  } else if (decision === "deny") {
    s.push({ node: 2, add: { role: "tool", text: "denied, not run" }, note: "Denied. Nothing touched the disk, but the refusal still goes into the context so the model knows." })
    s.push({ node: 0, add: { role: "assistant", text: "final answer: could not edit" }, note: "The model reads the refusal and replies in plain text. The gate stopped the action, not the loop." })
  }
  return s
}

export default function Ch5_AgentLoop() {
  const [i, setI] = React.useState(0)
  const [decision, setDecision] = React.useState<"allow" | "deny" | null>(null)
  const steps = build(decision)
  const cur = steps[Math.min(i, steps.length - 1)]
  const ctx: Msg[] = [{ role: "system", text: "instructions" }, { role: "user", text: "make the failing test pass" }]
  steps.slice(0, i + 1).forEach(st => st.add && ctx.push(st.add))
  const atGate = !!cur.gate
  const done = i >= steps.length - 1 && decision !== null
  const canNext = !done && !(atGate && decision === null)
  const W = 640

  return (
    <div style={{ fontFamily: C.sans, color: C.ink }}>
      <svg viewBox={`0 0 ${W} 120`} role="img" aria-label="The agent loop: model, permission gate, tool, context, then back to the model" style={{ width: "100%", height: "auto", display: "block" }}>
        <title>The agent loop</title>
        <defs>
          <marker id="c5a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={C.sec} /></marker>
        </defs>
        {NODES.map((n, k) => {
          const x = 8 + k * 158
          const on = cur.node === k
          const isGate = k === 1
          return (
            <g key={n}>
              <rect x={x} y={20} width={130} height={56} rx={4} fill={on ? C.paper : C.panel} stroke={on ? (isGate ? C.clay : C.blue) : C.line} strokeWidth={on ? 2 : 1} />
              <text x={x + 65} y={53} textAnchor="middle" fontSize={20} fontFamily={C.mono} fill={on ? (isGate ? C.clay : C.blue) : C.ink} style={{ textTransform: "uppercase" }}>{n === "Permission gate" ? "GATE" : n.toUpperCase()}</text>
              {k < 3 && <path d={`M${x + 130},48 H${x + 156}`} stroke={C.sec} strokeWidth={1.5} markerEnd="url(#c5a)" fill="none" />}
            </g>
          )
        })}
        <path d="M 535 76 V 104 H 73 V 78" stroke={C.sec} strokeWidth={1.5} strokeDasharray="4 3" fill="none" markerEnd="url(#c5a)" />
        <text x={W / 2} y={100} textAnchor="middle" fontSize={18} fontFamily={C.mono} fill={C.sec} style={{ textTransform: "uppercase" }}>repeat until no tool call</text>
      </svg>

      <div style={{ ...label, margin: "8px 0 6px" }}>Context window ({ctx.length} messages)</div>
      <div role="list" aria-label="Messages in the context window" style={{ border: `1px solid ${C.line}`, borderRadius: 4, background: C.paper }}>
        {ctx.map((m, k) => (
          <div role="listitem" key={k} style={{ display: "flex", gap: 8, padding: "6px 10px", borderTop: k ? `1px solid ${C.line}` : "none", background: k === ctx.length - 1 && i > 0 ? C.panel : "transparent" }}>
            <span style={{ ...label, width: 78, flex: "none", color: m.role === "tool" ? C.blue : m.role === "assistant" ? C.clay : C.sec }}>{m.role}</span>
            <span style={{ fontFamily: C.mono, fontSize: 13, wordBreak: "break-word" }}>{m.text}</span>
          </div>
        ))}
      </div>

      <Note>{cur.note}</Note>
      <Row>
        <Btn onClick={() => setI(i + 1)} disabled={!canNext}>Step</Btn>
        {atGate && (
          <>
            <Btn on={decision === "allow"} accent={C.blue} onClick={() => setDecision("allow")}>Approve</Btn>
            <Btn on={decision === "deny"} onClick={() => setDecision("deny")}>Deny</Btn>
          </>
        )}
        <Btn onClick={() => { setI(0); setDecision(null) }}>Reset</Btn>
      </Row>
      <Schematic />
    </div>
  )
}
