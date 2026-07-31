import 'server-only'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Check if a key (e.g. IP address) has exceeded the rate limit.
 * @param key      Unique identifier (IP, user ID, etc.)
 * @param limit    Maximum number of requests allowed per window
 * @param windowMs Window duration in milliseconds
 * @returns        { allowed: boolean; remaining: number; resetAt: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
