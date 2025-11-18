---
title: Migration Guide - Current to Production-Grade Structure
service: app
status: active
last_reviewed: 2025-11-18
type: how-to
---

# Migration Guide: Current → Production-Grade Structure

## Overview

This guide walks through migrating from the current flat structure to the production-grade folder structure defined in [FOLDER_STRUCTURE_CONVENTION.md](../FOLDER_STRUCTURE_CONVENTION.md).

## Quick Reference Map

```
CURRENT LOCATION                  →  NEW LOCATION
─────────────────────────────────────────────────────────────────────────
ROUTING & SCREENS
/screens/PlayScreen.tsx           →  /app/(tabs)/play.tsx (thin wrapper)
/screens/PuzzlePlayScreen.tsx     →  /app/(tabs)/puzzles.tsx
/screens/play/*                   →  /app/play/* (if route-specific)
/screens/puzzle/*                 →  /app/puzzle/* (if route-specific)

FEATURES - BOARD
/components/compound/ChessBoard   →  /features/board/components/ChessBoard
/components/compound/Square       →  /features/board/components/Square
/components/compound/Piece        →  /features/board/components/Piece
/hooks/useBoardInteraction        →  /features/board/hooks/useBoardInteraction
/utils/fen.ts                     →  /features/board/utils/fen.ts
/utils/coordinates.ts             →  /features/board/utils/coordinates.ts

FEATURES - GAME
/components/play/GameBoardSection →  /features/game/components/GameScreen
/components/compound/PlayerPanel  →  /features/game/components/PlayerBar
/components/compound/MoveList     →  /features/game/components/MoveHistory
/components/compound/GameActions  →  /features/game/components/GameControls
/hooks/useGameState               →  /features/game/hooks/useGameState
/hooks/useWebSocket               →  /features/game/hooks/useWebSocket
/hooks/useChessClock              →  /features/game/hooks/useChessClock

FEATURES - PUZZLES
/components/puzzle/*              →  /features/puzzles/components/*
/screens/puzzle/*                 →  /features/puzzles/components/* (if not route)
/hooks/usePuzzle*                 →  /features/puzzles/hooks/*

FEATURES - MATCHMAKING
/components/play/PlayNowPanel     →  /features/matchmaking/components/MatchmakingScreen
/hooks/useMatchmaking             →  /features/matchmaking/hooks/useMatchmaking

UI - DESIGN SYSTEM
/components/primitives/Box        →  /ui/primitives/Box
/components/primitives/Text       →  /ui/primitives/Text
/components/primitives/Button     →  /ui/primitives/Button
/components/primitives/Surface    →  /ui/primitives/Surface
/ui/tokens/*                      →  /ui/tokens/* (no change)
/ui/theme/*                       →  /ui/theme/* (no change)
/styles/*                         →  /ui/tokens/* (if design tokens)

UI - COMPOSITE COMPONENTS
/components/identity/IdentityHeader → /ui/components/Header
/components/play/NowPlayingBanner   → /ui/components/Banner (if reusable)
                                      /features/game/components/* (if feature-specific)

SERVICES - API
/api/liveGameClient.ts            →  /services/api/client.ts (base client)
/api/playApi.ts                   →  /services/api/game.api.ts
/api/puzzleApi.ts                 →  /services/api/puzzle.api.ts
/api/*                            →  /services/api/*.api.ts

SERVICES - WEBSOCKET
(if exists)                       →  /services/ws/GameWebSocket.ts
                                     /services/ws/MatchmakingWebSocket.ts

SERVICES - STORAGE
(if exists)                       →  /services/storage/AsyncStorageService.ts
                                     /services/storage/SecureStorageService.ts

CORE - UTILITIES
/utils/date.ts                    →  /core/utils/date.ts (if generic)
/utils/string.ts                  →  /core/utils/string.ts (if generic)
/utils/validation.ts              →  /core/utils/validation.ts (if generic)
/utils/debounce.ts                →  /core/utils/debounce.ts

CORE - CONSTANTS
/constants/config.ts              →  /core/constants/config.ts
/constants/routes.ts              →  /core/constants/routes.ts
/constants/*                      →  /core/constants/*

CORE - HOOKS
/hooks/useDebounce                →  /core/hooks/useDebounce.ts (if generic)
/hooks/useOnlineStatus            →  /core/hooks/useOnlineStatus.ts (if generic)
/hooks/usePrevious                →  /core/hooks/usePrevious.ts

CORE - STATE
/contexts/AuthContext             →  /core/state/authSlice.ts (Redux/Zustand)
/contexts/UserContext             →  /core/state/userSlice.ts
/contexts/ThemeContext            →  /ui/theme/ThemeProvider.tsx (if theme-specific)

PLATFORM - SECURITY
(if exists)                       →  /platform/security/AuthManager.ts
                                     /platform/security/BiometricAuth.ts

PLATFORM - MONITORING
(if exists)                       →  /platform/monitoring/ErrorBoundary.tsx
                                     /platform/monitoring/performanceMonitor.ts

TYPES
/types/Game.ts                    →  /types/chess.types.ts (if global)
                                     /features/game/types/game.types.ts (if feature-specific)
/types/Player.ts                  →  /types/user.types.ts (if global)
/types/auth.ts                    →  /types/api.types.ts (if API contract)
/types/*                          →  /types/* (if global) or
                                     /features/{feature}/types/* (if feature-specific)

ASSETS
/assets/*                         →  /assets/* (mostly no change)
                                     Organize into subdirectories (boards/, pieces/, sounds/)

I18N
/i18n/*                           →  /core/i18n/* or keep at root if large
```

## Migration Strategy

### Phase 1: Parallel Structure (Week 1)

Create new folders alongside existing:

```bash
mkdir -p app/{auth,tabs,game,puzzle,settings}
mkdir -p features/{board,game,puzzles,matchmaking}/{components,hooks,utils,types,__tests__}
mkdir -p ui/{primitives,components,tokens,theme,icons}
mkdir -p services/{api,ws,storage,analytics,notifications}
mkdir -p core/{utils,constants,hooks,state}
mkdir -p platform/{security,monitoring,error-boundaries,env}
mkdir -p types
```

Update `tsconfig.json` with path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"],
      "@/app/*": ["./app/*"],
      "@/features/*": ["./features/*"],
      "@/ui/*": ["./ui/*"],
      "@/services/*": ["./services/*"],
      "@/core/*": ["./core/*"],
      "@/platform/*": ["./platform/*"],
      "@/assets/*": ["./assets/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

### Phase 2: Move Shared Layers (Week 2)

**Order matters!** Start with lowest-level dependencies:

1. **Design Tokens** (no dependencies)
   ```bash
   mv ui/tokens/* ui/tokens/
   ```

2. **Utilities** (no dependencies)
   ```bash
   cp utils/date.ts core/utils/date.ts
   cp utils/string.ts core/utils/string.ts
   # Update imports gradually
   ```

3. **Constants** (minimal dependencies)
   ```bash
   cp constants/* core/constants/
   ```

4. **API Clients** (depend on constants)
   ```bash
   cp api/liveGameClient.ts services/api/client.ts
   cp api/playApi.ts services/api/game.api.ts
   cp api/puzzleApi.ts services/api/puzzle.api.ts
   ```

5. **UI Primitives** (depend on tokens)
   ```bash
   cp components/primitives/* ui/primitives/
   ```

### Phase 3: Migrate Features (Week 3-6)

**One feature at a time** to minimize risk.

#### Week 3: Board Feature

1. **Create structure**
   ```bash
   mkdir -p features/board/{components,hooks,utils,types,__tests__}
   ```

2. **Move components**
   ```bash
   cp components/compound/ChessBoard.tsx features/board/components/
   cp components/compound/Square.tsx features/board/components/
   cp components/compound/Piece.tsx features/board/components/
   ```

3. **Move hooks**
   ```bash
   cp hooks/useBoardInteraction.ts features/board/hooks/
   ```

4. **Move utils**
   ```bash
   cp utils/fen.ts features/board/utils/
   cp utils/coordinates.ts features/board/utils/
   ```

5. **Create public API** (`features/board/index.ts`)
   ```typescript
   export { ChessBoard } from './components/ChessBoard';
   export { useBoardInteraction } from './hooks/useBoardInteraction';
   export type { BoardProps, Square, Piece } from './types/board.types';
   ```

6. **Update imports**
   ```bash
   # Find all files importing from old location
   grep -r "from.*components/compound/ChessBoard" .
   
   # Update to new path
   # from: import { ChessBoard } from '@/components/compound/ChessBoard'
   # to:   import { ChessBoard } from '@/features/board'
   ```

7. **Test**
   ```bash
   npm test features/board
   ```

#### Week 4: Game Feature

Repeat process for `/features/game`:
- Move game-specific components
- Move game hooks (useGameState, useWebSocket)
- Move game types
- Create public API
- Update imports
- Test

#### Week 5: Puzzles Feature

Repeat for `/features/puzzles`

#### Week 6: Matchmaking Feature

Repeat for `/features/matchmaking`

### Phase 4: Routing Migration (Week 7)

1. **Install Expo Router** (if not already)
   ```bash
   npx expo install expo-router react-native-safe-area-context react-native-screens
   ```

2. **Create root layout**
   ```typescript
   // app/_layout.tsx
   import { Stack } from 'expo-router';
   
   export default function RootLayout() {
     return <Stack />;
   }
   ```

3. **Convert screens to routes**
   ```typescript
   // app/(tabs)/play.tsx
   import { GameScreen } from '@/features/game';
   
   export default function PlayRoute() {
     return <GameScreen />;
   }
   ```

4. **Update navigation**
   - Replace `@react-navigation` with `expo-router` hooks
   - Update all navigation calls to use `router.push()`

### Phase 5: Cleanup (Week 8)

1. **Remove duplicates**
   ```bash
   # Verify all old imports are updated
   grep -r "from '@/components/compound" .
   grep -r "from '@/screens" .
   
   # If none found, safe to delete
   rm -rf components/compound
   rm -rf screens
   ```

2. **Update documentation**
   - Mark `FOLDER_STRUCTURE.md` as deprecated
   - Update `README.md` to reference new structure
   - Update component docs

3. **Run full test suite**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Deploy to staging**
   ```bash
   npm run build:staging
   npm run deploy:staging
   ```

## Incremental Import Updates

Use this script to gradually update imports:

```typescript
// scripts/update-imports.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const importMap = {
  '@/components/compound/ChessBoard': '@/features/board',
  '@/components/compound/PlayerPanel': '@/features/game',
  '@/hooks/useGameState': '@/features/game',
  // ... add more mappings
};

const files = glob.sync('**/*.{ts,tsx}', { ignore: 'node_modules/**' });

files.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  let updated = false;
  
  Object.entries(importMap).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(`from ['"]${oldPath}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `from '${newPath}'`);
      updated = true;
    }
  });
  
  if (updated) {
    writeFileSync(file, content);
    console.log(`✓ Updated ${file}`);
  }
});
```

Run with:
```bash
npx tsx scripts/update-imports.ts
```

## Validation Checklist

After each phase:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] No circular dependencies (`npm run check-circular`)
- [ ] App runs on iOS (`npm run ios`)
- [ ] App runs on Android (`npm run android`)
- [ ] App runs on Web (`npm run web`)
- [ ] All features work as expected
- [ ] No console errors in dev mode

## Rollback Plan

If issues arise:

1. **Keep old structure until migration complete** — Don't delete until validated
2. **Git branches** — Work in feature branch, merge only when stable
3. **Feature flags** — Use flags to toggle between old/new code paths
4. **Incremental rollout** — Deploy to staging first, then canary, then full production

## Common Issues

### Import Resolution Errors

**Problem**: `Cannot find module '@/features/board'`

**Solution**: 
1. Check `tsconfig.json` has correct path aliases
2. Restart TypeScript server in VS Code
3. Verify `index.ts` exists in feature folder
4. Check Metro bundler cache: `npm start -- --reset-cache`

### Circular Dependencies

**Problem**: Feature A imports from Feature B

**Solution**:
1. Extract shared logic to `/core` or `/services`
2. Use events/state management for communication
3. Refactor to eliminate circular dependency

### Component Not Found

**Problem**: Component exists but import fails

**Solution**:
1. Check component is exported in `index.ts`
2. Verify path alias is correct
3. Check file naming (case-sensitive on Linux)
4. Clear build cache: `rm -rf .expo node_modules && npm install`

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Setup | 1 week | New folder structure, path aliases |
| Phase 2: Shared Layers | 1 week | Migrated tokens, utils, API clients |
| Phase 3: Features | 4 weeks | All features migrated (board, game, puzzles, matchmaking) |
| Phase 4: Routing | 1 week | Expo Router implemented |
| Phase 5: Cleanup | 1 week | Old structure removed, docs updated |
| **Total** | **8 weeks** | **Production-grade structure** |

## Success Criteria

- ✅ Zero circular dependencies
- ✅ All features independently testable
- ✅ New feature can be added in < 1 day
- ✅ Onboarding time reduced by 50%
- ✅ AI code generation works with 90%+ accuracy
- ✅ All existing features work without regression

## Questions?

- Check [FOLDER_STRUCTURE_CONVENTION.md](../FOLDER_STRUCTURE_CONVENTION.md) for detailed specs
- Review [ADR-0001](../decisions/ADR-0001-folder-structure-convention.md) for decision rationale
- Ask in team Slack channel #frontend-help

---

*Last updated: 2025-11-18*
