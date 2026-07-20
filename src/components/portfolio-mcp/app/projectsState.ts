import type { PortfolioProject } from "../schema"

export type ProjectListState =
  | { status: "loading" }
  | { status: "results"; projects: PortfolioProject[] }
  | { status: "error"; message: string }

export type ProjectDetailState =
  | { status: "idle" }
  | { status: "loading"; slugOrName: string }
  | { status: "found"; project: PortfolioProject }
  | { status: "not-found"; suggestions: Array<{ name: string; slug: string }> }
  | { status: "error"; message: string }

export type ProjectsState = {
  list: ProjectListState
  detail: ProjectDetailState
}

export type ProjectsAction =
  | { type: "list/request" }
  | { type: "list/resolved"; projects: PortfolioProject[] }
  | { type: "list/rejected"; message: string }
  | { type: "detail/request"; slugOrName: string }
  | { type: "detail/found"; project: PortfolioProject }
  | { type: "detail/not-found"; suggestions: Array<{ name: string; slug: string }> }
  | { type: "detail/rejected"; message: string }
  | { type: "detail/close" }

export const initialProjectsState: ProjectsState = {
  list: { status: "loading" },
  detail: { status: "idle" },
}

export const projectsReducer = (state: ProjectsState, action: ProjectsAction): ProjectsState => {
  switch (action.type) {
    case "list/request":
      return { ...state, list: { status: "loading" } }
    case "list/resolved":
      return { ...state, list: { status: "results", projects: action.projects } }
    case "list/rejected":
      return { ...state, list: { status: "error", message: action.message } }
    case "detail/request":
      return { ...state, detail: { status: "loading", slugOrName: action.slugOrName } }
    case "detail/found":
      return { ...state, detail: { status: "found", project: action.project } }
    case "detail/not-found":
      return { ...state, detail: { status: "not-found", suggestions: action.suggestions } }
    case "detail/rejected":
      return { ...state, detail: { status: "error", message: action.message } }
    case "detail/close":
      return { ...state, detail: { status: "idle" } }
    default:
      return state
  }
}
