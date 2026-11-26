import * as React from "react"

// End-to-end story of the thesis (ERBGA, community detection on Alzheimer's
// disease gene networks): DNA -> genes -> gene interaction network -> communities.
// One loop, four stages. Click a stage label to jump to it; hover a node once
// communities form to highlight its community.
const W = 400
const H = 360
const CYCLE = 17.5
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const COMM = [CLAY, BLUE, INK, SEC]
const STAGES = [
  { name: "01 DNA", at: 0 },
  { name: "02 GENES", at: 3 },
  { name: "03 NETWORK", at: 5.5 },
  { name: "04 COMMUNITIES", at: 9 },
]
const N = 16
const HELIX_Y = 62
const NAMES: Record<number, string> = { 0: "APOE", 5: "APP", 10: "PSEN1", 14: "TREM2" } // illustrative labels

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

// small seeded RNG so the layout is stable between loads
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

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

    const r = rng(11)
    const comm = Array.from({ length: N }, (_, i) => i % 4)
    const hx = Array.from({ length: N }, (_, i) => 28 + (i * 344) / (N - 1))
    const net = Array.from({ length: N }, () => ({ x: 70 + r() * 260, y: 165 + r() * 120 }))
    const anchors = [[100, 192], [300, 192], [100, 282], [300, 282]]
    const cp = comm.map((c, i) => {
      const a = (i / 4) * 6.28
      return { x: anchors[c][0] + Math.cos(a) * 30, y: anchors[c][1] + Math.sin(a) * 22 }
    })
    const edges: [number, number][] = []
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++) if (r() < (comm[i] === comm[j] ? 0.75 : 0.04)) edges.push([i, j])

    const ptr = { x: -999, y: -999 }
    let hover = -1
    let base = performance.now()
    let raf = 0
    let pos: { x: number; y: number }[] = []

    const helixY = (x: number, ph: number, s: number) => HELIX_Y + Math.sin(x * 0.07 + ph + s * Math.PI) * 17

    const frame = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      const ph = t * 1.3
      const reveal = ease(seg(t, 0, 1.8))
      const drop = ease(seg(t, 3, 5.5))
      const cm = ease(seg(t, 9, 12.5))
      const ret = ease(seg(t, 16, 17.5))
      const eA = seg(t, 5.5, 8) * (1 - ret)
      const geneA = seg(t, 2.2, 3) * (1 - ease(seg(t, 3, 5.5)) * 0.8)

      // caption
      ctx.font = "10px 'JetBrains Mono', monospace"
      ctx.textBaseline = "top"
      ctx.fillStyle = `rgba(${SEC},0.9)`
      ctx.fillText("ALZHEIMER'S DISEASE GENE NETWORK · ILLUSTRATIVE", 0, 0)

      // helix: two strands + rungs, drawn in from the left
      const maxX = 14 + reveal * (W - 28)
      for (let x = 14; x <= maxX; x += 11) {
        const y1 = helixY(x, ph, 0), y2 = helixY(x, ph, 1)
        ctx.strokeStyle = `rgba(${INK},${0.08 + 0.18 * Math.abs(Math.cos(x * 0.07 + ph))})`
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke()
      }
      for (const s of [0, 1]) {
        ctx.strokeStyle = `rgba(${s ? SEC : INK},${s ? 0.55 : 0.85})`
        ctx.lineWidth = 1.6
        ctx.beginPath()
        for (let x = 14; x <= maxX; x += 3) ctx[x === 14 ? "moveTo" : "lineTo"](x, helixY(x, ph, s))
        ctx.stroke()
      }
      // gene segments highlighted on strand 0
      if (geneA > 0) {
        for (let i = 0; i < N; i++) {
          ctx.strokeStyle = `rgba(${CLAY},${geneA})`
          ctx.lineWidth = 4
          ctx.beginPath()
          for (let x = hx[i] - 8; x <= hx[i] + 8; x += 2) ctx[x === hx[i] - 8 ? "moveTo" : "lineTo"](x, helixY(x, ph, 0))
          ctx.stroke()
        }
        if (t < 5.5) {
          ctx.fillStyle = `rgba(${CLAY},${geneA})`
          ctx.fillText("GENES", 14, HELIX_Y + 34)
        }
      }

      // node positions
      pos = Array.from({ length: N }, (_, i) => {
        const hy = helixY(hx[i], ph, 0)
        const wob = (drop - cm) * 3
        const nx = net[i].x + Math.sin(t * 1.1 + i) * wob
        const ny = net[i].y + Math.cos(t * 0.9 + i * 1.7) * wob
        let x = lerp(hx[i], nx, drop), y = lerp(hy, ny, drop)
        x = lerp(x, cp[i].x, cm); y = lerp(y, cp[i].y, cm)
        x = lerp(x, hx[i], ret); y = lerp(y, hy, ret)
        return { x, y }
      })

      // community hover target
      hover = -1
      if (cm > 0.6 && ret === 0)
        for (let i = 0; i < N; i++) if (Math.hypot(pos[i].x - ptr.x, pos[i].y - ptr.y) < 14) hover = i
      const hc = hover >= 0 ? comm[hover] : -1

      // community halos
      if (cm > 0.3 && ret === 0)
        for (let c = 0; c < 4; c++) {
          ctx.strokeStyle = `rgba(${COMM[c]},${0.7 * cm * (hc === -1 || hc === c ? 1 : 0.25)})`
          ctx.setLineDash([3, 4])
          ctx.beginPath(); ctx.ellipse(anchors[c][0], anchors[c][1], 62, 48, 0, 0, 7); ctx.stroke()
          ctx.setLineDash([])
        }

      // edges
      if (eA > 0)
        for (const [i, j] of edges) {
          const same = comm[i] === comm[j]
          const dim = hc !== -1 && !(same && comm[i] === hc)
          const col = same && cm > 0.5 ? COMM[comm[i]] : SEC
          ctx.strokeStyle = `rgba(${col},${(same ? 0.55 : 0.14) * eA * (dim ? 0.25 : 1)})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[j].x, pos[j].y); ctx.stroke()
        }

      // nodes
      for (let i = 0; i < N; i++) {
        const p = pos[i]
        const onHelix = 1 - drop
        const col = cm > 0.02 ? COMM[comm[i]] : onHelix > 0.5 && geneA > 0 ? CLAY : SEC
        const dim = hc !== -1 && comm[i] !== hc
        ctx.fillStyle = `rgba(${col},${(dim ? 0.25 : 0.95) * (t < 2.2 ? 0 : 1)})`
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, 7); ctx.fill()
        if (NAMES[i] && drop > 0.9 && ret === 0) {
          ctx.fillStyle = `rgba(${SEC},${dim ? 0.3 : 0.95})`
          ctx.font = "9px 'JetBrains Mono', monospace"
          ctx.fillText(NAMES[i], p.x + 7, p.y - 4)
          ctx.font = "10px 'JetBrains Mono', monospace"
        }
      }

      // stage bar
      ctx.font = "10px 'JetBrains Mono', monospace"
      const cur = STAGES.reduce((a, s, k) => (t >= s.at ? k : a), 0)
      STAGES.forEach((s, k) => {
        const x = (k * W) / 4
        ctx.fillStyle = k === cur ? `rgb(${BLUE})` : `rgba(${SEC},0.8)`
        ctx.fillRect(x, H - 24, W / 4 - 8, k === cur ? 2 : 1)
        ctx.fillText(s.name, x, H - 16)
      })
    }

    const loop = (now: number) => {
      frame((((now - base) / 1000) % CYCLE + CYCLE) % CYCLE)
      raf = requestAnimationFrame(loop)
    }

    const toLocal = (e: PointerEvent | MouseEvent) => {
      const b = cv.getBoundingClientRect()
      return { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H }
    }
    const move = (e: PointerEvent) => {
      const p = toLocal(e)
      ptr.x = p.x; ptr.y = p.y
      cv.style.cursor = p.y > H - 30 ? "pointer" : hover >= 0 ? "pointer" : "crosshair"
    }
    const leave = () => { ptr.x = ptr.y = -999 }
    const click = (e: MouseEvent) => {
      const p = toLocal(e)
      if (p.y <= H - 30) return
      const k = Math.min(3, Math.floor((p.x / W) * 4))
      base = performance.now() - STAGES[k].at * 1000
      if (reduce) frame(Math.min(CYCLE - 0.1, STAGES[k].at + 3))
    }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    cv.addEventListener("click", click)
    if (reduce) frame(13)
    else raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      cv.removeEventListener("pointermove", move)
      cv.removeEventListener("pointerleave", leave)
      cv.removeEventListener("click", click)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Animation of the thesis pipeline: DNA, genes along it, a gene interaction network, and the communities found in that network by the ERBGA algorithm. Gene names are illustrative."
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default CommunityNetwork
