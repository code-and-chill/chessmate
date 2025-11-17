---
title: Chess App Folder Structure
service: chess-app
status: active
last_reviewed: 2025-11-17
type: architecture
---

# Chess App Folder Structure

## Overview

The Chess App uses a **shallow, modular folder structure** designed for maintainability and scalability. Each folder represents a specific layer or concern.

## Directory Structure

```
chess-app/
├── src/
│   ├── api/                    # API layer - HTTP requests and data fetching
│   ├── hooks/                  # Custom React hooks for logic (8 hooks)
│   ├── i18n/                   # Internationalization (7 locales: en, es, fr, de, ja, ru, zh)
│   ├── types/                  # TypeScript type definitions
│   ├── screens/                # Screen/page components (13 screens + tests)
│   │   ├── PlayScreen.tsx
│   │   ├── PuzzlePlayScreen.tsx
│   │   ├── play/               # Play-related screens (8 files)
│   │   ├── puzzle/             # Puzzle-related screens (5 files)
│   │   └── __tests__/
│   ├── components/             # UI and feature components (organized by category)
│   │   ├── primitives/         # Base UI components (Box, Text, Button, Surface + index)
│   │   ├── compound/           # Complex UI components (ChessBoard, GameActions, MoveList, PlayerPanel + index)
│   │   ├── play/               # Play-feature components (GameBoardSection, RatingStrip, NowPlayingBanner, PlayNowPanel, GameHistoryList)
│   │   ├── puzzle/             # Puzzle-feature components (PuzzleBoardSection, PuzzleFooterControls, DailyPuzzleHero, TacticsStatsCard, TacticsQuickTrainRow)
│   │   ├── identity/           # Identity components (IdentityHeader)
│   │   ├── DailyPuzzleCard.tsx
│   │   └── index.ts
│   ├── ui/                     # Design system and theme (NOT screens/components)
│   │   ├── theme/              # Theme context and configuration
│   │   ├── tokens/             # Design tokens (spacing, colors, typography, etc.)
│   │   ├── config/             # UI configuration
│   │   └── index.ts
│   └── App.tsx                 # Root application component
├── docs/                       # Application documentation
├── tests/                      # Test files
├── Dockerfile                  # Docker configuration
├── package.json                # Project dependencies
└── README.md                   # Project overview
```

## Folder Guidelines

### `/src/api`
**Purpose**: HTTP client layer and data fetching logic.

**Contains**:
- API client instances (e.g., `liveGameClient.ts`)
- API methods for external services (e.g., `playApi.ts`, `puzzleApi.ts`)
- Request/response interceptors (if applicable)

**Rules**:
- No business logic or state management
- Pure API communication
- Export functions that return promises
- Example: `export const getRecentGames = (userId: string) => fetch(...)`

### `/src/hooks`
**Purpose**: Custom React hooks for data fetching, state management, and side effects.

**Contains**:
- React Query hooks (e.g., `useRecentGames`, `useGame`, `usePuzzleHistory`)
- Authentication hooks (e.g., `useAuth`)
- Game interaction hooks (e.g., `useGameInteractivity`, `useGameParticipant`)
- Custom logic hooks

**Rules**:
- Use React Query for server state
- Use `useState` for local component state
- Use `useEffect` for side effects
- Example: `export const useRecentGames = () => useQuery(...)`

### `/src/types`
**Purpose**: TypeScript type definitions and interfaces.

**Contains**:
- Domain models (e.g., `Game.ts`, `GameState.ts`, `Player.ts`)
- API response types (e.g., `NowPlaying.ts`)
- Context types (e.g., `auth.ts`)
- Game-specific types (e.g., `game.ts`)

**Rules**:
- One type definition per file (generally)
- Use `interface` for object shapes
- Use `type` for unions and aliases
- Export types explicitly
- Example: `export interface Game { id: string; ... }`

### `/src/i18n`
**Purpose**: Internationalization and localization.

**Contains**:
- `I18nContext.tsx` - i18n context provider
- `locales/` - Translation files (e.g., `en.json`, `es.json`)
- i18n configuration

**Rules**:
- All translation strings in locale JSON files
- Context provides `t()` function to components
- Support multiple languages (en, es, fr, de, ja, ru, zh)

### `/src/ui`
**Purpose**: Reusable UI components (design system).

**Contains**:
- Button, Input, Card, Modal components
- Layout components
- Form components
- Common UI patterns

**Rules**:
- No business logic
- Fully styled and self-contained
- Accept props for customization
- Exported as named exports

### `/src/screens`
**Purpose**: Screen/page-level components tied to navigation routes and views.

**Structure**:
```
screens/
├── PlayScreen.tsx              # Main game play screen
├── PuzzlePlayScreen.tsx        # Puzzle solving screen
├── play/
│   ├── GameScreen.tsx
│   ├── PlayHubScreen.tsx
│   ├── BotGameScreen.tsx
│   ├── BotSelectionScreen.tsx
│   ├── MatchmakingScreen.tsx
│   ├── OnlinePlaySetupScreen.tsx
│   ├── PostGameSummaryScreen.tsx
│   └── __tests__/
├── puzzle/
│   ├── DailyPuzzleScreen.tsx
│   ├── PuzzleHubScreen.tsx
│   ├── PuzzleHistoryScreen.tsx
│   ├── PuzzleStatsScreen.tsx
│   ├── TacticsTrainingScreen.tsx
│   └── __tests__/
├── __tests__/
└── index.ts                    # Exports main screens
```

**Rules**:
- One main screen per file
- Compose UI components, hooks, and features
- Handle route-specific logic and data fetching
- Example: `export const PlayScreen = ({ gameId }) => { ... }`

### `/src/components`
**Purpose**: Reusable UI components organized by category (primitives, compound, feature-specific).

**Structure**:
```
components/
├── primitives/                 # Base UI building blocks
│   ├── Box.tsx
│   ├── Text.tsx
│   ├── Button.tsx
│   ├── Surface.tsx
│   └── index.ts
├── compound/                   # Complex combined components
│   ├── ChessBoard.tsx
│   ├── GameActions.tsx
│   ├── MoveList.tsx
│   ├── PlayerPanel.tsx
│   └── index.ts
├── play/                       # Play feature components
│   ├── GameBoardSection.tsx
│   ├── RatingStrip.tsx
│   ├── NowPlayingBanner.tsx
│   ├── PlayNowPanel.tsx
│   └── GameHistoryList.tsx
├── puzzle/                     # Puzzle feature components
│   ├── PuzzleBoardSection.tsx
│   ├── PuzzleFooterControls.tsx
│   ├── DailyPuzzleHero.tsx
│   ├── TacticsStatsCard.tsx
│   └── TacticsQuickTrainRow.tsx
├── identity/                   # Identity/user components
│   └── IdentityHeader.tsx
├── DailyPuzzleCard.tsx         # Top-level card component
└── index.ts                    # Exports all components
```

**Rules**:
- **Primitives**: No business logic, pure UI building blocks
- **Compound**: Combine primitives into larger UI units
- **Feature-specific**: Can include feature logic and styling
- All components fully typed with TypeScript
- Example: `export const ChessBoard: React.FC<Props> = ({ ... }) => { ... }`

### `/docs`
**Purpose**: Application documentation.

**Contains**:
- Architecture diagrams
- Component guides
- Setup instructions
- Development workflows

## Data Flow

```
Screens (screens/)                 ← Navigation and views
        ↓
Components (components/)           ← UI building blocks
        ↓
Custom Hooks (hooks/)              ← Data and logic
        ↓
API Layer (api/)                   ← HTTP communication
        ↓
Types (types/)                     ← Type definitions
        ↓
External Services                  ← Remote APIs
```

## File Naming Conventions

- **API files**: `{domain}Api.ts` (e.g., `playApi.ts`, `puzzleApi.ts`)
- **Hook files**: `use{Feature}.ts` (e.g., `useGame.ts`, `useAuth.ts`)
- **Type files**: `{EntityName}.ts` (e.g., `Game.ts`, `GameState.ts`)
- **Component files**: `{ComponentName}.tsx` (e.g., `GameBoard.tsx`)
- **Screen files**: `{ScreenName}Screen.tsx` (e.g., `PlayScreen.tsx`)

## Imports Best Practices

```typescript
// ✅ Good: Import from specific files
import { Game } from '../types/Game';
import { useGame } from '../hooks/useGame';
import { playApi } from '../api/playApi';

// ❌ Avoid: Circular imports
// Ensure dependencies flow downward:
// ui → components → screens → hooks → api → types
```

## Adding New Features

1. **Create types** in `/src/types/{Feature}.ts`
2. **Create API calls** in `/src/api/{domain}Api.ts`
3. **Create hooks** in `/src/hooks/use{Feature}.ts`
4. **Create components** in `/src/ui/{Component}.tsx`
5. **Create screens** in `/src/screens/{Screen}Screen.tsx`
6. **Wire together** in the appropriate screen

## Migration Notes (November 17, 2025)

### Restructuring Completed ✅

**Changes**:
- Moved `/src/ui/screens/` → `/src/screens/` (13 screen files)
- Moved `/src/ui/components/` → `/src/components/` (10+ component files organized by category)
- Kept `/src/ui/theme/` and `/src/ui/tokens/` (design system)
- Updated all 13 screen files with corrected import paths
- Fixed 10 import paths from `../../../features/*` to `../../hooks/*`
- Created stub implementations for 9 specialized components to unblock compilation

**Import Path Updates**:
- `../../core/hooks/*` → `../../hooks/*`
- `../../core/api/*` → `../../api/*`
- `../../core/i18n/*` → `../../i18n/*`
- Old `../../../features/*` → Removed and replaced with correct hook imports

**Benefits of New Structure**:
- Flatter hierarchy (clearer organization)
- Easier navigation and feature discovery
- Better separation of concerns (screens vs components vs UI system)
- Improved scalability for future features

### Old Structure Removed ❌

- Deleted: `/src/ui/screens/` (migrated to `/src/screens/`)
- Deleted: `/src/ui/components/` (migrated to `/src/components/`)
- Updated: `/src/ui/index.ts` to only export from `tokens` and `theme`

### Next Steps

- Implement specialized components (currently stubs):
  - `PuzzleBoardSection`, `PuzzleFooterControls`, `DailyPuzzleHero`
  - `TacticsStatsCard`, `TacticsQuickTrainRow`
  - `RatingStrip`, `NowPlayingBanner`, `PlayNowPanel`, `GameHistoryList`
  - `IdentityHeader`
- Update `App.tsx` imports to use new paths ✅
- Run `tsc --noEmit` to verify all imports resolve correctly
