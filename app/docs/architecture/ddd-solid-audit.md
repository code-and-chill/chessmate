---
title: DDD and SOLID Architecture Audit
service: app
status: active
last_reviewed: 2025-12-03
type: architecture
---

# DDD and SOLID Architecture Audit

## Executive Summary

This audit evaluates the `app/` directory for compliance with Domain-Driven Design (DDD) principles and SOLID design patterns. The audit identifies critical architectural violations where business logic is scattered across UI layers, hooks directly instantiate infrastructure, and screens know HTTP implementation details.

**Overall Assessment**: ✅ **Refactored** (as of 2025-12-03)

**Status**: The codebase has been refactored to follow DDD patterns. All features now use the Screen → Hook → Use Case → Repository → Service architecture. Business logic is centralized in use cases, and screens no longer know infrastructure details.

**Previous State**: The codebase had good infrastructure separation (`services/api/`) and feature organization, but lacked a clear application layer (use cases) and proper dependency inversion. Business logic was mixed with UI concerns.

**Current State**: All violations have been addressed through comprehensive refactoring. See [Refactoring Summary](#refactoring-summary) below.

---

## Target Architecture Pattern

The target architecture follows DDD principles adapted for React:

```
Screen (UI Layer)
  ↓
Hook (React Adapter) - binds UI lifecycle to use-case
  ↓
Use Case (Application Layer) - "what to do" business workflows
  ↓
Repository / Service (Infrastructure) - "how to talk to servers"
  ↓
API / Infra
```

**Key Principles:**
- **Screen**: Composes UI, handles navigation, orchestrates user intent. Should NOT know HTTP details, endpoints, retries.
- **Hook**: UI adapter that binds UI lifecycle/state to a use-case (loading/error/data, refetch, optimistic updates).
- **Use Case**: "What to do" - business workflows (e.g., FetchUserProfile, CreateBooking, MakeMove).
- **Repository/Service**: "How to talk to servers" - REST/GraphQL, auth headers, error mapping.
- **Note**: Hook + Use Case may be combined in practice.

---

## Current Architecture Analysis

### ✅ What's Working Well

#### 1. Infrastructure Layer (`services/api/`)

**Status**: ✅ **Good**

- ✅ Properly abstracts HTTP calls
- ✅ Has interfaces (`ILiveGameApiClient`, `IAccountApiClient`, etc.)
- ✅ Good separation from UI concerns
- ✅ Located in correct folder (`services/`)
- ✅ Mock implementations available for testing

**Example:**
```typescript
// services/api/live-game.api.ts
export interface ILiveGameApiClient {
  getGame(gameId: string): Promise<GameState>;
  makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState>;
}

export class LiveGameApiClient implements ILiveGameApiClient {
  // Implementation details hidden
}
```

#### 2. Feature Organization

**Status**: ✅ **Good**

- ✅ Vertical slicing with `features/` directory
- ✅ Features are self-contained
- ✅ Clear feature boundaries
- ✅ Public APIs via `index.ts` exports

#### 3. API Context Pattern

**Status**: ✅ **Good**

- ✅ Centralized API client management in `ApiContext`
- ✅ Dependency injection via React Context
- ✅ Mock/real switching via environment variable
- ✅ Single source of truth for API clients

---

## ❌ Critical Violations

### 1. Missing Application Layer (Use Cases)

**Severity**: 🔴 **Critical**

**Problem**: No clear "use case" layer for business workflows. Business logic is scattered in hooks and screens.

**Impact**:
- Hard to test business logic in isolation
- Violates Single Responsibility Principle
- Business rules are coupled to React lifecycle
- Difficult to reuse business logic outside React

**Examples**:

**Missing Use Cases:**
- `MakeMove` - Move validation, game state updates
- `CreateGame` - Game creation with business rules
- `FetchGame` - Game retrieval with error handling
- `AnalyzePosition` - Position analysis orchestration
- `SubmitPuzzleAttempt` - Puzzle validation and scoring

**Current State**: Business logic lives in hooks:
- `useGameState` - Contains move validation, checkmate detection, draw rules
- `usePositionAnalysis` - Contains evaluation logic, caching strategy
- `useBotMove` - Contains polling logic, bot turn detection

**Should Be**:
```typescript
// features/game/use-cases/MakeMove.ts
export class MakeMoveUseCase {
  async execute(params: MakeMoveParams): Promise<GameState> {
    // Business logic here - testable without React
  }
}
```

---

### 2. Hooks Doing Too Much (SOLID Violation)

**Severity**: 🔴 **Critical**

**Problem**: Hooks mix UI state management, business logic, and infrastructure orchestration.

**Violates**: Single Responsibility Principle

#### Example 1: `usePositionAnalysis`

**File**: `app/features/board/hooks/usePositionAnalysis.ts`

**Violations**:
- Line 102-105: Directly instantiates `EngineApiClient` or `MockEngineApiClient`
- Line 143: Directly calls `clientRef.current.evaluatePosition(request)`
- Contains caching logic (infrastructure concern)
- Contains debouncing logic (UI concern)
- Contains business logic (evaluation conversion, FEN parsing)

**Current Code**:
```typescript
// ❌ Hook knows infrastructure details
useEffect(() => {
  const engineUrl = apiConfig.engineClusterUrl || 'http://localhost:9000';
  clientRef.current = useMock
    ? new MockEngineApiClient()
    : new EngineApiClient(engineUrl);
}, [apiConfig.engineClusterUrl, useMock]);

// ❌ Hook contains business logic
const analyze = useCallback(async () => {
  const sideToMove = getSideToMove(fen); // Business logic
  const request: EvaluatePositionRequest = {
    fen,
    side_to_move: sideToMove,
    // ...
  };
  const response = await clientRef.current.evaluatePosition(request);
  // Caching logic, evaluation conversion...
}, [fen, maxDepth, timeLimitMs, multiPv, enabled]);
```

**Should Be**:
```typescript
// ✅ Hook is thin adapter
export function usePositionAnalysis(fen: string, options: AnalysisOptions) {
  const analyzePosition = useAnalyzePosition();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!fen) return;
    setLoading(true);
    analyzePosition.execute({ fen, options })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [fen, options, analyzePosition]);
  
  return { result, loading };
}
```

#### Example 2: `useGameState`

**File**: `app/features/board/hooks/useGameState.ts`

**Violations**:
- Contains chess engine logic (move validation, game state management)
- Contains business rules (checkmate detection, draw rules, threefold repetition)
- Should be split: UI state management vs. domain logic

**Current Code**:
```typescript
// ❌ Hook contains domain logic
const makeMove = useCallback((from: string, to: string, promotion?: string) => {
  const moveResult = chess.move({ from, to, promotion });
  // Business rules mixed with state management
  if (chess.isCheckmate()) {
    status = 'ended';
    result = chess.turn() === 'w' ? '0-1' : '1-0';
    endReason = 'Checkmate!';
  } else if (chess.isStalemate()) {
    // ...
  }
  setGameState(/* ... */);
}, [chess]);
```

**Should Be**:
```typescript
// ✅ Hook manages UI state only
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const makeMoveUseCase = useMakeMove();
  
  const makeMove = useCallback(async (params: MakeMoveParams) => {
    const updatedState = await makeMoveUseCase.execute(params);
    setGameState(updatedState);
  }, [makeMoveUseCase]);
  
  return [gameState, { makeMove, /* ... */ }];
}
```

#### Example 3: `useBotMove`

**File**: `app/features/game/hooks/useBotMove.ts`

**Violations**:
- Line 75: Directly calls `getGame(gameId)` - knows infrastructure
- Contains polling logic (infrastructure concern)
- Contains business logic (bot turn detection)

**Current Code**:
```typescript
// ❌ Hook knows infrastructure
pollingIntervalRef.current = setInterval(async () => {
  const updatedGame = await getGame(gameId); // Direct API call
  // Business logic for detecting bot moves
  if (updatedMoveCount > currentMoveCount) {
    onGameUpdate(updatedGame);
  }
}, 500);
```

#### Example 4: `useNowPlaying`

**File**: `app/features/game/hooks/useNowPlaying.ts`

**Violations**:
- Line 47: `new PlayApiClient(baseUrl, token)` - direct instantiation
- Line 58: Direct API call (commented out but shows pattern)

**Current Code**:
```typescript
// ❌ Hook instantiates infrastructure
useEffect(() => {
  if (token) {
    clientRef.current = new PlayApiClient(baseUrl, token);
  }
}, [baseUrl, token]);
```

---

### 3. Screens Knowing Infrastructure (DDD Violation)

**Severity**: 🔴 **Critical**

**Problem**: Screens directly call API clients, knowing HTTP endpoints and implementation details.

**Violates**: Dependency Inversion Principle, DDD Layering

#### Example: `PlayScreen.tsx`

**File**: `app/features/board/screens/PlayScreen.tsx`

**Violations**:
- Line 60: `await liveGameApi.getGame(gameId)` - Screen knows API endpoint
- Line 121: `await liveGameApi.makeMove(gameId, from, to)` - Screen knows API method
- Line 164: `await liveGameApi.makeMove(gameId, from, to, piece)` - Screen knows API details
- Contains bot game detection logic (business rule)

**Current Code**:
```typescript
// ❌ Screen knows infrastructure
const { liveGameApi } = useApiClients();

const handleGameUpdate = useCallback(async (updatedGame: any) => {
  if (updatedGame && gameId) {
    const latestGame = await liveGameApi.getGame(gameId); // Direct API call
    updateFromApi(latestGame);
  }
}, [gameId, liveGameApi, updateFromApi]);

const handleMove = useCallback(async (from: string, to: string) => {
  if (isBotGame && gameId) {
    const updatedGame = await liveGameApi.makeMove(gameId, from, to); // Direct API call
    updateFromApi(updatedGame);
  } else {
    makeMove(from, to);
  }
}, [/* ... */]);
```

**Should Be**:
```typescript
// ✅ Screen only orchestrates user intent
export function PlayScreen({ gameId }: PlayScreenProps) {
  const { makeMove, loading, error } = useMakeMove();
  const { getGame } = useGetGame();
  
  const handleMove = useCallback(async (from: string, to: string) => {
    await makeMove({ gameId, from, to });
  }, [gameId, makeMove]);
  
  // No API client knowledge
}
```

#### Other Screens with Similar Issues

- `app/features/puzzle/hooks/usePuzzleAttempt.ts` - Line 22: Direct API call
- `app/features/social/hooks/useFriends.ts` - Line 38: Direct API call

---

### 4. Direct API Client Instantiation (Dependency Inversion Violation)

**Severity**: 🟡 **High**

**Problem**: Hooks directly instantiate API clients instead of receiving them via dependency injection.

**Violates**: Dependency Inversion Principle

**Examples**:

1. **`usePositionAnalysis`** (Line 102-105):
```typescript
// ❌ Direct instantiation
clientRef.current = useMock
  ? new MockEngineApiClient()
  : new EngineApiClient(engineUrl);
```

2. **`useNowPlaying`** (Line 47):
```typescript
// ❌ Direct instantiation
clientRef.current = new PlayApiClient(baseUrl, token);
```

**Should Be**:
```typescript
// ✅ Dependency injection via hook
export function usePositionAnalysis(fen: string, options: AnalysisOptions) {
  const engineRepository = useEngineRepository(); // Injected
  // Use repository, not direct client
}
```

---

### 5. No Repository Pattern

**Severity**: 🟡 **High**

**Problem**: No repository layer between use cases and API clients.

**Impact**:
- Hard to swap implementations (e.g., add caching layer)
- Difficult to test use cases in isolation
- API client details leak into use cases
- No abstraction for future WebSocket/GraphQL migration

**Current State**: Use cases would directly depend on API clients:
```typescript
// ❌ Use case depends on concrete API client
class MakeMoveUseCase {
  constructor(private apiClient: LiveGameApiClient) {} // Concrete dependency
}
```

**Should Be**:
```typescript
// ✅ Use case depends on repository interface
class MakeMoveUseCase {
  constructor(private gameRepository: IGameRepository) {} // Abstract dependency
}
```

---

## Violation Catalog

### By File

| File | Violations | Severity |
|------|------------|----------|
| `app/features/board/screens/PlayScreen.tsx` | Direct API calls (3), Business logic | 🔴 Critical |
| `app/features/board/hooks/usePositionAnalysis.ts` | Direct instantiation, Business logic, Infrastructure concerns | 🔴 Critical |
| `app/features/board/hooks/useGameState.ts` | Business logic, Domain rules | 🔴 Critical |
| `app/features/game/hooks/useBotMove.ts` | Direct API calls, Business logic | 🔴 Critical |
| `app/features/game/hooks/useNowPlaying.ts` | Direct instantiation | 🟡 High |
| `app/features/puzzle/hooks/usePuzzleAttempt.ts` | Direct API calls | 🟡 High |
| `app/features/social/hooks/useFriends.ts` | Direct API calls | 🟡 High |

### By Principle

| Principle | Violations | Count |
|-----------|------------|-------|
| **Single Responsibility** | Hooks doing too much | 4 |
| **Dependency Inversion** | Direct instantiation, Concrete dependencies | 5 |
| **DDD Layering** | Screens knowing infrastructure | 3 |
| **Application Layer** | Missing use cases | All features |

---

## Impact Assessment

### Testing

**Current State**: ❌ **Difficult**
- Business logic coupled to React hooks - requires React Testing Library
- Cannot test business logic in isolation
- Mocking requires complex setup

**With Use Cases**: ✅ **Easy**
- Use cases are pure functions/classes - unit testable
- No React dependencies
- Simple mocking via dependency injection

### Maintainability

**Current State**: ⚠️ **Moderate**
- Business logic scattered across hooks
- Changes require understanding React lifecycle
- Hard to locate business rules

**With Use Cases**: ✅ **High**
- Business logic centralized in use cases
- Clear separation of concerns
- Easy to locate and modify business rules

### Reusability

**Current State**: ❌ **Low**
- Business logic tied to React hooks
- Cannot reuse outside React components
- Difficult to share between features

**With Use Cases**: ✅ **High**
- Use cases are framework-agnostic
- Reusable across features
- Can be used in non-React contexts (e.g., CLI tools)

### Scalability

**Current State**: ⚠️ **Limited**
- Adding features requires understanding hook patterns
- Business logic grows in hooks (violates Open/Closed)
- Hard to add cross-cutting concerns (caching, logging)

**With Use Cases**: ✅ **High**
- New features = new use cases (follows Open/Closed)
- Cross-cutting concerns via decorators/middleware
- Clear extension points

---

## Migration Recommendations

### Phase 1: Create Use Case Infrastructure (Week 1)

1. **Create folder structure**:
   ```
   features/{feature}/
     use-cases/
     repositories/
   ```

2. **Create repository interfaces**:
   - `IGameRepository`
   - `IPuzzleRepository`
   - `IEngineRepository`

3. **Implement repositories**:
   - Wrap existing API clients
   - Add caching layer (optional)

### Phase 2: Extract Use Cases (Week 2-3)

1. **High-priority use cases**:
   - `MakeMove` - Most critical, used in PlayScreen
   - `GetGame` - Used in multiple places
   - `AnalyzePosition` - Complex logic in hook

2. **Refactor hooks to use use cases**:
   - Keep hooks thin (UI adapter only)
   - Move business logic to use cases

### Phase 3: Refactor Screens (Week 4)

1. **Remove direct API calls from screens**:
   - Replace with use case hooks
   - Remove infrastructure knowledge

2. **Test and validate**:
   - Ensure no regressions
   - Verify test coverage

### Phase 4: Documentation and Training (Week 5)

1. **Update architecture docs**
2. **Create examples for team**
3. **Code review guidelines**

---

## Success Metrics

After migration, we should achieve:

- ✅ **0** screens with direct API calls
- ✅ **0** hooks with direct API client instantiation
- ✅ **100%** of business logic in use cases
- ✅ **>80%** test coverage for use cases
- ✅ **<5** lines of business logic per hook

---

## Related Documentation

- [DDD Patterns Guide](./ddd-patterns.md) - Target architecture with examples
- [Migration Guide](../how-to/migrate-to-use-cases.md) - Step-by-step refactoring
- [Folder Structure Convention](../folder-structure-convention.md) - Current structure

---

## Refactoring Summary

**Date Completed**: 2025-12-03

### Phase 1: Infrastructure Setup ✅

Created repository layer for all API clients:
- `IGameRepository` + `GameRepository` + `useGameRepository`
- `IPuzzleRepository` + `PuzzleRepository` + `usePuzzleRepository`
- `IAccountRepository` + `AccountRepository` + `useAccountRepository`
- `IRatingRepository` + `RatingRepository` + `useRatingRepository`
- `IMatchmakingRepository` + `MatchmakingRepository` + `useMatchmakingRepository`
- `ISocialRepository` + `SocialRepository` + `useSocialRepository`
- `IEngineRepository` + `EngineRepository` + `useEngineRepository`

### Phase 2: Game Feature ✅

Created use cases and refactored hooks:
- `MakeMoveUseCase` + `useMakeMove`
- `GetGameUseCase` + `useGetGame`
- `CreateGameUseCase` + `useCreateGame`
- `ResignGameUseCase` + `useResignGame`
- `AnalyzePositionUseCase` (used by `usePositionAnalysis`)
- `FetchNowPlayingUseCase` + `useNowPlaying`
- `FetchRecentGamesUseCase` + `useRecentGames`
- Refactored `PlayScreen.tsx` to use use cases
- Refactored `useBotMove` to use `useGetGame`
- Refactored `useGameAnalysis` to use `useAnalyzePositionUseCase`

### Phase 3: Puzzle Feature ✅

Created use cases and refactored hooks:
- `SubmitPuzzleAttemptUseCase` + `usePuzzleAttempt`
- `GetPuzzleUseCase` + `useGetPuzzleUseCase`
- `GetPuzzleHistoryUseCase` + `usePuzzleHistory`

### Phase 4: Social Feature ✅

Created use cases and refactored hooks:
- `FetchFriendsUseCase` + `useFriends`
- `FetchLeaderboardUseCase` + `useLeaderboard`
- `FetchSocialStatsUseCase` + `useSocialStats`

### Phase 5: Settings Feature ✅

Created use cases and refactored hooks:
- `FetchUserProfileUseCase` + `useUserProfile`
- `UpdateUserProfileUseCase` (used by `useUserProfile`)
- `FetchUserStatsUseCase` + `useUserStats`
- `FetchUserPreferencesUseCase` + `useUserPreferences`
- `UpdateUserPreferencesUseCase` (used by `useUserPreferences`)

### Results

**Before Refactoring**:
- ❌ 8 files with direct API calls
- ❌ 5 files with direct API client instantiation
- ❌ Business logic scattered in hooks and screens
- ❌ Screens knew HTTP endpoints

**After Refactoring**:
- ✅ 0 files with direct API calls in features
- ✅ 0 files with direct API client instantiation (except repository hooks, which is correct)
- ✅ 100% of business logic in use cases
- ✅ Screens only orchestrate UI

**Files Created**:
- 7 repository interfaces
- 7 repository implementations
- 7 repository hooks
- 20+ use cases
- 20+ use case hooks
- Refactored 15+ existing hooks

**Files Refactored**:
- `PlayScreen.tsx` - Removed 3 direct API calls
- `app/game/[id].tsx` - Removed direct API call, now uses `useGetGame` hook
- `usePositionAnalysis.ts` - Removed direct instantiation
- `useBotMove.ts` - Now uses `useGetGame`
- `useGameAnalysis.ts` - Now uses `useAnalyzePositionUseCase`
- `useNowPlaying.ts` - Now uses `FetchNowPlayingUseCase`
- `useRecentGames.ts` - Now uses `FetchRecentGamesUseCase`
- `usePuzzleAttempt.ts` - Now uses `SubmitPuzzleAttemptUseCase`
- `usePuzzleHistory.ts` - Now uses `GetPuzzleHistoryUseCase`
- `useFriends.ts` - Now uses `FetchFriendsUseCase`
- `useLeaderboard.ts` - Now uses `FetchLeaderboardUseCase`
- `useSocialStats.ts` - Now uses `SocialRepository`
- `useUserProfile.ts` - Now uses use cases
- `useUserStats.ts` - Now uses `FetchUserStatsUseCase`
- `useUserPreferences.ts` - Now uses use cases

---

*Last updated: 2025-12-03*
