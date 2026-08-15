import type { ProjectDetailState } from "./projectsState"
import { BodyText, ConsoleList, EyebrowLabel, Panel, SectionHeading } from "./theme"

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
    <Panel accent={state.status === "found" ? "cyan" : "slate"}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.85rem" }}>
        <button className="secondary-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {state.status === "loading" && <BodyText>Loading project...</BodyText>}
      {state.status === "error" && <BodyText role="alert">{state.message}</BodyText>}

      {state.status === "not-found" && (
        <div>
          <EyebrowLabel>Not found</EyebrowLabel>
          <BodyText>Project not found.</BodyText>
          {state.suggestions.length > 0 ? (
            <div style={{ marginTop: "1rem" }}>
              <ConsoleList items={state.suggestions.map((suggestion) => suggestion.name)} />
            </div>
          ) : null}
        </div>
      )}

      {state.status === "found" && (
        <div>
          <EyebrowLabel>Project detail</EyebrowLabel>
          <SectionHeading>{state.project.name}</SectionHeading>
          <BodyText style={{ marginTop: "0.9rem" }}>{state.project.whyItMatters}</BodyText>
          <BodyText style={{ marginTop: "0.9rem" }}>{state.project.recruiterFraming}</BodyText>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "1rem" }}>
            {state.project.links.map((link) => (
              <button className="pill-button" key={link.href} type="button" onClick={() => onOpenLink(link.href)}>
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}
