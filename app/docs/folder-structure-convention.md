---
title: Production-Grade Folder Structure Convention
service: app
status: active
last_reviewed: 2025-11-18
type: architecture
---

# Production-Grade Folder Structure Convention

## Purpose

This document defines the **long-term, production-grade folder structure** for the ChessMate React Native + Web application. This structure is designed to support:

- ✅ Chess.com-grade product scalability
- ✅ Multi-team development and domain isolation
- ✅ AI-compatible code generation
- ✅ Clean architectural boundaries
- ✅ Feature modularity and extensibility
- ✅ Security, performance, and maintainability

## Architectural Principles

### 1. Vertical Slicing (Features)
Each feature is **self-contained** with its own components, hooks, state, and types. Features don't import from each other directly.

### 2. Horizontal Layering (UI, Services, Core)
- **UI Layer**: Pure presentation components (design system)
- **Services Layer**: External integrations (API, WebSocket, Storage)
- **Core Layer**: Domain-agnostic utilities and shared logic

### 3. Dependency Flow
```
app (routes) → features → ui/services/core → platform
                           ↓
                     types/assets
```

### 4. No Circular Dependencies
- ✅ Features → UI
- ❌ UI → Features
- ❌ Feature A → Feature B

### 5. Public APIs
Each folder exports via `index.ts`. Internal files prefixed with `_`. Import from folder, not file.

---

## Top-Level Structure

```
app/
├── README.md                          # Build, run, test instructions
├── package.json                       # Dependencies and scripts
├── app.json                           # Expo configuration
├── tsconfig.json                      # TypeScript configuration
├── service.yaml                       # Service metadata (monorepo)
├── Dockerfile                         # Container definition
│
├── docs/                              # Service documentation (AGENTS.md requirement)
│   ├── README.md                      # Service overview
│   ├── GETTING_STARTED.md             # Dev setup guide
│   ├── ARCHITECTURE.md                # Technical design
│   ├── FOLDER_STRUCTURE_CONVENTION.md # This file
│   ├── overview.md                    # Feature specification
│   ├── domain.md                      # Chess domain glossary
│   ├── operations.md                  # Deployment, monitoring
│   ├── how-to/                        # How-to guides
│   ├── decisions/                     # Architecture Decision Records
│   └── migrations/                    # Phase-based development
│
├── app/                               # 🚀 FILE-BASED ROUTING (Expo Router)
├── features/                          # 🎯 VERTICAL DOMAIN SLICES
├── ui/                                # 🎨 DESIGN SYSTEM
├── services/                          # 🌐 EXTERNAL INTEGRATIONS
├── core/                              # 🛠️ DOMAIN-AGNOSTIC UTILITIES
├── platform/                          # ⚙️ CROSS-CUTTING CONCERNS
├── assets/                            # 📦 STATIC RESOURCES
├── types/                             # 🔷 GLOBAL TYPE DEFINITIONS
├── scripts/                           # 🔧 BUILD & AUTOMATION
└── __tests__/                         # 🧪 ROOT-LEVEL TESTS
```

---

## 1. `/app` — File-Based Routing

**Responsibility**: Define navigation structure and route hierarchy using Expo Router.

### Structure
```
app/
├── _layout.tsx                    # Root layout (navigation shell)
├── index.tsx                      # Landing/Home screen
├── (auth)/                        # Auth flow group
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                        # Main app tabs
│   ├── _layout.tsx
│   ├── play.tsx                   # Quick Play tab
│   ├── puzzles.tsx                # Puzzles tab
│   ├── learn.tsx                  # Learn tab
│   └── profile.tsx                # Profile tab
├── game/
│   └── [gameId].tsx               # Dynamic game route
├── puzzle/
│   └── [puzzleId].tsx             # Dynamic puzzle route
└── settings/
    ├── index.tsx
    ├── account.tsx
    ├── preferences.tsx
    └── notifications.tsx
```

### What Belongs Inside
- `_layout.tsx` files (navigation containers)
- Route screens (thin orchestration layer)
- Route-specific layouts (auth flow, tabs, modals)

### What Must NOT Belong Inside
- ❌ Business logic (goes to `/features`)
- ❌ Reusable components (goes to `/ui` or `/features`)
- ❌ API calls (goes to `/services`)
- ❌ Utilities (goes to `/core`)

### Team Scaling
- Each team owns routes under their domain
- Shared layouts require cross-team coordination
- Route changes trigger navigation contract updates

### AI Agent Guidelines
- ✅ **When adding a screen**: Create route file, import feature component
- ✅ **When refactoring navigation**: Update `_layout.tsx` files
- ❌ **Never**: Put feature logic directly in route files

---

## 2. `/features` — Vertical Domain Slices

**Responsibility**: Encapsulate complete feature domains with components, hooks, state, and types.

### Structure
```
features/
├── README.md                      # Feature module guide
│
├── board/                         # Chess board rendering + interaction
│   ├── index.ts                   # Public API exports
│   ├── components/
│   │   ├── ChessBoard.tsx         # Main board container
│   │   ├── Square.tsx             # Board square
│   │   ├── Piece.tsx              # Chess piece
│   │   ├── MoveHighlight.tsx      # Legal move indicators
│   │   ├── CoordinateLabels.tsx   # A-H, 1-8 labels
│   │   └── PromotionDialog.tsx    # Pawn promotion UI
│   ├── hooks/
│   │   ├── useBoardInteraction.ts # Drag-drop, tap-to-move
│   │   ├── useLegalMoves.ts       # Chess.js integration
│   │   └── useBoardAnimation.ts   # Piece movement animation
│   ├── utils/
│   │   ├── fen.ts                 # FEN notation parser
│   │   ├── coordinates.ts         # Square index ↔ algebraic
│   │   └── validation.ts          # Move validation
│   ├── types/
│   │   └── board.types.ts         # Board-specific types
│   └── __tests__/
│       └── board.test.tsx
│
├── game/                          # Live game orchestration
│   ├── index.ts
│   ├── components/
│   │   ├── GameScreen.tsx         # Full game UI
│   │   ├── PlayerBar.tsx          # Player info + timer
│   │   ├── MoveHistory.tsx        # Move list
│   │   ├── GameControls.tsx       # Resign, draw, rematch
│   │   ├── ClockDisplay.tsx       # Chess clock
│   │   └── GameOverModal.tsx      # Result display
│   ├── hooks/
│   │   ├── useGameState.ts        # Game state management
│   │   ├── useWebSocket.ts        # Real-time sync
│   │   ├── useChessClock.ts       # Timer logic
│   │   └── useGameActions.ts      # Move, resign, draw
│   ├── state/
│   │   ├── gameSlice.ts           # Redux/Zustand slice
│   │   └── gameSelectors.ts       # Memoized selectors
│   ├── types/
│   │   └── game.types.ts
│   └── __tests__/
│
├── puzzles/                       # Tactical puzzles
│   ├── index.ts
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── __tests__/
│
├── matchmaking/                   # Find opponents
├── learn/                         # Educational content
├── analysis/                      # Game analysis (future)
├── social/                        # Friends, chat (future)
└── tournaments/                   # Tournament system (future)
```

### What Belongs Inside
- ✅ Feature-specific components (not reusable elsewhere)
- ✅ Domain hooks (`useGameState`, `usePuzzleLogic`)
- ✅ Feature state management (slices, selectors)
- ✅ Feature types (scoped to the feature)
- ✅ Feature tests

### What Must NOT Belong Inside
- ❌ Design system components (goes to `/ui`)
- ❌ API clients (goes to `/services`)
- ❌ Generic utilities (goes to `/core`)
- ❌ Navigation logic (goes to `/app`)

### Team Scaling
- Each feature is **owned by one team**
- Features communicate via **state management** or **events**
- No direct imports between features (use shared services)
- New features = new folder (e.g., `/features/tournaments`)

### AI Agent Guidelines
- ✅ **When adding a feature**: Scaffold full structure (components, hooks, types, tests)
- ✅ **When extending a feature**: Stay within feature boundaries
- ❌ **Never**: Import from other features directly (use `/services` or `/core`)

---

## 3. `/ui` — Design System

**Responsibility**: Provide reusable, theme-aware components and design tokens.

### Structure
```
ui/
├── README.md                      # Design system guide
├── index.ts                       # Barrel exports
│
├── primitives/                    # Atomic components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Card/
│   ├── Avatar/
│   ├── Badge/
│   ├── Modal/
│   ├── Tooltip/
│   ├── Spinner/
│   └── index.ts                   # Export all primitives
│
├── components/                    # Composite components
│   ├── Header/
│   ├── Footer/
│   ├── NavigationBar/
│   ├── SearchBar/
│   ├── UserMenu/
│   └── index.ts
│
├── tokens/                        # Design tokens
│   ├── colors.ts                  # Color palette
│   ├── typography.ts              # Font scales
│   ├── spacing.ts                 # 4/8/16/24/32px system
│   ├── shadows.ts                 # Box shadows
│   ├── borders.ts                 # Border radius, widths
│   ├── animations.ts              # Timing functions
│   └── index.ts
│
├── theme/                         # Theme engine
│   ├── ThemeProvider.tsx          # Context provider
│   ├── useTheme.ts                # Hook
│   ├── themes/
│   │   ├── light.ts               # Light theme
│   │   ├── dark.ts                # Dark theme
│   │   └── index.ts
│   └── createTheme.ts             # Theme factory
│
└── icons/                         # Icon components
    ├── ChessIcons.tsx             # ♔♕♖♗♘♙
    ├── ActionIcons.tsx            # Play, settings, etc.
    └── index.ts
```

### What Belongs Inside
- ✅ Atomic primitives (Button, Input, Card)
- ✅ Composite components (Header, Footer)
- ✅ Design tokens (colors.ts, spacing.ts)
- ✅ Theme provider and hooks
- ✅ Icon components

### What Must NOT Belong Inside
- ❌ Feature-specific components (goes to `/features`)
- ❌ Business logic (goes to `/features` or `/core`)
- ❌ API calls (goes to `/services`)

### Team Scaling
- **Design team** owns this folder
- Features consume via imports (`import { Button } from '@/ui'`)
- Breaking changes require cross-team coordination
- Version design system separately if needed

### AI Agent Guidelines
- ✅ **When adding a component**: Follow primitive → composite hierarchy
- ✅ **When theming**: Update tokens, not hard-coded styles
- ❌ **Never**: Add feature logic to UI components (keep them dumb)

---

## 4. `/services` — External Integrations

**Responsibility**: Abstract API calls, WebSocket connections, and external services.

### Structure
```
services/
├── README.md                      # Service integration guide
│
├── api/                           # HTTP API clients
│   ├── client.ts                  # Axios/Fetch base client
│   ├── auth.api.ts                # account-api calls
│   ├── game.api.ts                # live-game-api calls
│   ├── puzzle.api.ts              # puzzle-api calls
│   ├── rating.api.ts              # rating-api calls
│   ├── matchmaking.api.ts         # matchmaking-api calls
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # JWT injection
│   │   ├── error.interceptor.ts   # Error handling
│   │   └── retry.interceptor.ts   # Retry logic
│   └── types/
│       └── api.types.ts
│
├── ws/                            # WebSocket clients
│   ├── GameWebSocket.ts           # live-game-api WS
│   ├── MatchmakingWebSocket.ts    # matchmaking-api WS
│   ├── WebSocketManager.ts        # Connection pool
│   └── types/
│       └── ws.types.ts
│
├── storage/                       # Persistence
│   ├── AsyncStorageService.ts     # React Native AsyncStorage
│   ├── SecureStorageService.ts    # Expo SecureStore
│   ├── CacheService.ts            # In-memory cache
│   └── types/
│       └── storage.types.ts
│
├── analytics/                     # Tracking
│   ├── AnalyticsService.ts        # Event tracking
│   ├── events.ts                  # Event definitions
│   └── providers/
│       ├── mixpanel.ts
│       └── amplitude.ts
│
└── notifications/                 # Push notifications
    ├── NotificationService.ts     # Expo Notifications
    └── types/
```

### What Belongs Inside
- ✅ API clients (axios/fetch wrappers)
- ✅ WebSocket managers
- ✅ Storage services (AsyncStorage, SecureStore)
- ✅ Analytics trackers
- ✅ Interceptors (auth, retry, error)

### What Must NOT Belong Inside
- ❌ Business logic (goes to `/features`)
- ❌ UI components (goes to `/ui`)
- ❌ Generic utilities (goes to `/core`)

### Team Scaling
- Backend team defines API contracts (OpenAPI)
- Frontend team implements clients based on contracts
- One file per backend service (e.g., `game.api.ts` → `live-game-api`)

### AI Agent Guidelines
- ✅ **When backend changes**: Update corresponding API client
- ✅ **When adding integration**: Create new service file
- ✅ **Always**: Use interceptors for cross-cutting concerns (auth, errors)

---

## 5. `/core` — Domain-Agnostic Utilities

**Responsibility**: Provide pure utility functions, global constants, and shared hooks.

### Structure
```
core/
├── README.md                      # Core utilities guide
│
├── utils/                         # Pure functions
│   ├── date.ts                    # Date formatting
│   ├── string.ts                  # String manipulation
│   ├── number.ts                  # Number formatting
│   ├── validation.ts              # Input validation
│   ├── debounce.ts                # Debounce/throttle
│   └── logger.ts                  # Logging utility
│
├── constants/                     # Global constants
│   ├── config.ts                  # App configuration
│   ├── routes.ts                  # Route definitions
│   ├── timeControls.ts            # Chess time formats
│   └── errorCodes.ts              # Error code mappings
│
├── hooks/                         # Shared hooks
│   ├── useDebounce.ts
│   ├── useThrottle.ts
│   ├── useOnlineStatus.ts         # Network detection
│   ├── useKeyboard.ts             # Keyboard events
│   └── usePrevious.ts
│
└── state/                         # Global state management
    ├── store.ts                   # Redux/Zustand store
    ├── authSlice.ts               # Authentication state
    ├── userSlice.ts               # User profile state
    ├── settingsSlice.ts           # App settings
    └── types/
```

### What Belongs Inside
- ✅ Pure utils (date, string, validation)
- ✅ Global constants (routes, config)
- ✅ Shared hooks (useDebounce, useOnlineStatus)
- ✅ Global state slices (auth, user)

### What Must NOT Belong Inside
- ❌ Feature-specific logic (goes to `/features`)
- ❌ API clients (goes to `/services`)
- ❌ UI components (goes to `/ui`)

### Team Scaling
- **Platform team** maintains this folder
- All teams can consume safely (no side effects)
- Additions require review (avoid bloat)

### AI Agent Guidelines
- ✅ **When adding utility**: Ensure it's truly generic
- ✅ **When creating hook**: Ensure it's reusable across features
- ❌ **Never**: Put feature-specific logic here

---

## 6. `/platform` — Cross-Cutting Concerns

**Responsibility**: Handle security, monitoring, error boundaries, and environment config.

### Structure
```
platform/
├── README.md                      # Platform guide
│
├── security/                      # Security layer
│   ├── AuthManager.ts             # JWT handling
│   ├── BiometricAuth.ts           # Touch/Face ID
│   ├── encryption.ts              # Data encryption
│   └── types/
│
├── monitoring/                    # Observability
│   ├── ErrorBoundary.tsx          # React error boundary
│   ├── performanceMonitor.ts      # Performance tracking
│   ├── crashReporter.ts           # Sentry integration
│   └── types/
│
├── error-boundaries/              # Error handling
│   ├── RootErrorBoundary.tsx      # Global catcher
│   ├── FeatureErrorBoundary.tsx   # Feature-level
│   └── FallbackUI.tsx             # Error UI
│
└── env/                           # Environment management
    ├── config.ts                  # Env variable loader
    ├── env.development.ts         # Dev config
    ├── env.staging.ts             # Staging config
    ├── env.production.ts          # Prod config
    └── types/
```

### What Belongs Inside
- ✅ Security managers (AuthManager, BiometricAuth)
- ✅ Monitoring tools (Sentry, performance)
- ✅ Error boundaries (React error catchers)
- ✅ Environment configuration loaders

### What Must NOT Belong Inside
- ❌ Feature logic (goes to `/features`)
- ❌ API clients (goes to `/services`)
- ❌ UI components (goes to `/ui`)

### Team Scaling
- **DevOps/Platform team** owns this folder
- All teams benefit automatically (no opt-in needed)
- Changes affect entire app (requires careful testing)

### AI Agent Guidelines
- ✅ **When adding platform feature**: Ensure it's truly cross-cutting
- ✅ **When debugging**: Check error boundaries and monitoring first
- ❌ **Never**: Put business logic here

---

## 7. `/assets` — Static Resources

**Responsibility**: Store images, fonts, sounds, and themed resources.

### Structure
```
assets/
├── README.md                      # Asset guide
│
├── boards/                        # Board themes
│   ├── classic-brown.png
│   ├── modern-gray.png
│   ├── neon-blue.png
│   └── wood-texture.png
│
├── pieces/                        # Piece sets
│   ├── classic/
│   │   ├── wK.svg
│   │   ├── wQ.svg
│   │   └── ...
│   ├── modern/
│   ├── neo/
│   └── 3d/
│
├── sounds/                        # Sound effects
│   ├── move.mp3
│   ├── capture.mp3
│   ├── check.mp3
│   ├── castle.mp3
│   └── game-end.mp3
│
├── icons/                         # App icons
│   ├── icon.png
│   ├── adaptive-icon.png
│   └── splash.png
│
├── fonts/                         # Custom fonts
│   ├── Inter-Regular.ttf
│   ├── Inter-Bold.ttf
│   └── RobotoMono-Regular.ttf     # For chess notation
│
└── images/                        # Misc images
    ├── logo.png
    ├── onboarding/
    └── backgrounds/
```

### What Belongs Inside
- ✅ Board themes (PNG/SVG)
- ✅ Chess piece sets (SVG)
- ✅ Sound effects (MP3/WAV)
- ✅ App icons and splash screens
- ✅ Custom fonts

### What Must NOT Belong Inside
- ❌ Code (goes to appropriate folder)
- ❌ Dynamic content (fetched from API)

### Team Scaling
- **Design team** maintains assets
- **Frontend team** references via `require()` or imports
- Large assets → CDN (not in repo)

### AI Agent Guidelines
- ✅ **When adding theme**: Create organized subfolder
- ✅ **When referencing**: Use typed asset imports
- ❌ **Never**: Hard-code asset paths (use constants)

---

## 8. `/types` — Global Type Definitions

**Responsibility**: Define global TypeScript types and API contracts.

### Structure
```
types/
├── README.md                      # Type system guide
├── index.d.ts                     # Global type augmentation
├── navigation.types.ts            # Expo Router types
├── api.types.ts                   # API contracts
├── chess.types.ts                 # Chess domain types
├── user.types.ts                  # User models
└── env.d.ts                       # Environment types
```

### What Belongs Inside
- ✅ Global type definitions (`index.d.ts`)
- ✅ Navigation types (Expo Router)
- ✅ API response types (shared across services)
- ✅ Chess domain types (shared across features)

### What Must NOT Belong Inside
- ❌ Feature-specific types (goes to `/features/{feature}/types`)
- ❌ Implementation code (goes to appropriate folder)

### Team Scaling
- **Platform team** maintains global types
- Feature teams add feature-specific types in their folders
- Backend contracts → auto-generate types (OpenAPI → TypeScript)

### AI Agent Guidelines
- ✅ **When adding global type**: Put in `/types`
- ✅ **When adding feature type**: Put in `/features/{feature}/types`
- ✅ **Always**: Use strict TypeScript (`strict: true`)

---

## Migration Path

### From Current Structure to New Structure

```
CURRENT                          →  NEW
────────────────────────────────────────────────────────────
/components/compound/ChessBoard  →  /features/board/components/ChessBoard
/components/core/*               →  /ui/primitives/*
/screens/PlayScreen              →  /app/(tabs)/play.tsx (thin)
                                    /features/game/components/GameScreen (thick)
/contexts/*                      →  /core/state/* (Redux/Zustand)
/api/*                           →  /services/api/*
/utils/*                         →  /core/utils/* (if generic)
                                    /features/{feature}/utils/* (if specific)
/hooks/*                         →  /core/hooks/* (if generic)
                                    /features/{feature}/hooks/* (if specific)
/constants/*                     →  /core/constants/*
/styles/*                        →  /ui/tokens/* (design tokens)
                                    /ui/theme/* (theme system)
```

### Migration Strategy

1. **Phase 1: Create new structure** (parallel to existing)
2. **Phase 2: Move shared utilities** (`/core`, `/ui/tokens`)
3. **Phase 3: Migrate features** (one at a time: board → game → puzzles)
4. **Phase 4: Update routing** (`/app` with Expo Router)
5. **Phase 5: Refactor services** (`/services`)
6. **Phase 6: Remove old structure**

---

## Path Aliases (tsconfig.json)

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

---

## Quick Reference

### Adding a Feature
1. Create folder under `/features/{feature-name}`
2. Scaffold: `components/`, `hooks/`, `types/`, `__tests__/`
3. Create `index.ts` with public exports
4. Add route in `/app` (if screen needed)

### Adding a Component
1. **Reusable across features?** → `/ui/primitives` or `/ui/components`
2. **Feature-specific?** → `/features/{feature}/components`
3. **Route screen?** → `/app/{route}.tsx` (thin wrapper)

### Adding API Integration
1. Create client in `/services/api/{service}.api.ts`
2. Define types in `/types/api.types.ts`
3. Use interceptors for auth/errors

### Adding Utility
1. **Generic?** → `/core/utils`
2. **Feature-specific?** → `/features/{feature}/utils`
3. **Chess-specific?** → `/features/board/utils` or `/core/utils/chess.ts`

---

## Compliance with AGENTS.md

This structure follows:
- ✅ **Service-level organization** (app is a service in the monorepo)
- ✅ **Domain isolation** (features as vertical slices)
- ✅ **Documentation standards** (docs/, migrations/, ADRs)
- ✅ **Multi-team scalability** (clear boundaries, no cross-contamination)
- ✅ **AI-agent compatibility** (predictable paths, explicit responsibilities)

---

## Related Documentation

- [architecture.md](./architecture.md) — Technical design and patterns
- [folder-structure.md](./folder-structure.md) — Current structure
- [decisions/adr-0001-folder-structure-convention.md](./decisions/adr-0001-folder-structure-convention.md) — Decision rationale
- [how-to/migration-to-production-structure.md](./how-to/migration-to-production-structure.md) — Migration plan

---

*Last updated: 2025-11-18*
