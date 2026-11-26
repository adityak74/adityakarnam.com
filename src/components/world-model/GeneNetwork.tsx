import * as React from "react"

// Interactive gene-interaction graph: three communities (nod to the thesis on
// community detection in Alzheimer's disease gene networks). Springs keep each
// community cohesive; the pointer pushes nodes away and they flow back.
const COLORS = ["#C2522D", "#141413", "#5E5D59"]
const W = 300
const H = 270

type Node = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; g: number; ph: number }

const seeds: [number, number, number][] = [
  [60, 70, 0], [100, 40, 0], [120, 95, 0], [75, 120, 0], [40, 105, 0],
  [190, 60, 1], [230, 85, 1], [215, 130, 1], [175, 110, 1], [250, 45, 1],
  [120, 190, 2], [165, 175, 2], [150, 225, 2], [100, 230, 2], [195, 215, 2],
]

const GeneNetwork = () => {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const nodes: Node[] = seeds.map(([x, y, g], i) => ({ x, y, vx: 0, vy: 0, hx: x, hy: y, g, ph: i * 0.7 }))
    const ptr = { x: -999, y: -999 }
    let raf = 0
    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const same = a.g === b.g
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (!same && d > 70) continue
          ctx.strokeStyle = same ? COLORS[a.g] : "#E3E0D8"
          ctx.globalAlpha = same ? 0.22 : 0.9 * (1 - d / 70)
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      ctx.globalAlpha = 1
      for (const n of nodes) {
        ctx.fillStyle = COLORS[n.g]
        ctx.globalAlpha = 0.65 + 0.35 * Math.sin(t * 1.5 + n.ph)
        ctx.beginPath(); ctx.arc(n.x, n.y, 4.5, 0, 7); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const step = () => {
      t += 0.016
      for (const n of nodes) {
        // home spring + slow organic drift
        const tx = n.hx + Math.sin(t * 0.8 + n.ph) * 5
        const ty = n.hy + Math.cos(t * 0.7 + n.ph * 1.3) * 5
        n.vx += (tx - n.x) * 0.02
        n.vy += (ty - n.y) * 0.02
        const dx = n.x - ptr.x, dy = n.y - ptr.y
        const d = Math.hypot(dx, dy)
        if (d < 70 && d > 0.1) {
          const f = ((70 - d) / 70) * 1.6
          n.vx += (dx / d) * f
          n.vy += (dy / d) * f
        }
        n.vx *= 0.9
        n.vy *= 0.9
        n.x += n.vx
        n.y += n.vy
      }
      draw()
      raf = requestAnimationFrame(step)
    }

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      ptr.x = ((e.clientX - r.left) / r.width) * W
      ptr.y = ((e.clientY - r.top) / r.height) * H
    }
    const leave = () => { ptr.x = ptr.y = -999 }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    if (reduce) draw()
    else raf = requestAnimationFrame(step)
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
      aria-label="Interactive gene interaction network with three communities"
      style={{ width: "100%", maxWidth: 300, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default GeneNetwork
