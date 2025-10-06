# Database Schema

## Overview

The VS Code Profile Launcher uses SQLite as its database engine via the `better-sqlite3` library. The database stores profile configurations, settings, and metadata.

## Database Location

```typescript
const dbPath = path.join(app.getPath('userData'), 'profiles.db');
```

**Platform-specific paths:**
- **Windows**: `%APPDATA%\vscode-profile-launcher\profiles.db`
- **macOS**: `~/Library/Application Support/vscode-profile-launcher/profiles.db`
- **Linux**: `~/.config/vscode-profile-launcher/profiles.db`

## Tables

### profiles

Main table storing all VS Code profile configurations.

#### Schema

```sql
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL,
    description TEXT,
    workspacePath TEXT,
    extensions TEXT,
    aiProvider TEXT,
    aiModel TEXT,
    envVariables TEXT,
    codeTemplate TEXT,
    githubRepo TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastUsed DATETIME
);
```

#### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | INTEGER | No | Primary key, auto-incrementing |
| `name` | TEXT | No | Profile name, must be unique |
| `language` | TEXT | No | Programming language (TypeScript, Python, etc.) |
| `description` | TEXT | Yes | Optional profile description |
| `workspacePath` | TEXT | Yes | Default workspace directory path |
| `extensions` | TEXT | Yes | JSON array of VS Code extension IDs |
| `aiProvider` | TEXT | Yes | AI provider: 'gemini' or 'openai' |
| `aiModel` | TEXT | Yes | Specific AI model identifier |
| `envVariables` | TEXT | Yes | JSON object of environment variables |
| `codeTemplate` | TEXT | Yes | Default code template for new files |
| `githubRepo` | TEXT | Yes | JSON object with GitHub repository info |
| `createdAt` | DATETIME | No | Timestamp of profile creation |
| `lastUsed` | DATETIME | Yes | Last time profile was launched |

#### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);
CREATE INDEX IF NOT EXISTS idx_profiles_lastUsed ON profiles(lastUsed DESC);
```

**Purpose:**
- `idx_profiles_name`: Fast lookups by profile name
- `idx_profiles_language`: Efficient filtering by language
- `idx_profiles_lastUsed`: Quick sorting by recently used

## Data Types

### JSON Fields

Several columns store JSON data as TEXT. These are serialized/deserialized by the application:

#### extensions (JSON Array)

```json
[
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python"
]
```

#### envVariables (JSON Object)

```json
{
    "NODE_ENV": "development",
    "DEBUG": "true",
    "API_KEY": "xxx"
}
```

#### githubRepo (JSON Object)

```json
{
    "owner": "username",
    "repo": "repository-name",
    "branch": "main"
}
```

## TypeScript Mapping

### Profile Interface

```typescript
export interface Profile {
    id?: number;
    name: string;
    language: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
    createdAt?: string;
    lastUsed?: string;
}
```

### CreateProfileData Interface

```typescript
export interface CreateProfileData {
    name: string;
    language: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
}
```

### UpdateProfileData Interface

```typescript
export interface UpdateProfileData {
    name?: string;
    language?: string;
    description?: string;
    workspacePath?: string;
    extensions?: string[];
    aiProvider?: 'gemini' | 'openai';
    aiModel?: string;
    envVariables?: Record<string, string>;
    codeTemplate?: string;
    githubRepo?: GitHubRepository;
    lastUsed?: string;
}
```

## Database Operations

### Initialization

```typescript
export class DatabaseService {
    private db: Database.Database;
    
    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'profiles.db');
        this.db = new Database(dbPath);
        this.initializeDatabase();
    }
    
    private initializeDatabase(): void {
        // Create table if not exists
        this.db.exec(createTableQuery);
        
        // Run migrations if needed
        this.runMigrations();
    }
}
```

### CRUD Operations

#### Create Profile

```typescript
public createProfile(profileData: CreateProfileData): Profile {
    const stmt = this.db.prepare(`
        INSERT INTO profiles (
            name, language, description, workspacePath,
            extensions, aiProvider, aiModel, envVariables,
            codeTemplate, githubRepo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
        profileData.name,
        profileData.language,
        profileData.description || null,
        profileData.workspacePath || null,
        JSON.stringify(profileData.extensions || []),
        profileData.aiProvider || null,
        profileData.aiModel || null,
        JSON.stringify(profileData.envVariables || {}),
        profileData.codeTemplate || null,
        JSON.stringify(profileData.githubRepo || null)
    );
    
    return this.getProfile(result.lastInsertRowid as number)!;
}
```

#### Read Profile(s)

```typescript
public getAllProfiles(): Profile[] {
    const stmt = this.db.prepare('SELECT * FROM profiles ORDER BY lastUsed DESC');
    const rows = stmt.all();
    return rows.map(this.mapRowToProfile);
}

public getProfile(id: number): Profile | null {
    const stmt = this.db.prepare('SELECT * FROM profiles WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapRowToProfile(row) : null;
}
```

#### Update Profile

```typescript
public updateProfile(id: number, updates: UpdateProfileData): Profile | null {
    const profile = this.getProfile(id);
    if (!profile) return null;
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
    }
    // ... other fields
    
    if (fields.length === 0) return profile;
    
    values.push(id);
    const sql = `UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(sql).run(...values);
    
    return this.getProfile(id);
}
```

#### Delete Profile

```typescript
public deleteProfile(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM profiles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
```

### Data Transformation

#### Row to Profile Mapping

```typescript
private mapRowToProfile(row: any): Profile {
    return {
        id: row.id,
        name: row.name,
        language: row.language,
        description: row.description,
        workspacePath: row.workspacePath,
        extensions: row.extensions ? JSON.parse(row.extensions) : [],
        aiProvider: row.aiProvider,
        aiModel: row.aiModel,
        envVariables: row.envVariables ? JSON.parse(row.envVariables) : {},
        codeTemplate: row.codeTemplate,
        githubRepo: row.githubRepo ? JSON.parse(row.githubRepo) : null,
        createdAt: row.createdAt,
        lastUsed: row.lastUsed
    };
}
```

## Migrations

### Schema Versioning

```typescript
private runMigrations(): void {
    // Get current schema version
    const version = this.getSchemaVersion();
    
    if (version < 1) {
        this.migrateTo1();
    }
    if (version < 2) {
        this.migrateTo2();
    }
    // Add more migrations as needed
}
```

### Example Migration

```typescript
private migrateTo1(): void {
    // Add new columns
    const alterTableQueries = [
        'ALTER TABLE profiles ADD COLUMN aiProvider TEXT',
        'ALTER TABLE profiles ADD COLUMN aiModel TEXT',
        'ALTER TABLE profiles ADD COLUMN envVariables TEXT',
        'ALTER TABLE profiles ADD COLUMN codeTemplate TEXT',
        'ALTER TABLE profiles ADD COLUMN githubRepo TEXT',
    ];
    
    alterTableQueries.forEach(query => {
        try {
            this.db.exec(query);
        } catch (error) {
            // Column already exists, ignore
        }
    });
    
    this.setSchemaVersion(1);
}
```

### Schema Version Tracking

```sql
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Transactions

### Using Transactions

```typescript
public createMultipleProfiles(profiles: CreateProfileData[]): Profile[] {
    const transaction = this.db.transaction((profilesData: CreateProfileData[]) => {
        const created: Profile[] = [];
        for (const data of profilesData) {
            const profile = this.createProfile(data);
            created.push(profile);
        }
        return created;
    });
    
    return transaction(profiles);
}
```

**Benefits:**
- **Atomicity**: All operations succeed or all fail
- **Performance**: Much faster than individual operations
- **Consistency**: Database remains in valid state

## Query Optimization

### Prepared Statements

Always use prepared statements for security and performance:

```typescript
// ✅ Good - Prepared statement
const stmt = this.db.prepare('SELECT * FROM profiles WHERE name = ?');
const profile = stmt.get(name);

// ❌ Bad - SQL injection risk
const profile = this.db.exec(`SELECT * FROM profiles WHERE name = '${name}'`);
```

### Batch Operations

```typescript
// ✅ Good - Batch insert with transaction
const insert = this.db.prepare('INSERT INTO profiles (name, language) VALUES (?, ?)');
const insertMany = this.db.transaction((profiles) => {
    for (const p of profiles) insert.run(p.name, p.language);
});
insertMany(profilesArray);

// ❌ Bad - Individual inserts
for (const p of profilesArray) {
    this.createProfile(p); // Slow for many items
}
```

## Backup and Restore

### Create Backup

```typescript
public backupDatabase(backupPath: string): void {
    this.db.backup(backupPath);
}
```

### Restore from Backup

```typescript
public restoreDatabase(backupPath: string): void {
    this.db.close();
    fs.copyFileSync(backupPath, this.dbPath);
    this.db = new Database(this.dbPath);
}
```

### Export to JSON

```typescript
public exportProfiles(): string {
    const profiles = this.getAllProfiles();
    return JSON.stringify(profiles, null, 2);
}
```

### Import from JSON

```typescript
public importProfiles(jsonData: string): number {
    const profiles = JSON.parse(jsonData) as CreateProfileData[];
    const transaction = this.db.transaction(() => {
        profiles.forEach(p => this.createProfile(p));
    });
    transaction();
    return profiles.length;
}
```

## Performance Considerations

### 1. Use Indexes

```sql
-- Frequently queried columns should be indexed
CREATE INDEX idx_profiles_language ON profiles(language);
CREATE INDEX idx_profiles_lastUsed ON profiles(lastUsed DESC);
```

### 2. Batch Writes

```typescript
// Group multiple writes in a transaction
const insertMultiple = this.db.transaction((items) => {
    const stmt = this.db.prepare('INSERT INTO profiles ...');
    items.forEach(item => stmt.run(...item));
});
```

### 3. Limit Result Sets

```typescript
// For large datasets, use pagination
const stmt = this.db.prepare('SELECT * FROM profiles LIMIT ? OFFSET ?');
const results = stmt.all(limit, offset);
```

### 4. Use WAL Mode

```typescript
// Write-Ahead Logging for better concurrency
this.db.pragma('journal_mode = WAL');
```

## Best Practices

### 1. Always Use Transactions for Multiple Operations

```typescript
const createWithExtensions = this.db.transaction((profile, extensions) => {
    const p = this.createProfile(profile);
    extensions.forEach(ext => this.addExtension(p.id, ext));
    return p;
});
```

### 2. Handle Unique Constraints

```typescript
try {
    this.createProfile({ name: 'Existing', language: 'TypeScript' });
} catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
        throw new Error('Profile name already exists');
    }
    throw error;
}
```

### 3. Clean Up Resources

```typescript
public close(): void {
    this.db.close();
}
```

### 4. Validate Data Before Insert

```typescript
public createProfile(data: CreateProfileData): Profile {
    // Validate before database operation
    if (!data.name || data.name.length < 1) {
        throw new Error('Profile name is required');
    }
    if (data.name.length > 100) {
        throw new Error('Profile name too long');
    }
    
    return this.insertProfile(data);
}
```

## Testing

### In-Memory Database for Tests

```typescript
describe('DatabaseService', () => {
    let db: DatabaseService;
    
    beforeEach(() => {
        // Use :memory: for tests
        db = new DatabaseService(':memory:');
    });
    
    afterEach(() => {
        db.close();
    });
    
    it('should create profile', () => {
        const profile = db.createProfile({
            name: 'Test',
            language: 'TypeScript'
        });
        expect(profile.id).toBeDefined();
    });
});
```

## Security

### 1. SQL Injection Prevention

Always use parameterized queries:

```typescript
// ✅ Safe
const stmt = this.db.prepare('SELECT * FROM profiles WHERE name = ?');
stmt.get(userInput);

// ❌ Unsafe
this.db.exec(`SELECT * FROM profiles WHERE name = '${userInput}'`);
```

### 2. Data Validation

Validate all input before database operations:

```typescript
private validateProfileData(data: CreateProfileData): void {
    if (typeof data.name !== 'string') throw new Error('Invalid name');
    if (typeof data.language !== 'string') throw new Error('Invalid language');
    // ... more validation
}
```

### 3. Sanitize JSON Fields

```typescript
private sanitizeExtensions(extensions: string[]): string[] {
    return extensions.filter(ext => 
        typeof ext === 'string' && ext.length > 0
    );
}
```

## Monitoring

### Query Performance

```typescript
const start = Date.now();
const result = stmt.all();
const duration = Date.now() - start;
if (duration > 100) {
    console.warn(`Slow query: ${duration}ms`);
}
```

### Database Size

```typescript
public getDatabaseSize(): number {
    const stats = fs.statSync(this.dbPath);
    return stats.size; // bytes
}
```

## Related Documentation

- [MVC Architecture](../architecture/MVC-ARCHITECTURE.md)
- [Database Service](../../src/services/DatabaseService.ts)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## Troubleshooting

### Database Locked

```typescript
// Enable busy timeout
this.db.pragma('busy_timeout = 5000');
```

### Corrupted Database

```bash
# Check database integrity
sqlite3 profiles.db "PRAGMA integrity_check;"

# Repair if needed
sqlite3 profiles.db ".recover" | sqlite3 profiles_recovered.db
```

### Migration Issues

```typescript
// Rollback migration
private rollbackMigration(version: number): void {
    // Restore from backup
    this.restoreDatabase(`backup_v${version}.db`);
}
```
