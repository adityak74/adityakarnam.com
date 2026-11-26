import * as React from "react"

const c = { paper: "#FAF9F6", ink: "#141413", sec: "#5E5D59", hair: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C" }
const mono = "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace"
const sans = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Role to node mapping, straight from the subagent-fleet post.
const ROLES = [
  { id: "planner", node: 1, tools: "Read, Grep, Glob", why: "Planning and file discovery do not need a big model, so the route goes to a small fast model on a lightweight node." },
  { id: "implementer", node: 2, tools: "Read, Grep, Glob, Edit, MultiEdit, Bash", why: "Implementation gets the larger coding model on a bigger node." },
  { id: "reviewer", node: 2, tools: "Read, Grep, Glob, Bash", why: "Review also gets the larger coding model on the bigger node, with its own tool list." },
  { id: "summarizer", node: 0, tools: "", why: "Summaries are cheap, so a small local model on the controller answers." },
]
const NODES = [
  { x: 12, name: "Controller", sub: "small local model" },
  { x: 126, name: "Lightweight", sub: "small fast model" },
  { x: 240, name: "Bigger node", sub: "larger coding model" },
]
const STEPS = ["Pick a role, then press Step.", "The harness sends the request, tagged with its role, to the LiteLLM gateway.", "The gateway follows the route that fleet.yaml generated for this role and calls Ollama on that node.", "The node answers and the reply travels back through the gateway to the harness."]

const ControlPlane = () => {
  const [role, setRole] = React.useState(0)
  const [step, setStep] = React.useState(0)
  const r = ROLES[role]
  const n = NODES[r.node]
  const cx = n.x + 54
  const line = (on: boolean, hot = false) => ({ stroke: on ? (hot ? c.blue : c.clay) : c.hair, strokeWidth: on ? 2 : 1.5, fill: "none" })
  const btn = (active: boolean): React.CSSProperties => ({ fontFamily: mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", padding: "8px 12px", minHeight: 40, borderRadius: 3, border: `1px solid ${active ? c.clay : c.hair}`, background: active ? c.paper : "transparent", color: active ? c.clay : c.ink, cursor: "pointer" })
  return (
    <div style={{ fontFamily: sans, color: c.ink }}>
      <div role="group" aria-label="Choose an agent role" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {ROLES.map((x, i) => (
          <button key={x.id} type="button" aria-pressed={i === role} onClick={() => { setRole(i); setStep(0) }} style={btn(i === role)}>{x.id}</button>
        ))}
      </div>
      <svg viewBox="0 0 360 372" role="img" aria-label={`Control plane schematic. The ${r.id} role is routed to the ${n.name} node.`} style={{ width: "100%", height: "auto", display: "block" }}>
        <title>subagent-fleet routing schematic</title>
        <rect x="60" y="6" width="240" height="38" rx="3" fill={c.paper} stroke={c.blue} />
        <text x="180" y="22" textAnchor="middle" fontFamily={mono} fontSize="11" fill={c.blue}>fleet.yaml</text>
        <text x="180" y="36" textAnchor="middle" fontFamily={sans} fontSize="10" fill={c.sec}>nodes, models, roles, routes</text>
        <path d="M180 44 V150" {...line(false)} strokeDasharray="3 3" />
        <text x="188" y="100" fontFamily={sans} fontSize="9" fill={c.sec}>generates</text>
        <rect x="60" y="60" width="240" height="34" rx="3" fill={c.paper} stroke={step >= 1 ? c.clay : c.hair} />
        <text x="180" y="81" textAnchor="middle" fontFamily={sans} fontSize="11" fill={c.ink}>Coding harness, role: {r.id}</text>
        <path d="M180 94 V150" {...line(step >= 1)} />
        <rect x="60" y="150" width="240" height="40" rx="3" fill={c.paper} stroke={step >= 2 ? c.clay : c.hair} />
        <text x="180" y="168" textAnchor="middle" fontFamily={mono} fontSize="11" fill={c.ink}>LiteLLM gateway</text>
        <text x="180" y="182" textAnchor="middle" fontFamily={sans} fontSize="10" fill={c.sec}>routes from fleet.yaml</text>
        {NODES.map((nd, i) => {
          const on = i === r.node && step >= 2
          return <path key={i} d={`M180 190 V230 H${nd.x + 54} V262`} {...line(on)} />
        })}
        {step >= 3 ? <path d={`M${cx + 8} 262 V240 H188 V190`} {...line(true, true)} /> : null}
        {NODES.map((nd, i) => {
          const on = i === r.node && step >= 2
          return (
            <g key={nd.name}>
              <rect x={nd.x} y="262" width="108" height="56" rx="3" fill={on ? c.panel : c.paper} stroke={on ? c.clay : c.hair} strokeWidth={on ? 2 : 1} />
              <text x={nd.x + 54} y="282" textAnchor="middle" fontFamily={mono} fontSize="10" fill={c.ink}>{nd.name}</text>
              <text x={nd.x + 54} y="296" textAnchor="middle" fontFamily={sans} fontSize="10" fill={c.sec}>{nd.sub}</text>
              <text x={nd.x + 54} y="309" textAnchor="middle" fontFamily={sans} fontSize="10" fill={c.sec}>Ollama</text>
            </g>
          )
        })}
        <text x="180" y="352" textAnchor="middle" fontFamily={sans} fontSize="9" fill={c.sec}>schematic, not to scale</text>
      </svg>
      <p aria-live="polite" style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.6, minHeight: 72 }}>
        {STEPS[step]}
        {step >= 2 ? <span style={{ color: c.sec }}> {r.why}{r.tools ? ` Tools for this role in the post: ${r.tools}.` : ""}</span> : null}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step >= 3} style={{ ...btn(false), opacity: step >= 3 ? 0.5 : 1 }}>Step</button>
        <button type="button" onClick={() => setStep(0)} style={btn(false)}>Reset</button>
      </div>
    </div>
  )
}
export default ControlPlane
