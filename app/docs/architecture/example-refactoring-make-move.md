---
title: Example Refactoring: MakeMove Use Case
service: app
status: active
last_reviewed: 2025-12-03
type: architecture
---

# Example Refactoring: MakeMove Use Case

This document demonstrates a complete refactoring of the `MakeMove` functionality from the current architecture to the DDD pattern.

## Before: Current Implementation

### Screen (Violations)

**File**: `app/features/board/screens/PlayScreen.tsx`

```typescript
// ❌ Screen knows infrastructure details
export function PlayScreen({ gameId, initialGame }: PlayScreenProps) {
  const { liveGameApi } = useApiClients();
  const [gameState, gameActions] = useGameState(initialGame ?? undefined);
  const { makeMove, endGame, offerDraw, updateFromApi } = gameActions;
  
  // ❌ Direct API call in screen
  const handleGameUpdate = useCallback(async (updatedGame: any) => {
    if (updatedGame && gameId) {
      try {
        const latestGame = await liveGameApi.getGame(gameId); // ❌ Knows API endpoint
        updateFromApi(latestGame);
      } catch (err) {
        console.error('Failed to refresh game after bot move:', err);
      }
    }
  }, [gameId, liveGameApi, updateFromApi]);
  
  // ❌ Direct API call in screen
  const handleMove = useCallback(async (from: string, to: string) => {
    const needsPromotion = promotionActions.checkPromotion(from, to, gameState.fen, gameState.sideToMove);
    if (needsPromotion) {
      promotionActions.showPromotion(from, to);
      return;
    }
    
    // ❌ Business logic: bot game detection
    if (isBotGame && gameId) {
      try {
        const updatedGame = await liveGameApi.makeMove(gameId, from, to); // ❌ Knows API method
        updateFromApi(updatedGame);
      } catch (error) {
        console.error('Failed to make move:', error);
      }
    } else {
      makeMove(from, to);
    }
  }, [promotionActions, makeMove, gameState.fen, gameState.sideToMove, isBotGame, gameId, liveGameApi, updateFromApi]);
  
  // ❌ Direct API call for promotion
  const handlePawnPromotion = useCallback(async (piece: PieceType) => {
    if (!promotionState.move) return;
    const { from, to } = promotionState.move;
    
    if (isBotGame && gameId) {
      try {
        const updatedGame = await liveGameApi.makeMove(gameId, from, to, piece); // ❌ Knows API details
        updateFromApi(updatedGame);
        promotionActions.hidePromotion();
      } catch (error) {
        console.error('Failed to make promotion move:', error);
      }
    } else {
      makeMove(from, to, piece);
      promotionActions.hidePromotion();
    }
  }, [promotionState.move, makeMove, promotionActions, isBotGame, gameId, liveGameApi, updateFromApi]);
  
  // ... rest of component
}
```

**Problems**:
1. Screen directly calls `liveGameApi.getGame()` and `liveGameApi.makeMove()`
2. Screen contains business logic (bot game detection)
3. Screen knows HTTP endpoint details
4. Hard to test (requires mocking API clients)

---

## After: Refactored Implementation

### Step 1: Repository Interface

**File**: `app/features/game/repositories/IGameRepository.ts`

```typescript
import type { GameState } from '../types/GameState';

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
  resign(gameId: string): Promise<GameState>;
}
```

**Why**: Provides abstraction for testing and future changes.

---

### Step 2: Repository Implementation

**File**: `app/features/game/repositories/GameRepository.ts`

```typescript
import { ILiveGameApiClient } from '@/services/api';
import type { IGameRepository, MakeMoveParams } from './IGameRepository';
import type { GameState } from '../types/GameState';

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
  
  async createGame(params: CreateGameParams): Promise<GameState> {
    const response = await this.apiClient.createGame(params);
    return this.mapApiResponseToGameState(response);
  }
  
  async resign(gameId: string): Promise<GameState> {
    const response = await this.apiClient.resign(gameId);
    return this.mapApiResponseToGameState(response);
  }
  
  /**
   * Maps API response to domain model
   */
  private mapApiResponseToGameState(apiResponse: any): GameState {
    return {
      id: apiResponse.game_id || apiResponse.id,
      status: apiResponse.status === 'ended' ? 'ended' : 'in_progress',
      fen: apiResponse.fen,
      sideToMove: (apiResponse.side_to_move || apiResponse.sideToMove) === 'w' ? 'w' : 'b',
      moves: (apiResponse.moves || []).map((m: any) => ({
        moveNumber: m.move_number || m.moveNumber || 0,
        color: (m.color === 'w' || m.color === 'white' ? 'w' : 'b') as 'w' | 'b',
        san: m.san || '',
      })),
      result: apiResponse.result || null,
      endReason: apiResponse.end_reason || apiResponse.endReason || '',
      lastMove: apiResponse.last_move ? {
        from: apiResponse.last_move.from_square || apiResponse.last_move.from,
        to: apiResponse.last_move.to_square || apiResponse.last_move.to,
      } : null,
      players: apiResponse.players || [],
      botId: apiResponse.bot_id || apiResponse.botId,
      botColor: apiResponse.bot_color || apiResponse.botColor,
      isBotGame: !!(apiResponse.bot_id || apiResponse.botId),
    };
  }
}
```

**Why**: 
- Wraps API client
- Handles data transformation (API model → Domain model)
- Can add caching, logging, error handling

---

### Step 3: Repository Hook

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

### Step 4: Use Case

**File**: `app/features/game/use-cases/MakeMove.ts`

```typescript
import type { IGameRepository } from '../repositories/IGameRepository';
import type { MakeMoveParams } from '../repositories/IGameRepository';
import type { GameState } from '../types/GameState';
import type { IChessEngine } from '../domain/IChessEngine';

export class InvalidMoveError extends Error {
  constructor(message: string = 'Invalid move') {
    super(message);
    this.name = 'InvalidMoveError';
  }
}

export class GameNotActiveError extends Error {
  constructor(message: string = 'Game is not active') {
    super(message);
    this.name = 'GameNotActiveError';
  }
}

export class MakeMoveUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private chessEngine: IChessEngine
  ) {}
  
  /**
   * Execute a move in a game
   * 
   * Business rules:
   * - Game must be in progress
   * - Move must be valid according to chess rules
   * - Move must be legal for current position
   */
  async execute(params: MakeMoveParams): Promise<GameState> {
    // 1. Fetch current game state
    const game = await this.gameRepository.getGame(params.gameId);
    
    // 2. Validate game is active (business rule)
    if (game.status !== 'in_progress') {
      throw new GameNotActiveError(`Game ${params.gameId} is not active (status: ${game.status})`);
    }
    
    // 3. Validate move is legal (business rule)
    const isValid = this.chessEngine.validateMove(game, {
      from: params.from,
      to: params.to,
      promotion: params.promotion,
    });
    
    if (!isValid) {
      throw new InvalidMoveError(`Invalid move: ${params.from} to ${params.to}`);
    }
    
    // 4. Execute move via repository
    const updatedGame = await this.gameRepository.makeMove(params);
    
    // 5. Check for game end conditions (business rule)
    if (this.chessEngine.isCheckmate(updatedGame)) {
      // Game ends - could trigger another use case or event
      const winner = updatedGame.sideToMove === 'w' ? '0-1' : '1-0';
      // Note: In a full implementation, this might call EndGameUseCase
    } else if (this.chessEngine.isStalemate(updatedGame)) {
      // Stalemate - game ends in draw
      // Note: In a full implementation, this might call EndGameUseCase
    }
    
    return updatedGame;
  }
}
```

**Why**: 
- Contains all business logic
- Testable without React
- Framework-agnostic
- Clear business rules

**Test**:

```typescript
// features/game/use-cases/__tests__/MakeMove.test.ts
import { MakeMoveUseCase, InvalidMoveError, GameNotActiveError } from '../MakeMove';

describe('MakeMoveUseCase', () => {
  let useCase: MakeMoveUseCase;
  let mockRepository: jest.Mocked<IGameRepository>;
  let mockEngine: jest.Mocked<IChessEngine>;
  
  beforeEach(() => {
    mockRepository = {
      getGame: jest.fn(),
      makeMove: jest.fn(),
      createGame: jest.fn(),
      resign: jest.fn(),
    };
    
    mockEngine = {
      validateMove: jest.fn(),
      isCheckmate: jest.fn(),
      isStalemate: jest.fn(),
    };
    
    useCase = new MakeMoveUseCase(mockRepository, mockEngine);
  });
  
  it('should throw error if game is not active', async () => {
    mockRepository.getGame.mockResolvedValue({
      id: '1',
      status: 'ended',
      // ... other fields
    } as GameState);
    
    await expect(
      useCase.execute({ gameId: '1', from: 'e2', to: 'e4' })
    ).rejects.toThrow(GameNotActiveError);
    
    expect(mockRepository.makeMove).not.toHaveBeenCalled();
  });
  
  it('should throw error if move is invalid', async () => {
    mockRepository.getGame.mockResolvedValue({
      id: '1',
      status: 'in_progress',
      // ... other fields
    } as GameState);
    
    mockEngine.validateMove.mockReturnValue(false);
    
    await expect(
      useCase.execute({ gameId: '1', from: 'e2', to: 'e9' }) // Invalid square
    ).rejects.toThrow(InvalidMoveError);
    
    expect(mockRepository.makeMove).not.toHaveBeenCalled();
  });
  
  it('should execute valid move', async () => {
    const game: GameState = {
      id: '1',
      status: 'in_progress',
      // ... other fields
    } as GameState;
    
    const updatedGame: GameState = {
      ...game,
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    };
    
    mockRepository.getGame.mockResolvedValue(game);
    mockEngine.validateMove.mockReturnValue(true);
    mockRepository.makeMove.mockResolvedValue(updatedGame);
    mockEngine.isCheckmate.mockReturnValue(false);
    mockEngine.isStalemate.mockReturnValue(false);
    
    const result = await useCase.execute({ gameId: '1', from: 'e2', to: 'e4' });
    
    expect(mockRepository.makeMove).toHaveBeenCalledWith({
      gameId: '1',
      from: 'e2',
      to: 'e4',
    });
    expect(result).toEqual(updatedGame);
  });
});
```

---

### Step 5: Use Case Hook

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

### Step 6: React Hook (Adapter)

**File**: `app/features/game/hooks/useMakeMove.ts`

```typescript
import { useState, useCallback } from 'react';
import { useMakeMoveUseCase } from './useMakeMoveUseCase';
import type { MakeMoveParams } from '../repositories/IGameRepository';
import type { GameState } from '../types/GameState';

export interface UseMakeMoveResult {
  makeMove: (params: MakeMoveParams) => Promise<GameState>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for making moves in a game
 * 
 * This is a thin React adapter that binds UI lifecycle to the MakeMove use case.
 * All business logic is in MakeMoveUseCase.
 */
export function useMakeMove(): UseMakeMoveResult {
  const makeMoveUseCase = useMakeMoveUseCase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const makeMove = useCallback(async (params: MakeMoveParams): Promise<GameState> => {
    setLoading(true);
    setError(null);
    try {
      const result = await makeMoveUseCase.execute(params);
      return result;
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

**Why**: 
- Thin React adapter
- Only handles UI state (loading, error)
- Delegates business logic to use case

**Test**:

```typescript
// features/game/hooks/__tests__/useMakeMove.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMakeMove } from '../useMakeMove';
import { MakeMoveUseCase } from '../../use-cases/MakeMove';

jest.mock('../useMakeMoveUseCase');
jest.mock('../useGameRepository');
jest.mock('../useChessEngine');

describe('useMakeMove', () => {
  it('should set loading state during execution', async () => {
    const mockUseCase = {
      execute: jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({} as GameState), 100))
      ),
    };
    
    (useMakeMoveUseCase as jest.Mock).mockReturnValue(mockUseCase);
    
    const { result } = renderHook(() => useMakeMove());
    
    act(() => {
      result.current.makeMove({ gameId: '1', from: 'e2', to: 'e4' });
    });
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
  
  it('should set error on failure', async () => {
    const mockError = new Error('Invalid move');
    const mockUseCase = {
      execute: jest.fn().mockRejectedValue(mockError),
    };
    
    (useMakeMoveUseCase as jest.Mock).mockReturnValue(mockUseCase);
    
    const { result } = renderHook(() => useMakeMove());
    
    await act(async () => {
      try {
        await result.current.makeMove({ gameId: '1', from: 'e2', to: 'e4' });
      } catch (err) {
        // Expected to throw
      }
    });
    
    expect(result.current.error).toEqual(mockError);
    expect(result.current.loading).toBe(false);
  });
});
```

---

### Step 7: Refactored Screen

**File**: `app/features/board/screens/PlayScreen.tsx`

```typescript
// ✅ Screen only orchestrates user intent
import { useMakeMove } from '@/features/game/hooks/useMakeMove';
import { useGetGame } from '@/features/game/hooks/useGetGame';

export function PlayScreen({ gameId, initialGame }: PlayScreenProps) {
  const { makeMove, loading: moveLoading, error: moveError } = useMakeMove();
  const { game, loading: gameLoading, error: gameError } = useGetGame(gameId);
  const [gameState, gameActions] = useGameState(initialGame ?? undefined);
  const { updateFromApi } = gameActions;
  
  // Update local state when game changes
  useEffect(() => {
    if (game) {
      updateFromApi(game);
    }
  }, [game, updateFromApi]);
  
  // ✅ No API client knowledge
  // ✅ No business logic
  const handleMove = useCallback(async (from: string, to: string) => {
    const needsPromotion = promotionActions.checkPromotion(
      from,
      to,
      gameState.fen,
      gameState.sideToMove
    );
    
    if (needsPromotion) {
      promotionActions.showPromotion(from, to);
      return;
    }
    
    try {
      // ✅ Use case handles all business logic
      const updatedGame = await makeMove({ gameId: gameId!, from, to });
      updateFromApi(updatedGame);
    } catch (error) {
      // Error handling (could show toast, etc.)
      console.error('Failed to make move:', error);
    }
  }, [promotionActions, makeMove, gameState.fen, gameState.sideToMove, gameId, updateFromApi]);
  
  const handlePawnPromotion = useCallback(async (piece: PieceType) => {
    if (!promotionState.move) return;
    const { from, to } = promotionState.move;
    
    try {
      // ✅ Use case handles all business logic
      const updatedGame = await makeMove({ gameId: gameId!, from, to, promotion: piece });
      updateFromApi(updatedGame);
      promotionActions.hidePromotion();
    } catch (error) {
      console.error('Failed to make promotion move:', error);
    }
  }, [promotionState.move, makeMove, gameId, updateFromApi, promotionActions]);
  
  // ... rest of component (UI only)
  
  return (
    <SafeAreaView>
      <ChessBoard onMove={handleMove} />
      {moveLoading && <Spinner />}
      {moveError && <ErrorDisplay error={moveError} />}
    </SafeAreaView>
  );
}
```

**Why**: 
- Screen is now pure UI orchestration
- No infrastructure knowledge
- No business logic
- Easy to test (mock hooks)

---

## Comparison

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Screen Complexity** | 256 lines, mixed concerns | ~100 lines, UI only |
| **Business Logic Location** | Scattered in screen/hooks | Centralized in use case |
| **Testability** | Requires React + API mocks | Unit test use case, integration test hook |
| **Infrastructure Knowledge** | Screen knows API endpoints | Screen knows nothing |
| **Reusability** | Tied to React | Use case reusable anywhere |

### Code Metrics

**Before**:
- Screen: 256 lines
- Direct API calls: 3
- Business logic in screen: Yes
- Testable without React: No

**After**:
- Screen: ~100 lines
- Direct API calls: 0
- Business logic in screen: No
- Testable without React: Yes (use case)

---

## Benefits

1. **Testability**: Use case can be unit tested without React
2. **Maintainability**: Business logic centralized, easy to find
3. **Reusability**: Use case can be used in CLI tools, tests, etc.
4. **Separation of Concerns**: Clear boundaries between layers
5. **Dependency Inversion**: Screen depends on abstractions, not concrete implementations

---

## Related Documentation

- [DDD Patterns Guide](./ddd-patterns.md) - Architecture patterns
- [Migration Guide](../how-to/migrate-to-use-cases.md) - Step-by-step instructions
- [DDD & SOLID Audit](./ddd-solid-audit.md) - Current violations

---

*Last updated: 2025-12-03*
