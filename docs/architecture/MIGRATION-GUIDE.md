# Migration Guide: From Monolithic to MVC

This document describes the changes made during the MVC restructuring and how to adapt to the new structure.

## Overview

The project has been restructured from a monolithic architecture to a clean MVC (Model-View-Controller) pattern. This improves:
- Code organization and maintainability
- Separation of concerns
- Testability
- Scalability

## File Migrations

### Services (Previously Managers)

| Old Location | New Location | Class Name Change |
|-------------|--------------|-------------------|
| `src/database.ts` | `src/services/DatabaseService.ts` | `DatabaseManager` → `DatabaseService` |
| `src/config.ts` | `src/services/ConfigService.ts` | `ConfigManager` → `ConfigService` |
| `src/ai-manager.ts` | `src/services/AIService.ts` | `AIManager` → `AIService` |
| `src/github-manager.ts` | `src/services/GitHubService.ts` | `GitHubManager` → `GitHubService` |

### Import Changes

**Before:**
```typescript
import { DatabaseManager } from './database';
import { ConfigManager } from './config';
import { AIManager } from './ai-manager';
```

**After:**
```typescript
import { DatabaseService } from './services/DatabaseService';
import { ConfigService } from './services/ConfigService';
import { AIService } from './services/AIService';
```

### Instance Access

**Before:**
```typescript
const config = ConfigManager.getInstance();
const ai = AIManager.getInstance();
```

**After:**
```typescript
const config = ConfigService.getInstance();
const ai = AIService.getInstance();
```

## New Components

### Controllers

New layer introduced to handle business logic:

- **ProfileController**: Manages profile CRUD operations
  - `getAllProfiles()`
  - `getProfile(id)`
  - `createProfile(data)`
  - `updateProfile(id, data)`
  - `deleteProfile(id)`
  - `searchProfiles(query)`
  - `filterByLanguage(language)`

- **SettingsController**: Manages application settings
  - `getConfig()`
  - `getApiKeys()`
  - `updateApiKey(provider, key)`
  - `updateGitHubToken(token)`
  - `getGitHubToken()`
  - `getVSCodeCommand()`
  - `getProfilePaths(profileName)`

- **AIController**: Handles AI operations
  - `getAIProviders()`
  - `getAvailableProviders()`
  - `generateCode(request)`
  - `generateCodeTemplate(language, name, ...)`

- **GitHubController**: Manages GitHub integration
  - `listIssues(owner, repo, state)`
  - `createIssue(owner, repo, title, body, labels)`
  - `listBranches(owner, repo)`
  - `validateRepository(owner, repo)`
  - `listRepositories()`
  - `isConfigured()`

### Models

- **Profile**: Data model with validation methods
  - `validate()`: Validates profile data
  - `toJSON()`: Serializes to plain object

### Utilities

- **Logger** (`src/utils/logger.ts`): Consistent logging
  ```typescript
  import logger from './utils/logger';
  logger.info('Message', { data });
  logger.error('Error', error);
  ```

- **Validators** (`src/utils/validators.ts`): Data validation utilities
  ```typescript
  import { isValidProfileName, isValidGitHubRepo } from './utils/validators';
  ```

## Main.ts Changes

The main process now uses controllers instead of directly calling services:

**Before:**
```typescript
ipcMain.handle('get-profiles', async () => {
    return this.db.getAllProfiles();
});
```

**After:**
```typescript
ipcMain.handle('get-profiles', async () => {
    return this.profileController.getAllProfiles();
});
```

## Directory Structure Changes

**New Directories:**
```
src/
├── controllers/      # NEW: Business logic layer
├── models/           # NEW: Data models
├── services/         # NEW: Service layer (renamed from root)
├── utils/            # NEW: Utility functions
└── views/            # NEW: For future UI components
    ├── components/
    └── pages/

docs/                 # NEW: Documentation
├── architecture/
├── api/
├── guides/
└── tech/

scripts/              # NEW: Build and utility scripts
└── utils/

tests/                # NEW: Test structure
├── unit/
├── integration/
└── e2e/
```

## Code Quality Tools

### New Configuration Files

- `.eslintrc.json`: ESLint configuration
- `.prettierrc.json`: Prettier formatting rules
- `.editorconfig`: Editor configuration

### Build Scripts

New npm scripts added:
```bash
npm run clean         # Clean build artifacts
npm run build         # Clean + compile TypeScript
```

## Backward Compatibility

✅ **All existing functionality preserved**
- Renderer process (app.js) unchanged
- IPC communication maintained
- Database operations identical
- AI and GitHub integrations work the same

## Migration Checklist for Developers

If you have local changes, here's how to update them:

1. **Update imports**:
   - Change paths from `./database` to `./services/DatabaseService`
   - Change paths from `./config` to `./services/ConfigService`
   - Change paths from `./ai-manager` to `./services/AIService`
   - Change paths from `./github-manager` to `./services/GitHubService`

2. **Update class names**:
   - `DatabaseManager` → `DatabaseService`
   - `ConfigManager` → `ConfigService`
   - `AIManager` → `AIService`
   - `GitHubManager` → `GitHubService`

3. **Consider using controllers** for new IPC handlers instead of directly calling services

4. **Run build** to verify:
   ```bash
   npm run build
   ```

## Benefits of New Architecture

1. **Separation of Concerns**: Each layer has clear responsibilities
2. **Testability**: Controllers can be unit tested independently
3. **Maintainability**: Changes are isolated to specific layers
4. **Scalability**: Easy to add new features following established patterns
5. **Code Organization**: Files are logically grouped
6. **Documentation**: Clear structure with comprehensive docs

## Next Steps

1. Familiarize yourself with the [MVC Architecture](MVC-ARCHITECTURE.md)
2. Read the [Developer Guide](../guides/DEVELOPER-GUIDE.md)
3. Follow the new patterns when adding features
4. Consider refactoring `app.js` into smaller components (future work)

## Questions?

- Review [MVC-ARCHITECTURE.md](MVC-ARCHITECTURE.md)
- Check [DEVELOPER-GUIDE.md](../guides/DEVELOPER-GUIDE.md)
- Open an issue on GitHub
