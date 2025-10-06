# VS Code Profile Launcher - Copilot Instructions

This is an advanced Electron application built with TypeScript, SQLite, Monaco Editor, and AI integrations (Gemini & OpenAI) that serves as an intelligent VS Code profile launcher.

## Project Overview
- **Technology Stack**: Electron, TypeScript, SQLite, Monaco Editor, Google Generative AI, OpenAI API
- **Purpose**: Create and manage intelligent VS Code development profiles with AI assistance
- **Advanced Features**: 
  - VS Code-like interface with dark theme
  - AI-powered code template generation (Gemini & OpenAI)
  - Monaco Editor integration for code editing
  - Environment variables management per profile
  - Intelligent profile recommendations
  - Performance-optimized VS Code launching

## Architecture
- **Main Process**: Electron app initialization, database management, AI integration, VS Code launching
- **Renderer Process**: Modern UI with Monaco Editor, settings management, profile creation
- **Database Layer**: SQLite with extended schema for AI settings, environment variables, code templates
- **AI Layer**: Dual API integration (Gemini/OpenAI) with intelligent model selection
- **Config Layer**: Environment variables management with secure API key storage

## Key Features
- **Profile Management**: Create, edit, delete profiles with advanced settings
- **AI Integration**: Generate code templates using Gemini (1.5 Flash/Pro) or OpenAI (GPT-3.5/4)
- **Code Editor**: Monaco Editor with syntax highlighting for 10+ languages
- **Environment Variables**: Per-profile environment configuration
- **Smart Launch**: Optimized VS Code launching with performance flags
- **Settings Management**: Secure API key configuration and provider status
- **Search & Filter**: Advanced profile filtering and search capabilities

## Development Guidelines
- Use TypeScript for all source code with strict type checking
- Follow Electron security best practices (context isolation, no node integration)
- Implement clean, modular architecture with separation of concerns
- Use SQLite for persistent data with proper migration support
- Ensure cross-platform compatibility (Windows, macOS, Linux)
- Implement proper error handling and user feedback
- Follow modern web development practices for the renderer process

## File Structure
- `src/main.ts`: Electron main process with IPC handlers
- `src/database.ts`: SQLite database manager with CRUD operations
- `src/ai-manager.ts`: AI integration layer (Gemini/OpenAI)
- `src/config.ts`: Configuration and environment variables manager
- `src/types.ts`: TypeScript type definitions and interfaces
- `src/preload.ts`: Secure IPC bridge between main and renderer
- `src/renderer/`: Frontend application with Monaco Editor integration