/**
 * Simple in-memory cache implementation for API responses
 * This helps reduce database queries for frequently accessed data
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class Cache {
    private store: Map<string, CacheEntry<any>>;

    constructor() {
        this.store = new Map();
    }

    /**
     * Set a cache entry with a specific TTL (time to live)
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.store.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * Get a cache entry if it exists and hasn't expired
     * @param key - Cache key
     * @returns Cached data or null if not found or expired
     */
    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        
        if (!entry) {
            return null;
        }

        const now = Date.now();
        const age = now - entry.timestamp;

        // Check if cache entry has expired
        if (age > entry.ttl) {
            this.store.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Invalidate a specific cache entry
     * @param key - Cache key to invalidate
     */
    invalidate(key: string): void {
        this.store.delete(key);
    }

    /**
     * Invalidate all cache entries matching a pattern
     * @param pattern - String pattern to match against keys
     */
    invalidatePattern(pattern: string): void {
        const keys = Array.from(this.store.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.store.delete(key);
            }
        });
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.store.size;
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keys = Array.from(this.store.keys());
        
        keys.forEach(key => {
            const entry = this.store.get(key);
            if (entry && (now - entry.timestamp) > entry.ttl) {
                this.store.delete(key);
            }
        });
    }
}

// Create a singleton cache instance
export const cache = new Cache();

// Run cleanup every 10 minutes to remove expired entries
setInterval(() => {
    cache.cleanup();
}, 10 * 60 * 1000);
