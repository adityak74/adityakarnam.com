/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { ESSAYS } from "./essays"
import { POSTS } from "./posts"
import { GH } from "./growth-data"
import { EXPERIMENTS } from "./experiments"

// Dark panel palette (clay = pace, blue = depth).
const D = { bg: "#141413", ink: "#FAF9F6", sec: "#A3A19B", rule: "#34332F", clay: "#E07A55", blue: "#86AEDB", sage: "#9CC59A" }
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SERIF = "'Fraunces', Georgia, serif"

// GH (monthly GitHub contributions), POSTS and ESSAYS are regenerated weekly by scripts/update-growth-data.mjs.
const sumYear = (y: string) => GH.filter(([mo]) => mo.startsWith(y)).reduce((t, [, n]) => t + n, 0)
const RATIO = (sumYear("2026") / sumYear("2025")).toFixed(1)
const monthLabel = (mo: string) => new Date(`${mo}-01T00:00:00Z`).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase()

// One published result per layer, surface to bedrock.
const DEPTH = [
  { layer: "Agents", proof: "1.3 MB", line: "Quecto, a Rust coding agent with a 1.3 MB core", to: "/quecto/" },
  { layer: "Retrieval", proof: "15+", line: "CAG on arXiv, then embenx over 15+ vector stores", to: "/embenx-python-embedding-toolkit/" },
  { layer: "Evals", proof: "arXiv", line: "BudgetBench, agent memory under a token budget", to: "/budgetbench-explained" },
  { layer: "Models", proof: "+5.5", line: "A 4.9 GB distill that beats the 8.9 GB release on MMLU", to: "/distilling-ornith-9b-two-teacher-mlx/" },
  { layer: "Inference", proof: "+119%", line: "Decode speedup from speculative decoding", to: "/mlx-speculative-decoding-qwen3-8-apple-silicon/" },
  { layer: "Silicon", proof: "~80x", line: "GEMM over GEMV throughput on an M5 Pro", to: "/mlx-gemv-gemm-roofline-apple-silicon/" },
]
// Month each layer's first result was published (1-based DEPTH index).
const PINS: Record<string, number[]> = { "2024-12": [2], "2026-07": [1], "2026-08": [5, 6], "2026-09": [4, 3] }

// Published papers and technical posts per month (cumulated into the depth line).
// Posts: frontmatter dates in content/posts. (Call to Think essays are dots on the pace line instead.) Papers (Google Scholar): CAG 2024-12, IJACSA 16(5) 2025-05, MMEP 12(6) 2025-06,
// two 2025 papers with no month placed at 2025-12 (latest possible), Enterprise AI Control Plane 2026-08, BudgetBench 2026-09.

// Google Scholar papers with a year inside the chart window. Months come from the arXiv id or journal issue;
// MEDFIT-LLM and the governance study list only "2025", so they sit at 2025-12 (latest possible).
// Left out: the 2024 cardiac paper (month unknown, may predate Nov 2024) and the concept papers Scholar lists with no year.
const PAPERS: { mo: string; title: string; venue: string; href: string }[] = [
  { mo: "2024-12", title: "CAG: chunked augmented generation for Chrome's built-in Gemini Nano", venue: "arXiv", href: "https://arxiv.org/abs/2412.18708" },
  { mo: "2025-05", title: "Automated analysis of glucose response patterns in type 1 diabetes", venue: "IJACSA 16(5)", href: "/ai-research" },
  { mo: "2025-06", title: "Neural network diagnostic framework for breathwork and skin microbiome dynamics", venue: "MMEP 12(6)", href: "/ai-research" },
  { mo: "2025-12", title: "MEDFIT-LLM: domain-focused fine-tuning of small language models", venue: "IEEE conference", href: "https://ieeexplore.ieee.org/abstract/document/11042816" },
  { mo: "2025-12", title: "Quantifying adaptive governance success across 500 organizations", venue: "Study", href: "/ai-research" },
  // Co-authored with Arjun Jaggi, listed on arjunjaggi.com (/papers/ index, books, white papers). Books shown only as "2026" sit at 2026-11 (latest possible).
  { mo: "2026-09", title: "Agent Deception Containment", venue: "Concept paper ADC-2026-014 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/agent-deception-containment.html" },
  { mo: "2026-09", title: "The Innovation Compression Ratio", venue: "Concept paper ICR-2026-013 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/innovation-compression-ratio.html" },
  { mo: "2026-08", title: "The Agent Compromise Surface", venue: "Concept paper ACS-2026-012 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/agent-compromise-surface.html" },
  { mo: "2026-08", title: "Enterprise AI Ensembles", venue: "Concept paper EAEF-2026-010 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/enterprise-ai-ensembles.html" },
  { mo: "2026-08", title: "Output Genealogy: enterprise AI audit provenance", venue: "Concept paper AOGF-2026-004 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/ai-output-provenance.html" },
  { mo: "2026-08", title: "The Contribution Ratio Framework", venue: "Concept paper CRF-2026-009 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/contribution-ratio-authorship-framework.html" },
  { mo: "2026-08", title: "The Governance Topology of Enterprise Multi-Agent Systems", venue: "Concept paper MAGT-2026-008 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/multiagent-governance-topology.html" },
  { mo: "2026-08", title: "The AI Fiduciary Gap", venue: "Concept paper AIFG-2026-007 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/ai-fiduciary-gap.html" },
  { mo: "2026-08", title: "The AI Value Accounting Layer", venue: "Concept paper AVAL-2026-006 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/enterprise-ai-value-accounting.html" },
  { mo: "2026-08", title: "The Enterprise Agent Identity Framework", venue: "Concept paper EAIF-2026-005 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/enterprise-agent-identity.html" },
  { mo: "2026-08", title: "The Enterprise Memory Governance Framework", venue: "Concept paper EMGF-2026-004 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/enterprise-memory-governance.html" },
  { mo: "2026-08", title: "Multi-Agent Trust Governance", venue: "Concept paper MATGF-2026-003 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/multi-agent-trust-governance.html" },
  { mo: "2026-08", title: "The Enterprise AI Agent Governance Framework", venue: "Concept paper EAGF-2026-002 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/enterprise-ai-agent-governance.html" },
  { mo: "2026-08", title: "The Enterprise AI Control Plane", venue: "Concept paper EACP-2026-001 \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/papers/enterprise-ai-control-plane.html" },
  { mo: "2026-08", title: "The Trust Stack", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-trust-stack.html" },
  { mo: "2026-11", title: "The Model Decision", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-model-decision.html" },
  { mo: "2026-11", title: "The Harness Engineer", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-harness-engineer.html" },
  { mo: "2026-11", title: "The Inference Budget", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-inference-budget.html" },
  { mo: "2026-11", title: "The Contained Agent", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-contained-agent.html" },
  { mo: "2026-11", title: "The Memory Layer", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-memory-layer.html" },
  { mo: "2026-11", title: "The Command Layer", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-command-layer.html" },
  { mo: "2026-11", title: "The Local Model", venue: "Book \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/books/the-local-model.html" },
  { mo: "2026-10", title: "The Future Is Local", venue: "White paper \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/whitepapers/the-future-is-local.html" },
  { mo: "2026-10", title: "The Defensibility Gap", venue: "White paper \u00b7 with A. Jaggi", href: "https://arjunjaggi.com/whitepapers/defensibility-gap.html" },
  { mo: "2026-09", title: "BudgetBench: memory strategy evaluation in local LLM agents", venue: "arXiv", href: "https://arxiv.org/abs/2609.13149" },
]

// Chart geometry (viewBox 400 x 170, baseline at y = 150).
const X0 = 8, X1 = 392, BASE = 150
const x = (i: number) => X0 + (i * (X1 - X0)) / (GH.length - 1)
let run = 0
const CUM = GH.map(([, n]) => (run += n))
const PACE = CUM.map((c, i) => [x(i), BASE - (c / run) * 126] as const)
let pubRun = 0
const PUB_CUM = GH.map(([mo]) => (pubRun += POSTS.filter((p) => p.date.startsWith(mo)).length + PAPERS.filter((pp) => pp.mo === mo).length))
const DEPTH_PTS = PUB_CUM.map((c, i) => [x(i), BASE - (c / pubRun) * 96] as const)
const STEP = DEPTH_PTS.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ")
const RINGS = GH.flatMap(([mo], i) => (PINS[mo] || PAPERS.some((pp) => pp.mo === mo) || POSTS.some((p) => p.date.startsWith(mo)) ? [{ key: mo, x: DEPTH_PTS[i][0], y: DEPTH_PTS[i][1], ns: PINS[mo] || [], papers: PAPERS.filter((pp) => pp.mo === mo), posts: POSTS.filter((p) => p.date.startsWith(mo)), major: !!PINS[mo] || PAPERS.some((pp) => pp.mo === mo), month: new Date(`${mo}-15`).toLocaleString("en-US", { month: "short", year: "numeric" }) }] : []))
// After hours: private experiments, cumulative, drawn as a dashed sage line.
let expRun = 0
const EXP_CUM = GH.map(([mo]) => (expRun += EXPERIMENTS.filter((e) => e.mo === mo).length))
const EXP_PTS = EXP_CUM.map((c, i) => [x(i), BASE - (c / expRun) * 66] as const)
const EXP_LINE = EXP_PTS.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ")
const EXP_DOTS = GH.flatMap(([mo], i) => {
  const xs = EXPERIMENTS.filter((e) => e.mo === mo)
  return xs.length ? [{ key: `x${mo}`, x: EXP_PTS[i][0], y: EXP_PTS[i][1], xs, month: new Date(`${mo}-15`).toLocaleString("en-US", { month: "short", year: "numeric" }) }] : []
})
const line = PACE.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ")

// Essays grouped by month, drawn as clay dots on the pace line.
const ESSAY_DOTS = GH.flatMap(([mo], i) => {
  const es = ESSAYS.filter((e) => e.date.startsWith(mo))
  return es.length ? [{ key: `e${mo}`, x: PACE[i][0], y: PACE[i][1], es, month: new Date(`${mo}-15`).toLocaleString("en-US", { month: "short", year: "numeric" }) }] : []
})

const ACTIVE = GH.filter(([, n]) => n > 0).length
const MAX = Math.max(...GH.map(([, n]) => n))
const CELL = (X1 - X0) / (GH.length - 1) - 2

const kpi = { fontFamily: SERIF, fontSize: ["2rem", "clamp(2.8rem, 8vw, 4.2rem)"], lineHeight: 1, letterSpacing: "-0.03em" }
const small = { fontFamily: MONO, fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase" as const }

const GrowthLadder = () => {
  const [open, setOpen] = React.useState<string | null>(null)
  const ring = RINGS.find((r) => r.key === open)
  const dot = ESSAY_DOTS.find((d) => d.key === open)
  const exp = EXP_DOTS.find((d) => d.key === open)
  return (
  <div sx={{ bg: D.bg, color: D.ink, px: [3, 5], py: [4, 5], borderRadius: "6px" }}>
    <div sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: [2, 5] }}>
      <div>
        <div sx={{ ...kpi, color: D.clay }}>{RATIO}x</div>
        <div sx={{ mt: 2, color: D.sec, fontSize: ["13px", "15px"], maxWidth: "24ch" }}>more shipped in 2026 than in 2025</div>
      </div>
      <div>
        <div sx={{ ...kpi, color: D.blue }}>6/6</div>
        <div sx={{ mt: 2, color: D.sec, fontSize: ["13px", "15px"], maxWidth: "24ch" }}>layers of the AI stack, from agents down to silicon</div>
      </div>
      <div>
        <div sx={{ ...kpi, color: D.ink }}>{ACTIVE}/{GH.length}</div>
        <div sx={{ mt: 2, color: D.sec, fontSize: ["13px", "15px"], maxWidth: "24ch" }}>months active on GitHub, without a break</div>
      </div>
    </div>

    <div sx={{ position: "relative", mt: [4, 5] }} onMouseLeave={() => setOpen(null)}>
    <svg onClick={() => setOpen(null)} viewBox="0 0 400 190" role="img" aria-label="Cumulative GitHub contributions, published work, and after-hours experiments, November 2024 to November 2026" sx={{ display: "block", width: "100%", height: "auto", overflow: "visible", "@keyframes ringPulse": { "0%": { r: 4, opacity: 0.7 }, "100%": { r: 13, opacity: 0 } }, ".pulse": { animation: "ringPulse 2.4s ease-out infinite" }, "@media (prefers-reduced-motion: reduce)": { ".pulse": { animation: "none", opacity: 0 } } }}>
      <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke={D.rule} />
      <path d={`${line} L${X1} ${BASE} L${X0} ${BASE} Z`} fill={D.clay} opacity={0.16} />
      <path d={line} fill="none" stroke={D.clay} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={EXP_LINE} fill="none" stroke={D.sage} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
      <path d={STEP} fill="none" stroke={D.blue} strokeWidth={2.5} strokeLinejoin="round" />
      {RINGS.map((r) => (
        <g key={r.key} role="button" tabIndex={0} aria-label={`${r.month}: ${[...r.ns.map((n) => `first ${DEPTH[n - 1].layer} result`), ...r.papers.map((pp) => pp.title), ...(r.posts.length ? [`${r.posts.length} posts`] : [])].join("; ")}`} aria-expanded={open === r.key}
          onMouseEnter={() => setOpen(r.key)} onFocus={() => setOpen(r.key)} onClick={(e) => { e.stopPropagation(); setOpen(r.key) }}
          onKeyDown={(e) => e.key === "Escape" && setOpen(null)} sx={{ cursor: "pointer", outline: "none", "&:focus-visible circle.dot": { stroke: D.ink } }}>
          {r.major && <circle className="pulse" cx={r.x} cy={r.y} r="4" fill="none" stroke={D.blue} strokeWidth={1.5} />}
          <circle cx={r.x} cy={r.y} r="13" fill="transparent" />
          <circle className="dot" cx={r.x} cy={r.y} r={r.major ? (open === r.key ? 5.5 : 4) : 2.5 + Math.sqrt(r.posts.length) * 1.1} fill={open === r.key || !r.major ? D.blue : D.bg} stroke={D.blue} strokeWidth={2.5} />
        </g>
      ))}
      {ESSAY_DOTS.map((d) => (
        <g key={d.key} role="button" tabIndex={0} aria-label={`${d.month}: ${d.es.length} Call to Think essays`} aria-expanded={open === d.key}
          onMouseEnter={() => setOpen(d.key)} onFocus={() => setOpen(d.key)} onClick={(e) => { e.stopPropagation(); setOpen(d.key) }}
          onKeyDown={(e) => e.key === "Escape" && setOpen(null)} sx={{ cursor: "pointer", outline: "none" }}>
          <circle cx={d.x} cy={d.y} r="13" fill="transparent" />
          <circle cx={d.x} cy={d.y} r={2.5 + Math.sqrt(d.es.length) * 1.1} fill={D.clay} stroke={open === d.key ? D.ink : D.bg} strokeWidth={1.5} />
        </g>
      ))}
      {EXP_DOTS.map((d) => (
        <g key={d.key} role="button" tabIndex={0} aria-label={`${d.month}: after-hours experiments: ${d.xs.map((e) => e.title).join("; ")}`} aria-expanded={open === d.key}
          onMouseEnter={() => setOpen(d.key)} onFocus={() => setOpen(d.key)} onClick={(e) => { e.stopPropagation(); setOpen(d.key) }}
          onKeyDown={(e) => e.key === "Escape" && setOpen(null)} sx={{ cursor: "pointer", outline: "none" }}>
          <circle cx={d.x} cy={d.y} r="11" fill="transparent" />
          <rect x={d.x - (2.5 + d.xs.length)} y={d.y - (2.5 + d.xs.length)} width={2 * (2.5 + d.xs.length)} height={2 * (2.5 + d.xs.length)} transform={`rotate(45 ${d.x} ${d.y})`} fill={D.sage} stroke={open === d.key ? D.ink : D.bg} strokeWidth={1.5} />
        </g>
      ))}
      <text x={X0} y="10" fontFamily={MONO} fontSize="10.5" letterSpacing=".08em" fill={D.clay}>— PACE</text>
      <text x={X0} y="24" fontFamily={MONO} fontSize="10.5" letterSpacing=".08em" fill={D.sage}>- - AFTER HOURS ◆ EXPERIMENTS</text>
      <text x={X0 + 62} y="10" fontFamily={MONO} fontSize="10.5" letterSpacing=".08em" fill={D.blue}>— DEPTH</text>
      <text x={X0 + 132} y="10" fontFamily={MONO} fontSize="10.5" letterSpacing=".04em" fill={D.sec}>○ LAYER/PAPER</text>
      <text x={X0 + 228} y="10" fontFamily={MONO} fontSize="10.5" letterSpacing=".04em" fill={D.blue}>● POSTS</text>
      <text x={X0 + 290} y="10" fontFamily={MONO} fontSize="10.5" letterSpacing=".04em" fill={D.clay}>● ESSAYS</text>
      {GH.map(([mo, n], i) => <rect key={mo} x={x(i) - CELL / 2} y="157" width={CELL} height="9" rx="1.5" fill={D.clay} opacity={0.2 + 0.8 * Math.sqrt(n / MAX)}><title>{`${mo}: ${n} contributions`}</title></rect>)}
      <text x={X0} y="184" fontFamily={MONO} fontSize="10" fill={D.sec}>NOV 2024</text>
      <text x={X1} y="184" textAnchor="end" fontFamily={MONO} fontSize="10" fill={D.sec}>{monthLabel(GH[GH.length - 1][0])}</text>
    </svg>
    {ring && (
      <div role="dialog" sx={{ position: ["relative", "absolute"], left: ["auto", `${(ring.x / 400) * 100}%`], top: ["auto", `${(ring.y / 190) * 100}%`], transform: ["none", ring.x > 200 ? "translate(calc(-100% - 14px), -50%)" : "translate(14px, -50%)"], width: ["auto", "280px"], mt: [2, 0], bg: "#1F1F1D", border: `1px solid ${D.rule}`, borderLeft: `3px solid ${D.blue}`, p: 3, zIndex: 2, boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
        <div sx={{ ...small, color: D.sec }}>{ring.month}</div>
        {ring.ns.map((n) => {
          const d = DEPTH[n - 1]
          return (
            <Link key={n} to={d.to} sx={{ display: "block", mt: 2, textDecoration: "none", color: D.ink, "&:hover .go": { color: D.blue } }}>
              <div sx={{ ...small, color: D.blue }}>{d.layer} <span sx={{ fontFamily: SERIF, fontSize: "1.2rem", letterSpacing: 0, textTransform: "none", color: D.ink, ml: 1 }}>{d.proof}</span></div>
              <div sx={{ fontSize: "13px", lineHeight: 1.45, color: D.sec, mt: 1 }}>{d.line} <span className="go" sx={{ color: D.ink }}>→</span></div>
            </Link>
          )
        })}
        {ring.papers.slice(0, 3).map((pp) => (
          <a key={pp.title} href={pp.href} {...(pp.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} sx={{ display: "block", mt: 2, textDecoration: "none", color: D.ink, "&:hover .go": { color: D.blue } }}>
            <div sx={{ ...small, color: D.clay }}>Paper · {pp.venue}</div>
            <div sx={{ fontSize: "13px", lineHeight: 1.45, color: D.sec, mt: 1 }}>{pp.title} <span className="go" sx={{ color: D.ink }}>→</span></div>
          </a>
        ))}
        {ring.papers.length > 3 && <a href="https://arjunjaggi.com/papers/" target="_blank" rel="noopener noreferrer" sx={{ display: "block", mt: 2, ...small, color: D.clay, textDecoration: "none" }}>+ {ring.papers.length - 3} more co-authored papers and books →</a>}
        {ring.posts.length > 0 && <div sx={{ ...small, color: D.blue, mt: 3 }}>{ring.posts.length} {ring.posts.length === 1 ? "post" : "posts"} on this site</div>}
        {ring.posts.slice(0, 4).map((p) => (
          <Link key={p.to} to={p.to} sx={{ display: "block", mt: 2, fontSize: "13px", lineHeight: 1.45, color: D.ink, textDecoration: "none", "&:hover": { color: D.blue } }}>{p.title} →</Link>
        ))}
        {ring.posts.length > 4 && <Link to="/blog" sx={{ display: "block", mt: 2, ...small, color: D.blue, textDecoration: "none" }}>+ {ring.posts.length - 4} more posts →</Link>}
      </div>
    )}
    {dot && (
      <div role="dialog" sx={{ position: ["relative", "absolute"], left: ["auto", `${(dot.x / 400) * 100}%`], top: ["auto", `${(dot.y / 190) * 100}%`], transform: ["none", "translate(calc(-100% - 14px), -30%)"], width: ["auto", "320px"], mt: [2, 0], bg: "#1F1F1D", border: `1px solid ${D.rule}`, borderLeft: `3px solid ${D.clay}`, p: 3, zIndex: 2, boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
        <div sx={{ ...small, color: D.sec }}>{dot.month} · <span sx={{ color: D.clay }}>{dot.es.length} {dot.es.length === 1 ? "essay" : "essays"} on Call to Think</span></div>
        {dot.es.slice(0, 4).map((e) => (
          <a key={e.slug} href={`https://calltothink.com/blog/${e.slug}/`} target="_blank" rel="noopener noreferrer" sx={{ display: "block", mt: 2, fontSize: "13px", lineHeight: 1.45, color: D.ink, textDecoration: "none", "&:hover": { color: D.clay } }}>{e.title} →</a>
        ))}
        {dot.es.length > 4 && <a href="https://calltothink.com/" target="_blank" rel="noopener noreferrer" sx={{ display: "block", mt: 2, ...small, color: D.clay, textDecoration: "none" }}>+ {dot.es.length - 4} more on calltothink.com →</a>}
      </div>
    )}
    {exp && (
      <div role="dialog" sx={{ position: ["relative", "absolute"], left: ["auto", `${(exp.x / 400) * 100}%`], top: ["auto", `${(exp.y / 190) * 100}%`], transform: ["none", exp.x > 200 ? "translate(calc(-100% - 14px), -50%)" : "translate(14px, -50%)"], width: ["auto", "300px"], mt: [2, 0], bg: "#1F1F1D", border: `1px solid ${D.rule}`, borderLeft: `3px solid ${D.sage}`, p: 3, zIndex: 2, boxShadow: "0 10px 30px rgba(0,0,0,.45)" }}>
        <div sx={{ ...small, color: D.sec }}>{exp.month} · <span sx={{ color: D.sage }}>after hours</span></div>
        {exp.xs.map((e) => (
          <Link key={e.key} to="/ai-research/#after-hours" sx={{ display: "block", mt: 2, textDecoration: "none", color: D.ink, "&:hover .go": { color: D.sage } }}>
            <div sx={{ ...small, color: D.sage }}>{e.tag}</div>
            <div sx={{ fontSize: "13px", lineHeight: 1.45, mt: 1 }}>{e.title} <span className="go" sx={{ color: D.sec }}>→</span></div>
          </Link>
        ))}
      </div>
    )}
    </div>

    <div sx={{ display: "grid", gridTemplateColumns: ["1fr 1fr", "1fr 1fr 1fr"], gap: "1px", bg: D.rule, border: `1px solid ${D.rule}`, mt: [4, 5] }}>
      {DEPTH.map((d, i) => (
        <Link key={d.layer} to={d.to} sx={{ display: "block", bg: D.bg, p: [2, 3], textDecoration: "none", color: D.ink, transition: "background .15s", "&:hover": { bg: "#1F1F1D" } }}>
          <div sx={{ ...small, color: D.blue }}>{String(i + 1).padStart(2, "0")} {d.layer}</div>
          <div sx={{ fontFamily: SERIF, fontSize: ["1.6rem", "2rem"], lineHeight: 1.1, mt: 2 }}>{d.proof}</div>
          <div sx={{ color: D.sec, fontSize: "13px", lineHeight: 1.45, mt: 1 }}>{d.line}</div>
        </Link>
      ))}
    </div>
  </div>
  )
}

export default GrowthLadder
