/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))

// Scroll-driven nebula + starfield. The look is seeded by the visitor's local hour (24 looks a day) plus a per-spot salt, so spots differ from each other.
const RGB = ["194,82,45", "47,93,140", "150,90,160", "50,140,150", "205,110,130", "210,150,60", "80,80,170"]
const rng = (seed: number) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

const roll = (salt: number) => {
  const hour = new Date().getHours()
  const R = rng(hour * 7919 + salt * 104729 + 13)
  const rnd = (a: number, b: number) => a + R() * (b - a)
  const pal = [...RGB].sort(() => R() - 0.5)
  return {
    clouds: Array.from({ length: 2 + Math.floor(R() * 3) }, (_, i) => ({
      x: rnd(0.1, 0.9), y: rnd(0.1, 0.9), r: rnd(0.28, 0.6), rgb: pal[i], a: rnd(0.06, 0.14),
      dx: rnd(-0.3, 0.3), dy: rnd(-0.45, 0.45),
    })),
    stars: Array.from({ length: 60 + Math.floor(R() * 80) }, () => ({ x: R(), y: R(), z: rnd(0.15, 1), k: R(), rgb: pal[Math.floor(R() * 3)] })),
    glint: R() < 0.35 ? { x: rnd(0.15, 0.85), y: rnd(0.15, 0.85) } : null,
  }
}

export const NebulaCanvas = ({ p, strength = 1, salt = 0 }: { p: number; strength?: number; salt?: number }) => {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [look] = React.useState(() => roll(salt))
  React.useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = cv.clientWidth, h = cv.clientHeight
    if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr }
    const g = cv.getContext("2d")!
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    const q = p - 0.5
    look.clouds.forEach(c => {
      const cx = w * (c.x + q * c.dx), cy = h * (c.y + q * c.dy)
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, w * c.r)
      gr.addColorStop(0, `rgba(${c.rgb},${c.a * strength})`)
      gr.addColorStop(1, `rgba(${c.rgb},0)`)
      g.fillStyle = gr
      g.fillRect(0, 0, w, h)
    })
    const s = p * h, sa = Math.min(1, strength + 0.3)
    look.stars.forEach(st => {
      const y = (((st.y * h - s * st.z * 1.6) % h) + h) % h
      g.fillStyle = st.k > 0.6 ? `rgba(${st.rgb},${(0.3 + st.z * 0.35) * sa})` : `rgba(20,20,19,${(0.1 + st.z * 0.25) * sa})`
      g.beginPath()
      g.arc(st.x * w, y, 0.5 + st.z * 1.2, 0, Math.PI * 2)
      g.fill()
    })
    if (look.glint) {
      const gx = look.glint.x * w, gy = (((look.glint.y * h - s * 0.9) % h) + h) % h
      g.strokeStyle = `rgba(20,20,19,${0.4 * sa})`
      g.lineWidth = 1
      g.beginPath(); g.moveTo(gx - 7, gy); g.lineTo(gx + 7, gy); g.moveTo(gx, gy - 7); g.lineTo(gx, gy + 7); g.stroke()
    }
  }, [p, strength, look])
  return <canvas ref={ref} aria-hidden="true" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", WebkitMaskImage: "radial-gradient(ellipse at center, #000 35%, transparent 72%)", maskImage: "radial-gradient(ellipse at center, #000 35%, transparent 72%)" }} />
}

// Drop-in backdrop: parent needs position:relative + isolation:isolate. Parallax follows page scroll; static under reduced motion.
export const NebulaBackdrop = ({ strength = 0.6, bleed = 60, salt = 0 }: { strength?: number; bleed?: number; salt?: number }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [p, setP] = React.useState(0.5)
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const tick = () => {
      raf = 0
      const r = ref.current?.getBoundingClientRect()
      if (r) setP(clamp((window.innerHeight - r.top) / (window.innerHeight + r.height)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(tick) }
    tick()
    window.addEventListener("scroll", on, { passive: true })
    window.addEventListener("resize", on)
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return (
    <div ref={ref} aria-hidden="true" sx={{ position: "absolute", top: -bleed, bottom: -bleed, left: -40, right: -40, zIndex: -1, pointerEvents: "none" }}>
      <NebulaCanvas p={p} strength={strength} salt={salt} />
    </div>
  )
}
