# Database Migrations

## Overview

This document describes the database migration strategy for VS Code Profile Launcher. Migrations ensure database schema changes are applied consistently across installations while preserving existing data.

## Migration System

### Architecture

```
DatabaseService
    ├── initializeDatabase()
    ├── runMigrations()
    ├── getSchemaVersion()
    ├── setSchemaVersion()
    └── migration methods (migrateTo1, migrateTo2, etc.)
```

### Schema Version Tracking

**Table: `schema_version`**

```sql
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);
```

This table tracks which migrations have been applied.

## Migration Implementation

### Base Implementation

```typescript
export class DatabaseService {
    private db: Database.Database;
    
    private runMigrations(): void {
        const currentVersion = this.getSchemaVersion();
        
        // Apply migrations in order
        if (currentVersion < 1) {
            this.migrateTo1();
        }
        if (currentVersion < 2) {
            this.migrateTo2();
        }
        // Add more migrations as needed
    }
    
    private getSchemaVersion(): number {
        try {
            const result = this.db
                .prepare('SELECT MAX(version) as version FROM schema_version')
                .get() as { version: number | null };
            return result.version || 0;
        } catch (error) {
            // Table doesn't exist yet
            return 0;
        }
    }
    
    private setSchemaVersion(version: number, description: string): void {
        this.db.prepare(
            'INSERT INTO schema_version (version, description) VALUES (?, ?)'
        ).run(version, description);
    }
}
```

## Existing Migrations

### Migration 0 → 1: Initial Schema

**Purpose**: Create base profiles table

```typescript
private migrateTo1(): void {
    console.log('Running migration to version 1...');
    
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            language TEXT NOT NULL,
            description TEXT,
            workspacePath TEXT,
            extensions TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            lastUsed DATETIME
        )
    `;
    
    this.db.exec(createTableQuery);
    this.setSchemaVersion(1, 'Initial schema with basic profile fields');
    
    console.log('Migration to version 1 completed');
}
```

### Migration 1 → 2: AI Integration

**Purpose**: Add AI provider fields

```typescript
private migrateTo2(): void {
    console.log('Running migration to version 2...');
    
    const alterQueries = [
        'ALTER TABLE profiles ADD COLUMN aiProvider TEXT',
        'ALTER TABLE profiles ADD COLUMN aiModel TEXT',
    ];
    
    alterQueries.forEach(query => {
        try {
            this.db.exec(query);
        } catch (error) {
            // Column already exists, safe to ignore
        }
    });
    
    this.setSchemaVersion(2, 'Added AI provider and model fields');
    console.log('Migration to version 2 completed');
}
```

### Migration 2 → 3: Enhanced Features

**Purpose**: Add environment variables, code templates, and GitHub integration

```typescript
private migrateTo3(): void {
    console.log('Running migration to version 3...');
    
    const alterQueries = [
        'ALTER TABLE profiles ADD COLUMN envVariables TEXT',
        'ALTER TABLE profiles ADD COLUMN codeTemplate TEXT',
        'ALTER TABLE profiles ADD COLUMN githubRepo TEXT',
    ];
    
    alterQueries.forEach(query => {
        try {
            this.db.exec(query);
        } catch (error) {
            // Column already exists
            console.warn('Column might already exist:', error.message);
        }
    });
    
    this.setSchemaVersion(3, 'Added envVariables, codeTemplate, and githubRepo');
    console.log('Migration to version 3 completed');
}
```

## Creating New Migrations

### Step-by-Step Guide

1. **Identify the Change**
   - What needs to be added/modified?
   - Will it affect existing data?
   - Are indexes needed?

2. **Create Migration Method**
   ```typescript
   private migrateToN(): void {
       console.log('Running migration to version N...');
       
       // Your migration logic here
       
       this.setSchemaVersion(N, 'Description of changes');
       console.log('Migration to version N completed');
   }
   ```

3. **Add to Migration Chain**
   ```typescript
   private runMigrations(): void {
       const currentVersion = this.getSchemaVersion();
       
       // ... existing migrations ...
       
       if (currentVersion < N) {
           this.migrateToN();
       }
   }
   ```

4. **Test Migration**
   - Test on fresh database
   - Test on database with existing data
   - Verify data integrity

### Example: Adding User Preferences

```typescript
private migrateTo4(): void {
    console.log('Running migration to version 4...');
    
    // Add new table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY,
            theme TEXT DEFAULT 'dark',
            fontSize INTEGER DEFAULT 14,
            autoSave BOOLEAN DEFAULT 1
        )
    `;
    
    this.db.exec(createTableQuery);
    
    // Insert default preferences
    this.db.prepare(`
        INSERT INTO user_preferences (id, theme, fontSize, autoSave)
        VALUES (1, 'dark', 14, 1)
    `).run();
    
    this.setSchemaVersion(4, 'Added user preferences table');
    console.log('Migration to version 4 completed');
}
```

## Migration Best Practices

### 1. Always Use Transactions

```typescript
private migrateTo5(): void {
    const migrate = this.db.transaction(() => {
        // All migration operations
        this.db.exec('ALTER TABLE profiles ADD COLUMN newField TEXT');
        this.db.exec('UPDATE profiles SET newField = "default" WHERE newField IS NULL');
        this.setSchemaVersion(5, 'Added newField with default values');
    });
    
    migrate();
}
```

### 2. Handle Errors Gracefully

```typescript
private migrateTo6(): void {
    try {
        this.db.exec('ALTER TABLE profiles ADD COLUMN field TEXT');
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            throw error; // Re-throw unexpected errors
        }
        // Column already exists, safe to continue
    }
    
    this.setSchemaVersion(6, 'Added field column');
}
```

### 3. Preserve Existing Data

```typescript
private migrateTo7(): void {
    // Create new table with better structure
    this.db.exec(`
        CREATE TABLE profiles_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            -- new columns
            metadata TEXT
        )
    `);
    
    // Copy existing data
    this.db.exec(`
        INSERT INTO profiles_new (id, name, metadata)
        SELECT id, name, '{}' FROM profiles
    `);
    
    // Drop old table and rename
    this.db.exec('DROP TABLE profiles');
    this.db.exec('ALTER TABLE profiles_new RENAME TO profiles');
    
    this.setSchemaVersion(7, 'Restructured profiles table');
}
```

### 4. Create Indexes

```typescript
private migrateTo8(): void {
    // Add indexes for performance
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_profiles_lastUsed ON profiles(lastUsed DESC)');
    
    this.setSchemaVersion(8, 'Added indexes for query performance');
}
```

### 5. Validate Data After Migration

```typescript
private migrateTo9(): void {
    // Run migration
    this.db.exec('ALTER TABLE profiles ADD COLUMN validated BOOLEAN DEFAULT 0');
    
    // Validate data
    const profiles = this.db.prepare('SELECT id FROM profiles').all();
    const update = this.db.prepare('UPDATE profiles SET validated = 1 WHERE id = ?');
    
    profiles.forEach((profile: any) => {
        // Validation logic
        update.run(profile.id);
    });
    
    this.setSchemaVersion(9, 'Added validation flag and validated existing data');
}
```

## Testing Migrations

### Test Suite

```typescript
describe('Database Migrations', () => {
    let db: DatabaseService;
    
    beforeEach(() => {
        // Use in-memory database for tests
        db = new DatabaseService(':memory:');
    });
    
    afterEach(() => {
        db.close();
    });
    
    it('should apply all migrations on fresh database', () => {
        const version = db.getSchemaVersion();
        expect(version).toBeGreaterThan(0);
    });
    
    it('should not fail on repeated migrations', () => {
        // Run migrations twice
        db.runMigrations();
        db.runMigrations();
        
        const version = db.getSchemaVersion();
        expect(version).toBeGreaterThan(0);
    });
    
    it('should preserve existing data', () => {
        // Create profile
        const profile = db.createProfile({
            name: 'Test',
            language: 'TypeScript'
        });
        
        // Simulate migration
        db.runMigrations();
        
        // Verify data preserved
        const retrieved = db.getProfile(profile.id!);
        expect(retrieved?.name).toBe('Test');
    });
});
```

### Manual Testing

1. **Fresh Installation**
   ```bash
   # Delete existing database
   rm ~/path/to/profiles.db
   
   # Start application
   npm start
   
   # Verify all migrations applied
   ```

2. **Upgrade Path**
   ```bash
   # Use database from previous version
   cp backup/profiles.db ~/path/to/profiles.db
   
   # Start application
   npm start
   
   # Verify migrations applied and data preserved
   ```

## Rollback Strategy

### Backup Before Migration

```typescript
private runMigrations(): void {
    const currentVersion = this.getSchemaVersion();
    
    if (currentVersion < this.getLatestVersion()) {
        // Create backup
        this.createBackup();
        
        // Run migrations
        this.applyMigrations(currentVersion);
    }
}

private createBackup(): void {
    const backupPath = this.getBackupPath();
    this.db.backup(backupPath);
    console.log(`Backup created: ${backupPath}`);
}
```

### Manual Rollback

```typescript
public rollbackToVersion(targetVersion: number): void {
    const currentVersion = this.getSchemaVersion();
    
    if (targetVersion >= currentVersion) {
        throw new Error('Target version must be less than current version');
    }
    
    // Restore from backup
    const backupPath = this.getBackupPathForVersion(targetVersion);
    if (!fs.existsSync(backupPath)) {
        throw new Error(`No backup found for version ${targetVersion}`);
    }
    
    this.close();
    fs.copyFileSync(backupPath, this.dbPath);
    this.db = new Database(this.dbPath);
    
    console.log(`Rolled back to version ${targetVersion}`);
}
```

## Migration Checklist

Before creating a migration:

- [ ] Identify schema changes needed
- [ ] Plan data preservation strategy
- [ ] Write migration method
- [ ] Add to migration chain
- [ ] Create backup before applying
- [ ] Test on fresh database
- [ ] Test on existing database
- [ ] Test rollback procedure
- [ ] Update documentation
- [ ] Add tests

## Common Patterns

### Adding a Column

```typescript
private addColumn(table: string, column: string, type: string, defaultValue?: string): void {
    const defaultClause = defaultValue ? `DEFAULT ${defaultValue}` : '';
    const query = `ALTER TABLE ${table} ADD COLUMN ${column} ${type} ${defaultClause}`;
    
    try {
        this.db.exec(query);
    } catch (error) {
        if (!error.message.includes('duplicate column')) {
            throw error;
        }
    }
}
```

### Renaming a Column

SQLite doesn't support RENAME COLUMN before version 3.25.0, so we need to recreate the table:

```typescript
private renameColumn(table: string, oldName: string, newName: string): void {
    // Get existing schema
    const schema = this.getTableSchema(table);
    
    // Create new table with updated schema
    const newSchema = schema.replace(oldName, newName);
    this.db.exec(`CREATE TABLE ${table}_new ${newSchema}`);
    
    // Copy data
    this.db.exec(`INSERT INTO ${table}_new SELECT * FROM ${table}`);
    
    // Replace table
    this.db.exec(`DROP TABLE ${table}`);
    this.db.exec(`ALTER TABLE ${table}_new RENAME TO ${table}`);
}
```

### Adding a Table

```typescript
private createTable(name: string, schema: string): void {
    this.db.exec(`CREATE TABLE IF NOT EXISTS ${name} ${schema}`);
}
```

## Monitoring and Logging

### Log Migration Activity

```typescript
private migrateTo10(): void {
    const startTime = Date.now();
    console.log('Starting migration to version 10...');
    
    try {
        // Migration logic
        this.db.exec('ALTER TABLE profiles ADD COLUMN new_field TEXT');
        
        const duration = Date.now() - startTime;
        console.log(`Migration to version 10 completed in ${duration}ms`);
        
        this.setSchemaVersion(10, 'Added new_field column');
    } catch (error) {
        console.error('Migration to version 10 failed:', error);
        throw error;
    }
}
```

### Track Migration History

```sql
SELECT version, applied_at, description
FROM schema_version
ORDER BY version;
```

## Related Documentation

- [Database Schema](../api/database-schema.md)
- [MVC Architecture](../architecture/MVC-ARCHITECTURE.md)
- [DatabaseService](../../src/services/DatabaseService.ts)

## Troubleshooting

### Migration Fails Midway

1. Check error message
2. Restore from backup
3. Fix migration code
4. Test thoroughly
5. Re-run migration

### Data Loss After Migration

1. Stop application immediately
2. Restore from backup
3. Report issue with details
4. Do not attempt migration again until fixed

### Duplicate Column Error

This is usually safe - it means the column already exists. The migration catches this and continues.

---

**Remember**: Always test migrations thoroughly before releasing!
