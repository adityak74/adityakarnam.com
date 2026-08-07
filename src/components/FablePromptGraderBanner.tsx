import * as React from "react"
import { Link } from "gatsby"

const DISMISS_KEY = "fable-prompt-grader-banner-dismissed"

export const FablePromptGraderBanner = () => {
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
      to="/ai-toolkit/fable-prompt-grader/"
      style={{
        alignItems: "center",
        background: "#2B1B3D",
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
        New: Fable Prompt Grader. Score and fix your creative writing prompts.
      </span>
      <span
        style={{
          background: "#FAF9F7",
          borderRadius: "6px",
          color: "#2B1B3D",
          fontSize: "0.85rem",
          fontWeight: 600,
          padding: "0.35rem 0.65rem",
        }}
      >
        Grade a prompt
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Fable Prompt Grader banner"
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
