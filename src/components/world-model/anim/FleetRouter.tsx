import * as React from "react"

// Fleet router: requests leave a source, a router dispatches each to the
// least-loaded healthy machine. Nodes fail at random and traffic re-routes.
// Hover a node to highlight it; click to pin it unhealthy.
const W = 400
const H = 260
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const LABELS = ["M5 PRO", "MAC MINI", "LINUX GPU", "CLOUD"]
const SRC = { x: 14, y: H / 2 }
const RT = { x: 150, y: H / 2 }
const NX = 270, NW = 126, NH = 42
const ny = (i: number) => 14 + i * 62

type Node = { load: number; auto: number; pinned: boolean }
type Pkt = { t: number; to: number; sx: number; sy: number }

const FleetRouter = () => {
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
    const nodes: Node[] = LABELS.map(() => ({ load: 0.2 + Math.random() * 0.3, auto: 0, pinned: false }))
    const bad = (n: Node) => n.pinned || n.auto > 0
    const pk: Pkt[] = []
    let hover = -1
    let t = 0
    let raf = 0

    // route: least-loaded healthy node, with a little jitter
    const pick = () => {
      let best = -1, bs = 1e9
      nodes.forEach((n, i) => {
        if (bad(n)) return
        const s = n.load + Math.random() * 0.3
        if (s < bs) { bs = s; best = i }
      })
      return best
    }
    const emit = () => { const to = pick(); if (to >= 0) pk.push({ t: 0, to, sx: 0, sy: 0 }) }
    if (reduce) { for (let i = 0; i < 6; i++) { emit(); pk[i].t = 0.1 + i * 0.15 } nodes[2].auto = 1 }

    const frame = () => {
      t += 0.016
      if (!reduce) {
        if (Math.random() < 0.045) emit()
        if (Math.random() < 0.003 && !nodes.some(bad)) nodes[Math.floor(Math.random() * 4)].auto = 3.5
      }
      ctx.clearRect(0, 0, W, H)
      ctx.font = "10px 'JetBrains Mono', monospace"
      ctx.textBaseline = "top"
      // links router -> nodes
      ctx.lineWidth = 1
      nodes.forEach((n, i) => {
        ctx.strokeStyle = `rgba(${INK},${bad(n) ? 0.08 : 0.2})`
        ctx.setLineDash([3, 4])
        ctx.beginPath(); ctx.moveTo(RT.x + 8, RT.y); ctx.lineTo(NX, ny(i) + NH / 2); ctx.stroke()
      })
      ctx.beginPath(); ctx.moveTo(SRC.x + 8, SRC.y); ctx.lineTo(RT.x - 8, RT.y); ctx.stroke()
      ctx.setLineDash([])
      // source + router
      ctx.fillStyle = `rgb(${INK})`
      ctx.fillRect(SRC.x - 4, SRC.y - 4, 8, 8)
      ctx.fillStyle = `rgba(${SEC},0.9)`
      ctx.fillText("REQUESTS", 0, SRC.y + 12)
      ctx.strokeStyle = `rgb(${BLUE})`
      ctx.lineWidth = 1.2
      ctx.strokeRect(RT.x - 8, RT.y - 8, 16, 16)
      ctx.fillStyle = `rgba(${SEC},0.9)`
      ctx.fillText("ROUTER", RT.x - 18, RT.y + 14)
      // packets
      for (let i = pk.length - 1; i >= 0; i--) {
        const p = pk[i]
        const n = nodes[p.to]
        if (p.t < 0.5 && bad(n) && !reduce) { const to = pick(); if (to < 0) { pk.splice(i, 1); continue } p.to = to }
        p.t += 0.012
        if (p.t >= 1) { nodes[p.to].load = Math.min(1, nodes[p.to].load + 0.07); pk.splice(i, 1); continue }
        let x: number, y: number
        if (p.t < 0.5) { const u = p.t * 2; x = SRC.x + 8 + (RT.x - 8 - SRC.x - 8) * u; y = SRC.y }
        else { const u = (p.t - 0.5) * 2, ty = ny(p.to) + NH / 2; x = RT.x + 8 + (NX - RT.x - 8) * u; y = RT.y + (ty - RT.y) * u }
        ctx.fillStyle = `rgb(${p.t < 0.5 ? INK : CLAY})`
        ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4)
      }
      // nodes
      nodes.forEach((n, i) => {
        const y = ny(i)
        const b = bad(n)
        if (!reduce) { n.load = Math.max(0.05, n.load - 0.0015); if (n.auto > 0) n.auto -= 0.016 }
        ctx.strokeStyle = `rgba(${b ? SEC : INK},${b ? 0.5 : 0.7})`
        ctx.lineWidth = 1
        ctx.setLineDash(b ? [3, 3] : [])
        ctx.strokeRect(NX + 0.5, y + 0.5, NW, NH)
        ctx.setLineDash([])
        ctx.fillStyle = i === hover ? `rgb(${CLAY})` : `rgba(${SEC},${b ? 0.6 : 0.95})`
        ctx.fillText(LABELS[i] + (b ? "  DOWN" : ""), NX + 8, y + 8)
        ctx.fillStyle = `rgba(${INK},0.08)`
        ctx.fillRect(NX + 8, y + 26, NW - 16, 6)
        ctx.fillStyle = b ? `rgba(${SEC},0.35)` : `rgba(${BLUE},0.85)`
        ctx.fillRect(NX + 8, y + 26, (NW - 16) * n.load, 6)
      })
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    const idx = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H
      if (x < NX) return -1
      return nodes.findIndex((_, i) => y >= ny(i) && y <= ny(i) + NH)
    }
    const move = (e: PointerEvent) => { hover = idx(e); cv.style.cursor = hover >= 0 ? "pointer" : "crosshair" }
    const leave = () => { hover = -1 }
    const click = (e: PointerEvent) => {
      const i = idx(e)
      if (i >= 0) { nodes[i].pinned = !nodes[i].pinned; nodes[i].auto = 0; if (reduce) frame() }
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
      aria-label="Requests dispatched by a router to four machines; when a machine goes unhealthy, traffic re-routes to the others"
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default FleetRouter
