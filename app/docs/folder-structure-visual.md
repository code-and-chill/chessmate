---
title: Folder Structure Visual Guide
service: app
status: active
last_reviewed: 2025-11-18
type: architecture
---

# Folder Structure Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    /app (Routing)                            │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │  play    │ puzzles  │  learn   │ profile  │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              /features (Domain Slices)                       │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │  board   │   game   │ puzzles  │matching  │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
└─────────────────────────────────────────────────────────────┘
              │                │                │
              ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│           Horizontal Layers (Shared)                         │
│  ┌────────────────┬─────────────────┬───────────────────┐  │
│  │   /ui          │   /services     │    /core          │  │
│  │ Design System  │ API/WS/Storage  │ Utils/Hooks/State │  │
│  └────────────────┴─────────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              /platform (Infrastructure)                      │
│  Security │ Monitoring │ Error Boundaries │ Env Config      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         /assets + /types (Resources)                         │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Flow

```
ALLOWED ✅                          FORBIDDEN ❌
────────────────                    ──────────────────
app → features                      features → app
features → ui                       ui → features
features → services                 services → features
features → core                     core → features
ui → tokens                         tokens → ui
services → core                     Feature A → Feature B
core → (nothing)                    platform → features
platform → (nothing)                
```

## Feature Structure (Vertical Slice)

```
features/board/
│
├── index.ts ─────────────────► Public API (exports)
│
├── components/ ──────────────► UI Components
│   ├── ChessBoard.tsx
│   ├── Square.tsx
│   ├── Piece.tsx
│   └── PromotionDialog.tsx
│
├── hooks/ ───────────────────► Business Logic
│   ├── useBoardInteraction.ts
│   ├── useLegalMoves.ts
│   └── useBoardAnimation.ts
│
├── utils/ ───────────────────► Feature Utilities
│   ├── fen.ts
│   ├── coordinates.ts
│   └── validation.ts
│
├── types/ ───────────────────► Type Definitions
│   └── board.types.ts
│
└── __tests__/ ───────────────► Tests
    └── board.test.tsx
```

## UI Layer Structure (Horizontal)

```
ui/
│
├── primitives/ ──────────────► Atomic Components
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── Avatar/
│
├── components/ ──────────────► Composite Components
│   ├── Header/
│   ├── Footer/
│   └── NavigationBar/
│
├── tokens/ ──────────────────► Design Tokens
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── theme/ ───────────────────► Theme System
│   ├── ThemeProvider.tsx
│   ├── useTheme.ts
│   └── themes/
│
└── icons/ ───────────────────► Icon Components
```

## Service Layer Structure

```
services/
│
├── api/ ─────────────────────► HTTP Clients
│   ├── client.ts              (Axios base)
│   ├── game.api.ts            → live-game-api
│   ├── puzzle.api.ts          → puzzle-api
│   └── rating.api.ts          → rating-api
│
├── ws/ ──────────────────────► WebSocket Clients
│   ├── GameWebSocket.ts
│   └── MatchmakingWebSocket.ts
│
├── storage/ ─────────────────► Persistence
│   ├── AsyncStorageService.ts
│   └── SecureStorageService.ts
│
├── analytics/ ───────────────► Tracking
│   └── AnalyticsService.ts
│
└── notifications/ ───────────► Push Notifications
    └── NotificationService.ts
```

## Core Layer Structure

```
core/
│
├── utils/ ───────────────────► Pure Functions
│   ├── date.ts
│   ├── string.ts
│   └── validation.ts
│
├── constants/ ───────────────► Global Constants
│   ├── config.ts
│   ├── routes.ts
│   └── timeControls.ts
│
├── hooks/ ───────────────────► Shared Hooks
│   ├── useDebounce.ts
│   ├── useOnlineStatus.ts
│   └── usePrevious.ts
│
└── state/ ───────────────────► Global State
    ├── store.ts
    ├── authSlice.ts
    └── userSlice.ts
```

## Import Examples

### ✅ Correct Imports

```typescript
// Route imports from feature
import { GameScreen } from '@/features/game';

// Feature imports from UI
import { Button } from '@/ui/primitives';

// Feature imports from services
import { gameApi } from '@/services/api/game.api';

// Feature imports from core
import { formatDate } from '@/core/utils/date';

// Global types
import type { Game } from '@/types/chess.types';
```

### ❌ Wrong Imports

```typescript
// ❌ Deep imports (breaks encapsulation)
import { GameScreen } from '@/features/game/components/GameScreen';

// ❌ Feature to feature
import { ChessBoard } from '@/features/board';  // from /features/game

// ❌ UI to feature
import { useGameState } from '@/features/game'; // from /ui/components

// ❌ Relative paths (breaks consistency)
import { Button } from '../../../ui/primitives/Button';
```

## Data Flow Example: Play a Game

```
1. User taps "Play" button
   └─► app/(tabs)/play.tsx
        └─► features/matchmaking/components/MatchmakingScreen
             └─► features/matchmaking/hooks/useMatchmaking
                  └─► services/api/matchmaking.api.ts
                       └─► Backend: matchmaking-api

2. Match found, navigate to game
   └─► app/game/[gameId].tsx
        └─► features/game/components/GameScreen
             ├─► features/board/components/ChessBoard
             │    └─► features/board/hooks/useBoardInteraction
             │         └─► features/board/utils/validation.ts
             ├─► features/game/hooks/useWebSocket
             │    └─► services/ws/GameWebSocket.ts
             │         └─► Backend: live-game-api (WebSocket)
             └─► features/game/components/MoveHistory
                  └─► ui/primitives/Card
                       └─► ui/tokens/colors.ts
```

## Component Hierarchy Example

```
GameScreen (feature)
├── PlayerBar (feature)
│   ├── Avatar (ui/primitive)
│   ├── Text (ui/primitive)
│   └── ClockDisplay (feature)
│
├── ChessBoard (feature)
│   ├── Square (feature) × 64
│   │   └── Piece (feature) × 32
│   └── MoveHighlight (feature)
│
└── MoveHistory (feature)
    ├── Card (ui/primitive)
    ├── Text (ui/primitive)
    └── ScrollView (react-native)
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────┐
│                  Global State (/core/state)                 │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │  authSlice   │  userSlice   │  settingsSlice       │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│             Feature State (/features/*/state)               │
│  ┌──────────────┬──────────────┬──────────────────────┐   │
│  │  gameSlice   │ puzzleSlice  │  matchmakingSlice    │   │
│  └──────────────┴──────────────┴──────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│        Component State (useState in components)             │
│  Local UI state (modals, forms, animations)                 │
└────────────────────────────────────────────────────────────┘
```

## Theme System Flow

```
┌─────────────────────────────────────────────────────────┐
│  ThemeProvider (/ui/theme/ThemeProvider.tsx)             │
│  ┌───────────────┬───────────────┐                      │
│  │  Light Theme  │  Dark Theme   │                      │
│  └───────────────┴───────────────┘                      │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Design Tokens (/ui/tokens/)                             │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐  │
│  │ colors  │ spacing │  fonts  │ shadows │ borders │  │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Components consume via useTheme() hook                  │
└─────────────────────────────────────────────────────────┘
```

## Testing Pyramid

```
                    ┌──────────┐
                    │   E2E    │  (/__tests__/e2e/)
                    │   Tests  │  Full user flows
                    └──────────┘
                        │
                ┌───────────────┐
                │  Integration  │  (/__tests__/integration/)
                │     Tests     │  API + Component integration
                └───────────────┘
                        │
            ┌───────────────────────┐
            │    Component Tests    │  (/features/*/tests/)
            │   (React Testing Lib) │  UI + Logic
            └───────────────────────┘
                        │
        ┌───────────────────────────────┐
        │        Unit Tests             │  Co-located with code
        │  (Utils, Hooks, Pure Funcs)   │  Pure logic
        └───────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  platform/security/AuthManager.ts                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  JWT Token Management                            │  │
│  │  ├─ Token refresh                                │  │
│  │  ├─ Token validation                             │  │
│  │  └─ Token storage (SecureStore)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  services/api/interceptors/auth.interceptor.ts           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Inject JWT into every API request               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend APIs (live-game-api, account-api, etc.)         │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│  platform/error-boundaries/RootErrorBoundary.tsx         │
│  (Catches all React errors)                              │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  platform/error-boundaries/FeatureErrorBoundary.tsx      │
│  (Catches feature-specific errors)                       │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  services/api/interceptors/error.interceptor.ts          │
│  (Handles API errors)                                    │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  platform/monitoring/crashReporter.ts                    │
│  (Logs to Sentry/monitoring service)                     │
└─────────────────────────────────────────────────────────┘
```

## Performance Monitoring

```
┌─────────────────────────────────────────────────────────┐
│  platform/monitoring/performanceMonitor.ts               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Track metrics:                                  │  │
│  │  ├─ Screen render time                           │  │
│  │  ├─ API response time                            │  │
│  │  ├─ Bundle size                                  │  │
│  │  └─ Memory usage                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Build & Deploy Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  Local Development                                       │
│  npm run dev → Expo Dev Server                           │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Staging                                                 │
│  npm run build:staging → EAS Build                       │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Production                                              │
│  npm run build:production → EAS Build → App Stores       │
└─────────────────────────────────────────────────────────┘
```

---

## Key Principles (Visual Summary)

```
╔════════════════════════════════════════════════════════╗
║  1. VERTICAL SLICING                                    ║
║     Features are self-contained                         ║
║     ┌──────┐ ┌──────┐ ┌──────┐                        ║
║     │board │ │ game │ │puzzle│  (isolated)             ║
║     └──────┘ └──────┘ └──────┘                        ║
╠════════════════════════════════════════════════════════╣
║  2. HORIZONTAL LAYERING                                 ║
║     Shared concerns at bottom                           ║
║     ┌─────────────────────────┐                        ║
║     │ ui, services, core      │ (reusable)             ║
║     └─────────────────────────┘                        ║
╠════════════════════════════════════════════════════════╣
║  3. DEPENDENCY FLOW                                     ║
║     One direction only                                  ║
║     app → features → layers → platform                  ║
║                    (no cycles)                          ║
╠════════════════════════════════════════════════════════╣
║  4. PUBLIC APIs                                         ║
║     Import from folders, not files                      ║
║     @/features/board (not /board/components/...)        ║
╚════════════════════════════════════════════════════════╝
```

---

*For detailed information, see [folder-structure-convention.md](./folder-structure-convention.md)*

*Last updated: 2025-11-18*
