import * as React from "react"
import { useColorMode } from "theme-ui"
import {
  EXAMPLE_QUESTIONS,
  RESEARCH_LENS_FALLBACK,
  VISITOR_LENSES,
  type ResearchSource,
  type VisitorLens,
} from "./research-context"

type LensResponse = {
  text: string
  fallback?: boolean
  sources?: ResearchSource[]
}

type AskResponse = {
  text: string
  fallback?: boolean
  sources?: ResearchSource[]
}

const lensIntro =
  "See the same body of work through different decision-making lenses without turning the site into a generic chatbot."

const askIntro =
  "Ask about projects, research direction, and infrastructure themes. Answers stay grounded in this site’s existing project write-ups and pages."

const AskMyWorkPage = () => {
  const [colorMode] = useColorMode()
  const isDark = colorMode === "dark"
  const [activeLens, setActiveLens] = React.useState<VisitorLens>("AI Researcher")
  const [lensResult, setLensResult] = React.useState<LensResponse>({
    text: RESEARCH_LENS_FALLBACK,
    fallback: true,
  })
  const [lensLoading, setLensLoading] = React.useState(false)
  const [question, setQuestion] = React.useState(EXAMPLE_QUESTIONS[0])
  const [askResult, setAskResult] = React.useState<AskResponse | null>(null)
  const [askLoading, setAskLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const colors = {
    pageBg: isDark ? "#0f1210" : "#f3f0e6",
    panelBg: isDark ? "#151a17" : "#faf7ef",
    panelMuted: isDark ? "#101512" : "#efeadb",
    border: isDark ? "rgba(112, 201, 176, 0.18)" : "rgba(19, 77, 63, 0.12)",
    borderStrong: isDark ? "rgba(112, 201, 176, 0.38)" : "rgba(19, 77, 63, 0.28)",
    text: isDark ? "#e7f0e9" : "#13201b",
    secondary: isDark ? "#a9b7ae" : "#51635a",
    accent: isDark ? "#78e6c0" : "#0f7a5e",
    accentSoft: isDark ? "rgba(120, 230, 192, 0.12)" : "rgba(15, 122, 94, 0.08)",
    code: isDark ? "#8ef2cf" : "#0f7a5e",
    grid: isDark ? "rgba(120, 230, 192, 0.08)" : "rgba(15, 122, 94, 0.08)",
  }

  const loadLens = React.useCallback(async (lens: VisitorLens) => {
    setLensLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/research-lens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lens }),
      })

      if (!response.ok) {
        throw new Error(`Lens request failed with ${response.status}`)
      }

      const payload = (await response.json()) as LensResponse
      setLensResult(payload)
    } catch (_error) {
      setError("Lens response unavailable. Showing grounded fallback copy.")
      setLensResult({
        text: RESEARCH_LENS_FALLBACK,
        fallback: true,
      })
    } finally {
      setLensLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadLens(activeLens)
  }, [activeLens, loadLens])

  const submitQuestion = async (nextQuestion?: string) => {
    const prompt = (nextQuestion ?? question).trim()

    if (!prompt) {
      setError("Enter a question about projects, research direction, or the infrastructure thesis.")
      return
    }

    setAskLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ask-my-work", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt }),
      })

      if (!response.ok) {
        throw new Error(`Ask request failed with ${response.status}`)
      }

      const payload = (await response.json()) as AskResponse
      setAskResult(payload)
      setQuestion(prompt)
    } catch (_error) {
      setError("Ask My Work is unavailable. Showing grounded fallback copy instead.")
      setAskResult({
        text:
          "I could not generate a live answer right now, but the strongest summary is that Aditya’s work focuses on world-model AI infrastructure: agents, memory, retrieval, model routing, local inference, and evals.",
        fallback: true,
      })
    } finally {
      setAskLoading(false)
    }
  }

  const panelStyle: React.CSSProperties = {
    background: colors.panelBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    padding: "1.25rem",
    boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.22)" : "0 20px 40px rgba(17, 31, 26, 0.08)",
  }

  return (
    <div
      style={{
        background: colors.pageBg,
        color: colors.text,
        marginTop: "2rem",
        borderRadius: "28px",
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.05))",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          padding: "2rem 1.25rem 1.5rem",
          borderBottom: `1px solid ${colors.border}`,
          background:
            isDark
              ? "radial-gradient(circle at top left, rgba(120, 230, 192, 0.16), transparent 34%)"
              : "radial-gradient(circle at top left, rgba(15, 122, 94, 0.1), transparent 36%)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.78rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: colors.accent,
            }}
          >
            Ask My Work
          </span>
          <span
            style={{
              padding: "0.25rem 0.55rem",
              borderRadius: "999px",
              border: `1px solid ${colors.borderStrong}`,
              background: colors.accentSoft,
              color: colors.secondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.72rem",
            }}
          >
            Observe → Model → Simulate → Act → Evaluate → Update
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
          }}
        >
          Source-grounded research interface for Aditya’s AI systems work.
        </h1>

        <p
          style={{
            marginTop: "1rem",
            maxWidth: "50rem",
            color: colors.secondary,
            fontSize: "1.02rem",
            lineHeight: 1.75,
          }}
        >
          Use the lens selector for a fast framing pass, or ask a direct question about projects, research direction, and the world-model infrastructure thesis. Responses stay short, server-side, and tied to the material already published in this repo.
        </p>
      </section>

      <section
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "1rem",
          padding: "1.25rem",
        }}
      >
        <div style={panelStyle}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: colors.accent }}>
              Explore My Work Through Your Lens
            </div>
            <p style={{ margin: "0.75rem 0 0", color: colors.secondary, lineHeight: 1.7 }}>{lensIntro}</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginBottom: "1rem" }}>
            {VISITOR_LENSES.map((lens) => {
              const isActive = lens === activeLens

              return (
                <button
                  key={lens}
                  type="button"
                  onClick={() => setActiveLens(lens)}
                  style={{
                    borderRadius: "999px",
                    border: `1px solid ${isActive ? colors.borderStrong : colors.border}`,
                    background: isActive ? colors.accentSoft : colors.panelMuted,
                    color: isActive ? colors.text : colors.secondary,
                    padding: "0.55rem 0.85rem",
                    fontSize: "0.92rem",
                    cursor: "pointer",
                  }}
                >
                  {lens}
                </button>
              )
            })}
          </div>

          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: "16px",
              padding: "1rem",
              background: colors.panelMuted,
              minHeight: "12rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
              <strong style={{ fontSize: "1rem" }}>Adaptive Research Profile</strong>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: colors.code }}>
                {lensLoading ? "loading…" : lensResult.fallback ? "fallback" : "live"}
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.75, color: colors.text }}>{lensResult.text}</p>
            {lensResult.sources && lensResult.sources.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                {lensResult.sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    style={{
                      padding: "0.4rem 0.65rem",
                      borderRadius: "999px",
                      border: `1px solid ${colors.border}`,
                      fontSize: "0.82rem",
                      color: colors.secondary,
                      textDecoration: "none",
                    }}
                  >
                    {source.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", color: colors.accent }}>
              Ask My Work
            </div>
            <p style={{ margin: "0.75rem 0 0", color: colors.secondary, lineHeight: 1.7 }}>{askIntro}</p>
          </div>

          <label htmlFor="ask-my-work-input" style={{ display: "block", marginBottom: "0.65rem", fontSize: "0.92rem", color: colors.secondary }}>
            Ask a question
          </label>
          <textarea
            id="ask-my-work-input"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={5}
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: "16px",
              border: `1px solid ${colors.border}`,
              padding: "0.95rem 1rem",
              background: colors.panelMuted,
              color: colors.text,
              fontSize: "0.98rem",
              lineHeight: 1.6,
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.85rem", marginBottom: "1rem" }}>
            {EXAMPLE_QUESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setQuestion(prompt)
                  void submitQuestion(prompt)
                }}
                style={{
                  borderRadius: "999px",
                  border: `1px solid ${colors.border}`,
                  background: colors.panelMuted,
                  color: colors.secondary,
                  padding: "0.45rem 0.7rem",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={() => void submitQuestion()}
              disabled={askLoading}
              style={{
                borderRadius: "999px",
                border: `1px solid ${colors.borderStrong}`,
                background: colors.accentSoft,
                color: colors.text,
                padding: "0.7rem 1rem",
                cursor: askLoading ? "wait" : "pointer",
                fontWeight: 600,
              }}
            >
              {askLoading ? "Generating…" : "Generate answer"}
            </button>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: colors.secondary }}>
              Server-side only. No API key in browser code.
            </span>
          </div>

          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: "16px",
              padding: "1rem",
              background: colors.panelMuted,
              minHeight: "12rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
              <strong style={{ fontSize: "1rem" }}>Response</strong>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: colors.code }}>
                {askLoading ? "loading…" : askResult?.fallback ? "fallback" : askResult ? "live" : "idle"}
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.75, color: colors.text }}>
              {askResult?.text ?? "Ask a question to generate a short answer with source links."}
            </p>
            {askResult?.sources && askResult.sources.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                {askResult.sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    style={{
                      padding: "0.4rem 0.65rem",
                      borderRadius: "999px",
                      border: `1px solid ${colors.border}`,
                      fontSize: "0.82rem",
                      color: colors.secondary,
                      textDecoration: "none",
                    }}
                  >
                    {source.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <div
          style={{
            position: "relative",
            padding: "0 1.25rem 1.25rem",
          }}
        >
          <div
            style={{
              background: colors.accentSoft,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: "14px",
              padding: "0.85rem 1rem",
              color: colors.secondary,
            }}
          >
            {error}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AskMyWorkPage
