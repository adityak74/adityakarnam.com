import * as React from "react"
import { Link } from "gatsby"

const DISMISS_KEY = "field-guide-banner-dismissed"

export const FieldGuideBanner = () => {
  const [dismissed, setDismissed] = React.useState(true)

  React.useEffect(() => {
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "true")
  }, [])

  if (dismissed) return null

  const dismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    window.sessionStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  return (
    <Link
      to="/ai-systems-design-field-guide/"
      style={{
        alignItems: "center",
        background: "#12312B",
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
      <span style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>
        New field guide: AI Systems Design. Model APIs, agent runtimes, MCP, and A2A.
      </span>
      <span
        style={{
          background: "#FAF9F7",
          borderRadius: "6px",
          color: "#12312B",
          fontSize: "0.85rem",
          fontWeight: 600,
          padding: "0.35rem 0.65rem",
        }}
      >
        Read the guide
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss AI Systems Design Field Guide banner"
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
