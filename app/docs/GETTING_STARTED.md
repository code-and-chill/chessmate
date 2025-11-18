---
title: Getting Started with Chess App
service: chess-app
status: active
last_reviewed: 2025-11-17
type: how-to
---

# Getting Started - Chess App Development

Welcome! This guide will help you set up your development environment and understand the project structure.

## 📋 Prerequisites

- **Node.js 16+** – Check with `node --version`
- **npm/yarn** – Comes with Node.js
- **Expo CLI** – Installed via npm when you run `npm start`
- Optional: **Xcode** (for iOS development) or **Android Studio** (for Android)

## 🚀 Initial Setup

### 1. Install Dependencies

```bash
cd chess-app
npm install
```

This installs all packages listed in `package.json`.

### 2. Start Development Server

```bash
npm start
```

You'll see a terminal menu with options to run on:
- **w** – Web (opens in browser)
- **i** – iOS Simulator
- **a** – Android Emulator
- **Scan QR** – Expo GO app on mobile device

### 3. Choose Your Development Environment

#### 🌐 Web (Recommended for Quick Iteration)

```bash
npm run web
```

- Opens http://localhost:8081
- Hot reload on file save
- Best for rapid development
- No device/simulator needed

#### 📱 iOS Simulator

```bash
npm run ios
```

Prerequisites:
- Xcode installed
- iOS Simulator running

#### 🤖 Android Emulator

```bash
npm run android
```

Prerequisites:
- Android Studio installed
- Emulator running

---

## 📁 Understanding the New Structure

The project was restructured in November 2025. Here's what you need to know:

### Root Folders (`/src/`)

| Folder | Purpose | Examples |
|--------|---------|----------|
| **`/api/`** | HTTP clients | PuzzleApiClient, GameApiClient |
| **`/hooks/`** | Business logic | useGame, useAuth, usePuzzle |
| **`/types/`** | TypeScript interfaces | Game, Puzzle, Player types |
| **`/i18n/`** | Translations | 7 locales (en, es, fr, de, ru, zh, ja) |
| **`/screens/`** | Full pages | PlayScreen, PuzzlePlayScreen |
| **`/components/`** | UI components | 20+ organized by category |
| **`/ui/`** | Design system | theme, tokens config |

### Component Organization

```
/components/
├── primitives/      ← Box, Text, Button, Surface
├── compound/        ← ChessBoard, GameActions, MoveList, PlayerPanel
├── play/            ← Play feature components
├── puzzle/          ← Puzzle feature components
└── identity/        ← User components
```

**⚠️ Important**: Don't import from `/src/ui/components` or `/src/ui/screens` (old structure). Use the new structure above instead.

---

## 🔧 Common Development Tasks

### Type Checking

Verify your code has no TypeScript errors:

```bash
npm run typecheck
```

Run this before submitting changes.

### Running Tests

```bash
npm test
```

Or with watch mode:

```bash
npm test -- --watch
```

### Adding a New Hook

1. Create file: `/src/hooks/use<Feature>.ts`
2. Export the hook
3. Import and use in components/screens

Example:
```typescript
// /src/hooks/useMyFeature.ts
export const useMyFeature = () => {
  // Your logic here
};
```

### Adding a New Component

1. **Decide category**:
   - Reusable primitive? → `/src/components/primitives/`
   - Generic complex? → `/src/components/compound/`
   - Feature-specific? → `/src/components/play/` or `/src/components/puzzle/`

2. **Create file**: `/src/components/{category}/MyComponent.tsx`

3. **Use TypeScript**:
```typescript
import React from 'react';
import { Text } from './primitives';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onPress,
}) => {
  return <Text onPress={onPress}>{title}</Text>;
};
```

4. **Update index file**: Add to `/src/components/{category}/index.ts`

### Adding a New Translation

1. Edit the locale file in `/src/i18n/locales/{lang}.json`
2. Add your new keys
3. Use in component with `useI18n()` hook:

```typescript
const { t } = useI18n();
<Text>{t('myKey')}</Text>
```

---

## 🐛 Debugging

### Visual Debugging

1. Open DevTools in web/Expo:
   - **Web**: Open browser DevTools (F12)
   - **Mobile**: Shake device or press Ctrl+M to open menu

2. Console logs appear in:
   - Browser console (web)
   - Expo terminal (mobile)
   - Metro bundler output

### Common Issues

**Issue**: "Cannot find module"
- Solution: Verify import path matches new structure
- Check: `/src/screens/`, `/src/components/`, `/src/hooks/`

**Issue**: TypeScript errors
- Solution: Run `npm run typecheck` to see full errors
- Check: Type definitions in `/src/types/`

**Issue**: Blank/white screen
- Solution: Check browser console or Expo logs for errors
- Restart: Stop `npm start` and try again

---

## 📚 Documentation Reference

Read these files to understand the project better:

| Document | Purpose |
|----------|---------|
| [FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) | Complete directory guide with all files listed |
| [COMPONENT_INDEX.md](./docs/COMPONENT_INDEX.md) | Quick reference for all 20+ components |
| [MIGRATION_SUMMARY.md](./docs/MIGRATION_SUMMARY.md) | Details of November 2025 restructuring |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design and patterns |
| [overview.md](./docs/overview.md) | Feature overview |

---

## 🎯 Next Steps

1. **Start development server**: `npm start`
2. **Choose platform**: Press `w` for web
3. **Navigate source**: Open `/src/screens/PlayScreen.tsx` to understand structure
4. **Make a change**: Try editing a component and watch it hot reload
5. **Read component docs**: Check [COMPONENT_INDEX.md](./docs/COMPONENT_INDEX.md) for all available components

---

## 💡 Tips & Best Practices

### ✅ Do

- Use hooks for business logic (`/src/hooks/`)
- Organize components by category
- Import from category indexes: `import { Box } from '../components/primitives'`
- Use TypeScript interfaces for all props
- Run `npm run typecheck` before commits

### ❌ Don't

- Import from old paths: `src/ui/screens`, `src/ui/components`, `src/core/`
- Put business logic in components – use hooks instead
- Import from relative paths in `node_modules`
- Ignore TypeScript errors – fix them immediately

---

## 🆘 Need Help?

1. **First**: Check existing components for examples
2. **Second**: Review docs in `/docs/` folder
3. **Third**: Check TypeScript compiler output: `npm run typecheck`
4. **Last**: Examine git history for similar changes

---

**Last Updated**: November 17, 2025  
**Version**: ✅ Post-Migration (Nov 17, 2025)
