import { describe, it, expect } from "vitest"
import { checkRateLimit } from "./rate-limiter"

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const clientId = "client-a"
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(clientId)).toBe(true)
    }
  })

  it("blocks the 21st request within the same window", () => {
    const clientId = "client-b"
    for (let i = 0; i < 20; i++) {
      checkRateLimit(clientId)
    }
    expect(checkRateLimit(clientId)).toBe(false)
  })

  it("allows requests again once the window has passed", () => {
    const clientId = "client-c"
    const start = Date.now()
    for (let i = 0; i < 20; i++) {
      checkRateLimit(clientId, start)
    }
    expect(checkRateLimit(clientId, start)).toBe(false)
    expect(checkRateLimit(clientId, start + 1000 * 60 * 11)).toBe(true)
  })
})
