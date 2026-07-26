import { describe, expect, it } from "vitest"
import { SOURCE_COMMIT_FALLBACK } from "./build-data"
import { buildPortfolioMcpDataForRequest } from "./index"

describe("buildPortfolioMcpDataForRequest", () => {
  it("reads the source commit from CF_PAGES_COMMIT_SHA", () => {
    const data = buildPortfolioMcpDataForRequest({ CF_PAGES_COMMIT_SHA: "abc1234" })

    expect(data.sourceCommit).toBe("abc1234")
  })

  it("falls back to GITHUB_SHA when CF_PAGES_COMMIT_SHA is absent", () => {
    const data = buildPortfolioMcpDataForRequest({ GITHUB_SHA: "def5678" })

    expect(data.sourceCommit).toBe("def5678")
  })

  it("ignores blank commit values", () => {
    const data = buildPortfolioMcpDataForRequest({ CF_PAGES_COMMIT_SHA: "   ", GITHUB_SHA: "" })

    expect(data.sourceCommit).toBe(SOURCE_COMMIT_FALLBACK)
  })

  it("falls back to unknown when no env is provided", () => {
    expect(buildPortfolioMcpDataForRequest().sourceCommit).toBe(SOURCE_COMMIT_FALLBACK)
    expect(buildPortfolioMcpDataForRequest({}).sourceCommit).toBe(SOURCE_COMMIT_FALLBACK)
  })

  it("stamps generatedAt at call time rather than module load time", () => {
    const before = Date.now()
    const data = buildPortfolioMcpDataForRequest()
    const after = Date.now()

    const generatedAt = Date.parse(data.generatedAt)
    expect(Number.isNaN(generatedAt)).toBe(false)
    expect(generatedAt).toBeGreaterThanOrEqual(before - 1000)
    expect(generatedAt).toBeLessThanOrEqual(after + 1000)
  })

  it("returns a fresh object per call", () => {
    expect(buildPortfolioMcpDataForRequest()).not.toBe(buildPortfolioMcpDataForRequest())
  })
})
