# End-to-End Tests

This directory contains end-to-end tests for the VS Code Profile Launcher application.

## Setup

E2E tests require additional setup:

1. Install Spectron or Playwright for Electron testing
2. Configure test environment
3. Set up test fixtures

## Running E2E Tests

```bash
npm run test:e2e
```

## Test Structure

- **app.test.ts** - Application launch and window tests
- **profiles.test.ts** - Profile management workflows
- **settings.test.ts** - Settings and configuration tests

## Writing E2E Tests

E2E tests should:

- Test complete user workflows
- Verify UI interactions
- Test integration between all components
- Validate data persistence

## TODO

- [ ] Set up Spectron/Playwright
- [ ] Create application launch tests
- [ ] Test profile creation workflow
- [ ] Test VS Code launching
- [ ] Test settings management
