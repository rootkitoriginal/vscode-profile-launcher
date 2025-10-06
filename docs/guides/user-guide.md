# User Guide

## Welcome to VS Code Profile Launcher

VS Code Profile Launcher helps you manage multiple development environments with different configurations, extensions, and settings for each programming language or project type you work with.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Profiles](#creating-profiles)
3. [Managing Profiles](#managing-profiles)
4. [Launching VS Code](#launching-vs-code)
5. [AI Integration](#ai-integration)
6. [GitHub Integration](#github-integration)
7. [Advanced Features](#advanced-features)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Installation

1. Download the latest release for your operating system
2. Install the application
3. Launch VS Code Profile Launcher

### First Launch

On first launch, you'll see:
- Empty profile list
- Settings button to configure AI and GitHub
- Create Profile button

### Initial Setup

1. **Configure AI (Optional)**
   - Click Settings (⚙️) → AI Configuration
   - Add Gemini API key or OpenAI API key
   - Choose your preferred AI provider

2. **Configure GitHub (Optional)**
   - Click Settings (⚙️) → GitHub Configuration
   - Add your GitHub personal access token
   - This enables repository integration

## Creating Profiles

### Basic Profile

1. Click **"Create Profile"** button
2. Fill in required fields:
   - **Name**: Unique identifier (e.g., "Python ML", "TypeScript Web")
   - **Language**: Select from supported languages
   - **Description**: Optional details about the profile

3. Click **"Create"**

### Profile with Extensions

1. Create a new profile
2. In the extensions field, add VS Code extension IDs:
   ```
   dbaeumer.vscode-eslint
   esbenp.prettier-vscode
   ms-python.python
   ```
3. Extensions will be automatically installed when launching VS Code

### Profile with AI Configuration

1. Create or edit a profile
2. Select **AI Provider** (Gemini or OpenAI)
3. Choose **AI Model**:
   - **Gemini**: gemini-2.0-flash-exp, gemini-1.5-pro, etc.
   - **OpenAI**: gpt-4, gpt-4-turbo, gpt-3.5-turbo
4. Use AI to generate code templates

### Profile with GitHub Repository

1. Create or edit a profile
2. Enter **GitHub Repository**:
   - Owner: `username` or `organization`
   - Repository: `repo-name`
   - Branch: `main` (optional)
3. Access issues and branches directly from profile

### Profile with Workspace

1. Create or edit a profile
2. Click **"Select Workspace"** button
3. Choose your project directory
4. VS Code will open this folder by default

### Profile with Environment Variables

1. Create or edit a profile
2. Add environment variables in JSON format:
   ```json
   {
       "NODE_ENV": "development",
       "DEBUG": "true",
       "API_URL": "http://localhost:3000"
   }
   ```
3. These will be available in VS Code terminal

## Managing Profiles

### Viewing Profiles

- All profiles are listed on the main screen
- Recently used profiles appear first
- Each card shows:
  - Profile name
  - Programming language
  - Description
  - Last used date

### Editing Profiles

1. Click **Edit** (✏️) on a profile card
2. Modify any fields
3. Click **"Save Changes"**

### Deleting Profiles

1. Click **Delete** (🗑️) on a profile card
2. Confirm deletion
3. Profile is permanently removed

⚠️ **Warning**: Deletion is permanent and cannot be undone!

### Duplicating Profiles

1. Edit an existing profile
2. Change the name
3. Create as new profile
4. Modify settings as needed

### Searching Profiles

1. Use the search box at the top
2. Search by:
   - Profile name
   - Language
   - Description

### Filtering Profiles

1. Click **Filter** button
2. Select language
3. Only profiles for that language are shown

## Launching VS Code

### Quick Launch

1. Click **Launch** button on any profile card
2. VS Code opens with:
   - Profile-specific extensions
   - Configured settings
   - Workspace (if specified)
   - Environment variables

### What Happens on Launch

1. **Profile Validation**: Checks profile configuration
2. **Extension Installation**: Installs missing extensions
3. **Settings Application**: Applies profile settings
4. **Workspace Loading**: Opens specified folder
5. **Environment Setup**: Sets environment variables

### Launch Options

```bash
# Profile data directory
~/.vscode-profiles/<profile-name>/data

# Extensions directory
~/.vscode-profiles/<profile-name>/extensions
```

### Multiple Instances

You can launch multiple profiles simultaneously:
- Each runs in separate VS Code instance
- Independent settings and extensions
- No conflicts between profiles

## AI Integration

### Generating Code Templates

1. Open profile with AI configured
2. Click **"Generate Template"** button
3. AI generates starter code for your language
4. Template is saved in profile

### Custom Code Generation

1. Click **"AI Assistant"** button
2. Enter your prompt:
   ```
   Create a REST API endpoint for user authentication
   ```
3. Select AI provider and model
4. Click **"Generate"**
5. Copy generated code

### Template Examples

**TypeScript:**
```typescript
// Auto-generated class structure
export class HelloWorld {
    constructor() { }
    greet(): void {
        console.log("Hello, TypeScript!");
    }
}
```

**Python:**
```python
# Auto-generated Flask API
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/health')
def health():
    return jsonify({"status": "ok"})
```

### Best Practices

- **Be specific** in prompts: Include details about requirements
- **Iterate**: Refine prompts based on initial results
- **Review code**: Always review generated code before use
- **Save templates**: Store useful templates in profiles

## GitHub Integration

### Linking Repository

1. Edit a profile
2. Add GitHub repository information
3. Save profile

### Viewing Issues

1. Open profile with GitHub repo
2. Click **"View Issues"**
3. See all repository issues
4. Filter by open/closed status

### Creating Issues

1. Open GitHub integration
2. Click **"Create Issue"**
3. Fill in:
   - Title
   - Description
   - Labels (optional)
4. Issue is created in repository

### Viewing Branches

1. Open profile with GitHub repo
2. Click **"View Branches"**
3. See all repository branches
4. Switch branches as needed

### Repository Validation

The app automatically validates:
- Repository exists
- You have access
- Token has proper permissions

## Advanced Features

### Code Templates

Store frequently used code snippets:

1. Edit profile
2. Add code template:
   ```typescript
   // Your template
   export function ${functionName}() {
       // TODO: Implement
   }
   ```
3. Template available when launching VS Code

### Environment Variables

Configure development environment:

```json
{
    "NODE_ENV": "development",
    "DATABASE_URL": "postgresql://localhost/mydb",
    "REDIS_URL": "redis://localhost:6379",
    "LOG_LEVEL": "debug"
}
```

### Extension Management

Automatically install extensions:

```json
[
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "golang.go",
    "rust-lang.rust-analyzer"
]
```

### Profile Paths

Each profile has isolated directories:

- **Data**: `~/.vscode-profiles/<name>/data`
  - Settings, keybindings, snippets
- **Extensions**: `~/.vscode-profiles/<name>/extensions`
  - Installed extensions for this profile

### Backup and Export

**Export Profile:**
1. View profile details
2. Click **"Export"**
3. Save JSON file

**Import Profile:**
1. Click **"Import Profile"**
2. Select JSON file
3. Profile is created

## Tips and Tricks

### 1. Language-Specific Profiles

Create dedicated profiles per language:
- **Python ML**: NumPy, pandas, Jupyter extensions
- **Web Dev**: ESLint, Prettier, Live Server
- **Rust**: rust-analyzer, CodeLLDB

### 2. Project-Type Profiles

Organize by project type:
- **Frontend**: React, Vue, Tailwind extensions
- **Backend**: Database tools, API testing
- **DevOps**: Docker, Kubernetes, Terraform

### 3. Client-Specific Profiles

Separate profiles for different clients:
- Different settings per client
- Client-specific extensions
- Isolated workspaces

### 4. Quick Switching

- Use search to find profiles quickly
- Bookmark frequently used profiles
- Keep profile names short and descriptive

### 5. Naming Convention

Use clear naming patterns:
- `Lang-Purpose`: TypeScript-Web, Python-ML
- `Client-Project`: Acme-API, XYZ-Frontend
- `Type-Tech`: API-Node, Mobile-Flutter

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Create Profile | `Ctrl+N` (Cmd+N on Mac) |
| Search Profiles | `Ctrl+F` (Cmd+F on Mac) |
| Settings | `Ctrl+,` (Cmd+, on Mac) |
| Refresh | `F5` |

## Troubleshooting

### Profile Won't Launch

**Problem**: VS Code doesn't open when clicking Launch

**Solutions**:
1. Verify VS Code is installed
2. Check VS Code command in Settings
3. Review error message in console
4. Try relaunching application

### Extensions Not Installing

**Problem**: Extensions don't appear in VS Code

**Solutions**:
1. Check internet connection
2. Verify extension IDs are correct
3. Manually install extensions once
4. Check VS Code extension marketplace status

### AI Not Working

**Problem**: AI code generation fails

**Solutions**:
1. Verify API key is configured
2. Check API key is valid
3. Try different AI model
4. Check internet connection
5. Review API quota/rate limits

### GitHub Integration Issues

**Problem**: Can't access GitHub repository

**Solutions**:
1. Check GitHub token is configured
2. Verify token has correct permissions
3. Ensure repository exists
4. Check repository visibility (public/private)

### Database Errors

**Problem**: Profiles not saving

**Solutions**:
1. Check disk space available
2. Verify write permissions
3. Try restarting application
4. Check database file not locked

### Performance Issues

**Problem**: Application runs slowly

**Solutions**:
1. Close unused VS Code instances
2. Reduce number of extensions
3. Clear application cache
4. Update to latest version

## Getting Help

### Documentation

- [Developer Guide](./developer-guide.md)
- [API Documentation](../api/)
- [Architecture](../architecture/)

### Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Email**: Contact support team

### Community

- Share your profiles
- Contribute code templates
- Help other users

## Frequently Asked Questions

### Can I use the same profile on multiple computers?

Yes! Export the profile as JSON and import on another computer. Note: Extensions and settings will be re-downloaded.

### Do profiles affect my main VS Code installation?

No. Each profile uses isolated directories. Your default VS Code installation remains unchanged.

### How many profiles can I create?

Unlimited! However, each profile uses disk space for extensions and settings.

### Can I run multiple profiles at once?

Yes! Each profile launches a separate VS Code instance.

### What happens to my existing VS Code setup?

Nothing! The launcher uses separate profile directories and doesn't modify your default VS Code installation.

### Can I edit profiles while VS Code is running?

Yes, but changes won't apply to already-running instances. Restart VS Code with the profile to apply changes.

### How do I uninstall?

1. Close all VS Code instances
2. Uninstall the application
3. Optionally delete profile data:
   - Windows: `%APPDATA%\vscode-profile-launcher`
   - macOS: `~/Library/Application Support/vscode-profile-launcher`
   - Linux: `~/.config/vscode-profile-launcher`

## Next Steps

- [Developer Guide](./developer-guide.md) - Contributing to the project
- [Architecture](../architecture/MVC-ARCHITECTURE.md) - Technical details
- [API Documentation](../api/) - Integration guides

---

**Happy Coding!** 🚀
