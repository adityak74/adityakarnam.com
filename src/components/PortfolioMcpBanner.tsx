import * as React from "react"
import { Link } from "gatsby"

const DISMISS_KEY = "portfolio-mcp-banner-dismissed"

export const PortfolioMcpBanner = () => {
  const [dismissed, setDismissed] = React.useState(true)

  React.useEffect(() => {
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "true")
  }, [])

  if (dismissed) return null

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  return (
    <div
      style={{
        alignItems: "center",
        background: "#1A1A18",
        color: "#FAF9F7",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        justifyContent: "center",
        padding: "0.7rem 1rem",
        position: "relative",
        zIndex: 20,
      }}
    >
      <span style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>Portfolio MCP is live. Add Aditya's work to Claude.</span>
      <Link
        to="/mcp-install/"
        style={{
          background: "#FAF9F7",
          borderRadius: "6px",
          color: "#1A1A18",
          fontSize: "0.85rem",
          fontWeight: 600,
          padding: "0.35rem 0.65rem",
          textDecoration: "none",
        }}
      >
        Install in Claude
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Portfolio MCP banner"
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
    </div>
  )
}
