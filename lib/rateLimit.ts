interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly defaultRequests = parseInt(process.env.RATE_LIMIT_REQUESTS || '100')
  private readonly defaultWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000')

  isAllowed(identifier: string, requests: number = this.defaultRequests, window: number = this.defaultWindow): boolean {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + window,
      })
      return true
    }

    if (entry.count < requests) {
      entry.count++
      return true
    }

    return false
  }

  getRemainingRequests(identifier: string, requests: number = this.defaultRequests): number {
    const entry = this.limits.get(identifier)
    
    if (!entry || Date.now() > entry.resetTime) {
      return requests
    }

    return Math.max(0, requests - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier)
    return entry?.resetTime || Date.now()
  }

  reset(identifier: string): void {
    this.limits.delete(identifier)
  }

  clear(): void {
    this.limits.clear()
  }
}

export const rateLimiter = new RateLimiter()
