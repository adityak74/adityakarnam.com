import { describe, it, expect } from "vitest"
import { VISITOR_LENSES, LENS_FALLBACKS, DEFAULT_FALLBACK_SOURCES, buildSystemMessage } from "./hero-chat-types"

describe("hero-chat-types", () => {
  it("has a fallback for every visitor lens", () => {
    for (const lens of VISITOR_LENSES) {
      expect(LENS_FALLBACKS[lens]).toBeTruthy()
    }
  })

  it("provides at least one default fallback source", () => {
    expect(DEFAULT_FALLBACK_SOURCES.length).toBeGreaterThan(0)
  })

  it("builds a system message that mentions the persona's guidance and grounded-answer rules", () => {
    const message = buildSystemMessage("Frontier Lab Recruiter")

    expect(message.role).toBe("system")
    expect(message.content).toContain("recruiter")
    expect(message.content.toLowerCase()).toContain("do not invent")
  })
})
