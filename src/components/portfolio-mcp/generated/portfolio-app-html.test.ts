import { describe, expect, it } from "vitest"
import { PORTFOLIO_APP_HTML } from "./portfolio-app-html"

describe("PORTFOLIO_APP_HTML", () => {
  it("is a non-empty self-contained HTML document", () => {
    expect(PORTFOLIO_APP_HTML).toContain("<div id=\"root\">")
    expect(PORTFOLIO_APP_HTML).toContain("<script")
  })

  it("does not reference external script or stylesheet origins", () => {
    expect(PORTFOLIO_APP_HTML).not.toMatch(/src="https?:\/\//)
    expect(PORTFOLIO_APP_HTML).not.toMatch(/href="https?:\/\//)
  })
})
