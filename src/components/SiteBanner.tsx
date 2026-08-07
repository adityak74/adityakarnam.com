import * as React from "react"
import { Link } from "gatsby"

const DISMISS_KEY = "site-banner-dismissed"
const ROTATION_KEY = "site-banner-rotation"

type Promo = {
  key: string
  to: string
  message: string
  cta: string
  background: string
  label: string
}

/**
 * One promo shows at a time, advancing on each page load. Add or remove
 * entries here; ordering drives the rotation.
 */
export const promos: Promo[] = [
  {
    key: "portfolio-mcp",
    to: "/mcp-install/",
    message: "Portfolio MCP is live. Add Aditya's work to Claude.",
    cta: "Install in Claude",
    background: "#1A1A18",
    label: "Portfolio MCP",
  },
  {
    key: "fable-prompt-grader",
    to: "/ai-toolkit/fable-prompt-grader/",
    message: "New: Fable Prompt Grader. Score and fix your creative writing prompts.",
    cta: "Grade a prompt",
    background: "#2B1B3D",
    label: "Fable Prompt Grader",
  },
  {
    key: "ai-systems-design-field-guide",
    to: "/ai-systems-design-field-guide/",
    message: "New field guide: AI Systems Design. Model APIs, agent runtimes, MCP, and A2A.",
    cta: "Read the guide",
    background: "#12312B",
    label: "AI Systems Design Field Guide",
  },
]

/**
 * Advances to the next promo on every page load, so every promo gets seen
 * within a few pageviews rather than needing a fresh browser session. The
 * counter lives in localStorage so the rotation continues across visits
 * instead of restarting at the first promo each time.
 */
const advanceIndex = (): number => {
  const previous = Number.parseInt(window.localStorage.getItem(ROTATION_KEY) ?? "", 10)
  const next = (Number.isInteger(previous) ? previous + 1 : 0) % promos.length

  window.localStorage.setItem(ROTATION_KEY, String(next))
  return next
}

export const SiteBanner = () => {
  const [index, setIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (window.sessionStorage.getItem(DISMISS_KEY) === "true") return
    setIndex(advanceIndex())
  }, [])

  if (index === null) return null

  const promo = promos[index]

  const dismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    window.sessionStorage.setItem(DISMISS_KEY, "true")
    setIndex(null)
  }

  return (
    <Link
      to={promo.to}
      style={{
        alignItems: "center",
        background: promo.background,
        color: "#FAF9F7",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        justifyContent: "center",
        padding: "0.7rem 1rem",
        position: "relative",
        textDecoration: "none",
        zIndex: 20,
      }}
    >
      <span style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>{promo.message}</span>
      <span
        style={{
          background: "#FAF9F7",
          borderRadius: "6px",
          color: promo.background,
          fontSize: "0.85rem",
          fontWeight: 600,
          padding: "0.35rem 0.65rem",
        }}
      >
        {promo.cta}
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label={`Dismiss ${promo.label} banner`}
        style={{
          background: "transparent",
          border: "1px solid rgba(250,249,247,0.35)",
          borderRadius: "6px",
          color: "#FAF9F7",
          cursor: "pointer",
          fontSize: "0.8rem",
          padding: "0.3rem 0.5rem",
        }}
      >
        Dismiss
      </button>
    </Link>
  )
}
