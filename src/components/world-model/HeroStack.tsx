import * as React from "react"

// Hero canvas: particles rise through the AI stack. Blocky 8-bit pixels at the
// silicon layer resolve into smooth streaks, clusters, a connected agent
// network, and finished outputs. The pointer pushes particles away.
const W = 400
const H = 380
const BANDS = ["SILICON", "INFERENCE", "MODELS", "AGENTS", "FACTORY"]
const BH = H / BANDS.length
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const N = 170

type P = { x: number; y: number; v: number; ph: number; hx: number }

const spawn = (init: boolean): P => {
  const x = 44 + Math.random() * (W - 60)
  return {
  x, hx: x,
  y: init ? Math.random() * H : H + Math.random() * 20,
  v: 0.35 + Math.random() * 0.6,
  ph: Math.random() * 6.28,
  }
}

const HeroStack = () => {
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
    const ps = Array.from({ length: N }, () => spawn(true))
    const ptr = { x: -999, y: -999 }
    let hover = -1
    let t = 0
    let raf = 0

    const band = (y: number) => Math.min(BANDS.length - 1, Math.max(0, BANDS.length - 1 - Math.floor(y / BH)))

    const frame = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)
      // band rules + labels
      ctx.font = "10px 'JetBrains Mono', monospace"
      ctx.textBaseline = "top"
      for (let b = 0; b < BANDS.length; b++) {
        const y = H - (b + 1) * BH
        ctx.strokeStyle = `rgba(${INK},0.10)`
        ctx.setLineDash([3, 4])
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = b === hover ? `rgb(${CLAY})` : `rgba(${SEC},0.9)`
        ctx.fillText(BANDS[b], 0, y + 6)
      }
      // update
      for (const p of ps) {
        const b = band(p.y)
        const speed = p.v * (b === hover ? 1.8 : 1)
        p.y -= speed
        // sideways flow grows with height; silicon band moves in rigid columns
        p.x += b === 0 ? 0 : Math.sin(t * 0.9 + p.ph + p.y * 0.02) * 0.25 * b
        p.x += (p.hx - p.x) * 0.02
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy)
        if (d < 70 && d > 0.1) { const f = (70 - d) / 70; p.x += (dx / d) * f * 3; p.y += (dy / d) * f * 3 }
        p.x = Math.min(W - 4, Math.max(36, p.x))
        if (p.y < -6) Object.assign(p, spawn(false))
      }
      // draw particles per band style
      const agents: P[] = []
      for (const p of ps) {
        const b = band(p.y)
        if (b === 0) {
          const gx = Math.round(p.x / 8) * 8, gy = Math.round(p.y / 8) * 8
          ctx.fillStyle = `rgba(${INK},0.85)`
          ctx.fillRect(gx, gy, 5, 5)
        } else if (b === 1) {
          ctx.strokeStyle = `rgba(${BLUE},0.7)`
          ctx.lineWidth = 1.2
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.v * 14); ctx.stroke()
        } else if (b === 2) {
          ctx.fillStyle = `rgba(${BLUE},0.55)`
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 7); ctx.fill()
        } else if (b === 3) {
          ctx.fillStyle = `rgb(${CLAY})`
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.8, 0, 7); ctx.fill()
          agents.push(p)
        } else {
          ctx.strokeStyle = `rgba(${BLUE},0.95)`
          ctx.lineWidth = 1.2
          ctx.strokeRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 6, 6)
        }
      }
      // agent network edges
      ctx.lineWidth = 1
      for (let i = 0; i < agents.length; i++)
        for (let j = i + 1; j < agents.length; j++) {
          const d = Math.hypot(agents[i].x - agents[j].x, agents[i].y - agents[j].y)
          if (d < 55) {
            ctx.strokeStyle = `rgba(${CLAY},${0.45 * (1 - d / 55)})`
            ctx.beginPath(); ctx.moveTo(agents[i].x, agents[i].y); ctx.lineTo(agents[j].x, agents[j].y); ctx.stroke()
          }
        }
      raf = requestAnimationFrame(frame)
    }

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      ptr.x = ((e.clientX - r.left) / r.width) * W
      ptr.y = ((e.clientY - r.top) / r.height) * H
      hover = band(ptr.y)
    }
    const leave = () => { ptr.x = ptr.y = -999; hover = -1 }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    if (reduce) { frame(); cancelAnimationFrame(raf) } else raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      cv.removeEventListener("pointermove", move)
      cv.removeEventListener("pointerleave", leave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Particles rising through the AI stack: silicon, inference, models, agents, software factory"
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default HeroStack
