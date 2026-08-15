import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { buildPortfolioMcpHealth, buildPortfolioMcpManifest } from "./metadata"

describe("portfolio MCP metadata", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z", sourceCommit: "abc1234" })

  it("builds the discovery manifest", () => {
    const manifest = buildPortfolioMcpManifest(data)

    expect(manifest.name).toBe("aditya-portfolio")
    expect(manifest.mcpUrl).toBe("https://adityakarnam.com/mcp")
    expect(manifest.transport).toBe("http")
    expect(manifest.dataScope.doesNotExpose).toContain("private files")
  })

  it("builds the health response", () => {
    const health = buildPortfolioMcpHealth(data)

    expect(health.ok).toBe(true)
    expect(health.version).toBe(data.dataVersion)
    expect(health.generatedAt).toBe("2026-07-19T12:00:00.000Z")
    expect(health.tools).toContain("get_recruiter_brief")
    expect(health.resources).toContain("portfolio://profile")
  })
})
