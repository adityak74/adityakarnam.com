import * as React from "react"
import { Link } from "gatsby"
import PixelSprite from "./PixelSprite"

// A small pixel chef that peeks in from the corner once per page, after the visitor has
// scrolled a little, and points at one related page. Dismissible; stays dismissed for the session.
type Hint = { to: string; text: string }
const H = (to: string, text: string): Hint => ({ to, text })
const HINTS: Record<string, Hint[]> = {
  "/": [H("/about/", "Psst. My thesis is an animation."), H("/quecto/", "A whole agent in 1.3 MB. Peek inside."), H("/ai-research/", "Fresh papers, still warm."), H("/blog/", "Fresh from the kitchen: new posts.")],
  "/ai-research/": [H("/systems/", "Also check out what I built."), H("/blog/", "The long versions live in Writing."), H("/about/", "Want the origin story? Genetics, then AI.")],
  "/systems/": [H("/quecto/", "Quecto is the fun one. Try it."), H("/ai-research/", "The experiments behind these are here."), H("/now/", "Currently simmering: see Now.")],
  "/quecto/": [H("/now/", "See what I'm cooking up now."), H("/systems/", "More tools like this one in Systems."), H("/blog/", "I wrote up how it was built.")],
  "/about/": [H("/blog/", "Also check out my writing."), H("/ai-research/", "Curious what came after the thesis?"), H("/systems/", "Wanna see the things I shipped?")],
  "/now/": [H("/ai-research/", "The research behind this is here."), H("/about/", "Meet the person behind the pixels."), H("/quecto/", "Insert coin: try Quecto.")],
  "/blog/": [H("/ai-research/", "Hungry for papers? Try Research."), H("/systems/", "Prefer code? Systems has it."), H("/about/", "Psst. The About page animates.")],
}
const FALLBACKS = [H("/ai-research/", "Also check out my research."), H("/systems/", "Psst. Systems is worth a look."), H("/about/", "Say hi on the About page.")]
const pick = (a: Hint[], path: string) => {
  const ok = a.filter((h) => h.to !== path)
  const pool = ok.length ? ok : FALLBACKS
  return pool[Math.floor(Math.random() * pool.length)]
}
const SKIP = ["/404", "/box-breathing", "/status", "/mcp-install"]

const PeekGuide = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = React.useState(false)
  const path = pathname.endsWith("/") ? pathname : pathname + "/"
  const [hint, setHint] = React.useState<Hint>(FALLBACKS[0])

  React.useEffect(() => {
    setOpen(false)
    const h = pick(HINTS[path] || FALLBACKS, path)
    setHint(h)
    let off = false
    try { off = sessionStorage.getItem("peek-off") === "1" } catch (e) { /* ignore */ }
    if (off || SKIP.some((s) => path.startsWith(s)) || h.to === path) return
    const show = () => setOpen(true)
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0 && window.scrollY / h > 0.35) { show(); window.removeEventListener("scroll", onScroll) }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    const timer = window.setTimeout(show, 14000)
    return () => { window.removeEventListener("scroll", onScroll); window.clearTimeout(timer) }
  }, [path])

  const dismiss = () => {
    setOpen(false)
    try { sessionStorage.setItem("peek-off", "1") } catch (e) { /* ignore */ }
  }

  return (
    <div
      aria-hidden={!open}
      style={{
        position: "fixed", right: 14, bottom: 0, zIndex: 90, display: "flex", alignItems: "flex-end", gap: 8,
        transform: open ? "translateY(0)" : "translateY(110%)", transition: "transform .55s cubic-bezier(.2,.9,.3,1.25)",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div style={{ position: "relative", background: "#FAF9F6", border: "1px solid #141413", borderRadius: 2, padding: "9px 12px", marginBottom: 14, maxWidth: 210, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.5, letterSpacing: ".02em" }}>
        <button type="button" onClick={dismiss} aria-label="Dismiss" tabIndex={open ? 0 : -1} style={{ position: "absolute", top: 1, right: 4, background: "none", border: 0, cursor: "pointer", color: "#5E5D59", fontSize: 13, lineHeight: 1, padding: 2 }}>×</button>
        <span style={{ display: "block", paddingRight: 12 }}>{hint.text}</span>
        <Link to={hint.to} tabIndex={open ? 0 : -1} style={{ color: "#C2522D", textDecoration: "none", display: "inline-block", marginTop: 4 }}>Go there →</Link>
      </div>
      <div style={{ animation: open ? "peek-bob 2.4s ease-in-out infinite" : "none", transformOrigin: "bottom" }}>
        <PixelSprite name="chefFace" size={56} />
      </div>
      <style>{"@keyframes peek-bob{0%,100%{transform:translateY(6px)}50%{transform:translateY(0)}}@media (prefers-reduced-motion: reduce){div[aria-hidden]{transition:none!important}}"}</style>
    </div>
  )
}

export default PeekGuide
