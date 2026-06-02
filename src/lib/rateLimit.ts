interface Entry { count: number; resetAt: number }

// In-memory store — resets per cold start (adequate for Vercel serverless scale)
const store = new Map<string, Entry>()

/**
 * Returns true when the request is allowed, false when the limit is exceeded.
 * @param key      Identifier (e.g. IP address)
 * @param limit    Maximum requests allowed within the window (default: 5)
 * @param windowMs Time window in milliseconds (default: 60 s)
 */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
