# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                     (Electron Renderer)                         │
│                     src/renderer/app.js                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ IPC Communication
             │
┌────────────▼────────────────────────────────────────────────────┐
│                     Electron Main Process                       │
│                         (src/main.ts)                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    IPC Handlers Layer                     │ │
│  │  • get-profiles, create-profile, update-profile, etc.    │ │
│  └─────────────┬─────────────────────────────────────────────┘ │
│                │                                                │
│  ┌─────────────▼─────────────────────────────────────────────┐ │
│  │               Controllers Layer (MVC)                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │   Profile    │  │   Settings   │  │      AI      │   │ │
│  │  │  Controller  │  │  Controller  │  │  Controller  │   │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │ │
│  │         │                 │                 │            │ │
│  │  ┌──────┴───────┐         │         ┌───────┴──────┐    │ │
│  │  │   GitHub     │─────────┘         │              │    │ │
│  │  │  Controller  │                   │              │    │ │
│  │  └──────┬───────┘                   │              │    │ │
│  └─────────┼────────────────────────────┼──────────────────┘ │
│            │                            │                     │
│  ┌─────────▼────────────────────────────▼──────────────────┐ │
│  │                  Services Layer                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │   Database   │  │    Config    │  │      AI      │  │ │
│  │  │   Service    │  │   Service    │  │   Service    │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │ │
│  │         │                 │                 │           │ │
│  │  ┌──────┴───────┐         │                 │           │ │
│  │  │   GitHub     │─────────┘                 │           │ │
│  │  │   Service    │                           │           │ │
│  │  └──────┬───────┘                           │           │ │
│  └─────────┼────────────────────────────────────┼──────────┘ │
│            │                                    │             │
│  ┌─────────▼────────────────────────────────────▼──────────┐ │
│  │                  Models Layer                            │ │
│  │  ┌──────────────┐                                        │ │
│  │  │   Profile    │  (Data validation & transformation)    │ │
│  │  │    Model     │                                        │ │
│  │  └──────────────┘                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
             │                            │
             │                            │
┌────────────▼──────────┐    ┌───────────▼──────────┐
│    SQLite Database    │    │  External APIs       │
│  (profiles.db)        │    │  • Gemini AI         │
│                       │    │  • OpenAI            │
└───────────────────────┘    │  • GitHub API        │
                             └──────────────────────┘
```

## Data Flow Example: Creating a Profile

```
┌─────────┐                     ┌──────────┐
│  User   │                     │ Renderer │
│Interface│                     │ Process  │
└────┬────┘                     └────┬─────┘
     │                               │
     │  1. Click "Create Profile"    │
     ├──────────────────────────────>│
     │                               │
     │                               │ 2. IPC Call
     │                               │    'create-profile'
     │                               ├────────────────┐
     │                               │                │
     │                          ┌────▼────────────────▼────┐
     │                          │   Main Process (main.ts) │
     │                          │                          │
     │                          │  3. Route to Controller  │
     │                          │     profileController    │
     │                          │     .createProfile()     │
     │                          └────┬────────────────────┘
     │                               │
     │                          ┌────▼────────────────┐
     │                          │ ProfileController   │
     │                          │                     │
     │                          │ 4. Validate data    │
     │                          │                     │
     │                          │ 5. Call service     │
     │                          └────┬───────────────┘
     │                               │
     │                          ┌────▼────────────────┐
     │                          │ DatabaseService     │
     │                          │                     │
     │                          │ 6. Create profile   │
     │                          │    in database      │
     │                          └────┬───────────────┘
     │                               │
     │                          ┌────▼────────────────┐
     │                          │   SQLite Database   │
     │                          │                     │
     │                          │ 7. INSERT query     │
     │                          └────┬───────────────┘
     │                               │
     │                               │ 8. Return Profile
     │                               │
     │                          ┌────┴───────────────┐
     │                          │     Response        │
     │                          │  flows back up      │
     │  9. Display success      │  through layers     │
     │<─────────────────────────┤                     │
     │                          └─────────────────────┘
┌────▼────┐
│  User   │
│Interface│
│ Updated │
└─────────┘
```

## Layer Responsibilities

### 1. View Layer (Renderer Process)
- **Location**: `src/renderer/`
- **Responsibilities**:
  - Display user interface
  - Handle user interactions
  - Send IPC requests
  - Update UI based on responses
- **Technologies**: HTML, CSS, JavaScript, Monaco Editor

### 2. Controller Layer
- **Location**: `src/controllers/`
- **Responsibilities**:
  - Orchestrate business logic
  - Validate input data
  - Coordinate between services
  - Handle errors and edge cases
- **Files**:
  - ProfileController.ts
  - SettingsController.ts
  - AIController.ts
  - GitHubController.ts

### 3. Service Layer
- **Location**: `src/services/`
- **Responsibilities**:
  - External API integration
  - Database operations
  - Configuration management
  - Low-level operations
- **Files**:
  - DatabaseService.ts
  - ConfigService.ts
  - AIService.ts
  - GitHubService.ts

### 4. Model Layer
- **Location**: `src/models/`
- **Responsibilities**:
  - Define data structures
  - Validate data
  - Transform data
  - Business rules
- **Files**:
  - Profile.ts

### 5. Utility Layer
- **Location**: `src/utils/`
- **Responsibilities**:
  - Reusable functions
  - Common operations
  - Helper methods
- **Files**:
  - logger.ts
  - validators.ts

## Communication Patterns

### IPC Communication
```
Renderer Process  ←→  Main Process
                 IPC
    (app.js)     ←→   (main.ts)
```

### Service Communication
```
Controller  →  Service  →  External Resource
            (calls)         (database/API)
```

### Dependency Flow
```
View
  ↓
IPC Handler (main.ts)
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
External Resource
```

## File Structure with Responsibilities

```
src/
├── main.ts                     # IPC routing & app initialization
├── preload.ts                  # Secure IPC bridge
├── types.ts                    # TypeScript type definitions
│
├── controllers/                # BUSINESS LOGIC
│   ├── ProfileController.ts    # Profile operations
│   ├── SettingsController.ts   # Settings management
│   ├── AIController.ts         # AI operations
│   └── GitHubController.ts     # GitHub integration
│
├── models/                     # DATA STRUCTURES
│   └── Profile.ts              # Profile model with validation
│
├── services/                   # EXTERNAL INTEGRATION
│   ├── DatabaseService.ts      # SQLite operations
│   ├── ConfigService.ts        # Configuration management
│   ├── AIService.ts            # AI API integration
│   └── GitHubService.ts        # GitHub API integration
│
├── utils/                      # UTILITIES
│   ├── logger.ts               # Logging utility
│   └── validators.ts           # Validation helpers
│
└── renderer/                   # USER INTERFACE
    ├── index.html
    ├── styles.css
    └── app.js
```

## Design Principles

### 1. Separation of Concerns
Each layer has a distinct responsibility and doesn't know about implementation details of other layers.

### 2. Single Responsibility
Each class/module has one reason to change.

### 3. Dependency Injection
Controllers receive their dependencies (services) through constructor injection.

### 4. Interface Segregation
Services expose minimal, focused interfaces to controllers.

### 5. Don't Repeat Yourself (DRY)
Common logic extracted into utilities and shared services.

## Benefits of This Architecture

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Changes are isolated to specific layers
3. **Scalability**: Easy to add new features following established patterns
4. **Readability**: Clear structure makes code easy to understand
5. **Flexibility**: Layers can be modified without affecting others

## Next Steps

- Add unit tests for controllers
- Implement integration tests
- Refactor renderer into smaller components
- Add middleware for request validation
- Implement caching layer for performance
