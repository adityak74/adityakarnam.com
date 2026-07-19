import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData, SOURCE_COMMIT_FALLBACK } from "./build-data"

describe("buildPortfolioMcpData", () => {
  it("builds the public MCP identity and version metadata", () => {
    const data = buildPortfolioMcpData({
      generatedAt: "2026-07-19T12:00:00.000Z",
      sourceCommit: "abc1234",
    })

    expect(data.name).toBe("aditya-portfolio")
    expect(data.transport).toBe("http")
    expect(data.mcpUrl).toBe("https://adityakarnam.com/mcp")
    expect(data.installPageUrl).toBe("https://adityakarnam.com/mcp-install/")
    expect(data.healthUrl).toBe("https://adityakarnam.com/mcp-health")
    expect(data.dataVersion).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
    expect(data.generatedAt).toBe("2026-07-19T12:00:00.000Z")
    expect(data.sourceCommit).toBe("abc1234")
  })

  it("declares public data scope and private exclusions", () => {
    const data = buildPortfolioMcpData()

    expect(data.dataScope.exposes).toContain("public projects")
    expect(data.dataScope.doesNotExpose).toContain("private files")
    expect(data.dataScope.doesNotExpose).toContain("compensation")
    expect(data.dataScope.doesNotExpose).toContain("immigration status")
  })

  it("normalizes systems into source-cited projects", () => {
    const data = buildPortfolioMcpData()
    const project = data.projects.find((entry) => entry.name === "embenx")

    expect(project).toBeDefined()
    expect(project?.canonicalUrl).toBe("https://adityakarnam.com/embenx-python-embedding-toolkit/")
    expect(project?.sourceUrls).toContain(project?.canonicalUrl)
    expect(project?.tags).toContain("retrieval")
  })

  it("falls back to unknown source commit", () => {
    const data = buildPortfolioMcpData({ sourceCommit: undefined })

    expect(data.sourceCommit).toBe(SOURCE_COMMIT_FALLBACK)
  })
})
