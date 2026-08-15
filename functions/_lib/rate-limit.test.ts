import { describe, expect, it } from "vitest"
import { checkRateLimit } from "./rate-limit"

class FakeKv {
  values = new Map<string, string>()

  async get(key: string) {
    return this.values.get(key) ?? null
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }) {
    // Mirrors Cloudflare KV's real constraint: writes with too small a TTL are rejected.
    if (options?.expirationTtl !== undefined && options.expirationTtl < 60) {
      throw new Error(`KV PUT failed: 400 Invalid expiration_ttl of ${options.expirationTtl}. Expiration TTL must be at least 60.`)
    }
    this.values.set(key, value)
  }
}

describe("checkRateLimit", () => {
  it("fails open when KV is undefined", async () => {
    await expect(checkRateLimit(undefined, "198.51.100.10", { limit: 1 })).resolves.toMatchObject({
      allowed: true,
    })
  })

  it("allows requests under the limit and increments the current window counter", async () => {
    const kv = new FakeKv()

    const first = await checkRateLimit(kv, "198.51.100.11", { limit: 2, windowSeconds: 60 })
    const second = await checkRateLimit(kv, "198.51.100.11", { limit: 2, windowSeconds: 60 })

    expect(first.allowed).toBe(true)
    expect(first.remaining).toBe(1)
    expect(second.allowed).toBe(true)
    expect(second.remaining).toBe(0)
    expect([...kv.values.keys()][0]).toMatch(/^ratelimit:198\.51\.100\.11:\d+$/)
    expect([...kv.values.values()][0]).toBe("2")
  })

  it("denies requests once the current window reaches the limit", async () => {
    const kv = new FakeKv()

    await checkRateLimit(kv, "198.51.100.12", { limit: 2, windowSeconds: 60 })
    await checkRateLimit(kv, "198.51.100.12", { limit: 2, windowSeconds: 60 })
    const denied = await checkRateLimit(kv, "198.51.100.12", { limit: 2, windowSeconds: 60 })

    expect(denied.allowed).toBe(false)
    expect(denied.remaining).toBe(0)
  })

  it("writes a KV-accepted expirationTtl even late in the window", async () => {
    const kv = new FakeKv()
    const nowSeconds = Math.floor(Date.now() / 1000)
    const windowStart = Math.floor(nowSeconds / 60) * 60
    // Simulate being called near the end of the current 60s window, where
    // windowStart + windowSeconds - nowSeconds is small.
    const lateNowSeconds = windowStart + 55

    const originalNow = Date.now
    Date.now = () => lateNowSeconds * 1000
    try {
      const result = await checkRateLimit(kv, "198.51.100.13", { limit: 5, windowSeconds: 60 })
      expect(result.allowed).toBe(true)
      expect(kv.values.size).toBe(1)
    } finally {
      Date.now = originalNow
    }
  })
})
