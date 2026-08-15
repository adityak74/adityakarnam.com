import type { App } from "@modelcontextprotocol/ext-apps"
import { useReducer, useState } from "react"
import { getRecruiterBrief } from "./bridge"
import { fitCheckReducer, initialFitCheckState } from "./fitCheckState"
import { BodyText, ConsoleList, EyebrowLabel, Panel, SectionHeading, TagList, themeStyles } from "./theme"

const rolePresets = [
  "Senior AI Infrastructure Engineer focused on agent runtimes, evaluation pipelines, and production MCP integrations.",
  "Founding Engineer, Agent Systems building memory-aware coding tools, retrieval workflows, and local-first developer infrastructure.",
  "ML Platform Engineer - Retrieval & Memory owning vector search, context engineering, observability, and applied LLM reliability.",
]

export function FitCheckTab({ app }: { app: App }) {
  const [state, dispatch] = useReducer(fitCheckReducer, initialFitCheckState)
  const [roleDescription, setRoleDescription] = useState("")

  const runFitCheck = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    dispatch({ type: "submit", roleDescription: trimmed })
    try {
      const brief = await getRecruiterBrief(app, trimmed)
      dispatch({ type: "resolved", brief })
    } catch (err) {
      dispatch({ type: "rejected", message: err instanceof Error ? err.message : "Something went wrong." })
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void runFitCheck(roleDescription)
  }

  const handleRetry = () => {
    const lastRoleDescription = state.status === "error" ? state.roleDescription : roleDescription
    void runFitCheck(lastRoleDescription)
  }

  const handleOpenLink = (url: string) => {
    void app.openLink({ url })
  }

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <Panel accent="cyan">
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.9rem" }}>
          <label style={{ display: "grid", gap: "0.55rem" }}>
            <span style={themeStyles.label}>Role description</span>
            <textarea
              value={roleDescription}
              onChange={(event) => setRoleDescription(event.target.value)}
              placeholder="Paste a role description..."
              rows={5}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="primary-button" type="submit" disabled={state.status === "loading"}>
              Check fit
            </button>
          </div>
        </form>
      </Panel>

      {state.status === "empty" && (
        <Panel accent="green">
          <EyebrowLabel>Examples</EyebrowLabel>
          <SectionHeading style={{ fontSize: "1.35rem" }}>Start from a realistic hiring brief</SectionHeading>
          <BodyText style={{ marginTop: "0.7rem" }}>Pick a preset to populate the role field, then press Check fit.</BodyText>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "1rem" }}>
            {rolePresets.map((preset) => (
              <button className="pill-button" key={preset} type="button" onClick={() => setRoleDescription(preset)}>
                {preset.split(" focused ")[0].split(" building ")[0].split(" owning ")[0]}
              </button>
            ))}
          </div>
        </Panel>
      )}
      {state.status === "loading" && (
        <Panel accent="green">
          <EyebrowLabel>Working</EyebrowLabel>
          <BodyText>Checking fit...</BodyText>
        </Panel>
      )}

      {state.status === "error" && (
        <Panel accent="cyan">
          <EyebrowLabel>Error</EyebrowLabel>
          <BodyText role="alert">{state.message}</BodyText>
          <button className="secondary-button" type="button" onClick={handleRetry} style={{ marginTop: "1rem" }}>
            Retry
          </button>
        </Panel>
      )}

      {state.status === "results" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <Panel accent="cyan">
            <EyebrowLabel>Fit summary</EyebrowLabel>
            <SectionHeading style={{ fontSize: "1.35rem" }}>{state.brief.fitSummary}</SectionHeading>
          </Panel>

          {state.brief.evidence.length === 0 ? (
            <Panel accent="slate">
              <BodyText>No strong public evidence matched this role.</BodyText>
            </Panel>
          ) : (
            <div style={themeStyles.cardGrid}>
              {state.brief.evidence.map((item) => (
                <Panel accent="slate" key={item.url}>
                  <button className="title-button" type="button" onClick={() => handleOpenLink(item.url)}>
                    {item.title}
                  </button>
                  <BodyText style={{ marginTop: "0.65rem" }}>{item.matchReason}</BodyText>
                  {item.tags.length > 0 ? (
                    <div style={{ marginTop: "0.9rem" }}>
                      <TagList items={item.tags} />
                    </div>
                  ) : null}
                </Panel>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <Panel accent="green">
              <EyebrowLabel>Interview topics</EyebrowLabel>
              <ConsoleList items={state.brief.interviewTopics} />
            </Panel>
            <Panel accent="slate">
              <EyebrowLabel>Gaps</EyebrowLabel>
              <ConsoleList items={state.brief.gaps} />
            </Panel>
          </div>
        </div>
      )}
    </section>
  )
}
