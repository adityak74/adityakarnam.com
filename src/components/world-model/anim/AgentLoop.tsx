import * as React from "react"

// Agent loop: a pulse travels PROMPT -> MODEL -> TOOL CALL -> RESULT and back.
// At TOOL CALL an approval gate can block it; the ring greys until approved.
const W = 400
const H = 300
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const C = { x: 200, y: 130 }
const R = 85
const STAGES = ["PROMPT", "MODEL", "TOOL CALL", "RESULT"]
// angle (radians, clockwise from top) of each stage
const ANG = [0, 1, 2, 3].map(i => (i * Math.PI) / 2)
const GATE = { x: 152, y: 252, w: 96, h: 26 }
const pt = (a: number) => ({ x: C.x + R * Math.sin(a), y: C.y - R * Math.cos(a) })
const TAU = Math.PI * 2

const AgentLoop = () => {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext("2d")
    if (!cv || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let a = reduce ? Math.PI * 0.75 : 0
    let approved = true
    let hover = false
    let raf = 0

    const frame = () => {
      if (!reduce) {
        const next = a + 0.016
        // blocked: hold just before the TOOL CALL node (angle PI)
        a = !approved && a < Math.PI && next >= Math.PI ? Math.PI : !approved && a === Math.PI ? a : next
        if (a >= TAU) a -= TAU
      }
      const blocked = !approved && a === Math.PI
      const grey = !approved && a >= Math.PI - 0.0001 && a <= Math.PI + 0.0001
      ctx.clearRect(0, 0, W, H)
      ctx.font = "10px 'JetBrains Mono', monospace"
      ctx.textBaseline = "middle"
      const live = !grey
      // ring
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(${INK},0.2)`
      ctx.setLineDash([3, 4])
      ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, TAU); ctx.stroke()
      ctx.setLineDash([])
      // pulse trail (arc behind the head)
      if (live) {
        ctx.strokeStyle = `rgba(${BLUE},0.85)`
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(C.x, C.y, R, a - Math.PI / 2 - 0.9, a - Math.PI / 2); ctx.stroke()
      }
      // stages
      STAGES.forEach((s, i) => {
        const p = pt(ANG[i])
        const gateStage = i === 2
        ctx.fillStyle = grey ? `rgba(${SEC},0.5)` : `rgb(${INK})`
        ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 4, 8, 8)
        ctx.fillStyle = gateStage && hover ? `rgb(${CLAY})` : `rgba(${SEC},${grey ? 0.5 : 0.95})`
        if (i === 0) { ctx.textAlign = "center"; ctx.fillText(s, p.x, p.y - 16) }
        else if (i === 1) { ctx.textAlign = "left"; ctx.fillText(s, p.x + 12, p.y) }
        else if (i === 2) { ctx.textAlign = "center"; ctx.fillText(s, p.x, p.y + 16) }
        else { ctx.textAlign = "right"; ctx.fillText(s, p.x - 12, p.y) }
      })
      ctx.textAlign = "left"
      // pulse head: smooth dot, clay while moving, grey when blocked
      const h = pt(a)
      ctx.fillStyle = grey ? `rgba(${SEC},0.7)` : `rgb(${CLAY})`
      ctx.beginPath(); ctx.arc(h.x, h.y, 3.5, 0, 7); ctx.fill()
      // gate: pixel-square toggle
      ctx.strokeStyle = hover ? `rgb(${CLAY})` : `rgba(${INK},0.5)`
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.strokeRect(GATE.x + 0.5, GATE.y + 0.5, GATE.w, GATE.h)
      ctx.setLineDash([])
      const bx = GATE.x + 8, by = GATE.y + 6
      ctx.fillStyle = `rgba(${INK},0.9)`
      ctx.fillRect(bx, by, 14, 14)
      ctx.fillStyle = "#FAF9F6"
      ctx.fillRect(bx + 2, by + 2, 10, 10)
      if (approved) { ctx.fillStyle = `rgb(${CLAY})`; ctx.fillRect(bx + 4, by + 4, 6, 6) }
      ctx.fillStyle = hover ? `rgb(${CLAY})` : `rgba(${SEC},0.95)`
      ctx.fillText(blocked ? "BLOCKED" : "APPROVE?", bx + 22, GATE.y + GATE.h / 2 + 1)
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    const inGate = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H
      return x >= GATE.x && x <= GATE.x + GATE.w && y >= GATE.y && y <= GATE.y + GATE.h
    }
    const move = (e: PointerEvent) => { hover = inGate(e); cv.style.cursor = hover ? "pointer" : "crosshair" }
    const leave = () => { hover = false }
    const click = (e: PointerEvent) => {
      if (!inGate(e)) return
      approved = !approved
      if (approved && a === Math.PI) a += 0.001
      if (reduce) frame()
    }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    cv.addEventListener("pointerdown", click)
    if (reduce) frame(); else raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      cv.removeEventListener("pointermove", move)
      cv.removeEventListener("pointerleave", leave)
      cv.removeEventListener("pointerdown", click)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Agent loop: prompt, model, tool call, result. A pulse circles the loop and stops at the tool call when the approval gate is blocked"
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default AgentLoop
