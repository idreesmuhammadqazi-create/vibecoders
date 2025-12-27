import { CacheEntry } from './types'

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours

  set(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager()

// Generate cache key
export function generateCacheKey(prefix: string, ...args: any[]): string {
  return `${prefix}:${args.join(':')}`
}
