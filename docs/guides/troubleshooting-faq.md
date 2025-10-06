# Troubleshooting & FAQ

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Application Launch Issues](#application-launch-issues)
3. [Profile Management Issues](#profile-management-issues)
4. [VS Code Launch Issues](#vs-code-launch-issues)
5. [AI Integration Issues](#ai-integration-issues)
6. [GitHub Integration Issues](#github-integration-issues)
7. [Database Issues](#database-issues)
8. [Performance Issues](#performance-issues)
9. [Frequently Asked Questions](#frequently-asked-questions)

## Installation Issues

### Application Won't Install

**Problem**: Installation fails or application won't start

**Solutions**:

1. **Check System Requirements**
   - Node.js 16+ installed
   - Sufficient disk space (500MB+)
   - Administrator/root privileges if needed

2. **Windows Specific**
   ```bash
   # Run as administrator
   # Right-click installer → "Run as administrator"
   ```

3. **macOS Specific**
   ```bash
   # Allow app from unidentified developer
   System Preferences → Security & Privacy → Allow
   ```

4. **Linux Specific**
   ```bash
   # Make AppImage executable
   chmod +x vscode-profile-launcher.AppImage
   
   # Install required dependencies
   sudo apt install libgconf-2-4  # Ubuntu/Debian
   ```

### Dependencies Not Installing

**Problem**: `npm install` fails

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If native modules fail
npm rebuild
```

## Application Launch Issues

### Application Crashes on Startup

**Problem**: App crashes immediately after launch

**Diagnostic Steps**:

1. **Check Logs**
   - Windows: `%APPDATA%\vscode-profile-launcher\logs`
   - macOS: `~/Library/Logs/vscode-profile-launcher`
   - Linux: `~/.config/vscode-profile-launcher/logs`

2. **Run from Terminal**
   ```bash
   # See error messages
   ./vscode-profile-launcher --verbose
   ```

3. **Check Database**
   ```bash
   # Backup and reset database
   mv profiles.db profiles.db.backup
   ```

**Common Causes**:
- Corrupted database
- Missing dependencies
- Conflicting Electron version
- Insufficient permissions

### White Screen on Launch

**Problem**: Application shows blank white screen

**Solutions**:

1. **Clear Application Cache**
   - Delete: `%APPDATA%\vscode-profile-launcher\Cache`
   
2. **Reset Settings**
   ```bash
   # Delete config file
   rm ~/.config/vscode-profile-launcher/config.json
   ```

3. **Check GPU Acceleration**
   ```bash
   # Disable GPU acceleration
   ./vscode-profile-launcher --disable-gpu
   ```

### App Won't Close

**Problem**: Application doesn't close when clicked

**Solution**:

```bash
# Force kill process
# Windows
taskkill /F /IM vscode-profile-launcher.exe

# macOS/Linux
pkill -9 vscode-profile-launcher
```

## Profile Management Issues

### Cannot Create Profile

**Problem**: "Create Profile" button doesn't work

**Solutions**:

1. **Check Profile Name**
   - Must be unique
   - 1-100 characters
   - No special characters: `/\:*?"<>|`

2. **Verify Database Connection**
   ```javascript
   // Check database is accessible
   const profiles = await window.electronAPI.getProfiles();
   console.log('Database working:', profiles !== undefined);
   ```

3. **Check Disk Space**
   ```bash
   # Ensure sufficient disk space
   df -h  # Linux/macOS
   ```

### Profile Not Appearing

**Problem**: Created profile doesn't show in list

**Solutions**:

1. **Refresh Application**
   - Press `F5` or restart app
   
2. **Check Database**
   ```sql
   -- Open database and check
   sqlite3 profiles.db
   SELECT * FROM profiles;
   ```

3. **Clear Cache**
   - Restart application
   - Force refresh with `Ctrl+Shift+R`

### Cannot Delete Profile

**Problem**: Delete button doesn't work

**Solutions**:

1. **Check Profile Usage**
   - Close any VS Code instances using this profile
   
2. **Force Delete via Database**
   ```sql
   sqlite3 profiles.db
   DELETE FROM profiles WHERE id = <profile_id>;
   ```

3. **Check Permissions**
   - Ensure write access to database file

### Profile Data Lost

**Problem**: Profiles disappeared after update

**Solutions**:

1. **Check Backup**
   ```bash
   # Look for backup files
   ls ~/.config/vscode-profile-launcher/backups/
   ```

2. **Restore from Backup**
   ```bash
   # Restore database
   cp profiles.db.backup profiles.db
   ```

3. **Check Database Migration**
   - Look for migration errors in logs
   - Database may need manual recovery

## VS Code Launch Issues

### VS Code Won't Launch

**Problem**: Clicking "Launch" doesn't open VS Code

**Diagnostic Steps**:

1. **Verify VS Code Installation**
   ```bash
   # Check VS Code command
   code --version
   
   # If not found, install or add to PATH
   ```

2. **Check VS Code Path**
   - Settings → VS Code Command
   - Default: `code`
   - Windows: May need full path: `C:\Program Files\Microsoft VS Code\Code.exe`

3. **Test Manual Launch**
   ```bash
   # Try launching with profile manually
   code --user-data-dir ~/.vscode-profiles/MyProfile/data \
        --extensions-dir ~/.vscode-profiles/MyProfile/extensions
   ```

**Common Solutions**:

**Windows:**
```bash
# Add VS Code to PATH
# Or use full path in settings
"C:\\Program Files\\Microsoft VS Code\\Code.exe"
```

**macOS:**
```bash
# Install 'code' command
# VS Code → Command Palette → Shell Command: Install 'code' command
```

**Linux:**
```bash
# Create symlink if needed
sudo ln -s /usr/share/code/code /usr/local/bin/code
```

### Extensions Not Loading

**Problem**: Profile extensions don't install

**Solutions**:

1. **Check Extension IDs**
   - Verify format: `publisher.extension-name`
   - Example: `dbaeumer.vscode-eslint`

2. **Manual Installation**
   ```bash
   # Install extension manually
   code --install-extension dbaeumer.vscode-eslint \
        --extensions-dir ~/.vscode-profiles/MyProfile/extensions
   ```

3. **Check Internet Connection**
   - Extensions download from marketplace
   - Verify network connectivity

4. **Marketplace Issues**
   - Try again later
   - Check VS Code marketplace status

### Wrong VS Code Instance

**Problem**: VS Code opens with default profile instead of specified profile

**Solution**:

1. **Close All VS Code Instances**
   ```bash
   # Kill all VS Code processes
   pkill -9 code  # Linux/macOS
   taskkill /F /IM Code.exe  # Windows
   ```

2. **Check Launch Command**
   - Verify `--user-data-dir` flag is used
   - Check profile paths are correct

3. **Check VS Code Version**
   - Update to latest VS Code
   - Profile support may be limited in old versions

## AI Integration Issues

### AI API Key Not Working

**Problem**: AI generation fails with authentication error

**Solutions**:

1. **Verify API Key**
   - Copy key carefully (no extra spaces)
   - Check key hasn't been revoked
   - Regenerate key if needed

2. **Check API Key Format**
   - **Gemini**: Starts with `AIza...`
   - **OpenAI**: Starts with `sk-...`

3. **Test API Key**
   ```bash
   # Test Gemini key
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   
   # Test OpenAI key
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```

### AI Generation Fails

**Problem**: Code generation returns error

**Common Errors**:

1. **Quota Exceeded**
   ```
   Error: API quota exceeded
   ```
   **Solution**: Wait for quota reset or upgrade plan

2. **Rate Limit Hit**
   ```
   Error: Rate limit exceeded
   ```
   **Solution**: Wait 1 minute and try again

3. **Content Filtered**
   ```
   Error: Content filtered by safety settings
   ```
   **Solution**: Rephrase prompt to be less sensitive

4. **Model Not Found**
   ```
   Error: Model not available
   ```
   **Solution**: Select different model from dropdown

### Slow AI Response

**Problem**: AI takes too long to respond

**Solutions**:

1. **Use Faster Model**
   - Gemini: Try `gemini-1.5-flash` instead of `gemini-1.5-pro`
   - OpenAI: Try `gpt-3.5-turbo` instead of `gpt-4`

2. **Reduce Prompt Length**
   - Keep prompts concise
   - Remove unnecessary context

3. **Check Network**
   - Test internet speed
   - Try again on better connection

## GitHub Integration Issues

### GitHub Token Not Working

**Problem**: Cannot access GitHub repositories

**Solutions**:

1. **Verify Token Scopes**
   Required scopes:
   - `repo` - Full repository access
   - `read:org` - Organization access
   
   Create new token: https://github.com/settings/tokens

2. **Check Token Format**
   - Classic tokens: `ghp_...`
   - Fine-grained tokens: `github_pat_...`

3. **Test Token**
   ```bash
   # Test GitHub token
   curl -H "Authorization: token YOUR_TOKEN" \
     https://api.github.com/user
   ```

### Cannot Access Repository

**Problem**: "Repository not found" error

**Solutions**:

1. **Verify Repository Exists**
   - Check spelling of owner/repo
   - Example: `microsoft/vscode` not `microsoft/VSCode`

2. **Check Access Permissions**
   - For private repos, ensure token has `repo` scope
   - Verify you have access to the repository

3. **Organization Repositories**
   - May need `read:org` scope
   - Check organization settings

### Cannot Create Issue

**Problem**: Issue creation fails

**Solutions**:

1. **Check Permissions**
   - Need write access to repository
   - Token needs `repo` scope

2. **Verify Issue Data**
   - Title is required
   - Title length < 256 characters
   - Labels must exist in repository

3. **Check Repository Settings**
   - Issues must be enabled
   - Repository → Settings → Features → Issues

## Database Issues

### Database Locked

**Problem**: `database is locked` error

**Solutions**:

1. **Close Other Instances**
   ```bash
   # Close all app instances
   pkill -9 vscode-profile-launcher
   ```

2. **Wait for Lock Release**
   - Database may be in transaction
   - Wait 5 seconds and retry

3. **Enable WAL Mode**
   ```sql
   sqlite3 profiles.db "PRAGMA journal_mode=WAL;"
   ```

### Database Corrupted

**Problem**: Database errors or crashes

**Diagnostic**:

```bash
# Check database integrity
sqlite3 profiles.db "PRAGMA integrity_check;"
```

**Recovery Steps**:

1. **Backup Current Database**
   ```bash
   cp profiles.db profiles.db.broken
   ```

2. **Try to Recover**
   ```bash
   # Dump and recreate
   sqlite3 profiles.db ".dump" | sqlite3 profiles_recovered.db
   mv profiles_recovered.db profiles.db
   ```

3. **Restore from Backup**
   ```bash
   # Use automatic backup
   cp profiles.db.backup profiles.db
   ```

4. **Start Fresh** (last resort)
   ```bash
   # Delete and restart (loses data!)
   rm profiles.db
   # Restart application
   ```

### Migration Failed

**Problem**: Database migration error on update

**Solutions**:

1. **Check Error Log**
   - Look for specific migration version that failed
   
2. **Manual Migration**
   ```sql
   -- Check current version
   SELECT * FROM schema_version;
   
   -- Apply missing migration manually
   -- (See migration documentation)
   ```

3. **Rollback**
   ```bash
   # Restore pre-migration backup
   cp profiles.db.pre-migration profiles.db
   ```

## Performance Issues

### App Runs Slowly

**Problem**: Application is sluggish

**Solutions**:

1. **Clear Cache**
   ```bash
   # Delete cache directory
   rm -rf ~/.config/vscode-profile-launcher/Cache
   ```

2. **Reduce Profiles**
   - Archive or delete unused profiles
   - Large profile counts can slow down listing

3. **Check System Resources**
   ```bash
   # Check memory and CPU usage
   top  # Linux/macOS
   taskmgr  # Windows
   ```

4. **Disable Animations**
   - Settings → Disable animations
   - Improves performance on older hardware

### High Memory Usage

**Problem**: Application uses too much RAM

**Solutions**:

1. **Restart Application**
   - Close and reopen to free memory
   
2. **Close Unused VS Code Instances**
   - Each profile instance uses memory
   
3. **Check for Memory Leaks**
   ```javascript
   // Monitor memory in DevTools
   // Help → Toggle Developer Tools
   ```

### Database Queries Slow

**Problem**: Profile operations take too long

**Solutions**:

1. **Rebuild Indexes**
   ```sql
   sqlite3 profiles.db
   REINDEX;
   ANALYZE;
   ```

2. **Vacuum Database**
   ```sql
   sqlite3 profiles.db
   VACUUM;
   ```

3. **Check Database Size**
   ```bash
   ls -lh profiles.db
   # If very large (>100MB), may need optimization
   ```

## Frequently Asked Questions

### General Questions

**Q: Is VS Code Profile Launcher free?**

A: Yes, it's open source and free to use.

**Q: Does it work with VS Code forks (VSCodium, Code - OSS)?**

A: Yes, but you'll need to configure the correct command path in settings.

**Q: Can I use it on multiple computers?**

A: Yes! Export profiles as JSON and import on other computers. Note: Extensions will need to be re-downloaded.

**Q: Does it modify my default VS Code installation?**

A: No, it uses separate profile directories and doesn't touch your default setup.

### Profile Questions

**Q: How many profiles can I create?**

A: Unlimited, but each profile uses disk space (~100-500MB depending on extensions).

**Q: Can I share profiles with teammates?**

A: Yes! Export profiles as JSON and share. Recipients can import them.

**Q: What happens if I delete a profile?**

A: The profile configuration is deleted. Extensions and settings directories remain on disk until manually removed.

**Q: Can I backup profiles?**

A: Yes! Profiles are stored in SQLite database. Backup: `~/.config/vscode-profile-launcher/profiles.db`

### VS Code Questions

**Q: Can I run multiple profiles at once?**

A: Yes! Each profile launches a separate VS Code instance.

**Q: Do profiles share extensions?**

A: No, each profile has isolated extensions. This allows different extension versions per profile.

**Q: Can I use the same workspace with different profiles?**

A: Yes, you can open the same folder with different profiles.

**Q: Will this slow down VS Code?**

A: No, profiles help keep VS Code fast by only loading needed extensions.

### AI Questions

**Q: Do I need both Gemini and OpenAI keys?**

A: No, you can use either one. Configure at least one for AI features.

**Q: Are my API keys stored securely?**

A: Yes, keys are stored in Electron's secure storage and never sent to external services (except the AI providers themselves).

**Q: Does AI code generation cost money?**

A: 
- **Gemini**: Free tier available, pay for higher usage
- **OpenAI**: Pay per token, pricing at openai.com/pricing

**Q: Can AI generate code in any language?**

A: AI supports many languages, but quality varies. Best results with popular languages like TypeScript, Python, JavaScript, Go.

### GitHub Questions

**Q: Why do I need a GitHub token?**

A: GitHub API requires authentication for most operations. Token provides secure access.

**Q: Can I use it without GitHub?**

A: Yes! GitHub integration is optional.

**Q: Will it access all my repositories?**

A: Only repositories you explicitly configure in profiles. The token can access what its scopes allow.

**Q: Is my token shared with anyone?**

A: No, your token stays local on your machine and is only used to communicate with GitHub's API.

### Technical Questions

**Q: What database does it use?**

A: SQLite via better-sqlite3. Fast, embedded, zero-configuration.

**Q: Can I access the database directly?**

A: Yes! Database location: `~/.config/vscode-profile-launcher/profiles.db`

**Q: Where are logs stored?**

A:
- Windows: `%APPDATA%\vscode-profile-launcher\logs`
- macOS: `~/Library/Logs/vscode-profile-launcher`
- Linux: `~/.config/vscode-profile-launcher/logs`

**Q: Is it safe to delete node_modules during development?**

A: Yes, just run `npm install` again to restore dependencies.

### Troubleshooting Questions

**Q: App won't start, what should I check first?**

A:
1. Check system requirements (Node.js 16+)
2. Try running from terminal to see errors
3. Check database file isn't corrupted
4. Delete cache and restart

**Q: How do I reset everything?**

A:
```bash
# Delete all app data (nuclear option!)
rm -rf ~/.config/vscode-profile-launcher
# Restart application
```

**Q: Where can I get help?**

A:
- Read documentation: `/docs`
- Check GitHub Issues
- Create new issue with details

**Q: How do I report a bug?**

A:
1. Check existing issues
2. Gather information (OS, version, error logs)
3. Create detailed issue on GitHub
4. Include steps to reproduce

## Getting More Help

### Documentation

- [User Guide](./user-guide.md)
- [Developer Guide](./developer-guide.md)
- [API Documentation](../api/)
- [Architecture](../architecture/)

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and general help
- **Documentation**: Comprehensive guides

### Diagnostic Information

When reporting issues, include:

```bash
# System information
OS: Windows 11 / macOS 14 / Ubuntu 22.04
Node.js: node --version
App Version: 1.0.0

# Error logs
Check: ~/.config/vscode-profile-launcher/logs/

# Steps to reproduce
1. Open application
2. Click "Create Profile"
3. Error appears: "..."
```

---

**Still Having Issues?** Create an issue on GitHub with detailed information!
