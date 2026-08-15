const WINDOW_MS = 1000 * 60 * 10
const MAX_REQUESTS_PER_WINDOW = 20

const requestLog = new Map<string, number[]>()

export const checkRateLimit = (clientId: string, now: number = Date.now()): boolean => {
  const timestamps = (requestLog.get(clientId) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(clientId, timestamps)
    return false
  }

  timestamps.push(now)
  requestLog.set(clientId, timestamps)
  return true
}
