/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link } from "gatsby"

// Rotating highlights bar. Pauses on hover/focus; static under prefers-reduced-motion.
type Item = { tag: string; text: string; href: string; ext?: boolean }
const ITEMS: Item[] = [
  { tag: "NEW", text: "BudgetBench: memory strategy evaluation under a fixed token budget (arXiv:2609.13149)", href: "https://arxiv.org/abs/2609.13149", ext: true },
  { tag: "LIVE", text: "Search research papers right from the site, and try the tools I run", href: "/live/" },
  { tag: "DISTILLED", text: "A 4.9 GB Ornith build beats the 8.9 GB release it replaces", href: "/distilling-ornith-9b-two-teacher-mlx/" },
  { tag: "MERGED", text: "mlx-lm PR #1795 fixes LoRA training on 3 MoE models", href: "https://github.com/ml-explore/mlx-lm/pull/1795", ext: true },
  { tag: "OPEN SOURCE", text: "subagent-fleet turns local machines into one compute fleet for coding agents", href: "/subagent-fleet-local-ai-compute-control-plane/" },
  { tag: "BUILT", text: "Quecto: a 1.3 MB agent harness in Rust, made to be evaluated", href: "/quecto/" },
  { tag: "MEASURED", text: "Speculative decoding on Apple Silicon: 119% peak decode speedup", href: "/mlx-speculative-decoding-qwen3-8-apple-silicon/" },
  { tag: "THESIS", text: "My master's thesis, animated: from DNA to communities", href: "/about/" },
]
const EVERY = 5200

const AnnouncementBar = () => {
  const [i, setI] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [reduce, setReduce] = React.useState(true)

  React.useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])
  React.useEffect(() => {
    if (paused || reduce) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % ITEMS.length), EVERY)
    return () => window.clearTimeout(t)
  }, [i, paused, reduce])

  const it = ITEMS[i]
  const linkSx = { flex: 1, minWidth: 0, color: `secondary`, textDecoration: `none`, ":hover": { color: `heading` } } as const
  const body = (
    <span key={i} className="ann-in" sx={{ display: `block`, animation: reduce ? `none` : `ann-in .45s cubic-bezier(.2,.7,.2,1)` }}>
      <span sx={{ bg: `blue`, color: `background`, px: `6px`, py: `1px`, borderRadius: `2px`, mr: 2 }}>{it.tag}</span>
      {it.text} &rarr;
    </span>
  )

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-label="Highlights"
      sx={{ display: `flex`, alignItems: `center`, gap: 3, mb: 3, py: 2, px: 3, bg: `muted`, borderRadius: `2px`, fontFamily: `monospace`, fontSize: `12px`, letterSpacing: `0.04em`, minHeight: [`52px`, `36px`], overflow: `hidden` }}
    >
      {it.ext ? (
        <a href={it.href} target="_blank" rel="noopener noreferrer" sx={linkSx}>{body}</a>
      ) : (
        <Link to={it.href} sx={linkSx}>{body}</Link>
      )}
      <div sx={{ display: [`none`, `flex`], gap: `0px`, flex: `0 0 auto` }}>
        {ITEMS.map((x, k) => (
          <button
            key={x.tag}
            type="button"
            aria-label={`Show highlight ${k + 1}: ${x.tag}`}
            aria-current={k === i}
            onClick={() => setI(k)}
            sx={{ width: `20px`, height: `28px`, p: 0, border: 0, bg: `transparent`, cursor: `pointer`, display: `flex`, alignItems: `center`, justifyContent: `center` }}
          >
            <span sx={{ display: `block`, width: `6px`, height: `6px`, bg: k === i ? `blue` : `divide`, transition: `background .2s` }} />
          </button>
        ))}
      </div>
      <style>{"@keyframes ann-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"}</style>
    </div>
  )
}

export default AnnouncementBar
