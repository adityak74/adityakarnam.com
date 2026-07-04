import * as React from "react"
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

const colors = {
  pageBg: "#FAF9F7",
  panelBg: "#FFFFFF",
  panelMuted: "#F2F0EC",
  border: "#D8D4CC",
  borderStrong: "#C2522D",
  text: "#1A1A18",
  secondary: "#6B6B63",
  accent: "#C2522D",
  accentSoft: "rgba(194, 82, 45, 0.08)",
}

const lensIntro =
  "See the same body of work through different decision-making lenses without turning the site into a generic chatbot."

const askIntro =
  "Ask about projects, research direction, and infrastructure themes. Answers stay grounded in this site's existing project write-ups and pages."

const AskMyWorkPage = () => {
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

  const loadLens = React.useCallback(async (lens: VisitorLens) => {
    setLensLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/research-lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
          "I could not generate a live answer right now, but the strongest summary is that Aditya's work focuses on world-model AI infrastructure: agents, memory, retrieval, model routing, local inference, and evals.",
        fallback: true,
      })
    } finally {
      setAskLoading(false)
    }
  }

  const panelStyle: React.CSSProperties = {
    background: colors.panelBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 1px 2px rgba(26,26,24,0.06)",
  }

  return (
    <div
      style={{
        background: colors.pageBg,
        color: colors.text,
        marginTop: "2rem",
        borderRadius: "16px",
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
      }}
    >
      <section
        style={{
          padding: "2.5rem 1.5rem 2rem",
          borderBottom: `1px solid ${colors.border}`,
          background: "linear-gradient(180deg, #ffffff 0%, #faf9f7 100%)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.74rem",
              letterSpacing: "0.14em",
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
              border: `1px solid ${colors.border}`,
              background: colors.panelMuted,
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
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            fontWeight: 500,
            maxWidth: "12ch",
          }}
        >
          Source-grounded research interface for Aditya's AI systems work.
        </h1>

        <p
          style={{
            marginTop: "1rem",
            maxWidth: "44rem",
            color: colors.secondary,
            fontSize: "17px",
            lineHeight: 1.65,
          }}
        >
          Use the lens selector for a fast framing pass, or ask a direct question about projects,
          research direction, and the world-model infrastructure thesis. Responses stay short,
          server-side, and tied to the material already published in this repo.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1rem",
          padding: "1.5rem",
        }}
      >
        <div style={panelStyle}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase", color: colors.accent }}>
              Explore My Work Through Your Lens
            </div>
            <p style={{ margin: "0.75rem 0 0", color: colors.secondary, lineHeight: 1.65, fontSize: "17px" }}>{lensIntro}</p>
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
                    background: isActive ? colors.accent : "transparent",
                    color: isActive ? "#ffffff" : colors.secondary,
                    padding: "0.55rem 0.9rem",
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
              borderTop: `1px solid ${colors.border}`,
              paddingTop: "1rem",
              minHeight: "12rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
              <strong style={{ fontSize: "1rem", fontWeight: 500 }}>Adaptive Research Profile</strong>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: colors.secondary }}>
                {lensLoading ? "loading" : lensResult.fallback ? "fallback" : "live"}
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.65, color: colors.text, fontSize: "17px" }}>{lensResult.text}</p>
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
                      background: colors.panelMuted,
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
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase", color: colors.accent }}>
              Ask My Work
            </div>
            <p style={{ margin: "0.75rem 0 0", color: colors.secondary, lineHeight: 1.65, fontSize: "17px" }}>{askIntro}</p>
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
              borderRadius: "8px",
              border: `1px solid ${colors.border}`,
              padding: "0.95rem 1rem",
              background: "#ffffff",
              color: colors.text,
              fontSize: "17px",
              lineHeight: 1.65,
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
                borderRadius: "8px",
                border: `1px solid ${colors.borderStrong}`,
                background: colors.accent,
                color: "#ffffff",
                padding: "0.75rem 1rem",
                fontSize: "0.95rem",
                cursor: askLoading ? "progress" : "pointer",
              }}
            >
              {askLoading ? "Thinking..." : "Ask My Work"}
            </button>
            <span style={{ color: colors.secondary, fontSize: "0.88rem" }}>
              Uses website-grounded context only.
            </span>
          </div>

          {error ? (
            <p style={{ margin: "0 0 1rem", color: colors.accent, fontSize: "0.9rem" }}>{error}</p>
          ) : null}

          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              paddingTop: "1rem",
              minHeight: "12rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
              <strong style={{ fontSize: "1rem", fontWeight: 500 }}>Answer</strong>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: colors.secondary }}>
                {askResult ? (askResult.fallback ? "fallback" : "live") : "ready"}
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.65, color: colors.text, fontSize: "17px" }}>
              {askResult?.text ?? "Ask about projects, research direction, or where the current work maps onto the world-model infrastructure stack."}
            </p>
            {askResult?.sources && askResult.sources.length > 0 ? (
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                {askResult.sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    style={{
                      borderTop: `1px solid ${colors.border}`,
                      paddingTop: "0.75rem",
                      color: colors.text,
                      textDecoration: "none",
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: "0.3rem", fontWeight: 500 }}>{source.label}</strong>
                    <span style={{ color: colors.secondary, fontSize: "0.92rem", lineHeight: 1.6 }}>{source.summary}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AskMyWorkPage
