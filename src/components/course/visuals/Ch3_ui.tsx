import * as React from "react"
import { ed } from "../../world-model/pages-systems-stack-now/editorial"

export const C = ed
export const monoLabel: React.CSSProperties = {
  fontFamily: ed.mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: ed.secondary,
}

export const useReducedMotion = () => {
  const [r, setR] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    setR(m.matches)
    const f = () => setR(m.matches)
    m.addEventListener?.("change", f)
    return () => m.removeEventListener?.("change", f)
  }, [])
  return r
}

/** True while the element is on screen. */
export const useOnScreen = (ref: React.RefObject<Element>) => {
  const [on, setOn] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") { setOn(true); return }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return on
}

/** Step counter with optional Play (user-started, never under reduced motion, only while on screen). */
export const useStepper = (count: number, ms = 1300) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const visible = useOnScreen(ref)
  const reduced = useReducedMotion()
  const [step, setStep] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  React.useEffect(() => {
    if (!playing || reduced || !visible) return
    const t = setTimeout(() => {
      if (step >= count - 1) setPlaying(false)
      else setStep(s => s + 1)
    }, ms)
    return () => clearTimeout(t)
  }, [playing, step, reduced, visible, count, ms])
  return {
    ref, step, reduced, playing,
    next: () => setStep(s => Math.min(count - 1, s + 1)),
    prev: () => setStep(s => Math.max(0, s - 1)),
    reset: () => { setPlaying(false); setStep(0) },
    toggle: () => { if (step >= count - 1) setStep(0); setPlaying(p => !p) },
    set: setStep,
  }
}

export const Btn = ({ children, onClick, pressed, disabled }: { children: React.ReactNode; onClick: () => void; pressed?: boolean; disabled?: boolean }) => (
  <button
    type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed}
    style={{
      ...monoLabel, cursor: disabled ? "default" : "pointer", padding: "8px 12px", minHeight: 36, borderRadius: 4,
      border: `1px solid ${pressed ? ed.clay : ed.hairline}`, background: pressed ? ed.paper : "transparent",
      color: pressed ? ed.clay : disabled ? ed.hairline : ed.ink,
    }}
  >{children}</button>
)

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "12px 0 0" }}>{children}</div>
)

export const Slider = ({ id, label, min, max, step = 1, value, onChange, display }: { id: string; label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; display?: string }) => (
  <label htmlFor={id} style={{ ...monoLabel, display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 0 }}>
    <span>{label}: <span style={{ color: ed.clay }}>{display ?? value}</span></span>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: ed.clay, minHeight: 28 }} />
  </label>
)

export const Note = ({ children }: { children: React.ReactNode }) => (
  <p aria-live="polite" style={{ fontFamily: ed.sans, fontSize: 15, lineHeight: 1.55, color: ed.ink, margin: "12px 0 0" }}>{children}</p>
)

export const svgBase: React.CSSProperties = { width: "100%", height: "auto", display: "block" }
export const svgText = (size = 12): React.CSSProperties => ({ fontFamily: ed.sans, fontSize: size })
export const svgMono = (size = 10): React.CSSProperties => ({ fontFamily: ed.mono, fontSize: size, letterSpacing: ".04em" })
