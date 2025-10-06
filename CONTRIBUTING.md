# Contributing to VS Code Profile Launcher

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Code Style](#code-style)
6. [Testing](#testing)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Issues](#reporting-issues)
9. [Feature Requests](#feature-requests)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Personal attacks or insults
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 16+** and npm installed
- **Git** for version control
- **VS Code** (recommended for development)
- Basic knowledge of TypeScript and Electron

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vscode-profile-launcher.git
   cd vscode-profile-launcher
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/rootkitoriginal/vscode-profile-launcher.git
   ```

### Stay Updated

Sync with upstream regularly:
```bash
git fetch upstream
git checkout master
git merge upstream/master
```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys (optional for development):
   ```
   GEMINI_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   GITHUB_TOKEN=your_token_here
   ```

### Build and Run

```bash
# Build TypeScript
npm run build

# Start in development mode
npm run dev

# Start built application
npm start
```

### Development Tools

- **Watch mode**: `npm run build:watch`
- **Linter**: `npm run lint`
- **Formatter**: `npm run format`
- **Tests**: `npm test`

## Making Changes

### Create a Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Build, configuration, or maintenance

### Make Your Changes

1. **Follow the MVC architecture** - See [MVC Architecture](docs/architecture/MVC-ARCHITECTURE.md)
2. **Write clean, readable code**
3. **Add comments** for complex logic
4. **Update documentation** if needed
5. **Add tests** for new functionality

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)

**Examples:**

```bash
git commit -m "feat(profiles): add profile export functionality"
git commit -m "fix(github): resolve authentication token issue"
git commit -m "docs(api): update GitHub API documentation"
```

**Detailed commit:**
```bash
feat(ai): add support for Claude AI provider

- Added Claude service integration
- Updated AI provider selection UI
- Added configuration for Claude API keys

Closes #123
```

### Keep Commits Focused

- One logical change per commit
- Small, focused commits are better than large ones
- Each commit should pass tests

## Code Style

### TypeScript

We use TypeScript for type safety and better code quality.

**Key principles:**
- Use explicit types, avoid `any`
- Prefer interfaces over types for objects
- Use meaningful variable names
- Keep functions small and focused

**Example:**
```typescript
// ✅ Good
interface ProfileData {
    name: string;
    language: string;
    description?: string;
}

function createProfile(data: ProfileData): Profile {
    // Implementation
}

// ❌ Bad
function create(d: any) {
    // Implementation
}
```

### Formatting

We use Prettier for consistent code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Configuration:** `.prettierrc.json`
- 4 spaces indentation
- Single quotes
- Trailing commas
- Print width: 100

### Linting

We use ESLint to catch common issues:

```bash
# Lint code
npm run lint

# Auto-fix issues
npm run lint:fix
```

**Configuration:** `.eslintrc.json` and `eslint.config.js`

### File Organization

Follow the MVC structure:

```
src/
├── controllers/    # Business logic
├── models/         # Data models
├── services/       # External integrations
├── views/          # UI components
├── utils/          # Helper functions
└── types.ts        # Type definitions
```

### Naming Conventions

- **Classes**: PascalCase (`ProfileController`)
- **Functions**: camelCase (`createProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PROFILES`)
- **Interfaces**: PascalCase (`ProfileData`)
- **Files**: PascalCase for classes, camelCase for others

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration
```

### Writing Tests

Use Jest for testing:

```typescript
describe('ProfileController', () => {
    let controller: ProfileController;
    
    beforeEach(() => {
        controller = new ProfileController(mockService);
    });
    
    it('should create profile', async () => {
        const data = {
            name: 'Test',
            language: 'TypeScript'
        };
        
        const profile = await controller.createProfile(data);
        
        expect(profile.name).toBe('Test');
        expect(profile.language).toBe('TypeScript');
    });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- All new features must include tests
- Bug fixes should include regression tests

### Testing Best Practices

1. **Arrange-Act-Assert** pattern
2. **One assertion per test** when possible
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**

## Pull Request Process

### Before Submitting

Checklist before creating a PR:

- [ ] Code follows project style guidelines
- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Formatting is correct: `npm run format:check`
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with master

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to GitHub and create a Pull Request

3. Fill out the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes were made and why
   - **Related Issues**: Link to related issues
   - **Screenshots**: For UI changes
   - **Testing**: How you tested the changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## How Has This Been Tested?
Describe testing performed

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated checks** run on your PR
2. **Maintainers review** your code
3. **Address feedback** by pushing new commits
4. **Approval required** before merging
5. **Squash and merge** by maintainers

### Review Feedback

- Be responsive to feedback
- Ask questions if something is unclear
- Make requested changes promptly
- Be open to suggestions

## Reporting Issues

### Bug Reports

Use the bug report template and include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - OS and version
   - Node.js version
   - Application version
6. **Screenshots**: If applicable
7. **Logs**: Error messages or console output

**Example:**

```markdown
**Bug Description**
Profile fails to launch VS Code on Windows 11

**Steps to Reproduce**
1. Create new profile
2. Click Launch button
3. Nothing happens

**Expected Behavior**
VS Code should open with profile

**Environment**
- OS: Windows 11
- Node.js: 16.14.0
- App version: 1.0.0

**Error Logs**
```
Error: spawn ENOENT
```

### Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security concerns to the maintainers
2. Include detailed description
3. Wait for response before public disclosure

## Feature Requests

### Proposing Features

1. Check existing issues for duplicates
2. Create a new issue with:
   - **Use Case**: Why is this needed?
   - **Proposed Solution**: How should it work?
   - **Alternatives**: Other solutions considered
   - **Additional Context**: Screenshots, mockups

3. Be patient - features are reviewed and prioritized

### Discussion

- Participate in feature discussions
- Provide feedback on proposed features
- Help refine requirements

## Development Guidelines

### Architecture

Follow the MVC pattern:

- **Models**: Data structures and validation
- **Views**: UI components
- **Controllers**: Business logic orchestration
- **Services**: External integrations

See [MVC Architecture](docs/architecture/MVC-ARCHITECTURE.md) for details.

### Dependencies

- Minimize new dependencies
- Use well-maintained packages
- Check licenses for compatibility
- Update dependencies regularly

### Performance

- Optimize database queries
- Use caching when appropriate
- Avoid blocking operations
- Profile performance-critical code

### Security

- Never commit secrets or API keys
- Validate all user input
- Use parameterized database queries
- Follow Electron security best practices

## Documentation

### Types of Documentation

1. **Code Comments**: Explain complex logic
2. **API Documentation**: Document public APIs
3. **Architecture Docs**: System design and structure
4. **User Guides**: How to use features
5. **Developer Guides**: How to contribute

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up to date

### Updating Documentation

Documentation changes are valuable contributions:

- Fix typos and errors
- Add missing information
- Improve clarity
- Add examples

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and features
- **Discussions**: Questions and ideas
- **Pull Requests**: Code review and collaboration

### Getting Help

- Read the documentation first
- Search existing issues
- Ask in discussions
- Be specific and provide context

### Helping Others

- Answer questions in discussions
- Review pull requests
- Test new features
- Improve documentation

## Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes
- Project README

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing:

1. Check the [Developer Guide](docs/guides/DEVELOPER-GUIDE.md)
2. Search existing issues and discussions
3. Create a new discussion
4. Contact maintainers

---

Thank you for contributing to VS Code Profile Launcher! 🎉
