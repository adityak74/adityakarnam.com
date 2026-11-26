import * as React from "react"

// The master's thesis (ERBGA, UMSL 2018) as eight slide-like scenes. Facts come from the
// thesis text: SNP network of 962 nodes / 6,672 edges from 4,972 individuals; one bit per
// edge (1 = edge cut); Psize 250, Prate 0.85, tournament of 7, Erate 0.2, Mrate 0.1,
// uniform crossover, Gene Repair, 5-25 islands, 1,000-5,000 generations.
// The graph drawn here is an 18-node sketch, not the real network.
const W = 880
const H = 320
const D = 7.5 // seconds per scene
type RGB = [number, number, number]
const INK: RGB = [20, 20, 19]
const SEC: RGB = [94, 93, 89]
const CLAY: RGB = [194, 82, 45]
const BLUE: RGB = [47, 93, 140]
const COMM = [CLAY, BLUE, INK]
const MONO = "10px 'JetBrains Mono', monospace"

const SCENES = [
  { title: "Start from DNA", text: "A SNP is a single DNA letter that differs between people. From 4,972 individuals, correlated SNPs were turned into a network of 962 nodes and 6,672 edges." },
  { title: "Encode a clustering as bits", text: "A chromosome has one bit per edge. A 1 cuts that edge, and the pieces that stay connected are the communities. No community count is chosen in advance." },
  { title: "Begin with a random population", text: "Each island starts with 250 random chromosomes. A bit is a cut with probability 0.85, so the first guesses are mostly shattered graphs." },
  { title: "Select the fittest", text: "Seven chromosomes are drawn into a tournament and the best two become parents. The top 20% also carry over unchanged (elitism)." },
  { title: "Cross over, then mutate", text: "Uniform crossover swaps bits at arbitrary points, because nodes in a network have no natural order. Mutation then flips about 10% of the bits." },
  { title: "Gene repair", text: "Random cuts can strand a high-degree node away from its neighbours. Gene repair puts removed edges back around hubs. It is a new operator introduced in this thesis." },
  { title: "Run many islands", text: "Between 5 and 25 populations evolve independently, for 1,000 to 5,000 generations, each climbing the fitness landscape on its own. Every chromosome is decoded back into a graph and scored, so the cost adds up fast." },
  { title: "Read off the communities", text: "The result is a partition of the Alzheimer's SNP network into communities, found without assuming how many there are or what shape they take." },
]

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const mix = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k) | 0, lerp(a[1], b[1], k) | 0, lerp(a[2], b[2], k) | 0]
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

// ---- fixed sketch graph ----
const N = 18
const R = rng(7)
const comm = Array.from({ length: N }, (_, i) => i % 3)
const hair = Array.from({ length: N }, () => ({ x: R(), y: R() }))
const CEN = [[0.2, 0.3], [0.78, 0.3], [0.49, 0.78]]
const off = Array.from({ length: N }, () => ({ x: (R() - 0.5) * 0.26, y: (R() - 0.5) * 0.3 }))
const edges: [number, number][] = []
for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (R() < (comm[i] === comm[j] ? 0.55 : 0.05)) edges.push([i, j])
const E = edges.length
const inter = edges.map(([a, b]) => comm[a] !== comm[b])
const deg = Array(N).fill(0)
edges.forEach(([a, b]) => { deg[a]++; deg[b]++ })
const hub = deg.indexOf(Math.max(...deg))
type Box = { x: number; y: number; w: number; h: number }
const gpos = (i: number, b: Box, spread: number) => {
  const ux = lerp(hair[i].x * 0.9 + 0.05, CEN[comm[i]][0] + off[i].x, spread)
  const uy = lerp(hair[i].y * 0.9 + 0.05, CEN[comm[i]][1] + off[i].y, spread)
  return { x: b.x + ux * b.w, y: b.y + uy * b.h }
}

// full-scale stand-in for the real network: 962 nodes, 6,672 edges (layout is synthetic)
const BN = 962, BE = 6672
const BR = rng(99)
const BC = Array.from({ length: 7 }, () => [0.12 + BR() * 0.76, 0.12 + BR() * 0.76])
const bcl = Array.from({ length: BN }, () => Math.floor(BR() * 7))
const bpos = bcl.map((c) => ({ x: BC[c][0] + (BR() + BR() + BR() - 1.5) * 0.11, y: BC[c][1] + (BR() + BR() + BR() - 1.5) * 0.15 }))
const byCl: number[][] = Array.from({ length: 7 }, () => [])
bcl.forEach((c, i) => byCl[c].push(i))
const bedges: [number, number][] = Array.from({ length: BE }, () => {
  const a = Math.floor(BR() * BN)
  const pool = BR() < 0.88 ? byCl[bcl[a]] : null
  const b = pool ? pool[Math.floor(BR() * pool.length)] : Math.floor(BR() * BN)
  return [a, b] as [number, number]
})
const num = (v: number, k: number) => Math.round(v * k).toLocaleString("en-US")

const bitsOf = (seed: number, n: number, p: number) => { const r = rng(seed); return Array.from({ length: n }, () => (r() < p ? 1 : 0)) }

const ThesisScenes = () => {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [scene, setScene] = React.useState(0)
  const [playing, setPlaying] = React.useState(true)
  const st = React.useRef({ scene: 0, t: 0, playing: true })

  const goTo = React.useCallback((i: number) => {
    const n = (i + SCENES.length) % SCENES.length
    st.current.scene = n
    st.current.t = 0
    setScene(n)
  }, [])
  const toggle = () => { st.current.playing = !st.current.playing; setPlaying(st.current.playing) }

  React.useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext("2d")
    if (!cv || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) { st.current.playing = false; setPlaying(false) }

    const label = (s: string, x: number, y: number, c: RGB = SEC, a = 0.9, align: CanvasTextAlign = "left") => {
      ctx.font = MONO; ctx.textBaseline = "top"; ctx.textAlign = align
      ctx.fillStyle = rgba(c, a); ctx.fillText(s, x, y); ctx.textAlign = "left"
    }
    const drawGraph = (b: Box, spread: number, o: { edgeA?: (e: number) => number; col?: (i: number) => RGB; dashed?: (e: number) => number; nodeA?: (i: number) => number; r?: number }) => {
      const P = Array.from({ length: N }, (_, i) => gpos(i, b, spread))
      edges.forEach(([a, c], e) => {
        const ea = o.edgeA ? o.edgeA(e) : 1
        if (ea <= 0.01) return
        const cut = o.dashed ? o.dashed(e) : 0
        ctx.strokeStyle = rgba(cut > 0.5 ? CLAY : SEC, (cut > 0.5 ? 0.5 : 0.42) * ea)
        ctx.lineWidth = 1
        ctx.setLineDash(cut > 0.5 ? [2, 3] : [])
        ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[c].x, P[c].y); ctx.stroke()
        ctx.setLineDash([])
      })
      for (let i = 0; i < N; i++) {
        const na = o.nodeA ? o.nodeA(i) : 1
        if (na <= 0.01) continue
        ctx.fillStyle = rgba(o.col ? o.col(i) : SEC, 0.95 * na)
        ctx.beginPath(); ctx.arc(P[i].x, P[i].y, (o.r || 4.5) * (0.4 + 0.6 * na), 0, 7); ctx.fill()
      }
      return P
    }
    const cell = (x: number, y: number, s: number, bit: number, col: RGB, a = 1) => {
      if (bit) { ctx.fillStyle = rgba(col, a); ctx.fillRect(x, y, s, s) }
      else { ctx.strokeStyle = rgba(col, 0.45 * a); ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1) }
    }

    const scenes: ((t: number) => void)[] = [
      // 0 DNA -> SNPs -> network
      (t) => {
        const big = ease(seg(t, 4.9, 6.2))
        ctx.globalAlpha = 1 - big
        const reveal = ease(seg(t, 0, 1.6))
        const mx = 20 + reveal * 400
        for (const s of [0, 1]) {
          ctx.strokeStyle = rgba(s ? SEC : INK, s ? 0.5 : 0.85); ctx.lineWidth = 1.6; ctx.beginPath()
          for (let x = 20; x <= mx; x += 3) ctx[x === 20 ? "moveTo" : "lineTo"](x, 70 + Math.sin(x * 0.06 + t * 1.2 + s * Math.PI) * 16)
          ctx.stroke()
        }
        for (let x = 20; x <= mx; x += 12) {
          ctx.strokeStyle = rgba(INK, 0.12); ctx.beginPath()
          ctx.moveTo(x, 70 + Math.sin(x * 0.06 + t * 1.2) * 16); ctx.lineTo(x, 70 - Math.sin(x * 0.06 + t * 1.2) * 16); ctx.stroke()
        }
        const box: Box = { x: 470, y: 30, w: 380, h: 250 }
        for (let i = 0; i < N; i++) {
          const sx = 40 + (i / (N - 1)) * 360, sy = 70 + Math.sin(sx * 0.06 + t * 1.2) * 16
          const k = ease(seg(t, 1.8 + i * 0.07, 3.6 + i * 0.07))
          const bp = gpos(i, box, 0)
          const x = lerp(sx, bp.x, k), y = lerp(sy, bp.y - 0 * k, k) + Math.sin(k * Math.PI) * -50
          nodesTmp[i] = { x, y }
          if (seg(t, 1.2 + i * 0.03, 1.8 + i * 0.03) > 0) {
            ctx.fillStyle = rgba(CLAY, 0.95); ctx.beginPath(); ctx.arc(x, y, 4 * (0.6 + 0.4 * (1 - k)) + 1, 0, 7); ctx.fill()
          }
        }
        edges.forEach(([a, b], e) => {
          const f = ease(seg(t, 4 + e * 0.03, 4.8 + e * 0.03))
          if (f <= 0.01) return
          ctx.strokeStyle = rgba(SEC, 0.4 * f); ctx.lineWidth = 1; ctx.beginPath()
          ctx.moveTo(nodesTmp[a].x, nodesTmp[a].y); ctx.lineTo(lerp(nodesTmp[a].x, nodesTmp[b].x, f), lerp(nodesTmp[a].y, nodesTmp[b].y, f)); ctx.stroke()
        })
        label("DNA", 20, 110, SEC, seg(t, 0.5, 1))
        label("EACH SNP BECOMES A NODE", 470, 8, CLAY, seg(t, 2, 3))
        label("ILLUSTRATIVE 18-NODE SKETCH", 20, 8, SEC, 0.8)
        ctx.globalAlpha = 1
        if (big > 0) {
          const bx = 150, by = 14, bw = 580, bh = 232
          ctx.strokeStyle = rgba(SEC, 0.07 * big); ctx.lineWidth = 0.6; ctx.beginPath()
          const ne = Math.floor(BE * ease(seg(t, 5.2, 7)))
          for (let e = 0; e < ne; e++) { const [a, b] = bedges[e]; ctx.moveTo(bx + bpos[a].x * bw, by + bpos[a].y * bh); ctx.lineTo(bx + bpos[b].x * bw, by + bpos[b].y * bh) }
          ctx.stroke()
          for (let i = 0; i < BN; i++) { ctx.fillStyle = rgba(i % 9 === 0 ? CLAY : INK, 0.8 * big); ctx.fillRect(bx + bpos[i].x * bw - 1, by + bpos[i].y * bh - 1, 2.2, 2.2) }
          const k = ease(seg(t, 5.3, 6.8))
          ctx.textBaseline = "alphabetic"; ctx.font = "500 28px Fraunces, Georgia, serif"
          ;[["4,972", 4972, "people", 70], ["962", 962, "SNPs (nodes)", 340], ["6,672", BE, "edges", 610]].forEach(([_, v, l, x]: any) => {
            ctx.fillStyle = rgba(BLUE, big); ctx.fillText(num(v as number, k), x, 290)
            label((l as string).toUpperCase(), x, 298, SEC, big)
          })
        }
      },
      // 1 chromosome encoding
      (t) => {
        const box: Box = { x: 30, y: 20, w: 400, h: 280 }
        const cutIdx = edges.map((_, e) => e).filter((e) => inter[e])
        const cutT = (e: number) => 1.2 + cutIdx.indexOf(e) * 0.32
        const spread = ease(seg(t, 4.2, 6.2))
        drawGraph(box, spread, {
          dashed: (e) => (inter[e] && t > cutT(e) ? 1 : 0),
          edgeA: (e) => (inter[e] && t > cutT(e) + 0.4 ? 1 - seg(t, cutT(e) + 0.4, cutT(e) + 1) : 1),
          col: (i) => mix(SEC, COMM[comm[i]], ease(seg(t, 3.6, 4.6))),
        })
        const cols = 9, s = 15, g = 5, ox = 520, oy = 62
        label("CHROMOSOME: ONE BIT PER EDGE", ox, 20, INK, 0.9)
        edges.forEach((_, e) => {
          const x = ox + (e % cols) * (s + g), y = oy + Math.floor(e / cols) * (s + g)
          const on = inter[e] && t > cutT(e)
          const pop = on ? 1 + 0.5 * Math.max(0, 1 - (t - cutT(e)) * 3) : 1
          cell(x - (pop - 1) * s / 2, y - (pop - 1) * s / 2, s * pop, on ? 1 : 0, on ? CLAY : INK, seg(t, 0.2 + e * 0.01, 0.8 + e * 0.01))
        })
        const ly = oy + Math.ceil(E / cols) * (s + g) + 14
        cell(ox, ly, 10, 0, INK); label("0  KEEP EDGE", ox + 18, ly - 1)
        cell(ox, ly + 20, 10, 1, CLAY); label("1  CUT EDGE", ox + 18, ly + 19)
        label("CONNECTED PIECES = COMMUNITIES", ox, ly + 52, BLUE, seg(t, 4.6, 5.4))
        const sa = seg(t, 5.2, 6), sr = rng(5)
        if (sa > 0) {
          for (let c = 0; c < 44; c++) {
            const bit = sr() < 0.85 ? 1 : 0
            const x = ((ox + c * 9 - t * 60) % 396 + 396) % 396 + ox - 10
            cell(x, 282, 6, bit, bit ? INK : SEC, sa * 0.8)
          }
          label("… 6,672 BITS IN THE REAL CHROMOSOME", ox, 296, BLUE, sa)
        }
      },
      // 2 random population
      (t) => {
        const rows = 14, cols = 44, s = 12, g = 5, ox = 50, oy = 34
        label("POPULATION · EACH ROW IS ONE RANDOM CLUSTERING", ox, 8, INK, 0.9)
        for (let r = 0; r < rows; r++) {
          const b = bitsOf(100 + r, cols, 0.85)
          for (let c = 0; c < cols; c++) {
            const a = seg(t, 0.3 + r * 0.22 + c * 0.012, 0.7 + r * 0.22 + c * 0.012)
            if (a > 0) cell(ox + c * (s + g), oy + r * (s + g), s, b[c], b[c] ? INK : SEC, a * (1 - 0.92 * ease(seg(t, 3.6, 4.6))))
          }
        }
        label("Psize = 250", ox, 302, BLUE, seg(t, 3, 4)); label("P(cut) = 0.85", ox + 140, 302, CLAY, seg(t, 3.6, 4.6))
        const wall = ease(seg(t, 3.6, 5))
        if (wall > 0) {
          ctx.globalAlpha = wall * 0.55
          ctx.drawImage(wallCv, 0, 0, wallCv.width, wallCv.height, 0, 0, W, 270 * (0.4 + 0.6 * wall))
          ctx.globalAlpha = 1
          ctx.fillStyle = rgba([250, 249, 246], 0.92 * seg(t, 5.2, 6)); ctx.fillRect(110, 92, 660, 96)
          const ex = Math.round(2008 * ease(seg(t, 5.4, 7)))
          ctx.textBaseline = "alphabetic"; ctx.textAlign = "center"
          ctx.fillStyle = rgba(INK, seg(t, 5.2, 6)); ctx.font = "500 40px Fraunces, Georgia, serif"
          ctx.fillText("10^" + ex.toLocaleString("en-US") + " possible clusterings", W / 2, 148)
          ctx.textAlign = "left"
          label("THIS WALL IS 250 OF THEM · SEARCH SPACE = 2^6,672", W / 2, 164, BLUE, seg(t, 6, 6.8), "center")
        }
      },
      // 3 tournament selection
      (t) => {
        const rows = 10, cols = 28, s = 11, g = 4, ox = 40, oy = 30
        const fit = Array.from({ length: rows }, (_, i) => 0.25 + ((i * 37) % 10) / 14)
        const pool = [1, 2, 4, 5, 7, 8, 9]
        const sorted = pool.slice().sort((a, b) => fit[b] - fit[a])
        label("TOURNAMENT: 7 RANDOM CHROMOSOMES, THE BEST 2 BREED", ox, 6, INK, 0.9)
        for (let r = 0; r < rows; r++) {
          const inPool = pool.includes(r)
          const hi = inPool ? ease(seg(t, 1.5 + pool.indexOf(r) * 0.1, 2.2 + pool.indexOf(r) * 0.1)) : 0
          const win = sorted.slice(0, 2).includes(r) ? ease(seg(t, 4.6, 5.8)) : 0
          const y = oy + r * (s + g + 6)
          const shift = win * 0
          const b = bitsOf(300 + r, cols, 0.6)
          for (let c = 0; c < cols; c++) cell(ox + c * (s + g) + shift, y, s, b[c], mix(INK, BLUE, hi), (0.4 + 0.6 * hi) * (inPool || t < 1.5 ? 1 : 1 - 0.55 * ease(seg(t, 1.5, 2.2))))
          const bw = 170 * fit[r] * (inPool ? ease(seg(t, 2.8 + pool.indexOf(r) * 0.12, 3.6 + pool.indexOf(r) * 0.12)) : 0)
          ctx.fillStyle = rgba(win ? CLAY : BLUE, 0.85); ctx.fillRect(ox + cols * (s + g) + 20, y + 2, bw, 8)
          if (win) { ctx.strokeStyle = rgba(CLAY, win); ctx.lineWidth = 1.5; ctx.strokeRect(ox - 6, y - 4, cols * (s + g) + 12, s + 8) }
        }
        label("FITNESS", ox + cols * (s + g) + 20, 6 + 0, SEC, seg(t, 2.8, 3.4))
        label("PARENTS", ox + cols * (s + g) + 20, 276, CLAY, seg(t, 5, 5.8))
        label("ELITISM: TOP 20% COPIED UNCHANGED", ox, 302, SEC, seg(t, 6, 6.8))
      },
      // 4 crossover + mutation
      (t) => {
        const n = 40, s = 14, g = 6, ox = 40
        const A = bitsOf(21, n, 0.5), B = bitsOf(22, n, 0.5), M = bitsOf(23, n, 0.5)
        const flips = [4, 13, 22, 31]
        label("PARENT A", ox, 22, BLUE); label("PARENT B", ox, 90, CLAY); label("CHILD", ox, 190, INK)
        for (let i = 0; i < n; i++) {
          const x = ox + i * (s + g)
          cell(x, 40, s, A[i], BLUE, 0.9); cell(x, 108, s, B[i], CLAY, 0.9)
          const k = ease(seg(t, 1 + i * 0.05, 1.6 + i * 0.05))
          if (k > 0) {
            const fromA = M[i] === 1
            const fy = fromA ? 54 : 122
            const y = lerp(fy, 208, k)
            let bit = fromA ? A[i] : B[i]
            const fl = flips.includes(i) ? seg(t, 4.6 + flips.indexOf(i) * 0.3, 4.8 + flips.indexOf(i) * 0.3) : 0
            if (fl > 0.5) bit = 1 - bit
            cell(x, y, s, bit, fl > 0.5 ? INK : fromA ? BLUE : CLAY, k)
            if (flips.includes(i) && fl > 0) {
              const rr = 8 + (1 - Math.abs(fl - 0.5) * 2) * 8
              ctx.strokeStyle = rgba(INK, 0.5 * (1 - seg(t, 4.8 + flips.indexOf(i) * 0.3, 5.6 + flips.indexOf(i) * 0.3))); ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, rr, 0, 7); ctx.stroke()
            }
          }
        }
        label("UNIFORM CROSSOVER: EACH BIT COMES FROM EITHER PARENT, AT ARBITRARY POINTS", ox, 252, SEC, seg(t, 2, 3))
        label("MUTATION: A FEW BITS FLIP (~10%)", ox, 272, INK, seg(t, 4.4, 5))
      },
      // 5 gene repair
      (t) => {
        const box: Box = { x: 200, y: 24, w: 480, h: 270 }
        const mine = edges.map((e, i) => i).filter((i) => edges[i][0] === hub || edges[i][1] === hub)
        const rep = (e: number) => ease(seg(t, 3 + mine.indexOf(e) * 0.25, 3.6 + mine.indexOf(e) * 0.25))
        const hubCut = (e: number) => (mine.includes(e) && mine.indexOf(e) % 3 !== 0 ? 1 : 0)
        const P = drawGraph(box, 0.85, {
          dashed: (e) => (hubCut(e) && rep(e) < 0.5 ? 1 : 0),
          edgeA: (e) => (hubCut(e) && rep(e) < 0.5 ? 0.9 : 1),
          col: (i) => (i === hub ? mix(SEC, CLAY, seg(t, 3, 5)) : mix(SEC, COMM[comm[i]], 0.6)),
          r: 4.5,
        })!
        edges.forEach(([a, b], e) => {
          if (hubCut(e) && rep(e) >= 0.5) {
            ctx.strokeStyle = rgba(CLAY, 0.9); ctx.lineWidth = 1.8
            ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke()
          }
        })
        const pulse = 10 + ((t * 14) % 18)
        ctx.strokeStyle = rgba(CLAY, 0.5 * (1 - (pulse - 10) / 18)); ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(P[hub].x, P[hub].y, pulse, 0, 7); ctx.stroke()
        label("HIGH-DEGREE NODE", P[hub].x + 14, P[hub].y - 24, CLAY, seg(t, 0.8, 1.6))
        label("CUT EDGES (DASHED)", 40, 40, CLAY, seg(t, 1.2, 2) * (1 - seg(t, 3, 3.4) * 0.5))
        label("REPAIRED: EDGES AROUND THE HUB RESTORED", 40, 300, BLUE, seg(t, 4.4, 5.2))
      },
      // 6 islands
      (t) => {
        const pw = 190, gap = 33, oy = 26
        for (let k = 0; k < 4; k++) {
          const x0 = 40 + k * (pw + gap)
          const win = k === 2 ? ease(seg(t, 5.5, 6.3)) : 0
          ctx.strokeStyle = rgba(win ? BLUE : SEC, win ? 0.9 : 0.35); ctx.lineWidth = win ? 1.5 : 1
          ctx.strokeRect(x0, oy, pw, 270)
          label("ISLAND " + (k + 1), x0 + 8, oy + 8, INK, 0.9)
          const r = rng(50 + k)
          for (let p = 0; p < 28; p++) {
            const bx = x0 + 16 + r() * (pw - 32), by = oy + 34 + r() * 100
            const spread = 1 - 0.7 * ease(seg(t, 1, 6))
            ctx.fillStyle = rgba(k === 2 && win ? BLUE : SEC, 0.7)
            ctx.beginPath(); ctx.arc(bx + Math.sin(t * 1.6 + p) * 6 * spread, by + Math.cos(t * 1.3 + p * 1.3) * 6 * spread, 2.2, 0, 7); ctx.fill()
          }
          const rate = [0.7, 0.55, 0.85, 0.62][k]
          ctx.strokeStyle = rgba(BLUE, 0.9); ctx.lineWidth = 1.5; ctx.beginPath()
          const cy0 = oy + 250, ch = 90, prog = seg(t, 1.2, 6)
          for (let i = 0; i <= 60 * prog; i++) {
            const u = i / 60
            const f = 1 - Math.exp(-u * rate * 4.5) + (Math.sin(u * 40 + k) * 0.015)
            ctx[i === 0 ? "moveTo" : "lineTo"](x0 + 14 + u * (pw - 28), cy0 - f * ch)
          }
          ctx.stroke()
          label("GENERATIONS →", x0 + 8, oy + 252, SEC, 0.8)
        }
        const ev = Math.round(31250000 * ease(seg(t, 3, 6.5)))
        label("UP TO " + ev.toLocaleString("en-US") + " CHROMOSOMES SCORED (250 × 25 ISLANDS × 5,000 GENERATIONS)", 40, 298, BLUE, seg(t, 3, 3.8))
        label("OF 10^2,008 POSSIBLE: A TINY, GUIDED SAMPLE", 40, 312, CLAY, seg(t, 6, 6.8))
      },
      // 7 communities
      (t) => {
        const box: Box = { x: 170, y: 24, w: 540, h: 250 }
        const f = ease(seg(t, 0.2, 2.6))
        const halo = ease(seg(t, 2.4, 3.6))
        const anchors = CEN.map((c) => ({ x: box.x + c[0] * box.w, y: box.y + c[1] * box.h }))
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = rgba(COMM[c], 0.07 * halo); ctx.strokeStyle = rgba(COMM[c], 0.45 * halo); ctx.lineWidth = 1
          ctx.beginPath(); ctx.ellipse(anchors[c].x, anchors[c].y, 92 * halo, 62 * halo, 0, 0, 7); ctx.fill(); ctx.stroke()
          label("C" + (c + 1), anchors[c].x - 92, anchors[c].y - 78, COMM[c], halo)
        }
        drawGraph(box, f, {
          col: (i) => mix(SEC, COMM[comm[i]], ease(seg(t, 1, 2.6))),
          edgeA: (e) => (inter[e] ? 0.4 * (1 - 0.7 * f) : 1),
          r: 5,
        })
        label("962 SNPs · 6,672 EDGES → COMMUNITIES OF DENSELY CONNECTED SNPs", 40, 300, BLUE, seg(t, 3.6, 4.6))
      },
    ]
    const wallCv = document.createElement("canvas")
    wallCv.width = 880; wallCv.height = 270
    {
      const w = wallCv.getContext("2d")!
      const wr = rng(3)
      for (let r = 0; r < 250; r++) for (let c = 0; c < 220; c++) {
        const on = wr() < 0.85
        w.fillStyle = on ? "rgba(20,20,19,0.8)" : "rgba(194,82,45,0.55)"
        if (on || wr() < 0.5) w.fillRect(c * 4, r * 1.08, 3, 0.9)
      }
    }
    const nodesTmp: { x: number; y: number }[] = Array.from({ length: N }, () => ({ x: 0, y: 0 }))

    const render = () => {
      ctx.clearRect(0, 0, W, H)
      scenes[st.current.scene](st.current.t)
    }
    let last = performance.now(), raf = 0, visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(cv)
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible) {
        if (st.current.playing) {
          st.current.t += dt
          if (st.current.t >= D) goTo(st.current.scene + 1)
        }
        render()
      }
      raf = requestAnimationFrame(loop)
    }
    if (reduce) { st.current.t = D * 0.9; render() } else raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [goTo])

  // redraw a static frame when navigating while reduced motion is on
  React.useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) st.current.t = D * 0.9
  }, [scene])

  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(st.current.scene + 1)
    else if (e.key === "ArrowLeft") goTo(st.current.scene - 1)
    else if (e.key === " ") { e.preventDefault(); toggle() }
  }
  const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }
  const btn: React.CSSProperties = { ...mono, background: "none", border: "1px solid #E3E0D8", borderRadius: 4, padding: "6px 12px", cursor: "pointer", color: "#141413" }

  return (
    <div tabIndex={0} onKeyDown={key} style={{ outline: "none" }} aria-label="Thesis walkthrough, eight scenes. Use left and right arrow keys to change scene, space to pause.">
      <canvas
        ref={ref}
        role="img"
        aria-label={`Scene ${scene + 1} of ${SCENES.length}: ${SCENES[scene].title}. ${SCENES[scene].text}`}
        style={{ width: "100%", aspectRatio: `${W} / ${H}`, display: "block", borderTop: "2px solid #2F5D8C", borderBottom: "1px solid #E3E0D8", background: "#FAF9F6" }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem 2rem", alignItems: "flex-start", marginTop: 20 }}>
        <div style={{ flex: "1 1 360px", minHeight: 96 }}>
          <div style={{ ...mono, color: "#2F5D8C" }}>Scene {scene + 1} / {SCENES.length}</div>
          <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.5rem", lineHeight: 1.2, margin: "6px 0 8px", letterSpacing: "-0.015em" }}>{SCENES[scene].title}</div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, maxWidth: "60ch", color: "#141413" }}>{SCENES[scene].text}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" style={btn} onClick={() => goTo(scene - 1)} aria-label="Previous scene">←</button>
          <button type="button" style={{ ...btn, minWidth: 76 }} onClick={toggle}>{playing ? "Pause" : "Play"}</button>
          <button type="button" style={btn} onClick={() => goTo(scene + 1)} aria-label="Next scene">→</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {SCENES.map((s, i) => (
          <button key={s.title} type="button" onClick={() => goTo(i)} aria-label={`Go to scene ${i + 1}: ${s.title}`} style={{ flex: 1, height: 18, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
            <span style={{ display: "block", height: i === scene ? 3 : 2, marginTop: i === scene ? 7 : 8, background: i === scene ? "#2F5D8C" : i < scene ? "#5E5D59" : "#E3E0D8" }} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThesisScenes
