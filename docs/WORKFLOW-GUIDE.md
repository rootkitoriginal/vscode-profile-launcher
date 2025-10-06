# Workflow and Performance Guide

This guide covers the development workflow, performance optimization, and best practices for the VS Code Profile Launcher.

## Table of Contents

1. [Development Workflow](#development-workflow)
2. [Testing Strategy](#testing-strategy)
3. [Code Quality](#code-quality)
4. [Performance Optimization](#performance-optimization)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Best Practices](#best-practices)

## Development Workflow

### Quick Start

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Run in watch mode with hot reload
./scripts/dev/watch.sh
```

### Development Commands

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `npm run dev`         | Start development with watch mode |
| `npm run build`       | Build TypeScript                  |
| `npm run build:watch` | Watch mode compilation            |
| `npm start`           | Build and start Electron          |

### File Watching

The development setup includes:

- **TypeScript Watch**: Automatic recompilation on `.ts` file changes
- **Hot Reload**: Restart Electron on main process changes
- **Live Reload**: Refresh renderer on view changes (via DevTools)

### Development Tools

#### Electron DevTools

Open DevTools in the running app:

- **Windows/Linux**: `Ctrl+Shift+I`
- **macOS**: `Cmd+Option+I`

#### VS Code Debugging

Launch configurations are available in `.vscode/launch.json` for debugging:

- Main process debugging
- Renderer process debugging
- Attach to running process

## Testing Strategy

### Test Structure

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for service interactions
├── e2e/           # End-to-end tests for complete workflows
└── __mocks__/     # Mock implementations
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

#### Unit Test Example

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProfileController } from '../../src/controllers/ProfileController';

describe('ProfileController', () => {
    let controller: ProfileController;

    beforeEach(() => {
        // Setup
    });

    it('should create a profile', async () => {
        // Test implementation
    });
});
```

#### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { DatabaseService } from '../../src/services/DatabaseService';

describe('Database Integration', () => {
    let db: DatabaseService;

    beforeAll(() => {
        // Setup test database
    });

    afterAll(() => {
        // Cleanup
    });

    it('should persist profile changes', async () => {
        // Test implementation
    });
});
```

### Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user workflows

## Code Quality

### Automated Checks

#### Pre-commit Hooks

Automatically runs on every commit:

1. **Lint-staged**: Formats and lints changed files
2. **Unit Tests**: Runs fast unit tests

#### Commit Message Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

**Example:**

```
feat(profiles): add export functionality

Added ability to export profiles to JSON format for backup
and sharing purposes.

Closes #123
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format files
npm run format
```

### ESLint Configuration

The project uses:

- ESLint for TypeScript
- Prettier for formatting
- Consistent 4-space indentation
- Single quotes
- Semicolons required

## Performance Optimization

### Performance Monitoring

The application includes built-in performance monitoring utilities:

```typescript
import { PerformanceMonitor } from './utils/performance';

// Measure async operations
const { result, duration } = await PerformanceMonitor.measureAsync('loadProfiles', () =>
    db.getProfiles()
);

// Measure sync operations
const { result, duration } = PerformanceMonitor.measure('processData', () => processData(data));

// Get statistics
const stats = PerformanceMonitor.getMetricStats('loadProfiles');
console.log(`Average: ${stats.avg}ms, P95: ${stats.p95}ms`);
```

### Caching

Use the built-in cache for expensive operations:

```typescript
import { Cache } from './utils/cache';

const cache = new Cache(5 * 60 * 1000); // 5 minutes TTL

// Get or compute value
const data = await cache.getOrSet(
    'github-repos',
    () => fetchRepositories(),
    10 * 60 * 1000 // 10 minutes
);
```

### Performance Targets

| Metric       | Target  | Current |
| ------------ | ------- | ------- |
| Startup Time | < 3s    | TBD     |
| Memory Usage | < 200MB | TBD     |
| Bundle Size  | < 50MB  | TBD     |
| Profile Load | < 100ms | TBD     |

### Performance Best Practices

1. **Lazy Loading**: Load components only when needed
2. **Debouncing**: Debounce frequent operations (search, autosave)
3. **Virtualization**: Use virtual scrolling for large lists
4. **Query Optimization**: Index database tables appropriately
5. **Memory Management**: Clean up event listeners and timers

### Measuring Performance

```bash
# Generate performance report
./scripts/dev/performance-report.sh

# Profile with Chrome DevTools
# 1. Open app with DevTools
# 2. Go to Performance tab
# 3. Record and analyze
```

## CI/CD Pipeline

### GitHub Actions Workflows

#### Continuous Integration (`ci.yml`)

Runs on every push and pull request:

**Jobs:**

1. **Lint**: ESLint and Prettier checks
2. **Test**: Unit and integration tests
3. **Build**: Multi-platform builds (Linux, Windows, macOS)

**Triggers:**

- Push to `main`, `master`, or `develop` branches
- Pull requests to these branches

#### Release (`release.yml`)

Runs on version tags:

**Jobs:**

1. Build application for all platforms
2. Package as executables
3. Create GitHub release draft

**Triggers:**

- Tags matching `v*` (e.g., `v1.0.0`)

### Creating a Release

```bash
# Update version in package.json
npm version patch|minor|major

# Push tag to trigger release
git push --tags
```

### CI/CD Best Practices

1. **Fast Feedback**: Keep CI runs under 10 minutes
2. **Fail Fast**: Run linting before tests
3. **Parallel Jobs**: Run tests in parallel
4. **Cache Dependencies**: Use npm cache
5. **Clear Logs**: Provide actionable error messages

## Best Practices

### Project Structure

```
src/
├── main.ts              # Main process
├── preload.ts           # Preload script
├── controllers/         # Business logic
├── services/           # External integrations
├── models/             # Data models
├── utils/              # Utility functions
└── renderer/           # UI components
```

### Code Organization

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: Pass dependencies to constructors
3. **Error Handling**: Use try-catch and proper error messages
4. **Type Safety**: Use TypeScript types strictly
5. **Documentation**: Comment complex logic

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feat/my-feature
```

### Code Review Checklist

- [ ] All tests passing
- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] Error handling in place
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

### Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **Input Validation**: Validate all user input
3. **SQL Injection**: Use parameterized queries
4. **XSS Prevention**: Sanitize HTML content
5. **Dependency Updates**: Keep dependencies updated

### Performance Tips

1. **Async Operations**: Use async/await for I/O
2. **Batch Operations**: Group database writes
3. **Resource Cleanup**: Dispose of resources properly
4. **Memory Leaks**: Remove event listeners
5. **Lazy Loading**: Defer non-critical work

## Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### Test Failures

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test
npm test -- ProfileController.test.ts
```

#### Git Hook Failures

```bash
# Reinstall hooks
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

#### Performance Issues

```bash
# Profile the app
npm run dev
# Open DevTools and use Performance profiler

# Check memory usage
./scripts/dev/performance-report.sh
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/en/actions)

## Contributing

See [DEVELOPER-GUIDE.md](./guides/DEVELOPER-GUIDE.md) for detailed contribution guidelines.

## Support

For issues or questions:

1. Check existing GitHub issues
2. Review documentation
3. Create a new issue with details
