import { describe, expect, it } from "vitest"
import { openSourceImpact } from "./impact"

describe("openSourceImpact", () => {
  it("keeps the portfolio's adoption, upstream trust, and technical depth claims distinct", () => {
    expect(openSourceImpact.snapshotLabel).toContain("September 2026")
    expect(openSourceImpact.heroMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: "78K+", label: "monthly PyPI downloads" }),
        expect.objectContaining({ value: "320+", label: "GitHub stars" }),
        expect.objectContaining({ value: "190+", label: "public repositories" }),
      ]),
    )
    expect(openSourceImpact.featuredProject).toMatchObject({
      name: "mcp-scholarly",
      metrics: ["78K+ monthly PyPI downloads", "~180 GitHub stars", "26+ forks"],
    })
    expect(openSourceImpact.upstreamProjects).toContain("MLX-LM")
    expect(openSourceImpact.technicalDepth).toMatchObject({
      name: "Quecto, Embenx, and Subagent Fleet",
    })
  })
})
