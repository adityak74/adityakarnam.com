import * as React from "react"

// Current work threads as orbits around NOW. Inner loops turn faster. The
// pointer near a ring slows that orbit and shows its label in clay.
const W = 400
const H = 380
const INK = "20,20,19"
const SEC = "94,93,89"
const CLAY = "194,82,45"
const BLUE = "47,93,140"
const CX = W / 2
const CY = H / 2
const FONT = "12px 'JetBrains Mono', monospace"
const ORBITS = [
  { label: "SUBAGENT-FLEET", r: 58, w: 0.9, a: 0.5 },
  { label: "EMBENX", r: 86, w: 0.65, a: 2.6 },
  { label: "AGENT-MEMORY MAP", r: 114, w: 0.45, a: 4.4 },
  { label: "HARNESS WRITE-UP", r: 142, w: 0.3, a: 1.4 },
]

const NowOrbit = () => {
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
    const ang = ORBITS.map((o) => o.a)
    const spd = ORBITS.map(() => 1)
    let hover = -1
    let raf = 0

    const frame = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.font = FONT
      ctx.textBaseline = "middle"
      ctx.setLineDash([3, 4])
      ORBITS.forEach((o, i) => {
        ctx.strokeStyle = `rgba(${INK},${i === hover ? 0.3 : 0.12})`
        ctx.beginPath(); ctx.arc(CX, CY, o.r, 0, 7); ctx.stroke()
      })
      ctx.setLineDash([])
      ctx.textAlign = "center"
      ctx.fillStyle = `rgb(${INK})`
      ctx.fillText("NOW", CX, CY)
      ORBITS.forEach((o, i) => {
        spd[i] += ((i === hover ? 0.05 : 1) - spd[i]) * 0.1
        if (!reduce) ang[i] += o.w * 0.012 * spd[i]
        const x = CX + Math.cos(ang[i]) * o.r, y = CY + Math.sin(ang[i]) * o.r
        const hot = i === hover
        ctx.fillStyle = hot ? `rgb(${CLAY})` : `rgb(${BLUE})`
        ctx.beginPath(); ctx.arc(x, y, hot ? 5 : 4, 0, 7); ctx.fill()
        // labels sit on the inward side so they never clip the canvas edge
        const right = x > CX
        ctx.textAlign = right ? "right" : "left"
        ctx.fillStyle = hot ? `rgb(${CLAY})` : `rgba(${SEC},0.9)`
        ctx.fillText(o.label, x + (right ? -9 : 9), y)
      })
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      const d = Math.hypot(((e.clientX - r.left) / r.width) * W - CX, ((e.clientY - r.top) / r.height) * H - CY)
      hover = ORBITS.findIndex((o) => Math.abs(o.r - d) < 13)
    }
    const leave = () => { hover = -1 }
    cv.addEventListener("pointermove", move)
    cv.addEventListener("pointerleave", leave)
    frame()
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
      aria-label="Current work threads orbiting NOW: subagent-fleet, embenx, the agent-memory map and the harness write-up"
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, touchAction: "pan-y", cursor: "crosshair" }}
    />
  )
}

export default NowOrbit
