type KVNamespace = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
}

export const checkRateLimit = async (
  kv: KVNamespace | undefined,
  clientId: string,
  opts: { limit?: number; windowSeconds?: number } = {}
): Promise<RateLimitResult> => {
  const limit = opts.limit ?? 60
  const windowSeconds = opts.windowSeconds ?? 60

  if (!kv) return { allowed: true, remaining: limit }

  try {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const windowStart = Math.floor(nowSeconds / windowSeconds) * windowSeconds
    const key = `ratelimit:${clientId}:${windowStart}`
    const current = Number.parseInt((await kv.get(key)) ?? "0", 10)

    if (current >= limit) return { allowed: false, remaining: 0 }

    const next = current + 1
    const expirationTtl = Math.max(1, windowStart + windowSeconds - nowSeconds + 5)
    await kv.put(key, String(next), { expirationTtl })

    return { allowed: true, remaining: Math.max(0, limit - next) }
  } catch (_error) {
    return { allowed: true, remaining: limit }
  }
}
