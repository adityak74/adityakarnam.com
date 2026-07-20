import type { App } from "@modelcontextprotocol/ext-apps"
import { useReducer, useState } from "react"
import { getRecruiterBrief } from "./bridge"
import { fitCheckReducer, initialFitCheckState } from "./fitCheckState"

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
    <section>
      <form onSubmit={handleSubmit}>
        <textarea
          value={roleDescription}
          onChange={(event) => setRoleDescription(event.target.value)}
          placeholder="Paste a role description..."
          rows={4}
        />
        <button type="submit" disabled={state.status === "loading"}>
          Check fit
        </button>
      </form>

      {state.status === "empty" && <p>Paste a role description to see fit evidence.</p>}
      {state.status === "loading" && <p>Checking fit…</p>}

      {state.status === "error" && (
        <p role="alert">
          {state.message}{" "}
          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        </p>
      )}

      {state.status === "results" && (
        <div>
          <p>{state.brief.fitSummary}</p>

          {state.brief.evidence.length === 0 ? (
            <p>No strong public evidence matched this role.</p>
          ) : (
            <ul>
              {state.brief.evidence.map((item) => (
                <li key={item.url}>
                  <button type="button" onClick={() => handleOpenLink(item.url)}>
                    {item.title}
                  </button>
                  <p>{item.matchReason}</p>
                </li>
              ))}
            </ul>
          )}

          <h3>Interview topics</h3>
          <ul>
            {state.brief.interviewTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          <h3>Gaps</h3>
          <ul>
            {state.brief.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
