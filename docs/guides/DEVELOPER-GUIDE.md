# Developer Guide

Welcome to the VS Code Profile Launcher developer guide! This document will help you understand the project structure and how to contribute.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Development Workflow](#development-workflow)
4. [Code Style](#code-style)
5. [Adding New Features](#adding-new-features)
6. [Testing](#testing)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git
- VS Code (recommended)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/rootkitoriginal/vscode-profile-launcher.git
cd vscode-profile-launcher
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Add your API keys
```

4. Build the project:
```bash
npm run build
```

5. Start development:
```bash
npm run dev
```

## Architecture Overview

This project follows the **MVC (Model-View-Controller)** architecture pattern.

### Key Concepts

- **Models** (`src/models/`): Data structures and validation
- **Views** (`src/views/`, `src/renderer/`): User interface
- **Controllers** (`src/controllers/`): Business logic
- **Services** (`src/services/`): External integrations

For detailed architecture documentation, see [../architecture/MVC-ARCHITECTURE.md](../architecture/MVC-ARCHITECTURE.md).

## Development Workflow

### File Organization

```
src/
├── controllers/    # Add new business logic here
├── models/         # Add new data models here
├── services/       # Add new service integrations here
├── views/          # Add new UI components here
├── utils/          # Add utility functions here
└── types.ts        # Add new TypeScript types here
```

### Common Tasks

#### Adding a New Controller

1. Create file in `src/controllers/`:
```typescript
// src/controllers/NewController.ts
export class NewController {
    constructor(private service: SomeService) {}
    
    async doSomething(): Promise<void> {
        // Implementation
    }
}
```

2. Register in `main.ts`:
```typescript
// In App constructor
this.newController = new NewController(someService);

// In setupIpcHandlers
ipcMain.handle('new-action', async () => {
    return this.newController.doSomething();
});
```

#### Adding a New Service

1. Create file in `src/services/`:
```typescript
// src/services/NewService.ts
export class NewService {
    private static instance: NewService;
    
    public static getInstance(): NewService {
        if (!NewService.instance) {
            NewService.instance = new NewService();
        }
        return NewService.instance;
    }
    
    // Methods...
}
```

#### Adding a New Model

1. Create file in `src/models/`:
```typescript
// src/models/NewModel.ts
export class NewModel {
    constructor(private data: ModelData) {}
    
    validate(): { valid: boolean; errors: string[] } {
        // Validation logic
    }
    
    toJSON(): ModelData {
        // Serialization
    }
}
```

## Code Style

This project uses:
- **ESLint** for code quality
- **Prettier** for code formatting
- **EditorConfig** for consistent editor settings

### Formatting

Before committing, ensure your code is formatted:
```bash
# Format with Prettier (when installed)
npm run format

# Lint with ESLint (when installed)
npm run lint
```

### Naming Conventions

- **Files**: PascalCase for classes (`ProfileController.ts`)
- **Classes**: PascalCase (`ProfileController`)
- **Functions**: camelCase (`createProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PROFILES`)
- **Interfaces**: PascalCase with `I` prefix optional (`Profile` or `IProfile`)

### TypeScript Best Practices

1. **Always use types**: Don't use `any` unless absolutely necessary
2. **Use interfaces**: Define clear contracts
3. **Use async/await**: Prefer over promises chains
4. **Error handling**: Always try-catch async operations
5. **Documentation**: Add JSDoc comments for public methods

Example:
```typescript
/**
 * Creates a new profile with the given data
 * @param profileData - The profile data to create
 * @returns The created profile
 * @throws Error if validation fails
 */
async createProfile(profileData: CreateProfileData): Promise<Profile> {
    // Implementation
}
```

## Adding New Features

### Step-by-Step Process

1. **Plan**: Understand what you're building
2. **Design**: Decide which layers are affected (Model/View/Controller)
3. **Implement**:
   - Start with the Model (data structure)
   - Add Service methods if needed
   - Create/update Controller logic
   - Add IPC handlers in main.ts
   - Update the View (renderer)
4. **Test**: Manually test the feature
5. **Document**: Update relevant documentation
6. **Commit**: Use clear commit messages

### Example: Adding User Preferences

1. **Model** (`src/models/UserPreferences.ts`):
```typescript
export class UserPreferences {
    constructor(private data: PreferencesData) {}
    
    validate(): ValidationResult {
        // Validation
    }
}
```

2. **Service** (`src/services/PreferencesService.ts`):
```typescript
export class PreferencesService {
    savePreferences(prefs: UserPreferences): void {
        // Save to storage
    }
    
    loadPreferences(): UserPreferences {
        // Load from storage
    }
}
```

3. **Controller** (`src/controllers/PreferencesController.ts`):
```typescript
export class PreferencesController {
    constructor(private service: PreferencesService) {}
    
    async updatePreferences(data: PreferencesData): Promise<void> {
        const prefs = new UserPreferences(data);
        const validation = prefs.validate();
        
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }
        
        this.service.savePreferences(prefs);
    }
}
```

4. **Main.ts**: Register IPC handlers

5. **View**: Update UI to use new preferences

## Testing

### Manual Testing

Always test your changes manually:
1. Build the project: `npm run build`
2. Start the app: `npm start`
3. Test all affected features
4. Check the console for errors

### Unit Testing (Future)

When adding unit tests:
```typescript
// tests/unit/ProfileController.test.ts
describe('ProfileController', () => {
    it('should create a profile', async () => {
        // Test implementation
    });
});
```

## Debugging

### Electron Main Process

Add breakpoints in VS Code or use:
```typescript
console.log('Debug info:', data);
```

### Renderer Process

Open DevTools in the Electron app:
- Press `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (macOS)

### Common Issues

1. **Build errors**: Run `npm run build` to see TypeScript errors
2. **Runtime errors**: Check both main and renderer console logs
3. **IPC not working**: Verify handler names match between main and renderer

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following this guide
4. Test thoroughly
5. Commit with clear messages: `git commit -m "feat: add user preferences"`
6. Push and create a Pull Request

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MVC Architecture](../architecture/MVC-ARCHITECTURE.md)

## Getting Help

- Open an issue on GitHub
- Check existing documentation
- Review code examples in the project

Happy coding! 🚀
