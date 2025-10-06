# Testing Strategy

## Overview

The VS Code Profile Launcher uses a comprehensive testing strategy combining unit tests, integration tests, and end-to-end tests to ensure quality and reliability.

## Testing Stack

### Core Technologies

- **Jest**: Test framework and runner
- **ts-jest**: TypeScript support for Jest
- **@testing-library**: Testing utilities
- **Mock implementations**: For external dependencies

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── services/
│   ├── controllers/
│   ├── models/
│   └── utils/
├── integration/       # Integration tests
│   ├── database/
│   ├── api/
│   └── ipc/
└── e2e/              # End-to-end tests
    └── workflows/
```

## Test Configuration

### Jest Configuration

File: `jest.config.js`

```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    verbose: true
};
```

### NPM Scripts

```json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:unit": "jest tests/unit",
        "test:integration": "jest tests/integration",
        "test:e2e": "jest tests/e2e"
    }
}
```

## Unit Tests

### Purpose

Test individual components in isolation without external dependencies.

### Writing Unit Tests

#### Service Tests

**Example: DatabaseService**

```typescript
// tests/unit/services/DatabaseService.test.ts
import { DatabaseService } from '../../../src/services/DatabaseService';
import Database from 'better-sqlite3';

describe('DatabaseService', () => {
    let db: DatabaseService;
    
    beforeEach(() => {
        // Use in-memory database for tests
        db = new DatabaseService(':memory:');
    });
    
    afterEach(() => {
        db.close();
    });
    
    describe('createProfile', () => {
        it('should create a profile with valid data', () => {
            const profileData = {
                name: 'Test Profile',
                language: 'TypeScript'
            };
            
            const profile = db.createProfile(profileData);
            
            expect(profile.id).toBeDefined();
            expect(profile.name).toBe('Test Profile');
            expect(profile.language).toBe('TypeScript');
        });
        
        it('should throw error for duplicate name', () => {
            const profileData = {
                name: 'Duplicate',
                language: 'Python'
            };
            
            db.createProfile(profileData);
            
            expect(() => {
                db.createProfile(profileData);
            }).toThrow();
        });
        
        it('should handle optional fields', () => {
            const profile = db.createProfile({
                name: 'Optional Test',
                language: 'Go',
                description: 'Test description',
                extensions: ['ext1', 'ext2']
            });
            
            expect(profile.description).toBe('Test description');
            expect(profile.extensions).toEqual(['ext1', 'ext2']);
        });
    });
    
    describe('getAllProfiles', () => {
        it('should return empty array when no profiles', () => {
            const profiles = db.getAllProfiles();
            expect(profiles).toEqual([]);
        });
        
        it('should return all profiles', () => {
            db.createProfile({ name: 'Profile 1', language: 'TypeScript' });
            db.createProfile({ name: 'Profile 2', language: 'Python' });
            
            const profiles = db.getAllProfiles();
            
            expect(profiles).toHaveLength(2);
        });
    });
});
```

#### Controller Tests

**Example: ProfileController**

```typescript
// tests/unit/controllers/ProfileController.test.ts
import { ProfileController } from '../../../src/controllers/ProfileController';
import { DatabaseService } from '../../../src/services/DatabaseService';

// Mock DatabaseService
jest.mock('../../../src/services/DatabaseService');

describe('ProfileController', () => {
    let controller: ProfileController;
    let mockDbService: jest.Mocked<DatabaseService>;
    
    beforeEach(() => {
        mockDbService = new DatabaseService() as jest.Mocked<DatabaseService>;
        controller = new ProfileController(mockDbService);
    });
    
    describe('getAllProfiles', () => {
        it('should return all profiles from database', () => {
            const mockProfiles = [
                { id: 1, name: 'Profile 1', language: 'TypeScript' },
                { id: 2, name: 'Profile 2', language: 'Python' }
            ];
            
            mockDbService.getAllProfiles.mockReturnValue(mockProfiles);
            
            const result = controller.getAllProfiles();
            
            expect(result).toEqual(mockProfiles);
            expect(mockDbService.getAllProfiles).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('createProfile', () => {
        it('should create profile with valid data', () => {
            const profileData = {
                name: 'New Profile',
                language: 'Rust'
            };
            
            const mockProfile = { id: 1, ...profileData };
            mockDbService.createProfile.mockReturnValue(mockProfile);
            
            const result = controller.createProfile(profileData);
            
            expect(result).toEqual(mockProfile);
            expect(mockDbService.createProfile).toHaveBeenCalledWith(profileData);
        });
        
        it('should throw error for invalid data', () => {
            const invalidData = {
                name: '',
                language: 'TypeScript'
            };
            
            expect(() => {
                controller.createProfile(invalidData);
            }).toThrow('Profile name is required');
        });
    });
});
```

#### Model Tests

**Example: Profile Model**

```typescript
// tests/unit/models/Profile.test.ts
import { Profile } from '../../../src/models/Profile';

describe('Profile', () => {
    describe('validate', () => {
        it('should validate correct profile data', () => {
            const profile = new Profile({
                name: 'Test',
                language: 'TypeScript'
            });
            
            expect(profile.validate()).toBe(true);
        });
        
        it('should reject empty name', () => {
            const profile = new Profile({
                name: '',
                language: 'TypeScript'
            });
            
            expect(() => profile.validate()).toThrow();
        });
        
        it('should reject invalid language', () => {
            const profile = new Profile({
                name: 'Test',
                language: 'InvalidLang'
            });
            
            expect(() => profile.validate()).toThrow();
        });
    });
    
    describe('toJSON', () => {
        it('should serialize profile to JSON', () => {
            const profile = new Profile({
                name: 'Test',
                language: 'TypeScript',
                extensions: ['ext1', 'ext2']
            });
            
            const json = profile.toJSON();
            
            expect(json).toHaveProperty('name', 'Test');
            expect(json).toHaveProperty('extensions');
            expect(json.extensions).toEqual(['ext1', 'ext2']);
        });
    });
});
```

#### Utility Tests

**Example: Validators**

```typescript
// tests/unit/utils/validators.test.ts
import { isValidProfileName, isValidGitHubRepo } from '../../../src/utils/validators';

describe('validators', () => {
    describe('isValidProfileName', () => {
        it('should accept valid names', () => {
            expect(isValidProfileName('My Profile')).toBe(true);
            expect(isValidProfileName('Python-ML')).toBe(true);
            expect(isValidProfileName('Web Dev 2024')).toBe(true);
        });
        
        it('should reject invalid names', () => {
            expect(isValidProfileName('')).toBe(false);
            expect(isValidProfileName('a'.repeat(101))).toBe(false);
            expect(isValidProfileName('test/profile')).toBe(false);
        });
    });
    
    describe('isValidGitHubRepo', () => {
        it('should accept valid repo format', () => {
            expect(isValidGitHubRepo('owner', 'repo')).toBe(true);
            expect(isValidGitHubRepo('org-name', 'repo-name')).toBe(true);
        });
        
        it('should reject invalid format', () => {
            expect(isValidGitHubRepo('', 'repo')).toBe(false);
            expect(isValidGitHubRepo('owner', '')).toBe(false);
        });
    });
});
```

## Integration Tests

### Purpose

Test how multiple components work together with real dependencies.

### Database Integration Tests

```typescript
// tests/integration/database/profiles.test.ts
import { DatabaseService } from '../../../src/services/DatabaseService';
import { ProfileController } from '../../../src/controllers/ProfileController';

describe('Profile Database Integration', () => {
    let db: DatabaseService;
    let controller: ProfileController;
    
    beforeEach(() => {
        db = new DatabaseService(':memory:');
        controller = new ProfileController(db);
    });
    
    afterEach(() => {
        db.close();
    });
    
    it('should handle full profile lifecycle', () => {
        // Create
        const created = controller.createProfile({
            name: 'Integration Test',
            language: 'TypeScript'
        });
        expect(created.id).toBeDefined();
        
        // Read
        const retrieved = controller.getProfile(created.id!);
        expect(retrieved?.name).toBe('Integration Test');
        
        // Update
        const updated = controller.updateProfile(created.id!, {
            description: 'Updated description'
        });
        expect(updated?.description).toBe('Updated description');
        
        // Delete
        const deleted = controller.deleteProfile(created.id!);
        expect(deleted).toBe(true);
        
        // Verify deletion
        const notFound = controller.getProfile(created.id!);
        expect(notFound).toBeNull();
    });
    
    it('should maintain data consistency in transactions', () => {
        const profiles = [
            { name: 'Profile 1', language: 'TypeScript' },
            { name: 'Profile 2', language: 'Python' },
            { name: 'Profile 3', language: 'Go' }
        ];
        
        profiles.forEach(p => controller.createProfile(p));
        
        const all = controller.getAllProfiles();
        expect(all).toHaveLength(3);
    });
});
```

### AI Service Integration Tests

```typescript
// tests/integration/api/ai-service.test.ts
import { AIService } from '../../../src/services/AIService';
import { ConfigService } from '../../../src/services/ConfigService';

describe('AI Service Integration', () => {
    let aiService: AIService;
    
    beforeAll(() => {
        aiService = AIService.getInstance();
    });
    
    it('should list available providers', () => {
        const providers = aiService.getAvailableProviders();
        
        expect(Array.isArray(providers)).toBe(true);
        expect(providers.length).toBeGreaterThan(0);
        expect(providers[0]).toHaveProperty('name');
        expect(providers[0]).toHaveProperty('configured');
    });
    
    // Skip actual API calls in tests
    it.skip('should generate code with configured provider', async () => {
        const request = {
            prompt: 'Create a hello world function',
            provider: 'gemini' as const,
            model: 'gemini-1.5-flash'
        };
        
        const response = await aiService.generateCode(request);
        
        expect(response.success).toBe(true);
        expect(response.content).toBeTruthy();
    });
});
```

## End-to-End Tests

### Purpose

Test complete user workflows from UI to database.

### E2E Test Example

```typescript
// tests/e2e/workflows/profile-creation.test.ts
import { app, BrowserWindow } from 'electron';
import { DatabaseService } from '../../../src/services/DatabaseService';

describe('Profile Creation Workflow', () => {
    let mainWindow: BrowserWindow;
    let db: DatabaseService;
    
    beforeAll(async () => {
        // Setup test environment
        await app.whenReady();
        mainWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });
        
        db = new DatabaseService(':memory:');
    });
    
    afterAll(async () => {
        mainWindow.close();
        db.close();
        await app.quit();
    });
    
    it('should create profile through UI', async () => {
        // Simulate UI interaction
        const profileData = {
            name: 'E2E Test Profile',
            language: 'TypeScript',
            description: 'Created through E2E test'
        };
        
        // Trigger IPC call
        const profile = await mainWindow.webContents.executeJavaScript(`
            window.electronAPI.createProfile(${JSON.stringify(profileData)})
        `);
        
        expect(profile.id).toBeDefined();
        expect(profile.name).toBe(profileData.name);
        
        // Verify in database
        const retrieved = db.getProfile(profile.id);
        expect(retrieved).toBeTruthy();
    });
});
```

## Mocking Strategies

### Mock External Services

```typescript
// tests/mocks/github-service.mock.ts
export class MockGitHubService {
    async listIssues() {
        return [
            {
                id: 1,
                number: 1,
                title: 'Mock Issue',
                body: 'Mock body',
                state: 'open' as const,
                labels: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                htmlUrl: 'https://github.com/test/repo/issues/1'
            }
        ];
    }
    
    async createIssue() {
        return {
            id: 2,
            number: 2,
            title: 'Created Issue',
            body: '',
            state: 'open' as const,
            labels: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            htmlUrl: 'https://github.com/test/repo/issues/2'
        };
    }
}
```

### Mock Electron APIs

```typescript
// tests/mocks/electron.mock.ts
export const mockApp = {
    getPath: jest.fn((name: string) => {
        return `/mock/path/${name}`;
    }),
    whenReady: jest.fn().mockResolvedValue(undefined)
};

export const mockIpcMain = {
    handle: jest.fn(),
    on: jest.fn()
};

export const mockDialog = {
    showOpenDialog: jest.fn().mockResolvedValue({
        canceled: false,
        filePaths: ['/mock/selected/path']
    })
};
```

## Test Coverage

### Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Major user workflows

### Running Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types.ts',
        '!src/renderer/**/*'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

## Testing Best Practices

### 1. AAA Pattern

```typescript
it('should create profile', () => {
    // Arrange
    const data = { name: 'Test', language: 'TypeScript' };
    
    // Act
    const profile = controller.createProfile(data);
    
    // Assert
    expect(profile.name).toBe('Test');
});
```

### 2. One Assertion Per Test

```typescript
// ✅ Good
it('should set profile name', () => {
    expect(profile.name).toBe('Test');
});

it('should set profile language', () => {
    expect(profile.language).toBe('TypeScript');
});

// ❌ Bad
it('should create profile correctly', () => {
    expect(profile.name).toBe('Test');
    expect(profile.language).toBe('TypeScript');
    expect(profile.id).toBeDefined();
});
```

### 3. Descriptive Test Names

```typescript
// ✅ Good
it('should throw error when profile name is empty', () => {
    // ...
});

// ❌ Bad
it('test profile', () => {
    // ...
});
```

### 4. Test Edge Cases

```typescript
describe('updateProfile', () => {
    it('should update existing profile', () => { /* ... */ });
    it('should return null for non-existent profile', () => { /* ... */ });
    it('should handle empty update data', () => { /* ... */ });
    it('should validate updated data', () => { /* ... */ });
});
```

### 5. Cleanup After Tests

```typescript
afterEach(() => {
    // Clean up database connections
    db.close();
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Reset state
    jest.resetModules();
});
```

## Continuous Testing

### Pre-commit Hooks

```json
// package.json
{
    "husky": {
        "hooks": {
            "pre-commit": "npm run test:unit"
        }
    }
}
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Testing Tools

### Useful Libraries

```bash
# Install testing utilities
npm install --save-dev \
    @types/jest \
    jest-mock-extended \
    supertest \
    nock
```

### Test Utilities

```typescript
// tests/utils/test-helpers.ts
export function createMockProfile(overrides = {}) {
    return {
        id: 1,
        name: 'Mock Profile',
        language: 'TypeScript',
        ...overrides
    };
}

export function createMockDatabase() {
    return new DatabaseService(':memory:');
}
```

## Troubleshooting

### Tests Timeout

```typescript
// Increase timeout for slow tests
jest.setTimeout(10000); // 10 seconds

it('slow test', async () => {
    // ...
}, 15000); // 15 seconds for this specific test
```

### Flaky Tests

```typescript
// Use beforeEach/afterEach to ensure clean state
beforeEach(() => {
    jest.clearAllMocks();
    db = new DatabaseService(':memory:');
});
```

### Module Not Found

```typescript
// Use moduleNameMapper in jest.config.js
module.exports = {
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};
```

## Related Documentation

- [Build Process](./build-process.md)
- [Developer Guide](../guides/DEVELOPER-GUIDE.md)
- [CONTRIBUTING](../../CONTRIBUTING.md)
- [Jest Documentation](https://jestjs.io/)

---

**Happy Testing!** ✅
