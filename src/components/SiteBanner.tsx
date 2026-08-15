import * as React from "react"
import { Link } from "gatsby"

const ROTATION_KEY = "site-banner-rotation"

/** How long each promo stays on screen, and how long the crossfade takes. */
const SLIDE_MS = 6000
const FADE_MS = 260

type Promo = {
  key: string
  to: string
  message: string
  cta: string
  background: string
  label: string
}

/**
 * The banner cycles through these on a timer. Add or remove entries here;
 * ordering drives the rotation.
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
 * Which promo the carousel opens on. Advancing a stored counter each page load
 * means repeat visitors don't always start on the same promo, so no single
 * entry monopolises the first impression.
 */
const openingIndex = (): number => {
  const previous = Number.parseInt(window.localStorage.getItem(ROTATION_KEY) ?? "", 10)
  const next = (Number.isInteger(previous) ? previous + 1 : 0) % promos.length

  window.localStorage.setItem(ROTATION_KEY, String(next))
  return next
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === `function` && window.matchMedia(`(prefers-reduced-motion: reduce)`).matches

export const SiteBanner = () => {
  const [index, setIndex] = React.useState<number | null>(null)
  const [visible, setVisible] = React.useState(true)
  // Paused while the visitor is reading (hover) or tabbing through (focus), so
  // the promo they are about to click can't slide out from under them.
  const [paused, setPaused] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    setReducedMotion(prefersReducedMotion())
    setIndex(openingIndex())
  }, [])

  const showing = index !== null
  const autoRotating = showing && !paused && !reducedMotion && promos.length > 1

  React.useEffect(() => {
    if (!autoRotating) return undefined

    let swapTimer: ReturnType<typeof setTimeout>
    const tick = setInterval(() => {
      setVisible(false)
      swapTimer = setTimeout(() => {
        setIndex((current) => (current === null ? current : (current + 1) % promos.length))
        setVisible(true)
      }, FADE_MS)
    }, SLIDE_MS)

    return () => {
      clearInterval(tick)
      clearTimeout(swapTimer)
    }
  }, [autoRotating])

  if (index === null) return null

  const promo = promos[index]

  const jumpTo = (target: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIndex(target)
    setVisible(true)
  }

  return (
    <Link
      to={promo.to}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      // Touch devices have no hover, so without this a tap could land just as
      // the promo swaps and send the visitor somewhere they didn't choose.
      onTouchStart={() => setPaused(true)}
      aria-label={`${promo.message} ${promo.cta}`}
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
        transition: `background ${FADE_MS}ms ease`,
        zIndex: 20,
      }}
    >
      <span
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
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
            transition: `color ${FADE_MS}ms ease`,
            whiteSpace: "nowrap",
          }}
        >
          {promo.cta}
        </span>
      </span>

      <span style={{ alignItems: "center", display: "flex", gap: "0.4rem" }} aria-hidden>
        {promos.map((entry, position) => (
          <button
            key={entry.key}
            type="button"
            tabIndex={-1}
            onClick={jumpTo(position)}
            title={entry.label}
            style={{
              background: position === index ? "#FAF9F7" : "rgba(250,249,247,0.35)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              height: "6px",
              padding: 0,
              transition: `background ${FADE_MS}ms ease`,
              width: "6px",
            }}
          />
        ))}
      </span>
    </Link>
  )
}
