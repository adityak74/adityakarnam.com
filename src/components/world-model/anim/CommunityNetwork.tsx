import * as React from "react"

// Gene-interaction network. Nodes start grey and unclustered; a force pass pulls
// densely connected nodes together and they take on a community colour, the way
// ERBGA partitions Alzheimer's disease gene networks. Reshuffles every ~12s.
// Hover a node to highlight its community.
const W = 400
const H = 300
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const COLORS = [CLAY, BLUE, INK, SEC]
const ANCHORS = [[110, 100], [290, 100], [110, 215], [290, 215]]
const N = 40
const CYCLE = 12

type Node = { x: number; y: number; vx: number; vy: number; c: number; rev: number }

const CommunityNetwork = () => {
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
    const ns: Node[] = Array.from({ length: N }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 120, y: H / 2 + (Math.random() - 0.5) * 100, vx: 0, vy: 0, c: 0, rev: 0,
    }))
    let edges: [number, number][] = []
    const ptr = { x: -999, y: -999 }
    let hover = -1
    let t = 0
    let raf = 0

    // new random community assignment and wiring: dense inside, sparse between
    const reshuffle = () => {
      ns.forEach(n => { n.c = Math.floor(Math.random() * 4); n.rev = Math.random() })
      edges = []
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++)
          if (Math.random() < (ns[i].c === ns[j].c ? 0.28 : 0.02)) edges.push([i, j])
    }

    const step = (pull: number) => {
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const a = ns[i], b = ns[j]
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2)
          if (d < 60) { const f = 14 / d2; a.vx += dx / d * f * d; a.vy += dy / d * f * d; b.vx -= dx / d * f * d; b.vy -= dy / d * f * d }
        }
      for (const [i, j] of edges) {
        const a = ns[i], b = ns[j]
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1
        const f = (d - 36) * 0.006
        a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f
      }
      for (const n of ns) {
        const [ax, ay] = ANCHORS[n.c]
        n.vx += (W / 2 - n.x) * 0.0008 + (ax - n.x) * 0.006 * pull
        n.vy += (H / 2 - n.y) * 0.0008 + (ay - n.y) * 0.006 * pull
        const dx = n.x - ptr.x, dy = n.y - ptr.y, d = Math.hypot(dx, dy)
        if (d < 40 && d > 0.1) { n.vx += (dx / d) * (40 - d) * 0.01; n.vy += (dy / d) * (40 - d) * 0.01 }
        n.vx *= 0.88; n.vy *= 0.88
        n.x = Math.min(W - 8, Math.max(8, n.x + n.vx)); n.y = Math.min(H - 8, Math.max(24, n.y + n.vy))
      }
    }

    const frame = (settled: boolean) => {
      const prog = settled ? 1 : Math.min(1, Math.max(0, (t - 1.5) / 5))
      step(prog)
      ctx.clearRect(0, 0, W, H)
      const lit = (n: Node) => settled || prog > n.rev * 0.8 + 0.05
      const alpha = (n: Node) => (hover >= 0 && lit(n) && ns[hover].c !== n.c ? 0.12 : 1)
      ctx.lineWidth = 1
      for (const [i, j] of edges) {
        const a = ns[i], b = ns[j]
        const same = a.c === b.c && lit(a) && lit(b)
        ctx.strokeStyle = same ? `rgba(${COLORS[a.c]},${0.5 * Math.min(alpha(a), alpha(b))})` : `rgba(${SEC},${hover >= 0 ? 0.06 : 0.2})`
        ctx.setLineDash(same ? [] : [2, 3])
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      }
      ctx.setLineDash([])
      for (const n of ns) {
        ctx.fillStyle = lit(n) ? `rgba(${COLORS[n.c]},${alpha(n)})` : `rgba(${SEC},${hover >= 0 ? 0.15 : 0.45})`
        ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, 7); ctx.fill()
      }
      ctx.font = "12px 'JetBrains Mono', monospace"
      ctx.textBaseline = "top"
      ctx.fillStyle = hover >= 0 ? `rgb(${CLAY})` : `rgba(${SEC},0.9)`
      ctx.fillText("ERBGA · COMMUNITY DETECTION", 0, 0)
    }

    const loop = () => {
      t += 0.016
      if (t > CYCLE) { t = 0; reshuffle() }
      frame(false)
      raf = requestAnimationFrame(loop)
    }

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      ptr.x = ((e.clientX - r.left) / r.width) * W
      ptr.y = ((e.clientY - r.top) / r.height) * H
      // only highlight once grouped; nearest node within 14px
      hover = -1
      if (t > 3 || reduce) ns.forEach((n, i) => { if (Math.hypot(n.x - ptr.x, n.y - ptr.y) < 14) hover = i })
    }
    const leave = () => { ptr.x = ptr.y = -999; hover = -1 }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    reshuffle()
    if (reduce) { for (let k = 0; k < 400; k++) step(1); frame(true) } else raf = requestAnimationFrame(loop)
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
      aria-label="Gene interaction network where grey nodes gradually group into four coloured communities, illustrating community detection on Alzheimer's disease gene networks"
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default CommunityNetwork
