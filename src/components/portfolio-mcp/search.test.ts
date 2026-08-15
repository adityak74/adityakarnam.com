import { describe, expect, it } from "vitest"
import { buildPortfolioMcpData } from "./build-data"
import { searchWork } from "./search"

describe("searchWork", () => {
  const data = buildPortfolioMcpData({ generatedAt: "2026-07-19T12:00:00.000Z" })

  it("finds project matches by tag and summary", () => {
    const results = searchWork(data, { query: "MCP retrieval memory", audience: "engineer", limit: 3 })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].sourceUrls.length).toBeGreaterThan(0)
    expect(results[0].matchReason).toMatch(/matched/i)
  })

  it("returns an empty list for unrelated queries", () => {
    const results = searchWork(data, { query: "marine biology aquarium", limit: 5 })

    expect(results).toEqual([])
  })

  it("rejects empty queries", () => {
    expect(() => searchWork(data, { query: "   " })).toThrow("query is required")
  })
})
