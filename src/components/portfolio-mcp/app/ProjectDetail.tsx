import type { ProjectDetailState } from "./projectsState"

export function ProjectDetail({
  state,
  onOpenLink,
  onClose,
}: {
  state: ProjectDetailState
  onOpenLink: (url: string) => void
  onClose: () => void
}) {
  if (state.status === "idle") return null

  return (
    <div>
      <button type="button" onClick={onClose}>
        Close
      </button>

      {state.status === "loading" && <p>Loading project…</p>}
      {state.status === "error" && <p role="alert">{state.message}</p>}

      {state.status === "not-found" && (
        <div>
          <p>Project not found.</p>
          <ul>
            {state.suggestions.map((suggestion) => (
              <li key={suggestion.slug}>{suggestion.name}</li>
            ))}
          </ul>
        </div>
      )}

      {state.status === "found" && (
        <div>
          <h2>{state.project.name}</h2>
          <p>{state.project.whyItMatters}</p>
          <p>{state.project.recruiterFraming}</p>
          <ul>
            {state.project.links.map((link) => (
              <li key={link.href}>
                <button type="button" onClick={() => onOpenLink(link.href)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
