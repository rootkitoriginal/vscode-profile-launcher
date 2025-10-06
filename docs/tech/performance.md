# Performance Optimization

## Overview

This document outlines performance optimization strategies for the VS Code Profile Launcher, covering database operations, API calls, UI rendering, and resource management.

## Performance Targets

### Application Startup
- **Cold start**: < 2 seconds
- **Warm start**: < 500ms
- **Profile listing**: < 100ms

### Database Operations
- **Read operations**: < 10ms
- **Write operations**: < 50ms
- **Batch operations**: < 100ms

### UI Responsiveness
- **UI update**: < 16ms (60 FPS)
- **Search results**: < 200ms
- **Profile launch**: < 3 seconds

### Memory Usage
- **Idle**: < 100MB
- **Active**: < 200MB
- **With VS Code running**: < 300MB

## Database Performance

### 1. Use Prepared Statements

Always use prepared statements for repeated queries:

```typescript
// ✅ Good - Prepared statement (cached)
export class DatabaseService {
    private getProfileStmt: Database.Statement;
    
    constructor() {
        this.db = new Database(dbPath);
        this.getProfileStmt = this.db.prepare('SELECT * FROM profiles WHERE id = ?');
    }
    
    public getProfile(id: number): Profile | null {
        const row = this.getProfileStmt.get(id);
        return row ? this.mapRowToProfile(row) : null;
    }
}

// ❌ Bad - Creates new statement each time
public getProfile(id: number): Profile | null {
    const row = this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    return row ? this.mapRowToProfile(row) : null;
}
```

**Performance Gain**: 30-50% faster for repeated queries

### 2. Use Transactions for Batch Operations

```typescript
// ✅ Good - Transaction for batch insert
public createMultipleProfiles(profiles: CreateProfileData[]): Profile[] {
    const insert = this.db.prepare(`
        INSERT INTO profiles (name, language) VALUES (?, ?)
    `);
    
    const insertMany = this.db.transaction((items: CreateProfileData[]) => {
        const created: Profile[] = [];
        for (const item of items) {
            const result = insert.run(item.name, item.language);
            created.push(this.getProfile(result.lastInsertRowid as number)!);
        }
        return created;
    });
    
    return insertMany(profiles);
}

// ❌ Bad - Individual inserts
public createMultipleProfiles(profiles: CreateProfileData[]): Profile[] {
    return profiles.map(p => this.createProfile(p));
}
```

**Performance Gain**: 10-100x faster for bulk operations

### 3. Add Indexes for Frequent Queries

```sql
-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);
CREATE INDEX IF NOT EXISTS idx_profiles_lastUsed ON profiles(lastUsed DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(createdAt DESC);
```

**Query Performance**:
- Without index: O(n) - full table scan
- With index: O(log n) - binary search

### 4. Enable WAL Mode

Write-Ahead Logging improves concurrency:

```typescript
constructor() {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
}
```

**Benefits**:
- Better concurrent read/write performance
- Faster commits
- Reduced lock contention

### 5. Optimize Queries

```typescript
// ✅ Good - Select only needed columns
public getProfileNames(): Array<{ id: number; name: string }> {
    return this.db.prepare('SELECT id, name FROM profiles').all();
}

// ❌ Bad - Select all columns
public getProfileNames(): Array<{ id: number; name: string }> {
    return this.db.prepare('SELECT * FROM profiles').all();
}
```

## Caching Strategy

### 1. In-Memory Cache

```typescript
// src/utils/cache.ts
export class Cache<T> {
    private cache: Map<string, { data: T; timestamp: number }> = new Map();
    private ttl: number;
    
    constructor(ttlMs: number = 60000) {
        this.ttl = ttlMs;
    }
    
    public get(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) return null;
        
        const age = Date.now() - entry.timestamp;
        if (age > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }
    
    public set(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    public clear(): void {
        this.cache.clear();
    }
}
```

### 2. Cache Implementation

```typescript
export class ProfileController {
    private cache: Cache<Profile[]>;
    
    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
        this.cache = new Cache<Profile[]>(60000); // 1 minute TTL
    }
    
    public getAllProfiles(): Profile[] {
        const cached = this.cache.get('all-profiles');
        if (cached) {
            return cached;
        }
        
        const profiles = this.dbService.getAllProfiles();
        this.cache.set('all-profiles', profiles);
        
        return profiles;
    }
    
    public createProfile(data: CreateProfileData): Profile {
        const profile = this.dbService.createProfile(data);
        
        // Invalidate cache
        this.cache.clear();
        
        return profile;
    }
}
```

**Cache Invalidation Strategy**:
- Clear on writes (create, update, delete)
- Time-based expiration (TTL)
- Manual invalidation when needed

### 3. Memoization

```typescript
// Memoize expensive computations
import memoize from 'lodash/memoize';

const getProfilePaths = memoize((profileName: string) => {
    const baseDir = path.join(app.getPath('home'), '.vscode-profiles', profileName);
    return {
        baseDir,
        dataDir: path.join(baseDir, 'data'),
        extensionsDir: path.join(baseDir, 'extensions')
    };
});
```

## API Call Optimization

### 1. Request Debouncing

```typescript
import { debounce } from 'lodash';

// Debounce search requests
const searchProfiles = debounce((query: string) => {
    const results = profileController.searchProfiles(query);
    renderResults(results);
}, 300); // Wait 300ms after last keystroke
```

### 2. Request Batching

```typescript
// Batch multiple API requests
async function fetchMultipleRepos(repoIds: string[]) {
    // Instead of individual requests
    const promises = repoIds.map(id => githubService.getRepo(id));
    return Promise.all(promises);
}
```

### 3. Parallel Requests

```typescript
// Execute independent requests in parallel
async function initializeApp() {
    const [profiles, config, providers] = await Promise.all([
        profileController.getAllProfiles(),
        settingsController.getConfig(),
        aiController.getAvailableProviders()
    ]);
    
    return { profiles, config, providers };
}
```

### 4. Request Caching

```typescript
class GitHubService {
    private repoCache: Cache<any>;
    
    async getRepository(owner: string, repo: string) {
        const cacheKey = `${owner}/${repo}`;
        const cached = this.repoCache.get(cacheKey);
        
        if (cached) return cached;
        
        const data = await this.octokit.repos.get({ owner, repo });
        this.repoCache.set(cacheKey, data);
        
        return data;
    }
}
```

## UI Performance

### 1. Virtual Scrolling

For large lists, implement virtual scrolling:

```javascript
// Only render visible items
class ProfileList {
    renderVisibleProfiles() {
        const scrollTop = this.container.scrollTop;
        const visibleHeight = this.container.clientHeight;
        const itemHeight = 100; // pixels
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.ceil((scrollTop + visibleHeight) / itemHeight);
        
        const visibleProfiles = this.profiles.slice(startIndex, endIndex + 1);
        this.render(visibleProfiles, startIndex * itemHeight);
    }
}
```

### 2. Lazy Loading

Load Monaco Editor on demand:

```javascript
async function loadMonacoEditor() {
    if (!window.monaco) {
        // Load only when needed
        await import('monaco-editor');
    }
    return window.monaco;
}
```

### 3. DOM Optimization

```javascript
// ✅ Good - Batch DOM updates
function updateProfiles(profiles) {
    const fragment = document.createDocumentFragment();
    profiles.forEach(profile => {
        const element = createProfileElement(profile);
        fragment.appendChild(element);
    });
    container.appendChild(fragment);
}

// ❌ Bad - Individual DOM updates
function updateProfiles(profiles) {
    profiles.forEach(profile => {
        const element = createProfileElement(profile);
        container.appendChild(element); // Triggers reflow each time
    });
}
```

### 4. Event Delegation

```javascript
// ✅ Good - Single event listener
container.addEventListener('click', (e) => {
    if (e.target.matches('.launch-button')) {
        const profileId = e.target.dataset.profileId;
        launchProfile(profileId);
    }
});

// ❌ Bad - Multiple event listeners
profiles.forEach(profile => {
    const button = document.querySelector(`#launch-${profile.id}`);
    button.addEventListener('click', () => launchProfile(profile.id));
});
```

### 5. RequestAnimationFrame

```javascript
// Smooth animations using RAF
function animateProgress(target) {
    let current = 0;
    
    function step() {
        current += 1;
        progressBar.style.width = `${current}%`;
        
        if (current < target) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}
```

## Memory Management

### 1. Cleanup Event Listeners

```typescript
export class ProfileComponent {
    private listeners: Array<() => void> = [];
    
    constructor() {
        const handler = () => this.handleClick();
        button.addEventListener('click', handler);
        
        // Store cleanup function
        this.listeners.push(() => {
            button.removeEventListener('click', handler);
        });
    }
    
    public destroy(): void {
        // Clean up all listeners
        this.listeners.forEach(cleanup => cleanup());
        this.listeners = [];
    }
}
```

### 2. Close Database Connections

```typescript
// Always close when done
process.on('beforeExit', () => {
    db.close();
});

// Or use try-finally
function performDatabaseOperation() {
    const db = new Database(dbPath);
    try {
        // Operations
    } finally {
        db.close();
    }
}
```

### 3. Limit Cache Size

```typescript
export class LRUCache<T> {
    private maxSize: number;
    private cache: Map<string, T>;
    
    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    public set(key: string, value: T): void {
        // Remove oldest entry if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }
}
```

### 4. Lazy Initialization

```typescript
export class AIService {
    private _geminiClient: GoogleGenerativeAI | null = null;
    
    private get geminiClient(): GoogleGenerativeAI {
        if (!this._geminiClient) {
            const key = this.config.getApiKey('gemini');
            if (key) {
                this._geminiClient = new GoogleGenerativeAI(key);
            }
        }
        return this._geminiClient!;
    }
}
```

## Profiling and Monitoring

### 1. Performance Timing

```typescript
export class PerformanceMonitor {
    private timers: Map<string, number> = new Map();
    
    public start(label: string): void {
        this.timers.set(label, Date.now());
    }
    
    public end(label: string): number {
        const start = this.timers.get(label);
        if (!start) return 0;
        
        const duration = Date.now() - start;
        this.timers.delete(label);
        
        console.log(`${label}: ${duration}ms`);
        return duration;
    }
}

// Usage
const perf = new PerformanceMonitor();
perf.start('loadProfiles');
const profiles = await getAllProfiles();
perf.end('loadProfiles'); // Logs: loadProfiles: 45ms
```

### 2. Memory Profiling

```typescript
function logMemoryUsage() {
    const usage = process.memoryUsage();
    console.log({
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`
    });
}
```

### 3. Database Query Profiling

```typescript
export class DatabaseService {
    private logQuery(query: string, startTime: number): void {
        const duration = Date.now() - startTime;
        
        if (duration > 100) {
            console.warn(`Slow query (${duration}ms): ${query}`);
        }
    }
    
    public getProfile(id: number): Profile | null {
        const start = Date.now();
        const result = this.getProfileStmt.get(id);
        this.logQuery('getProfile', start);
        
        return result ? this.mapRowToProfile(result) : null;
    }
}
```

## Optimization Checklist

### Database
- [ ] Use prepared statements
- [ ] Enable WAL mode
- [ ] Add indexes for frequent queries
- [ ] Use transactions for batch operations
- [ ] Optimize query patterns

### Caching
- [ ] Implement memory cache with TTL
- [ ] Cache API responses
- [ ] Memoize expensive calculations
- [ ] Invalidate cache on updates
- [ ] Limit cache size

### API Calls
- [ ] Debounce frequent requests
- [ ] Batch related requests
- [ ] Execute independent requests in parallel
- [ ] Implement request caching
- [ ] Handle rate limits

### UI
- [ ] Use virtual scrolling for large lists
- [ ] Lazy load heavy components
- [ ] Batch DOM updates
- [ ] Use event delegation
- [ ] Optimize animations with RAF

### Memory
- [ ] Clean up event listeners
- [ ] Close database connections
- [ ] Limit cache size
- [ ] Lazy initialize services
- [ ] Monitor memory usage

## Performance Testing

### Benchmark Suite

```typescript
// tests/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
    it('should load 1000 profiles in < 100ms', () => {
        const start = Date.now();
        const profiles = db.getAllProfiles();
        const duration = Date.now() - start;
        
        expect(profiles.length).toBe(1000);
        expect(duration).toBeLessThan(100);
    });
    
    it('should search profiles in < 50ms', () => {
        const start = Date.now();
        const results = controller.searchProfiles('test');
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(50);
    });
});
```

### Load Testing

```typescript
async function loadTest() {
    const operations = 1000;
    const start = Date.now();
    
    for (let i = 0; i < operations; i++) {
        await controller.getAllProfiles();
    }
    
    const duration = Date.now() - start;
    const opsPerSec = operations / (duration / 1000);
    
    console.log(`${opsPerSec.toFixed(0)} operations/second`);
}
```

## Common Performance Issues

### Issue: Slow Profile Listing

**Cause**: Loading all profiles with full data

**Solution**: 
```typescript
// Load minimal data first
public getProfileSummaries() {
    return this.db.prepare(`
        SELECT id, name, language, lastUsed
        FROM profiles
        ORDER BY lastUsed DESC
    `).all();
}
```

### Issue: UI Freezing During Search

**Cause**: Synchronous search blocking UI thread

**Solution**:
```typescript
// Debounce and use async
const debouncedSearch = debounce(async (query) => {
    const results = await searchProfiles(query);
    updateUI(results);
}, 300);
```

### Issue: High Memory Usage

**Cause**: Caching too much data

**Solution**:
```typescript
// Implement LRU cache with size limit
const cache = new LRUCache(100); // Max 100 items
```

## Related Documentation

- [Build Process](./build-process.md)
- [Testing Strategy](./testing-strategy.md)
- [Database Schema](../api/database-schema.md)

---

**Optimize Early, Optimize Often!** ⚡
