/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

export class Cache<T = any> {
    private cache: Map<string, CacheEntry<T>> = new Map();
    private defaultTTL: number;

    constructor(defaultTTL: number = 5 * 60 * 1000) {
        // Default 5 minutes
        this.defaultTTL = defaultTTL;
    }

    /**
     * Set a value in cache with optional TTL
     */
    set(key: string, value: T, ttl?: number): void {
        const expiry = Date.now() + (ttl ?? this.defaultTTL);
        this.cache.set(key, { value, expiry });
    }

    /**
     * Get a value from cache
     */
    get(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete a key from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get or set pattern - get value or compute and cache it
     */
    async getOrSet(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        expired: number;
    } {
        let expired = 0;
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                expired++;
            }
        }

        return {
            size: this.cache.size,
            expired,
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }
}

// Export singleton instance for global use
export const globalCache = new Cache();
