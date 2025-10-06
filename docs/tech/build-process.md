# Build Process

## Overview

The VS Code Profile Launcher uses a TypeScript-based build system with Electron Builder for packaging. This document describes the build process, configuration, and deployment.

## Build System Architecture

```
Source Code (TypeScript)
    ↓ tsc (TypeScript Compiler)
TypeScript → JavaScript (dist/)
    ↓ electron-builder
Packaged Application
    ↓
Distributable Files (.exe, .dmg, .AppImage)
```

## Development Build

### Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start application
npm start
```

### Watch Mode

For active development with automatic rebuilds:

```bash
# Terminal 1: Watch and rebuild TypeScript
npm run build:watch

# Terminal 2: Run Electron with hot reload
npm run dev
```

The `dev` script uses `concurrently` and `wait-on` to:
1. Watch TypeScript files for changes
2. Recompile automatically
3. Restart Electron when changes detected

### Build Commands

```bash
# Clean build artifacts
npm run clean

# Build TypeScript
npm run build

# Build and watch
npm run build:watch

# Development mode (watch + run)
npm run dev
```

## TypeScript Configuration

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "moduleResolution": "node"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "build", "release"]
}
```

**Key Settings:**
- **target**: ES2020 for modern JavaScript features
- **module**: CommonJS for Node.js compatibility
- **strict**: Enable all strict type checking
- **sourceMap**: Generate source maps for debugging
- **declaration**: Generate .d.ts files for type checking

### Build Output

After compilation:

```
dist/
├── main.js           # Main process
├── main.js.map       # Source map
├── preload.js        # Preload script
├── services/         # Service layer
├── controllers/      # Controller layer
├── models/          # Data models
├── utils/           # Utilities
└── renderer/        # Frontend files (copied)
```

## Production Build

### Creating Distributables

```bash
# Build and package for current platform
npm run dist

# Package only (skip build)
npm run pack
```

### electron-builder Configuration

Configuration in `package.json`:

```json
{
    "build": {
        "appId": "com.vscode-profile-launcher",
        "productName": "VS Code Profile Launcher",
        "directories": {
            "output": "release"
        },
        "files": [
            "dist/**/*",
            "src/renderer/**/*",
            "package.json"
        ],
        "mac": {
            "category": "public.app-category.developer-tools",
            "target": ["dmg", "zip"]
        },
        "win": {
            "target": ["nsis", "portable"]
        },
        "linux": {
            "target": ["AppImage", "deb"],
            "category": "Development"
        }
    }
}
```

### Platform-Specific Builds

**Windows:**
```bash
npm run dist -- --win
```

**macOS:**
```bash
npm run dist -- --mac
```

**Linux:**
```bash
npm run dist -- --linux
```

**All platforms:**
```bash
npm run dist -- --mac --win --linux
```

## Build Artifacts

### Development Artifacts

```
dist/              # Compiled JavaScript
├── main.js
├── preload.js
├── services/
├── controllers/
└── ...
```

### Production Artifacts

```
release/
├── vscode-profile-launcher-1.0.0.exe      # Windows installer
├── vscode-profile-launcher-1.0.0.dmg      # macOS disk image
├── vscode-profile-launcher-1.0.0.AppImage # Linux AppImage
├── vscode-profile-launcher-1.0.0.deb      # Debian package
└── builder-*.yaml                         # Build metadata
```

## Optimization Scripts

### Custom Build Script

Located in `scripts/build/optimize.sh`:

```bash
#!/bin/bash

echo "Starting optimized build..."

# Clean previous builds
npm run clean

# Build TypeScript
echo "Compiling TypeScript..."
npm run build

# Verify build
echo "Verifying build..."
if [ ! -f "dist/main.js" ]; then
    echo "Error: Build failed"
    exit 1
fi

# Bundle size report
echo "Bundle size report:"
du -sh dist/*

# Package application
echo "Packaging application..."
npm run pack

echo "Build completed successfully!"
```

Run with:
```bash
./scripts/build/optimize.sh
```

## Build Verification

### Automated Checks

```bash
# Verify TypeScript compilation
npm run build

# Check for TypeScript errors
tsc --noEmit

# Run linter
npm run lint

# Run tests
npm test
```

### Manual Verification

1. **Check File Structure**
   ```bash
   ls -la dist/
   ```

2. **Verify Main Files**
   ```bash
   node -e "require('./dist/main.js')"
   ```

3. **Test Application**
   ```bash
   npm start
   ```

## Environment Configuration

### .env File

```bash
# Development
NODE_ENV=development
DEBUG=true

# Production
NODE_ENV=production
DEBUG=false

# API Keys (optional for build)
GEMINI_API_KEY=
OPENAI_API_KEY=
GITHUB_TOKEN=
```

### Environment-Specific Builds

**Development:**
```json
{
    "scripts": {
        "dev": "NODE_ENV=development npm run build && electron ."
    }
}
```

**Production:**
```json
{
    "scripts": {
        "dist": "NODE_ENV=production npm run build && electron-builder"
    }
}
```

## Dependencies

### Build Dependencies

From `package.json`:

```json
{
    "devDependencies": {
        "typescript": "^5.3.2",
        "electron": "^35.7.5",
        "electron-builder": "^24.9.1",
        "concurrently": "^8.2.2",
        "wait-on": "^7.2.0"
    }
}
```

### Production Dependencies

```json
{
    "dependencies": {
        "@google/generative-ai": "^0.24.1",
        "@octokit/rest": "^22.0.0",
        "better-sqlite3": "^9.2.2",
        "dotenv": "^17.2.3",
        "monaco-editor": "^0.53.0",
        "openai": "^6.1.0"
    }
}
```

### Native Dependencies

Some dependencies require native compilation:

- **better-sqlite3**: SQLite bindings
- **Electron**: Native modules

Handled automatically by `electron-builder`:

```bash
npm run postinstall  # Runs: electron-builder install-app-deps
```

## Code Signing

### macOS Code Signing

```json
{
    "build": {
        "mac": {
            "identity": "Developer ID Application: Your Name (TEAM_ID)",
            "hardenedRuntime": true,
            "gatekeeperAssess": false,
            "entitlements": "build/entitlements.mac.plist",
            "entitlementsInherit": "build/entitlements.mac.plist"
        }
    }
}
```

**Entitlements file** (`build/entitlements.mac.plist`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
```

### Windows Code Signing

```json
{
    "build": {
        "win": {
            "certificateFile": "path/to/cert.pfx",
            "certificatePassword": "password",
            "signingHashAlgorithms": ["sha256"],
            "rfc3161TimeStampServer": "http://timestamp.digicert.com"
        }
    }
}
```

## Continuous Integration

### GitHub Actions Workflow

Located in `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm test
      
      - name: Package
        run: npm run dist
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: release-${{ matrix.os }}
          path: release/
```

## Performance Optimization

### Build Time Optimization

1. **Use Incremental Builds**
   ```json
   {
       "compilerOptions": {
           "incremental": true,
           "tsBuildInfoFile": ".tsbuildinfo"
       }
   }
   ```

2. **Skip Type Checking in Watch Mode**
   ```bash
   tsc --noEmit false --watch
   ```

3. **Parallel Builds**
   ```bash
   npm run build:main & npm run build:renderer
   ```

### Bundle Size Optimization

1. **Analyze Dependencies**
   ```bash
   npm list --depth=0
   ```

2. **Remove Unused Dependencies**
   ```bash
   npm prune --production
   ```

3. **Tree Shaking**
   - Use ES modules where possible
   - Import only what you need

### Runtime Optimization

1. **Lazy Loading**
   ```typescript
   // Instead of:
   import { Octokit } from '@octokit/rest';
   
   // Use:
   const { Octokit } = await import('@octokit/rest');
   ```

2. **Code Splitting**
   - Separate main and renderer bundles
   - Load Monaco Editor on demand

## Debugging Builds

### Source Maps

Enable source maps in `tsconfig.json`:

```json
{
    "compilerOptions": {
        "sourceMap": true,
        "inlineSourceMap": false,
        "inlineSources": false
    }
}
```

### Debug Build

```bash
# Build with debugging enabled
npm run build -- --sourceMap

# Start with DevTools
npm start
```

### VS Code Debug Configuration

`.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Main Process",
            "type": "node",
            "request": "launch",
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
            "runtimeArgs": ["--remote-debugging-port=9223", "."],
            "sourceMaps": true,
            "outFiles": ["${workspaceFolder}/dist/**/*.js"]
        }
    ]
}
```

## Troubleshooting

### Build Fails

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Native Module Issues

**Problem**: better-sqlite3 doesn't work

**Solution**:
```bash
# Rebuild native modules
npm run postinstall
# or
electron-builder install-app-deps
```

### Missing Files in Package

**Problem**: Files not included in distribution

**Solution**: Update `files` in `package.json`:
```json
{
    "build": {
        "files": [
            "dist/**/*",
            "src/renderer/**/*",
            "!src/renderer/**/*.ts",
            "package.json"
        ]
    }
}
```

### Large Bundle Size

**Problem**: Application is too large

**Solution**:
1. Exclude dev dependencies: `npm prune --production`
2. Analyze bundle: `npm ls --prod`
3. Remove unused files from `files` array
4. Use `asar` packaging: `"asar": true`

## Best Practices

### 1. Always Clean Before Release

```bash
npm run clean && npm run build && npm run dist
```

### 2. Version Control

Include in `.gitignore`:
```
dist/
build/
release/
*.tsbuildinfo
```

### 3. Automated Testing

Run tests before building:
```bash
npm test && npm run build
```

### 4. Semantic Versioning

Update version in `package.json`:
```json
{
    "version": "1.2.3"
}
```

### 5. Release Notes

Maintain `CHANGELOG.md` for each version.

## Build Checklist

Before release:

- [ ] All tests passing
- [ ] Linting passes
- [ ] Version number updated
- [ ] CHANGELOG updated
- [ ] Clean build completed
- [ ] Application tested manually
- [ ] Native modules rebuilt
- [ ] Code signed (if applicable)
- [ ] Release notes prepared

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [Performance Guide](./performance.md)
- [Developer Guide](../guides/DEVELOPER-GUIDE.md)
- [Electron Builder Docs](https://www.electron.build/)

## Scripts Reference

```json
{
    "clean": "rm -rf dist build release",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "start": "npm run build && electron .",
    "dev": "concurrently \"npm run build:watch\" \"wait-on dist/main.js && electron .\"",
    "pack": "electron-builder --dir",
    "dist": "npm run build && electron-builder",
    "postinstall": "electron-builder install-app-deps"
}
```

---

**Happy Building!** 🏗️
