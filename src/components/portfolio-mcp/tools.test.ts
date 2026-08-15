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

  it("lists Thoughts posts without shipping full bodies", () => {
    const result = tools.list_thoughts({ limit: 5 })

    expect(result.posts.length).toBe(5)
    expect(result.total).toBeGreaterThanOrEqual(result.posts.length)
    expect(result.posts.every((post) => post.url.startsWith("https://adityakarnam.com/"))).toBe(true)
    expect(result.posts.every((post) => !("body" in post))).toBe(true)
  })

  it("filters Thoughts posts by tag and query", () => {
    const tagged = tools.list_thoughts({ tags: ["mcp"] })
    expect(tagged.posts.length).toBeGreaterThan(0)
    expect(tagged.posts.every((post) => post.tags.map((tag) => tag.toLowerCase()).includes("mcp"))).toBe(true)

    const queried = tools.list_thoughts({ query: "harness" })
    expect(queried.posts.length).toBeGreaterThan(0)
  })

  it("returns the full text of one post by slug", () => {
    const result = tools.get_thought({ slug_or_title: "portfolio-mcp-server" })

    expect(result.found).toBe(true)
    expect(result.post?.title).toContain("MCP Server")
    expect(result.post?.body.length).toBeGreaterThan(500)
  })

  it("resolves a post by title and reports misses with suggestions", () => {
    expect(tools.get_thought({ slug_or_title: "I Turned My Portfolio Into an MCP Server (And Gave It a UI)" }).found).toBe(true)

    const miss = tools.get_thought({ slug_or_title: "no-such-post" })
    expect(miss.found).toBe(false)
    expect(miss.suggestions?.length).toBeGreaterThan(0)
  })

  it("filters recent work down to blog posts", () => {
    const result = tools.get_recent_work({ type: "post", limit: 30 })

    expect(result.recentWork.length).toBeGreaterThan(0)
    expect(result.recentWork.every((item) => item.type === "post")).toBe(true)
  })

  it("returns recruiter brief evidence with citations and gaps", () => {
    const result = tools.get_recruiter_brief({ role_description: "AI infrastructure engineer MCP retrieval evals" })

    expect(result.evidence.length).toBeGreaterThan(0)
    expect(result.evidence.every((entry) => entry.sourceUrls.length > 0)).toBe(true)
    expect(Array.isArray(result.gaps)).toBe(true)
  })
})
