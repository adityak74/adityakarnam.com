import * as React from "react"

// BudgetBench in one picture: the same token stream falls into three memory
// strategies under a fixed per-call token budget. Truncate keeps the oldest
// tokens and loses what spills past the line, summarize compresses lossily,
// retrieve admits only relevant (clay) tokens. Only measured scores are shown:
// retrieval at 2K = 0.646, truncation needed 8K to reach 0.650.
const W = 400
const H = 380
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const FLOOR = H - 8
const CELL = 12
const PER_ROW = 10
const COLS = ["TRUNCATE", "SUMMARIZE", "RETRIEVE"]
const CX = [8, 140, 272]
const ROWS = { 2: 5, 8: 20 } as const // budget line height in rows (8K = 4x 2K)
const FONT = "12px 'JetBrains Mono', monospace"

type Tok = { c: number; x: number; y: number; rel: boolean }

const BudgetTiers = () => {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [budget, setBudget] = React.useState<2 | 8>(2)
  const budgetRef = React.useRef<2 | 8>(2)
  budgetRef.current = budget

  React.useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext("2d")
    if (!cv || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = W * dpr
    cv.height = H * dpr
    ctx.scale(dpr, dpr)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const stacks: boolean[][] = [[], [], []] // true = relevant
    let falling: Tok[] = []
    let hover = -1
    let lineRows = ROWS[2]
    let n = 0
    let raf = 0

    const cellY = (i: number) => FLOOR - (Math.floor(i / PER_ROW) + 1) * CELL
    const cellX = (c: number, i: number) => CX[c] + (i % PER_ROW) * CELL

    const step = () => {
      n++
      const cap = ROWS[budgetRef.current] * PER_ROW
      lineRows += (ROWS[budgetRef.current] - lineRows) * 0.08
      const lineY = FLOOR - lineRows * CELL
      if (n % 2 === 0)
        for (let c = 0; c < 3; c++)
          falling.push({ c, x: CX[c] + Math.floor(Math.random() * PER_ROW) * CELL, y: 40, rel: Math.random() < 0.25 })
      falling = falling.filter((t) => {
        t.y += 3 * (t.c === hover ? 1.8 : 1)
        const s = stacks[t.c]
        if (t.c === 2 && !t.rel) return t.y < lineY - 4 // retrieve rejects irrelevant tokens at the gate
        if (t.y < cellY(s.length)) return true
        s.push(t.rel)
        if (t.c === 1 && s.length >= cap) stacks[1] = s.filter((_, i) => i % 2 === 0) // lossy compression
        return false
      })
      stacks[0].length = Math.min(stacks[0].length, cap + 20) // spill past the line is dropped
      if (stacks[2].length > cap) stacks[2].splice(0, stacks[2].length - cap)
      if (stacks[1].length > cap) stacks[1].length = cap
      return { cap, lineY }
    }

    const draw = (cap: number, lineY: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.font = FONT
      ctx.textBaseline = "top"
      ctx.textAlign = "left"
      for (let c = 0; c < 3; c++) {
        const hot = c === hover
        if (hot) { ctx.fillStyle = `rgba(${INK},0.04)`; ctx.fillRect(CX[c] - 4, 36, PER_ROW * CELL + 8, FLOOR - 36) }
        ctx.fillStyle = hot ? `rgb(${CLAY})` : `rgba(${SEC},0.9)`
        ctx.fillText(COLS[c], CX[c], 4)
        const score = c === 2 && budgetRef.current === 2 ? "0.646" : c === 0 && budgetRef.current === 8 ? "0.650" : ""
        ctx.fillStyle = `rgb(${CLAY})`
        ctx.fillText(score, CX[c], 20)
        stacks[c].forEach((rel, i) => {
          const over = c === 0 && i >= cap
          ctx.fillStyle = over ? `rgba(${SEC},0.18)`
            : c === 1 ? `rgba(${BLUE},${rel ? 0.7 : 0.4})`
            : rel ? `rgb(${CLAY})` : `rgba(${INK},0.55)`
          ctx.fillRect(cellX(c, i), cellY(i), CELL - 3, CELL - 3)
        })
      }
      for (const t of falling) {
        const fade = t.c === 2 && !t.rel ? Math.max(0, (lineY - 4 - t.y) / 40) : 1
        ctx.fillStyle = t.rel ? `rgba(${CLAY},${fade})` : `rgba(${INK},${0.55 * fade})`
        ctx.fillRect(t.x, t.y, CELL - 3, CELL - 3)
      }
      ctx.strokeStyle = `rgba(${INK},0.45)`
      ctx.setLineDash([3, 4])
      ctx.beginPath(); ctx.moveTo(0, lineY); ctx.lineTo(W, lineY); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = `rgba(${SEC},0.9)`
      ctx.textAlign = "right"
      ctx.fillText(`${budgetRef.current}K BUDGET`, W, lineY - 16)
    }

    const frame = () => { const s = step(); draw(s.cap, s.lineY); raf = requestAnimationFrame(frame) }

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * W
      hover = x < 136 ? 0 : x < 268 ? 1 : 2
    }
    const leave = () => { hover = -1 }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    if (reduce) {
      let s = step()
      for (let i = 0; i < 700; i++) s = step()
      draw(s.cap, s.lineY)
    } else raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      cv.removeEventListener("pointermove", move)
      cv.removeEventListener("pointerleave", leave)
    }
  }, [])

  return (
    <div style={{ width: "100%", maxWidth: W }}>
      <canvas
        ref={ref}
        role="img"
        aria-label="Tokens fall into three memory strategies under a fixed token budget: truncate overflows, summarize compresses, retrieve keeps only relevant tokens. Retrieval at 2K scored 0.646; truncation needed 8K to reach 0.650."
        style={{ width: "100%", aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair", display: "block" }}
      />
      <div style={{ display: "flex", gap: 12, marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, textTransform: "uppercase" }}>
        {([2, 8] as const).map((b) => (
          <button
            key={b}
            type="button"
            aria-pressed={budget === b}
            onClick={() => setBudget(b)}
            style={{ all: "unset", cursor: "pointer", color: budget === b ? "rgb(194,82,45)" : "rgb(94,93,89)", borderBottom: "1px dashed currentColor" }}
          >
            {b}K budget
          </button>
        ))}
      </div>
    </div>
  )
}

export default BudgetTiers
