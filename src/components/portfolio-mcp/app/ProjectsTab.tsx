import type { App } from "@modelcontextprotocol/ext-apps"
import { useEffect, useReducer, useState } from "react"
import { getProject, listProjects } from "./bridge"
import { ProjectDetail } from "./ProjectDetail"
import { initialProjectsState, projectsReducer } from "./projectsState"

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
    <section>
      <input
        type="text"
        value={tagFilter}
        onChange={(event) => setTagFilter(event.target.value)}
        placeholder="Filter by tag..."
      />

      {state.list.status === "loading" && <p>Loading projects…</p>}
      {state.list.status === "error" && <p role="alert">{state.list.message}</p>}
      {state.list.status === "results" && visibleProjects.length === 0 && <p>No projects match this filter.</p>}

      {state.list.status === "results" && (
        <ul>
          {visibleProjects.map((project) => (
            <li key={project.slug}>
              <button type="button" onClick={() => void handleSelectProject(project.slug)}>
                {project.name}
              </button>
              <p>{project.systemBuilt}</p>
            </li>
          ))}
        </ul>
      )}

      <ProjectDetail state={state.detail} onOpenLink={handleOpenLink} onClose={() => dispatch({ type: "detail/close" })} />
    </section>
  )
}
