import * as React from "react"

export const C = {
  paper: "#FAF9F6", ink: "#141413", secondary: "#5E5D59", hairline: "#E3E0D8", panel: "#F3F1EB", clay: "#C2522D", blue: "#2F5D8C",
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif: "Fraunces, 'Source Serif 4', Georgia, serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', SFMono-Regular, Consolas, monospace",
}

export const mono: React.CSSProperties = { fontFamily: C.mono, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: C.secondary }

export const btn = (active: boolean): React.CSSProperties => ({
  ...mono, cursor: "pointer", padding: "8px 10px", minHeight: 36, borderRadius: 4,
  border: `1px solid ${active ? C.clay : C.hairline}`, background: active ? C.paper : "transparent", color: active ? C.clay : C.ink,
})

export const row: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "12px 0" }
export const svgBox: React.CSSProperties = { width: "100%", height: "auto", display: "block", maxWidth: 560, margin: "0 auto" }
export const svgText: React.CSSProperties = { fontFamily: C.mono, fontSize: 10, letterSpacing: ".04em", textTransform: "uppercase", fill: C.secondary }
export const readout: React.CSSProperties = { fontFamily: C.sans, fontSize: 15, lineHeight: 1.5, color: C.ink, margin: "8px 0 0" }

export const useReducedMotion = () => {
  const [r, setR] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const q = window.matchMedia("(prefers-reduced-motion: reduce)")
    setR(q.matches)
    const h = () => setR(q.matches)
    q.addEventListener?.("change", h)
    return () => q.removeEventListener?.("change", h)
  }, [])
  return r
}

/** Calls tick every ms while playing and the element is on screen. */
export const useTicker = (playing: boolean, ms: number, tick: () => void, ref: React.RefObject<Element>) => {
  const [visible, setVisible] = React.useState(true)
  const tickRef = React.useRef(tick)
  tickRef.current = tick
  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  React.useEffect(() => {
    if (!playing || !visible) return
    const id = setInterval(() => tickRef.current(), ms)
    return () => clearInterval(id)
  }, [playing, visible, ms])
}
