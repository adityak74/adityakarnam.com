import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { createPortfolioTools } from "./tools"

describe("portfolio tools", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z", sourceCommit: "abc1234" })
  const tools = createPortfolioTools(data)

  it("returns profile metadata with data version", () => {
    const result = tools.get_profile({})

    expect(result.dataVersion).toBe(data.dataVersion)
    expect(result.profile.name).toBe("Aditya Karnam")
    expect(result.dataScope.doesNotExpose).toContain("private files")
  })

  it("lists projects with source URLs", () => {
    const result = tools.list_projects({ tags: ["MCP"], limit: 10 })

    expect(result.projects.length).toBeGreaterThan(0)
    expect(result.projects.every((project) => project.sourceUrls.length > 0)).toBe(true)
  })

  it("returns a structured not found project response with suggestions", () => {
    const result = tools.get_project({ slug_or_name: "does-not-exist" })

    expect(result.found).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it("returns recruiter brief evidence with citations and gaps", () => {
    const result = tools.get_recruiter_brief({ role_description: "AI infrastructure engineer MCP retrieval evals" })

    expect(result.evidence.length).toBeGreaterThan(0)
    expect(result.evidence.every((entry) => entry.sourceUrls.length > 0)).toBe(true)
    expect(Array.isArray(result.gaps)).toBe(true)
  })
})
