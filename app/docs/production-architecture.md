---
title: Production Architecture Guide
service: app
status: active
last_reviewed: 2025-11-18
type: architecture
---

# Production-Grade React Native Architecture

This document describes the complete production-grade architecture implemented in the ChessMate app.

## Architecture Overview

```
app/
├── features/          # Vertical feature slices (self-contained modules)
├── services/          # Horizontal layers (API clients, external services)
├── core/              # Shared utilities, hooks, constants, state
├── platform/          # Infrastructure (errors, monitoring, security, env)
├── ui/                # Design system (tokens, primitives, components)
└── app/               # Expo Router file-based routing
```

## Core Principles

### 1. Vertical Feature Slices
Each feature is self-contained with its own:
- Components (UI implementation)
- Types (feature-specific types)
- Public API (`index.ts` exports)

**Example**: `features/board/`
```typescript
import { ChessBoard, type ChessBoardProps } from '@/features/board';
import type { BoardPosition } from '@/features/board';
```

### 2. Horizontal Layers
Cross-cutting concerns organized by responsibility:
- **services/** - API clients, WebSocket, external integrations
- **core/** - Utilities, hooks, constants, global state
- **platform/** - Infrastructure (errors, monitoring, security)
- **ui/** - Design system (tokens, primitives, components)

### 3. State Management with Zustand
**Location**: `core/state/`

**Stores**:
- `auth.store.ts` - User authentication, tokens, session
- `game.store.ts` - Active game state, moves, position
- `puzzle.store.ts` - Puzzle solving, progress, history

**Usage**:
```typescript
import { useAuthStore, useGameStore } from '@/core/state';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  
  const fen = useGameStore((state) => state.fen);
  const makeMove = useGameStore((state) => state.makeMove);
}
```

### 4. Platform Layer
**Location**: `platform/`

**Capabilities**:
- **Error Boundaries** - Catch React errors, show fallback UI
- **Monitoring** - Track errors, events, performance
- **Security** - JWT validation, input sanitization, rate limiting
- **Environment** - Config management, feature flags

**Usage**:
```typescript
import { ErrorBoundary, monitoring, isValidEmail } from '@/platform';

// Wrap app with error boundary
<ErrorBoundary onError={(err) => monitoring.captureException(err)}>
  <App />
</ErrorBoundary>

// Track events
monitoring.trackEvent('game_started', { gameId: '123' });

// Validate input
if (!isValidEmail(email)) {
  // Handle invalid email
}
```

### 5. Expo Router (File-Based Routing)
**Location**: `app/`

**Structure**:
```
app/
├── _layout.tsx        # Root layout
├── (drawer)/          # Drawer navigation
│   ├── _layout.tsx
│   ├── index.tsx
│   └── games.tsx
├── (tabs)/            # Tab navigation
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── explore.tsx
│   └── profile.tsx
└── modal.tsx          # Modal screens
```

**Navigation**:
```typescript
import { router } from 'expo-router';

// Navigate to screen
router.push('/games');

// Navigate with params
router.push({
  pathname: '/game/[id]',
  params: { id: '123' }
});
```

## File Organization

### Path Aliases
All imports use TypeScript path aliases:

```json
{
  "@/features/*": ["features/*"],
  "@/services/*": ["services/*"],
  "@/core/*": ["core/*"],
  "@/platform/*": ["platform/*"],
  "@/ui/*": ["ui/*"],
  "@/app/*": ["app/*"]
}
```

### Feature Structure
```
features/
├── board/
│   ├── components/
│   │   ├── ChessBoard.tsx

│   ├── types/
│   │   └── board.types.ts
│   └── index.ts           # Public API
├── game/
│   ├── components/
│   │   ├── PlayerPanel.tsx
│   │   ├── MoveList.tsx
│   │   └── GameActions.tsx
│   ├── types/
│   │   └── game.types.ts
│   └── index.ts           # Public API
└── README.md
```

### Services Structure
```
services/
├── api/
│   ├── game.api.ts
│   ├── puzzle.api.ts
│   ├── live-game.api.ts
│   └── index.ts           # Public API
└── websocket/
    └── game.websocket.ts
```

### Core Structure
```
core/
├── state/                 # Zustand stores
│   ├── auth.store.ts
│   ├── game.store.ts
│   ├── puzzle.store.ts
│   └── index.ts
├── utils/                 # Utilities
│   ├── chess/
│   │   └── chessEngine.ts
│   └── index.ts
├── hooks/                 # Custom hooks
│   └── index.ts
└── constants/             # Constants
    └── index.ts
```

### Platform Structure
```
platform/
├── error-boundary.tsx     # React error boundaries
├── monitoring.ts          # Error tracking, analytics
├── security.ts            # Auth, validation, rate limiting
├── environment.ts         # Config, feature flags
└── index.ts               # Public API
```

## Best Practices

### 1. Feature Development
**When creating a new feature:**

1. Create directory under `features/{feature-name}/`
2. Add components, types, hooks
3. Export public API via `index.ts`
4. Document in feature README

**Example**:
```typescript
// features/matchmaking/index.ts
export { MatchmakingQueue } from './components/MatchmakingQueue';
export { useMatchmaking } from './hooks/useMatchmaking';
export type { MatchmakingOptions } from './types/matchmaking.types';
```

### 2. State Management
**When adding new state:**

1. Create store in `core/state/{domain}.store.ts`
2. Define interface for state and actions
3. Export via `core/state/index.ts`
4. Use Zustand middleware (persist, devtools)

### 3. API Integration
**When adding new API endpoints:**

1. Create client in `services/api/{domain}.api.ts`
2. Use environment config for base URLs
3. Handle errors consistently
4. Export via `services/api/index.ts`

### 4. Error Handling
**Production error handling:**

```typescript
import { ErrorBoundary, monitoring } from '@/platform';

// Wrap components
<ErrorBoundary
  fallback={(error, reset) => (
    <ErrorView error={error} onRetry={reset} />
  )}
  onError={(error) => {
    monitoring.captureException(error, {
      component: 'GameScreen',
      userId: user?.id,
    });
  }}
>
  <GameComponent />
</ErrorBoundary>
```

### 5. Feature Flags
**Using feature flags:**

```typescript
import { isFeatureEnabled } from '@/platform';

if (isFeatureEnabled('enableAdvancedAnalysis')) {
  return <AdvancedAnalysisPanel />;
}

return <BasicAnalysisPanel />;
```

## Testing Strategy

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Use Jest + React Testing Library

### Integration Tests
- Test feature workflows
- Mock API responses
- Test state management

### E2E Tests
- Test critical user flows
- Use Detox for native testing
- Test on iOS, Android, Web

## Performance Optimization

### Code Splitting
- Lazy load features with `React.lazy()`
- Use Expo Router automatic code splitting
- Split by route for optimal bundle size

### State Management
- Use Zustand selectors to prevent re-renders
- Memoize expensive computations with `useMemo`
- Optimize list rendering with `React.memo`

### Monitoring
- Track render performance with `usePerformanceTracking`
- Monitor API response times
- Set up performance budgets

## Security

### Authentication
- JWT tokens stored securely (AsyncStorage/SecureStore)
- Token refresh handled automatically
- Rate limiting on auth endpoints

### Input Validation
- Sanitize all user input
- Validate email, username formats
- Check password strength

### API Security
- HTTPS only in production
- API timeout configuration
- Retry with exponential backoff

## Deployment

### Build Configuration
```bash
# Web
expo export --platform web

# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Environment Variables
Configure in `platform/environment.ts`:
- Development: Local APIs, verbose logging
- Staging: Staging APIs, full monitoring
- Production: Production APIs, error reporting only

## Migration from Old Structure

✅ **Completed**:
- Folder structure created
- Path aliases configured
- Features extracted (board, game)
- Services organized (API clients)
- State management (Zustand)
- Platform layer (errors, monitoring, security)
- Expo Router routing

📋 **Ongoing**:
- Feature component migration (iterative)
- Additional features (puzzles, matchmaking, learn, social)

## Resources

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions?

Check related documentation:
- [Migration Status](./migration-status.md)
- [Folder Structure Convention](./folder-structure-convention.md)
- [AI Agent Quick Reference](./ai-agent-quick-reference.md)
