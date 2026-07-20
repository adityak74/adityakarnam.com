import type { App } from "@modelcontextprotocol/ext-apps"
import { useEffect, useReducer, useState } from "react"
import { getProject, listProjects } from "./bridge"
import { ProjectDetail } from "./ProjectDetail"
import { initialProjectsState, projectsReducer } from "./projectsState"
import { BodyText, EyebrowLabel, Panel, StatusRow, TagList, themeStyles } from "./theme"

export function ProjectsTab({ app }: { app: App }) {
  const [state, dispatch] = useReducer(projectsReducer, initialProjectsState)
  const [tagFilter, setTagFilter] = useState("")

  useEffect(() => {
    let cancelled = false
    dispatch({ type: "list/request" })
    listProjects(app)
      .then((result) => {
        if (!cancelled) dispatch({ type: "list/resolved", projects: result.projects })
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: "list/rejected", message: err instanceof Error ? err.message : "Something went wrong." })
      })
    return () => {
      cancelled = true
    }
  }, [app])

  const handleSelectProject = async (slugOrName: string) => {
    dispatch({ type: "detail/request", slugOrName })
    try {
      const result = await getProject(app, slugOrName)
      if (result.found) {
        dispatch({ type: "detail/found", project: result.project })
      } else {
        dispatch({ type: "detail/not-found", suggestions: result.suggestions })
      }
    } catch (err) {
      dispatch({ type: "detail/rejected", message: err instanceof Error ? err.message : "Something went wrong." })
    }
  }

  const handleOpenLink = (url: string) => {
    void app.openLink({ url })
  }

  const visibleProjects =
    state.list.status === "results"
      ? state.list.projects.filter((project) =>
          tagFilter.trim() === ""
            ? true
            : project.tags.some((tag) => tag.toLowerCase().includes(tagFilter.trim().toLowerCase()))
        )
      : []

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <Panel accent="cyan">
        <label style={{ display: "grid", gap: "0.55rem" }}>
          <span style={themeStyles.label}>Tag filter</span>
          <input
            type="text"
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            placeholder="Filter by tag..."
          />
        </label>
      </Panel>

      {state.list.status === "loading" && (
        <Panel accent="green">
          <BodyText>Loading projects...</BodyText>
        </Panel>
      )}
      {state.list.status === "error" && (
        <Panel accent="cyan">
          <BodyText role="alert">{state.list.message}</BodyText>
        </Panel>
      )}
      {state.list.status === "results" && visibleProjects.length === 0 && (
        <Panel accent="slate">
          <BodyText>No projects match this filter.</BodyText>
        </Panel>
      )}

      {state.list.status === "results" && (
        <div style={themeStyles.cardGrid}>
          {visibleProjects.map((project) => (
            <Panel accent="slate" key={project.slug}>
              <button className="title-button" type="button" onClick={() => void handleSelectProject(project.slug)}>
                {project.name}
              </button>
              {project.tags.length > 0 ? (
                <div style={{ marginTop: "0.85rem" }}>
                  <TagList items={project.tags} />
                </div>
              ) : null}
              <div style={{ marginTop: "0.9rem" }}>
                <StatusRow label="Status" value={project.status} />
              </div>
              <BodyText style={{ marginTop: "0.9rem" }}>{project.systemBuilt}</BodyText>
            </Panel>
          ))}
        </div>
      )}

      <ProjectDetail state={state.detail} onOpenLink={handleOpenLink} onClose={() => dispatch({ type: "detail/close" })} />
    </section>
  )
}
