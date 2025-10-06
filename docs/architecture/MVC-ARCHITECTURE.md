# MVC Architecture Documentation

## Overview

This project follows the Model-View-Controller (MVC) architectural pattern to ensure separation of concerns, maintainability, and scalability.

## Directory Structure

```
src/
├── controllers/           # Business logic controllers
│   ├── ProfileController.ts
│   ├── SettingsController.ts
│   ├── AIController.ts
│   └── GitHubController.ts
├── models/               # Data models
│   └── Profile.ts
├── services/             # External service integrations
│   ├── DatabaseService.ts
│   ├── ConfigService.ts
│   ├── AIService.ts
│   └── GitHubService.ts
├── views/                # UI components
│   ├── components/       # Reusable UI components
│   └── pages/           # Page-level components
├── utils/               # Utility functions
├── types.ts             # TypeScript type definitions
├── main.ts              # Electron main process
├── preload.ts           # Electron preload script
└── renderer/            # Frontend application
    ├── index.html
    ├── styles.css
    └── app.js
```

## Architecture Layers

### 1. Models (`src/models/`)

Models represent the data structure and business rules. They encapsulate data validation and transformation logic.

**Example: Profile.ts**
- Defines the Profile data structure
- Provides validation methods
- Handles data serialization/deserialization

### 2. Services (`src/services/`)

Services handle external integrations and low-level operations. They provide a clean interface for:
- Database operations (DatabaseService)
- Configuration management (ConfigService)
- AI API integrations (AIService)
- GitHub API integration (GitHubService)

**Design Pattern**: Singleton pattern for shared services (ConfigService, AIService)

### 3. Controllers (`src/controllers/`)

Controllers orchestrate the flow between services and the view layer. They:
- Handle business logic
- Coordinate between multiple services
- Provide a clean API for IPC handlers

**Controllers:**
- **ProfileController**: Manages profile CRUD operations
- **SettingsController**: Handles application settings
- **AIController**: Manages AI-related operations
- **GitHubController**: Handles GitHub integration

### 4. Views (`src/views/` and `src/renderer/`)

Views handle the presentation layer:
- User interface components
- Event handling
- User interactions

## Data Flow

```
User Action (View)
    ↓
IPC Call (main.ts)
    ↓
Controller
    ↓
Service(s)
    ↓
Model/Database
    ↓
Response back through the chain
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Controllers and services can be unit tested independently
3. **Maintainability**: Changes in one layer don't cascade to others
4. **Scalability**: Easy to add new features by extending existing patterns
5. **Code Reusability**: Services and models can be reused across controllers

## Example: Creating a Profile

```typescript
// 1. User clicks "Create Profile" in the view (renderer/app.js)
// 2. IPC call sent to main process
ipcRenderer.invoke('create-profile', profileData)

// 3. Main process routes to controller (main.ts)
ipcMain.handle('create-profile', async (_: IpcMainInvokeEvent, profileData: any) => {
    return this.profileController.createProfile(profileData);
});

// 4. Controller validates and processes (ProfileController.ts)
async createProfile(profileData: CreateProfileData): Promise<Profile> {
    // Validation
    if (!profileData.name || !profileData.language) {
        throw new Error('Profile name and language are required');
    }
    
    // Delegate to service
    return this.dbService.createProfile(profileData);
}

// 5. Service performs database operation (DatabaseService.ts)
public createProfile(profileData: CreateProfileData): Profile {
    // SQL INSERT
    // Return profile
}

// 6. Response flows back to the view
```

## Best Practices

1. **Controllers should be thin**: Delegate complex operations to services
2. **Services should be reusable**: Don't couple them to specific controllers
3. **Models should validate**: Keep validation logic in models
4. **Views should be dumb**: Minimal logic, focus on presentation
5. **Use TypeScript types**: Ensure type safety across layers

## Future Enhancements

- Add comprehensive unit tests for controllers and services
- Implement middleware for IPC request validation
- Add logging service for better debugging
- Create view components library for UI reusability
- Implement caching layer for frequently accessed data
