/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link } from "gatsby"

const C = { blue: "#2F5D8C", ink: "#141413", sec: "#5E5D59", rule: "#E3E0D8", panel: "#F3F1EB", accent: "#C2522D" }
const MONO = "'JetBrains Mono', ui-monospace, monospace"
const SERIF = "'Fraunces', Georgia, serif"

// Every number below comes from a published write-up on this site.
const STEPS = [
  { layer: "Hardware", big: "80x", line: "Batched matmul holds a flat ~80x throughput edge over matrix-vector ops on an M5 Pro. That gap is why decode is the bottleneck.", to: "/mlx-gemv-gemm-roofline-apple-silicon/", cta: "Roofline study" },
  { layer: "Inference", big: "+119%", line: "A 0.8B draft model gives a 119% peak decode speedup on Qwen3.8-27B, once the hybrid attention cache is patched.", to: "/mlx-speculative-decoding-qwen3-8-apple-silicon/", cta: "Speculative decoding" },
  { layer: "Models", big: "4.9 GB", line: "A two-teacher distillation beats the 8.9 GB stock release it replaces by +5.5 MMLU, trained on one laptop.", to: "/distilling-ornith-9b-two-teacher-mlx/", cta: "The distillation" },
  { layer: "Agents", big: "5.5 MB", line: "Quecto is a coding agent in Rust with a 1.3 MB core, approval gating and session persistence. Small enough to read.", to: "/quecto/", cta: "Quecto" },
  { layer: "Retrieval", big: "15+", line: "One Collection API over fifteen-plus vector backends, with hybrid search, temporal memory and an MCP server.", to: "/embenx-python-embedding-toolkit/", cta: "embenx" },
  { layer: "Evals", big: "2K = 8K", line: "Retrieval at a 2K token budget scored 0.646. Truncation needed 8K to reach 0.650. Budget is the variable.", to: "/budgetbench-explained/", cta: "BudgetBench" },
]
const N = STEPS.length
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))

const label = { fontFamily: MONO, fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase" as const, color: C.sec }

const ScrollStory = () => {
  const box = React.useRef<HTMLDivElement>(null)
  const [p, setP] = React.useState(0)
  const [still, setStill] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStill(true); return }
    let raf = 0
    const tick = () => {
      raf = 0
      const el = box.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setP(clamp(-r.top / Math.max(1, r.height - window.innerHeight)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    tick()
    window.addEventListener("scroll", on, { passive: true })
    window.addEventListener("resize", on)
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf) }
  }, [])

  if (still) {
    return (
      <section aria-label="The AI stack in numbers" sx={{ my: 5 }}>
        <div sx={{ ...label, color: C.blue, mb: 3 }}>The stack in numbers</div>
        {STEPS.map(s => (
          <div key={s.layer} sx={{ py: 3, borderTop: `1px solid ${C.rule}` }}>
            <div sx={label}>{s.layer}</div>
            <div sx={{ fontFamily: SERIF, fontSize: "2.4rem", color: C.blue, lineHeight: 1.1 }}>{s.big}</div>
            <p sx={{ m: 0 }}>{s.line} <Link to={s.to}>{s.cta}</Link></p>
          </div>
        ))}
      </section>
    )
  }

  const pos = p * N // 0..N
  const active = Math.min(N - 1, Math.floor(pos))

  return (
    <section aria-label="The AI stack in numbers" ref={box} sx={{ height: `${N * 70 + 100}vh`, my: 5, position: "relative" }}>
      <div sx={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
        <div sx={{ ...label, color: C.blue, mb: 3 }}>The stack in numbers · scroll</div>
        <div sx={{ display: "grid", gridTemplateColumns: ["28px 1fr", "140px 1fr"], gap: [2, 4], alignItems: "stretch" }}>
          {/* rail */}
          <div sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `1px solid ${C.rule}`, pl: 3, py: 1 }}>
            {STEPS.map((s, i) => (
              <span key={s.layer} sx={{ ...label, display: ["none", "block"], color: i === active ? C.accent : C.sec, opacity: i === active ? 1 : 0.45, transition: "color .2s, opacity .2s" }}>
                {String(i + 1).padStart(2, "0")} {s.layer}
              </span>
            ))}
          </div>
          {/* stage */}
          <div sx={{ position: "relative", minHeight: ["340px", "380px"] }}>
            {STEPS.map((s, i) => {
              const d = pos - (i + 0.5) // 0 when centred
              const o = clamp(1 - Math.abs(d) * 2.4)
              return (
                <div
                  key={s.layer}
                  aria-hidden={i !== active}
                  sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", pointerEvents: i === active ? "auto" : "none", willChange: "transform, opacity" }}
                  style={{ opacity: o, transform: `translateY(${-d * 70}px) scale(${1 - Math.abs(d) * 0.08})` }}
                >
                  <div sx={{ ...label, color: C.accent, mb: 2 }}>{String(i + 1).padStart(2, "0")} / {s.layer}</div>
                  <div sx={{ fontFamily: SERIF, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1, fontSize: "clamp(3.6rem, 12vw, 7.5rem)", color: C.blue }}>{s.big}</div>
                  <p sx={{ mt: 3, mb: 3, maxWidth: "46ch", fontSize: "19px" }}>{s.line}</p>
                  <Link to={s.to} tabIndex={i === active ? 0 : -1} sx={{ fontFamily: MONO, fontSize: "12px", letterSpacing: ".06em", textTransform: "uppercase", color: C.accent }}>{s.cta} →</Link>
                </div>
              )
            })}
          </div>
        </div>
        <div sx={{ mt: 3, height: "2px", bg: C.rule }}>
          <div sx={{ height: "100%", bg: C.accent }} style={{ width: `${p * 100}%` }} />
        </div>
      </div>
    </section>
  )
}

export default ScrollStory
