import * as React from "react"

// End-to-end story of the thesis (ERBGA, community detection on Alzheimer's
// disease gene networks): DNA -> genes -> gene interaction network -> communities.
// Motion is physical, not keyframed: every node is a damped spring chasing a
// moving target, with staggered starts, curved arcs and overshoot; edges draw
// themselves in; colours blend; a faint trail gives motion blur. Click a stage
// label to jump; hover a node once communities form to isolate its community.
const W = 400
const H = 360
const CYCLE = 17.5
const INK: RGB = [20, 20, 19]
const SEC: RGB = [94, 93, 89]
const CLAY: RGB = [194, 82, 45]
const BLUE: RGB = [47, 93, 140]
const COMM = [CLAY, BLUE, INK, SEC]
const STAGES = [
  { name: "01 DNA", at: 0 },
  { name: "02 GENES", at: 3 },
  { name: "03 NETWORK", at: 5.5 },
  { name: "04 COMMUNITIES", at: 9 },
]
const N = 28
const HELIX_Y = 62
const NAMES: Record<number, string> = { 0: "APOE", 9: "APP", 18: "PSEN1", 27: "TREM2" } // illustrative labels

type RGB = [number, number, number]
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const mix = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

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
    const anchors = [[105, 188], [295, 188], [105, 272], [295, 272]]
    const cp = comm.map((c, i) => {
      const k = Math.floor(i / 4), a = (k / 7) * 6.28 + c
      const rr = k % 2 ? 30 : 17
      return { x: anchors[c][0] + Math.cos(a) * rr * 1.25, y: anchors[c][1] + Math.sin(a) * rr * 0.9 }
    })
    const edges: [number, number][] = []
    for (let i = 0; i < N; i++)
      for (let j = i + 1; j < N; j++) if (r() < (comm[i] === comm[j] ? 0.5 : 0.015)) edges.push([i, j])

    const helixY = (x: number, ph: number, s: number, amp: number) => HELIX_Y + Math.sin(x * 0.07 + ph + s * Math.PI) * amp

    // node physics state, staggered so the group flows instead of moving in lockstep
    const nodes = Array.from({ length: N }, (_, i) => ({ x: hx[i], y: HELIX_Y, vx: 0, vy: 0, lastPhase: 0, switchT: 0, dim: 1 }))
    const commDim = [1, 1, 1, 1]
    const ptr = { x: -999, y: -999 }
    let hoverC = -1
    let base = performance.now()
    let lastNow = base
    let raf = 0

    const phaseOf = (ti: number) => (ti < 3 ? 0 : ti < 9 ? 1 : ti < 16 ? 2 : 3)

    const step = (t: number, dt: number) => {
      const ph = t * 1.3
      const amp = 17 + Math.sin(t * 0.8) * 2.5 // helix breathes
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        const ti = t - i * 0.07
        const phase = phaseOf(ti)
        if (phase !== n.lastPhase) { n.lastPhase = phase; n.switchT = t }
        let tx: number, ty: number
        if (phase === 0 || phase === 3) { tx = hx[i]; ty = helixY(hx[i], ph, 0, amp) }
        else if (phase === 1) {
          const wob = Math.max(0, 1 - seg(t, 8, 9))
          tx = net[i].x + Math.sin(t * 1.1 + i) * 3 * wob; ty = net[i].y + Math.cos(t * 0.9 + i * 1.7) * 3 * wob
        } else { tx = cp[i].x; ty = cp[i].y }
        const ex = tx - n.x, ey = ty - n.y
        // underdamped spring (overshoot) + a curl term right after a phase switch so paths arc
        const k = phase === 0 || phase === 3 ? 90 : 38, c = phase === 0 || phase === 3 ? 15 : 7.5
        const env = Math.exp(-(t - n.switchT) * 1.7) * (phase === 0 ? 0 : 1)
        const curl = 2.2 * env * (i % 2 ? 1 : -1)
        const ax = k * ex - c * n.vx - curl * ey
        const ay = k * ey - c * n.vy + curl * ex
        // pointer nudges nodes slightly
        const dx = n.x - ptr.x, dy = n.y - ptr.y, d = Math.hypot(dx, dy)
        const push = d < 46 && d > 0.1 ? ((46 - d) / 46) * 260 : 0
        n.vx += (ax + (dx / (d || 1)) * push) * dt
        n.vy += (ay + (dy / (d || 1)) * push) * dt
        n.x += n.vx * dt
        n.y += n.vy * dt
      }
    }

    const draw = (t: number, trail: boolean) => {
      if (trail) { ctx.fillStyle = "rgba(250,249,246,0.34)"; ctx.fillRect(0, 0, W, H) } else { ctx.clearRect(0, 0, W, H) }
      const ph = t * 1.3
      const amp = 17 + Math.sin(t * 0.8) * 2.5
      const reveal = easeInOut(seg(t, 0, 1.8))
      const ret = easeInOut(seg(t, 16, 17.5))
      const fadeAll = 1 - seg(t, 16.9, 17.5)

      ctx.font = "10px 'JetBrains Mono', monospace"
      ctx.textBaseline = "top"
      ctx.fillStyle = rgba(SEC, 0.9)
      ctx.fillText("ALZHEIMER'S DISEASE GENE NETWORK · ILLUSTRATIVE", 0, 0)

      // helix: rungs then strands, drawn in left to right with a soft leading edge
      const maxX = 14 + reveal * (W - 28)
      for (let x = 14; x <= maxX; x += 11) {
        const edge = clamp((maxX - x) / 40)
        ctx.strokeStyle = rgba(INK, (0.07 + 0.17 * Math.abs(Math.cos(x * 0.07 + ph))) * edge)
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, helixY(x, ph, 0, amp)); ctx.lineTo(x, helixY(x, ph, 1, amp)); ctx.stroke()
      }
      for (const s of [0, 1]) {
        ctx.strokeStyle = rgba(s ? SEC : INK, s ? 0.55 : 0.85)
        ctx.lineWidth = 1.6
        ctx.beginPath()
        for (let x = 14; x <= maxX; x += 3) ctx[x === 14 ? "moveTo" : "lineTo"](x, helixY(x, ph, s, amp))
        ctx.stroke()
      }
      // genes light up as a wave sweeping along the strand, then release their node
      for (let i = 0; i < N; i++) {
        const on = easeInOut(seg(t, 2.2 + i * 0.07, 2.7 + i * 0.07))
        const off = easeInOut(seg(t, 3.1 + i * 0.07, 4 + i * 0.07)) * (1 - ret)
        const a = on * (1 - off * 0.85)
        if (a <= 0.01) continue
        ctx.strokeStyle = rgba(CLAY, a)
        ctx.lineWidth = 3 + on * 2
        ctx.lineCap = "round"
        ctx.beginPath()
        for (let x = hx[i] - 8; x <= hx[i] + 8; x += 2) ctx[x === hx[i] - 8 ? "moveTo" : "lineTo"](x, helixY(x, ph, 0, amp))
        ctx.stroke()
        ctx.lineCap = "butt"
      }
      if (t > 2.4 && t < 5) {
        ctx.fillStyle = rgba(CLAY, Math.min(seg(t, 2.4, 3), 1 - seg(t, 4.2, 5)))
        ctx.fillText("GENES", 14, HELIX_Y + 34)
      }

      // hover target: community of nearest node once communities have formed
      let hc = -1
      if (t > 10.5 && t < 15.8)
        for (let i = 0; i < N; i++) if (Math.hypot(nodes[i].x - ptr.x, nodes[i].y - ptr.y) < 14) hc = comm[i]
      for (let c = 0; c < 4; c++) commDim[c] = lerp(commDim[c], hc === -1 || hc === c ? 1 : 0.2, 0.15)

      // halos pop in with overshoot, fade out before the loop returns
      const hs = easeOutBack(seg(t, 10.4, 11.8)) * (1 - seg(t, 15.4, 16.2))
      if (hs > 0.02)
        for (let c = 0; c < 4; c++) {
          const hr = clamp(hs), d = commDim[c]
          ctx.fillStyle = rgba(COMM[c], 0.07 * hr * d)
          ctx.strokeStyle = rgba(COMM[c], 0.45 * hr * d)
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.ellipse(anchors[c][0], anchors[c][1], 52 * hs, 38 * hs, 0, 0, 7); ctx.fill(); ctx.stroke()
          ctx.fillStyle = rgba(COMM[c], 0.9 * hr * d)
          ctx.fillText("C" + (c + 1), anchors[c][0] - 52, anchors[c][1] - 52)
        }

      // edges grow from one end to the other, staggered
      for (let e = 0; e < edges.length; e++) {
        const [i, j] = edges[e]
        const f = easeInOut(seg(t, 5.5 + e * 0.035, 6.5 + e * 0.035)) * (1 - seg(t, 15.4, 16.4))
        if (f <= 0.01) continue
        const same = comm[i] === comm[j]
        const colK = same ? easeInOut(seg(t, 9.6, 10.8)) : 0
        const col = mix(SEC, COMM[comm[i]], colK)
        const dim = same ? commDim[comm[i]] : Math.min(...commDim)
        const a = nodes[i], b = nodes[j]
        ctx.strokeStyle = rgba(col, (same ? 0.55 : 0.14) * f * dim)
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(lerp(a.x, b.x, f), lerp(a.y, b.y, f)); ctx.stroke()
      }

      // nodes: colour blends grey -> community colour, staggered
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        const born = easeInOut(seg(t, 2.4 + i * 0.07, 2.9 + i * 0.07))
        if (born <= 0) continue
        const ti = t - i * 0.07
        const onHelix = 1 - easeInOut(seg(ti, 3, 4))
        const base = mix(SEC, CLAY, onHelix)
        const col = mix(base, COMM[comm[i]], easeInOut(seg(ti, 9.2, 10.2)))
        const pulse = 1 + 0.25 * Math.max(0, Math.sin(t * 3 - i)) * seg(t, 10.5, 11) * (1 - seg(t, 14, 15))
        ctx.fillStyle = rgba(col, 0.95 * born * fadeAll * (t > 10.5 && t < 15.8 ? commDim[comm[i]] : 1))
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.6 * pulse * (0.4 + 0.6 * born), 0, 7); ctx.fill()
        if (NAMES[i] && t > 5.2 && t < 15.5) {
          ctx.fillStyle = rgba(SEC, 0.95 * seg(t, 5.2, 6) * (1 - seg(t, 14.8, 15.5)) * commDim[comm[i]])
          ctx.font = "9px 'JetBrains Mono', monospace"
          ctx.fillText(NAMES[i], n.x + 7, n.y - 4)
          ctx.font = "10px 'JetBrains Mono', monospace"
        }
      }

      // stage bar with a progress fill that glides along the current stage
      const cur = STAGES.reduce((a, s, k) => (t >= s.at ? k : a), 0)
      STAGES.forEach((s, k) => {
        const x = (k * W) / 4, w = W / 4 - 8
        const next = k < 3 ? STAGES[k + 1].at : CYCLE
        ctx.fillStyle = rgba(SEC, 0.35)
        ctx.fillRect(x, H - 24, w, 1)
        if (k <= cur) {
          ctx.fillStyle = rgba(BLUE, 1)
          ctx.fillRect(x, H - 25, w * (k < cur ? 1 : seg(t, s.at, next)), 2)
        }
        ctx.fillStyle = k === cur ? rgba(BLUE, 1) : rgba(SEC, 0.8)
        ctx.fillText(s.name, x, H - 16)
      })
    }

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - lastNow) / 1000)
      lastNow = now
      const t = (((now - base) / 1000) % CYCLE + CYCLE) % CYCLE
      step(t, dt / 2); step(t, dt / 2) // two substeps keeps the springs stable
      draw(t, true)
      raf = requestAnimationFrame(loop)
    }

    const toLocal = (e: PointerEvent | MouseEvent) => {
      const b = cv.getBoundingClientRect()
      return { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H }
    }
    const move = (e: PointerEvent) => {
      const p = toLocal(e)
      ptr.x = p.x; ptr.y = p.y
      cv.style.cursor = p.y > H - 30 ? "pointer" : "crosshair"
    }
    const leave = () => { ptr.x = ptr.y = -999 }
    const click = (e: MouseEvent) => {
      const p = toLocal(e)
      if (p.y <= H - 30) return
      const k = Math.min(3, Math.floor((p.x / W) * 4))
      base = performance.now() - STAGES[k].at * 1000
    }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    cv.addEventListener("click", click)

    if (reduce) {
      let t = 0
      while (t < 13) { step(t, 1 / 60); t += 1 / 60 }
      draw(13, false)
    } else {
      raf = requestAnimationFrame(loop)
    }
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
