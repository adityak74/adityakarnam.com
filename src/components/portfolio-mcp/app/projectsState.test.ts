import { describe, expect, it } from "vitest"
import type { PortfolioProject } from "../schema"
import { initialProjectsState, projectsReducer } from "./projectsState"

const project: PortfolioProject = {
  name: "Example System",
  slug: "example-system",
  tags: ["agents"],
  status: "active",
  researchQuestion: "?",
  systemBuilt: "A system.",
  whyItMatters: "It matters.",
  canonicalUrl: "https://adityakarnam.com/example-system/",
  links: [],
  explanationModes: {},
  recruiterFraming: "Evidence of agents work.",
  sourceUrls: ["https://adityakarnam.com/example-system/"],
}

describe("projectsReducer", () => {
  it("starts with the list loading and detail idle", () => {
    expect(initialProjectsState).toEqual({ list: { status: "loading" }, detail: { status: "idle" } })
  })

  it("resolves the list", () => {
    const next = projectsReducer(initialProjectsState, { type: "list/resolved", projects: [project] })
    expect(next.list).toEqual({ status: "results", projects: [project] })
  })

  it("rejects the list", () => {
    const next = projectsReducer(initialProjectsState, { type: "list/rejected", message: "Rate limit exceeded." })
    expect(next.list).toEqual({ status: "error", message: "Rate limit exceeded." })
  })

  it("opens a detail panel while loading", () => {
    const next = projectsReducer(initialProjectsState, { type: "detail/request", slugOrName: "example-system" })
    expect(next.detail).toEqual({ status: "loading", slugOrName: "example-system" })
  })

  it("shows a found project detail", () => {
    const next = projectsReducer(initialProjectsState, { type: "detail/found", project })
    expect(next.detail).toEqual({ status: "found", project })
  })

  it("shows not-found suggestions", () => {
    const suggestions = [{ name: "Example System", slug: "example-system" }]
    const next = projectsReducer(initialProjectsState, { type: "detail/not-found", suggestions })
    expect(next.detail).toEqual({ status: "not-found", suggestions })
  })

  it("closes the detail panel", () => {
    const opened = projectsReducer(initialProjectsState, { type: "detail/found", project })
    expect(projectsReducer(opened, { type: "detail/close" }).detail).toEqual({ status: "idle" })
  })
})
