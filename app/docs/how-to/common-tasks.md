---
title: Common Tasks
service: chess-app
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Common Development Tasks

Frequent operations and workflows.

## Running the Application

### Web Development

```bash
# Start dev server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

### Mobile Development

```bash
# iOS
npm run ios

# Android
npm run android

# Expo (cross-platform)
npm run start
```

## Testing

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Specific test file
npm test -- App.test.tsx

# Watch mode
npm test -- --watch
```

## Code Quality

```bash
# ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# TypeScript type checking
npm run type-check

# Format code (if Prettier configured)
npm run format
```

## Building & Deployment

### Web Build

```bash
npm run build
# Output in build/ directory
```

### Mobile Build

```bash
# iOS build
npm run build:ios

# Android build
npm run build:android

# EAS build (Expo, cloud-based)
eas build
```

## Dependency Management

```bash
# Check for updates
npm outdated

# Update dependencies safely
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerable packages
npm audit fix
```

## Debugging

### React DevTools

```bash
# Install Chrome/Firefox extension
# DevTools available in browser

# React Native Debugger
npm install -g react-native-debugger
```

### Browser DevTools

```bash
# Open in any browser
F12 or Ctrl+Shift+I

# Common tasks:
# - Inspect elements
# - Debug JavaScript
# - Check network calls
# - Monitor performance
# - Review console logs
```

---

*Last updated: 2025-11-15*
