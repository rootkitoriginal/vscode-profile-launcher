# Scripts Directory

This directory contains various scripts to help with development, building, and deployment of the VS Code Profile Launcher.

## Directory Structure

```
scripts/
├── build/          # Build and optimization scripts
├── deploy/         # Deployment scripts
├── dev/            # Development helper scripts
└── utils/          # Utility scripts
```

## Development Scripts

### `dev/watch.sh`

Enhanced development mode with hot reload capabilities.

```bash
./scripts/dev/watch.sh
```

Features:

- Automatic TypeScript recompilation on file changes
- Clean build process
- Colored output for better readability
- Graceful shutdown handling

### `dev/performance-report.sh`

Generate a performance report of the application.

```bash
./scripts/dev/performance-report.sh
```

Shows:

- Bundle sizes
- Dependencies size
- Test coverage summary
- Performance targets

## Build Scripts

### `build/optimize.sh`

Production-optimized build process.

```bash
./scripts/build/optimize.sh
```

Features:

- Clean build
- TypeScript compilation
- Build verification
- Bundle size reporting
- Application packaging

## Utility Scripts

### `utils/clean.sh`

Clean all build artifacts and generated files.

```bash
./scripts/utils/clean.sh
```

Removes:

- `dist/` directory
- `build/` directory
- `release/` directory
- `logs/` directory

## NPM Scripts

The following scripts are available via `npm run`:

### Development

- `npm run dev` - Start development mode with watch
- `npm run build:watch` - Watch TypeScript files for changes

### Building

- `npm run build` - Clean build of TypeScript
- `npm run clean` - Clean build artifacts

### Testing

- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Packaging

- `npm run pack` - Package application
- `npm run dist` - Build and package for distribution

## Git Hooks

Pre-commit and commit-msg hooks are managed by Husky:

### Pre-commit

Automatically runs:

- Code formatting (via lint-staged)
- Linting (via lint-staged)
- Unit tests

### Commit-msg

Validates commit messages using commitlint.

Commit message format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Example:

```
feat: add performance monitoring utilities

Added PerformanceMonitor class to track execution times
and memory usage across the application.
```

## CI/CD

GitHub Actions workflows are configured in `.github/workflows/`:

### `ci.yml`

Runs on every push and pull request:

- Linting and formatting checks
- Unit and integration tests
- Multi-platform builds (Linux, Windows, macOS)
- Code coverage reporting

### `release.yml`

Runs on version tags:

- Multi-platform builds
- Application packaging
- Draft release creation

## Tips

1. **Development**: Use `npm run dev` for the best development experience
2. **Testing**: Run `npm run test:watch` while developing
3. **Before Commit**: Run `npm run lint:fix && npm run format` to ensure code quality
4. **Production Build**: Use `./scripts/build/optimize.sh` for optimized builds
5. **Performance Check**: Run `./scripts/dev/performance-report.sh` regularly

## Troubleshooting

### Build Errors

```bash
npm run clean
npm install
npm run build
```

### Test Failures

```bash
npm run test:unit -- --verbose
```

### Git Hook Issues

```bash
npx husky install
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```
