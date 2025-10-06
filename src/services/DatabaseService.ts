import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';
import { Profile, CreateProfileData, UpdateProfileData } from '../types';

export class DatabaseService {
    private db: Database.Database;

    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'profiles.db');
        this.db = new Database(dbPath);
        this.initializeDatabase();
    }

    private initializeDatabase(): void {
        // Create profiles table
        const createTableQuery = `
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
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                lastUsed DATETIME
            )
        `;

        this.db.exec(createTableQuery);

        // Add new columns if they don't exist (for existing databases)
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
                // Column already exists, ignore error
            }
        });

        // Create index for better performance
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_language ON profiles(language)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_name ON profiles(name)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_ai_provider ON profiles(aiProvider)');
    }

    public getAllProfiles(): Profile[] {
        const query = 'SELECT * FROM profiles ORDER BY lastUsed DESC, createdAt DESC';
        const rows = this.db.prepare(query).all() as any[];

        return rows.map(this.mapRowToProfile);
    }

    public getProfile(id: number): Profile | null {
        const query = 'SELECT * FROM profiles WHERE id = ?';
        const row = this.db.prepare(query).get(id) as any;

        return row ? this.mapRowToProfile(row) : null;
    }

    public createProfile(profileData: CreateProfileData): Profile {
        // Validate required fields
        if (!profileData.name || profileData.name.trim() === '') {
            throw new Error('Profile name is required and cannot be empty');
        }
        if (!profileData.language || profileData.language.trim() === '') {
            throw new Error('Profile language is required and cannot be empty');
        }

        const query = `
            INSERT INTO profiles (name, language, description, workspacePath, extensions, aiProvider, aiModel, envVariables, codeTemplate, githubRepo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const extensionsJson = profileData.extensions
            ? JSON.stringify(profileData.extensions)
            : null;
        const envVariablesJson = profileData.envVariables
            ? JSON.stringify(profileData.envVariables)
            : null;
        const githubRepoJson = profileData.githubRepo
            ? JSON.stringify(profileData.githubRepo)
            : null;

        const result = this.db
            .prepare(query)
            .run(
                profileData.name,
                profileData.language,
                profileData.description || null,
                profileData.workspacePath || null,
                extensionsJson,
                profileData.aiProvider || null,
                profileData.aiModel || null,
                envVariablesJson,
                profileData.codeTemplate || null,
                githubRepoJson
            );

        const newProfile = this.getProfile(result.lastInsertRowid as number);
        if (!newProfile) {
            throw new Error('Failed to create profile');
        }

        return newProfile;
    }

    public updateProfile(id: number, profileData: UpdateProfileData): Profile | null {
        const currentProfile = this.getProfile(id);
        if (!currentProfile) {
            return null;
        }

        // Validate critical fields
        if (profileData.name !== undefined && (!profileData.name || profileData.name.trim() === '')) {
            throw new Error('Profile name cannot be empty');
        }
        if (profileData.language !== undefined && (!profileData.language || profileData.language.trim() === '')) {
            throw new Error('Profile language cannot be empty');
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (profileData.name !== undefined) {
            updates.push('name = ?');
            values.push(profileData.name.trim());
        }
        if (profileData.language !== undefined) {
            updates.push('language = ?');
            values.push(profileData.language.trim());
        }
        if (profileData.description !== undefined) {
            updates.push('description = ?');
            values.push(profileData.description);
        }
        if (profileData.workspacePath !== undefined) {
            updates.push('workspacePath = ?');
            values.push(profileData.workspacePath);
        }
        if (profileData.extensions !== undefined) {
            updates.push('extensions = ?');
            values.push(JSON.stringify(profileData.extensions));
        }
        if (profileData.aiProvider !== undefined) {
            updates.push('aiProvider = ?');
            values.push(profileData.aiProvider);
        }
        if (profileData.aiModel !== undefined) {
            updates.push('aiModel = ?');
            values.push(profileData.aiModel);
        }
        if (profileData.envVariables !== undefined) {
            updates.push('envVariables = ?');
            values.push(JSON.stringify(profileData.envVariables));
        }
        if (profileData.codeTemplate !== undefined) {
            updates.push('codeTemplate = ?');
            values.push(profileData.codeTemplate);
        }
        if (profileData.githubRepo !== undefined) {
            updates.push('githubRepo = ?');
            values.push(profileData.githubRepo ? JSON.stringify(profileData.githubRepo) : null);
        }
        if (profileData.lastUsed !== undefined) {
            updates.push('lastUsed = ?');
            values.push(profileData.lastUsed);
        }

        if (updates.length === 0) {
            return currentProfile;
        }

        values.push(id);
        const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`;

        this.db.prepare(query).run(...values);
        return this.getProfile(id);
    }

    public deleteProfile(id: number): boolean {
        const query = 'DELETE FROM profiles WHERE id = ?';
        const result = this.db.prepare(query).run(id);

        return result.changes > 0;
    }

    public searchProfiles(searchTerm: string): Profile[] {
        const query = `
            SELECT * FROM profiles 
            WHERE name LIKE ? OR language LIKE ? OR description LIKE ?
            ORDER BY lastUsed DESC, createdAt DESC
        `;

        const term = `%${searchTerm}%`;
        const rows = this.db.prepare(query).all(term, term, term) as any[];

        return rows.map(this.mapRowToProfile);
    }

    public getProfilesByLanguage(language: string): Profile[] {
        const query =
            'SELECT * FROM profiles WHERE language = ? ORDER BY lastUsed DESC, createdAt DESC';
        const rows = this.db.prepare(query).all(language) as any[];

        return rows.map(this.mapRowToProfile);
    }

    public updateLastUsed(id: number): void {
        const query = 'UPDATE profiles SET lastUsed = CURRENT_TIMESTAMP WHERE id = ?';
        this.db.prepare(query).run(id);
    }

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
            githubRepo: row.githubRepo ? JSON.parse(row.githubRepo) : undefined,
            createdAt: row.createdAt,
            lastUsed: row.lastUsed,
        };
    }

    public close(): void {
        this.db.close();
    }
}
