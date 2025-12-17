---
title: Migrating to Use Case Architecture
service: app
status: active
last_reviewed: 2025-12-03
type: how-to
---

# Migrating to Use Case Architecture

This guide provides step-by-step instructions for refactoring existing code to follow the DDD pattern: Screen → Hook → Use Case → Repository → Service.

## Overview

**Goal**: Separate business logic from UI concerns by introducing:
1. **Use Cases** - Business workflows (framework-agnostic)
2. **Repositories** - Infrastructure abstraction
3. **Thin Hooks** - React adapters only

**Timeline**: 4-5 weeks for full migration

---

## Migration Strategy

### Phase 1: Create Infrastructure (Week 1)

Set up the foundation without changing existing code.

### Phase 2: Extract Use Cases (Week 2-3)

Refactor high-priority features one at a time.

### Phase 3: Refactor Screens (Week 4)

Update screens to use new hooks.

### Phase 4: Cleanup & Documentation (Week 5)

Remove old code, update docs, train team.

---

## Step-by-Step: Migrating MakeMove

This example shows how to migrate the `MakeMove` functionality from `PlayScreen.tsx`.

### Before: Current Implementation

**File**: `app/features/board/screens/PlayScreen.tsx`

```typescript
// ❌ Screen knows infrastructure
export function PlayScreen({ gameId }: PlayScreenProps) {
  const { liveGameApi } = useApiClients();
  
  const handleMove = useCallback(async (from: string, to: string) => {
    if (isBotGame && gameId) {
      const updatedGame = await liveGameApi.makeMove(gameId, from, to);
      updateFromApi(updatedGame);
    } else {
      makeMove(from, to);
    }
  }, [gameId, liveGameApi, isBotGame, makeMove, updateFromApi]);
  
  // ...
}
```

### Step 1: Create Repository Interface

**File**: `app/features/game/repositories/IGameRepository.ts`

```typescript
export interface MakeMoveParams {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface IGameRepository {
  getGame(gameId: string): Promise<GameState>;
  makeMove(params: MakeMoveParams): Promise<GameState>;
  createGame(params: CreateGameParams): Promise<GameState>;
}
```

**Why**: Provides abstraction for testing and future changes.

---

### Step 2: Implement Repository

**File**: `app/features/game/repositories/GameRepository.ts`

```typescript
import { ILiveGameApiClient } from '@/services/api';
import type { IGameRepository, MakeMoveParams } from './IGameRepository';

export class GameRepository implements IGameRepository {
  constructor(private apiClient: ILiveGameApiClient) {}
  
  async getGame(gameId: string): Promise<GameState> {
    const response = await this.apiClient.getGame(gameId);
    return this.mapApiResponseToGameState(response);
  }
  
  async makeMove(params: MakeMoveParams): Promise<GameState> {
    const response = await this.apiClient.makeMove(
      params.gameId,
      params.from,
      params.to,
      params.promotion
    );
    return this.mapApiResponseToGameState(response);
  }
  
  private mapApiResponseToGameState(apiResponse: any): GameState {
    // Transform API response to domain model
    return {
      id: apiResponse.game_id,
      status: apiResponse.status,
      fen: apiResponse.fen,
      sideToMove: apiResponse.side_to_move,
      moves: apiResponse.moves?.map((m: any) => ({
        moveNumber: m.move_number,
        color: m.color,
        san: m.san,
      })) || [],
      // ... map other fields
    };
  }
}
```

**Why**: Wraps API client, handles data transformation.

---

### Step 3: Create Repository Hook

**File**: `app/features/game/hooks/useGameRepository.ts`

```typescript
import { useMemo } from 'react';
import { useApiClients } from '@/contexts/ApiContext';
import { GameRepository } from '../repositories/GameRepository';
import type { IGameRepository } from '../repositories/IGameRepository';

export function useGameRepository(): IGameRepository {
  const { liveGameApi } = useApiClients();
  
  return useMemo(() => new GameRepository(liveGameApi), [liveGameApi]);
}
```

**Why**: Provides repository via dependency injection.

---

### Step 4: Create Use Case

**File**: `app/features/game/use-cases/MakeMove.ts`

```typescript
import type { IGameRepository } from '../repositories/IGameRepository';
import type { IChessEngine } from '../domain/IChessEngine';
import type { MakeMoveParams } from '../repositories/IGameRepository';
import type { GameState } from '../types/GameState';

export class MakeMoveUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private chessEngine: IChessEngine
  ) {}
  
  async execute(params: MakeMoveParams): Promise<GameState> {
    // 1. Fetch current game state
    const game = await this.gameRepository.getGame(params.gameId);
    
    // 2. Validate game is active (business rule)
    if (game.status !== 'in_progress') {
      throw new Error('Game is not active');
    }
    
    // 3. Validate move (business rule)
    const isValid = this.chessEngine.validateMove(game, params);
    if (!isValid) {
      throw new Error('Invalid move');
    }
    
    // 4. Execute move
    const updatedGame = await this.gameRepository.makeMove(params);
    
    // 5. Check for game end (business rule)
    if (this.chessEngine.isCheckmate(updatedGame)) {
      // Handle game end (could call another use case)
    }
    
    return updatedGame;
  }
}
```

**Why**: Contains all business logic, testable without React.

**Test**:

```typescript
// features/game/use-cases/__tests__/MakeMove.test.ts
describe('MakeMoveUseCase', () => {
  it('should throw error if game is not active', async () => {
    const mockRepo = {
      getGame: jest.fn().resolves({ status: 'ended' }),
      makeMove: jest.fn(),
    };
    const mockEngine = { validateMove: jest.fn() };
    const useCase = new MakeMoveUseCase(mockRepo as any, mockEngine as any);
    
    await expect(
      useCase.execute({ gameId: '1', from: 'e2', to: 'e4' })
    ).rejects.toThrow('Game is not active');
  });
});
```

---

### Step 5: Create Use Case Hook

**File**: `app/features/game/hooks/useMakeMoveUseCase.ts`

```typescript
import { useMemo } from 'react';
import { MakeMoveUseCase } from '../use-cases/MakeMove';
import { useGameRepository } from './useGameRepository';
import { useChessEngine } from './useChessEngine';

export function useMakeMoveUseCase() {
  const gameRepository = useGameRepository();
  const chessEngine = useChessEngine();
  
  return useMemo(
    () => new MakeMoveUseCase(gameRepository, chessEngine),
    [gameRepository, chessEngine]
  );
}
```

**Why**: Provides use case instance via dependency injection.

---

### Step 6: Create React Hook (Adapter)

**File**: `app/features/game/hooks/useMakeMove.ts`

```typescript
import { useState, useCallback } from 'react';
import { useMakeMoveUseCase } from './useMakeMoveUseCase';
import type { MakeMoveParams } from '../repositories/IGameRepository';

export function useMakeMove() {
  const makeMoveUseCase = useMakeMoveUseCase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const makeMove = useCallback(async (params: MakeMoveParams) => {
    setLoading(true);
    setError(null);
    try {
      return await makeMoveUseCase.execute(params);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [makeMoveUseCase]);
  
  return { makeMove, loading, error };
}
```

**Why**: Thin React adapter - only handles UI state, delegates to use case.

**Test**:

```typescript
// features/game/hooks/__tests__/useMakeMove.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useMakeMove } from '../useMakeMove';

describe('useMakeMove', () => {
  it('should set loading state', async () => {
    const { result } = renderHook(() => useMakeMove());
    
    act(() => {
      result.current.makeMove({ gameId: '1', from: 'e2', to: 'e4' });
    });
    
    expect(result.current.loading).toBe(true);
  });
});
```

---

### Step 7: Update Screen

**File**: `app/features/board/screens/PlayScreen.tsx`

```typescript
// ✅ Screen only orchestrates user intent
import { useMakeMove } from '@/features/game/hooks/useMakeMove';

export function PlayScreen({ gameId }: PlayScreenProps) {
  const { makeMove, loading, error } = useMakeMove();
  
  const handleMove = useCallback(async (from: string, to: string) => {
    await makeMove({ gameId, from, to });
  }, [gameId, makeMove]);
  
  // No API client knowledge!
  // No business logic!
  
  return (
    <View>
      <ChessBoard onMove={handleMove} />
      {loading && <Spinner />}
      {error && <ErrorDisplay error={error} />}
    </View>
  );
}
```

**Why**: Screen is now pure UI orchestration, no infrastructure knowledge.

---

## Migration Checklist

For each feature to migrate:

### Preparation

- [ ] Identify all business logic in hooks/screens
- [ ] List all API calls in the feature
- [ ] Document current data flow
- [ ] Create test cases for current behavior

### Implementation

- [ ] Create repository interface (`IGameRepository.ts`)
- [ ] Implement repository (`GameRepository.ts`)
- [ ] Create repository hook (`useGameRepository.ts`)
- [ ] Create use case (`MakeMove.ts`)
- [ ] Write unit tests for use case
- [ ] Create use case hook (`useMakeMoveUseCase.ts`)
- [ ] Create React hook adapter (`useMakeMove.ts`)
- [ ] Write integration tests for hook
- [ ] Update screen to use new hook
- [ ] Write component tests for screen

### Validation

- [ ] All tests pass
- [ ] No regressions in functionality
- [ ] No direct API calls in screens
- [ ] No business logic in hooks
- [ ] Use case is testable without React

### Cleanup

- [ ] Remove old code
- [ ] Update imports
- [ ] Update documentation
- [ ] Code review

---

## Common Patterns

### Pattern 1: Query (Read) Operations

**Before**:

```typescript
// ❌ Hook contains API call
export function useGetGame(gameId: string) {
  const { liveGameApi } = useApiClients();
  const [game, setGame] = useState<GameState | null>(null);
  
  useEffect(() => {
    liveGameApi.getGame(gameId).then(setGame);
  }, [gameId, liveGameApi]);
  
  return { game };
}
```

**After**:

```typescript
// ✅ Use case for query
export class GetGameUseCase {
  constructor(private gameRepository: IGameRepository) {}
  
  async execute(gameId: string): Promise<GameState> {
    return this.gameRepository.getGame(gameId);
  }
}

// ✅ Thin hook adapter
export function useGetGame(gameId: string) {
  const getGameUseCase = useGetGameUseCase();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    getGameUseCase.execute(gameId)
      .then(setGame)
      .finally(() => setLoading(false));
  }, [gameId, getGameUseCase]);
  
  return { game, loading };
}
```

---

### Pattern 2: Mutation (Write) Operations

**Before**:

```typescript
// ❌ Hook contains business logic
export function useCreateGame() {
  const { matchmakingApi } = useApiClients();
  
  const createGame = useCallback(async (params: CreateGameParams) => {
    // Business logic mixed with API call
    if (params.rated && !user.isPremium) {
      throw new Error('Premium required for rated games');
    }
    
    return matchmakingApi.createGame(params);
  }, [matchmakingApi, user]);
  
  return { createGame };
}
```

**After**:

```typescript
// ✅ Use case contains business logic
export class CreateGameUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private userService: IUserService
  ) {}
  
  async execute(params: CreateGameParams): Promise<GameState> {
    // Business rule
    if (params.rated && !this.userService.isPremium()) {
      throw new Error('Premium required for rated games');
    }
    
    return this.gameRepository.createGame(params);
  }
}

// ✅ Thin hook adapter
export function useCreateGame() {
  const createGameUseCase = useCreateGameUseCase();
  const [loading, setLoading] = useState(false);
  
  const createGame = useCallback(async (params: CreateGameParams) => {
    setLoading(true);
    try {
      return await createGameUseCase.execute(params);
    } finally {
      setLoading(false);
    }
  }, [createGameUseCase]);
  
  return { createGame, loading };
}
```

---

### Pattern 3: Complex Workflows

**Before**:

```typescript
// ❌ Hook orchestrates multiple API calls
export function useSubmitPuzzleAttempt() {
  const { puzzleApi } = useApiClients();
  
  const submitAttempt = useCallback(async (attempt: PuzzleAttempt) => {
    // Multiple API calls, business logic mixed
    const result = await puzzleApi.submitAttempt(puzzleId, attempt);
    
    if (result.correct) {
      await puzzleApi.updateStats(userId, { solved: true });
      await analytics.track('puzzle_solved', { puzzleId });
    }
    
    return result;
  }, [puzzleApi, puzzleId, userId]);
  
  return { submitAttempt };
}
```

**After**:

```typescript
// ✅ Use case orchestrates workflow
export class SubmitPuzzleAttemptUseCase {
  constructor(
    private puzzleRepository: IPuzzleRepository,
    private statsRepository: IStatsRepository,
    private analyticsService: IAnalyticsService
  ) {}
  
  async execute(params: SubmitPuzzleAttemptParams): Promise<PuzzleResult> {
    // 1. Submit attempt
    const result = await this.puzzleRepository.submitAttempt(params);
    
    // 2. Update stats if correct (business rule)
    if (result.correct) {
      await this.statsRepository.updatePuzzleStats(params.userId, {
        solved: true,
        puzzleId: params.puzzleId,
      });
      
      // 3. Track analytics
      await this.analyticsService.track('puzzle_solved', {
        puzzleId: params.puzzleId,
      });
    }
    
    return result;
  }
}
```

---

## Testing Strategy

### 1. Unit Tests (Use Cases)

Test business logic in isolation:

```typescript
describe('MakeMoveUseCase', () => {
  it('should validate move', async () => {
    const mockRepo = createMockRepository();
    const mockEngine = createMockEngine();
    const useCase = new MakeMoveUseCase(mockRepo, mockEngine);
    
    mockEngine.validateMove.mockReturnValue(false);
    
    await expect(
      useCase.execute({ gameId: '1', from: 'e2', to: 'e4' })
    ).rejects.toThrow(InvalidMoveError);
  });
});
```

### 2. Integration Tests (Hooks)

Test React integration:

```typescript
describe('useMakeMove', () => {
  it('should handle loading state', async () => {
    const { result } = renderHook(() => useMakeMove());
    
    act(() => {
      result.current.makeMove({ gameId: '1', from: 'e2', to: 'e4' });
    });
    
    expect(result.current.loading).toBe(true);
  });
});
```

### 3. Component Tests (Screens)

Test UI behavior:

```typescript
describe('PlayScreen', () => {
  it('should call makeMove on move', async () => {
    const mockMakeMove = jest.fn();
    jest.spyOn(hooks, 'useMakeMove').mockReturnValue({
      makeMove: mockMakeMove,
      loading: false,
      error: null,
    });
    
    render(<PlayScreen gameId="1" />);
    fireEvent.press(screen.getByTestId('square-e2'));
    fireEvent.press(screen.getByTestId('square-e4'));
    
    expect(mockMakeMove).toHaveBeenCalledWith({
      gameId: '1',
      from: 'e2',
      to: 'e4',
    });
  });
});
```

---

## Rollout Plan

### Week 1: Infrastructure Setup

- [ ] Create repository interfaces for all features
- [ ] Implement repositories
- [ ] Create repository hooks
- [ ] Set up testing infrastructure

### Week 2-3: High-Priority Features

**Priority Order**:

1. **MakeMove** (PlayScreen) - Most critical, used everywhere
2. **GetGame** - Used in multiple places
3. **CreateGame** - Game creation flow
4. **AnalyzePosition** - Complex logic in hook

**For Each Feature**:

- [ ] Extract use case
- [ ] Create hook adapter
- [ ] Update screen
- [ ] Write tests
- [ ] Code review
- [ ] Merge

### Week 4: Remaining Features

- [ ] SubmitPuzzleAttempt
- [ ] FetchFriends
- [ ] CreateBotGame
- [ ] Other features as needed

### Week 5: Cleanup

- [ ] Remove old code
- [ ] Update documentation
- [ ] Team training session
- [ ] Code review guidelines

---

## Troubleshooting

### Issue: Circular Dependencies

**Problem**: Use case imports hook, hook imports use case.

**Solution**: Use dependency injection. Hooks provide dependencies to use cases, not the other way around.

```typescript
// ❌ Bad: Circular dependency
// useMakeMove.ts imports MakeMoveUseCase
// MakeMoveUseCase imports useGameRepository

// ✅ Good: Dependency injection
// useMakeMove.ts creates MakeMoveUseCase with dependencies
// MakeMoveUseCase receives dependencies via constructor
```

### Issue: Too Many Layers

**Problem**: Simple operations feel over-engineered.

**Solution**: For simple CRUD operations, you can combine hook + use case:

```typescript
// ✅ Acceptable for simple cases
export function useGetGame(gameId: string) {
  const gameRepository = useGameRepository();
  // Simple use case logic inline
  const [game, setGame] = useState<GameState | null>(null);
  
  useEffect(() => {
    gameRepository.getGame(gameId).then(setGame);
  }, [gameId, gameRepository]);
  
  return { game };
}
```

### Issue: Testing is Hard

**Problem**: Can't test use cases because they depend on React hooks.

**Solution**: Use dependency injection. Use cases should receive dependencies, not import hooks.

```typescript
// ❌ Bad: Use case depends on React
export class MakeMoveUseCase {
  constructor() {
    this.repository = useGameRepository(); // ❌ Can't use hooks in class
  }
}

// ✅ Good: Dependencies injected
export class MakeMoveUseCase {
  constructor(private repository: IGameRepository) {} // ✅ Pure dependency
}
```

---

## Success Criteria

After migration, verify:

- ✅ **0** screens with direct API calls
- ✅ **0** hooks with direct API client instantiation
- ✅ **100%** of business logic in use cases
- ✅ **>80%** test coverage for use cases
- ✅ **<10** lines of business logic per hook
- ✅ All use cases testable without React

---

## Related Documentation

- [DDD Patterns Guide](../architecture/ddd-patterns.md) - Architecture patterns
- [DDD & SOLID Audit](../architecture/ddd-solid-audit.md) - Current violations
- [Folder Structure Convention](../folder-structure-convention.md) - File organization

---

*Last updated: 2025-12-03*
