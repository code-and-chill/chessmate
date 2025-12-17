---
title: DDD Patterns for React Applications
service: app
status: active
last_reviewed: 2025-12-03
type: architecture
---

# DDD Patterns for React Applications

## Overview

This guide explains how to apply Domain-Driven Design (DDD) principles in React applications. We adapt traditional DDD patterns (Application Layer, Domain Layer, Infrastructure Layer) to work with React's component and hook model.

## Target Architecture

```
┌─────────────────────────────────────────┐
│         Screen (UI Layer)              │
│  - Composes UI components             │
│  - Handles navigation                  │
│  - Orchestrates user intent           │
│  - ❌ Should NOT know HTTP details     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│      Hook (React Adapter)               │
│  - Binds UI lifecycle to use-case      │
│  - Manages loading/error/data state    │
│  - Handles refetch, optimistic updates │
│  - Thin wrapper around use case        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    Use Case (Application Layer)        │
│  - "What to do" business workflows     │
│  - Orchestrates domain logic           │
│  - Pure functions/classes (testable)   │
│  - Framework-agnostic                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Repository (Infrastructure Abstraction)│
│  - Abstracts data access               │
│  - Interface for testing               │
│  - Can add caching, logging            │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    Service (Infrastructure)            │
│  - API clients (REST/GraphQL)          │
│  - WebSocket connections               │
│  - Storage (AsyncStorage, etc.)         │
└─────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Screen Layer

**Location**: `app/features/{feature}/screens/` or `app/app/` (routes)

**Responsibilities**:
- ✅ Compose UI components
- ✅ Handle navigation
- ✅ Orchestrate user intent
- ✅ Pass data to components

**Should NOT**:
- ❌ Know HTTP endpoints
- ❌ Know API methods
- ❌ Contain business logic
- ❌ Directly call API clients

**Example**:

```typescript
// ✅ Good: Screen only orchestrates
export function PlayScreen({ gameId }: PlayScreenProps) {
  const { makeMove, loading, error } = useMakeMove();
  const { game, loading: gameLoading } = useGetGame(gameId);
  
  const handleMove = useCallback(async (from: string, to: string) => {
    await makeMove({ gameId, from, to });
  }, [gameId, makeMove]);
  
  if (gameLoading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <View>
      <ChessBoard game={game} onMove={handleMove} />
    </View>
  );
}
```

```typescript
// ❌ Bad: Screen knows infrastructure
export function PlayScreen({ gameId }: PlayScreenProps) {
  const { liveGameApi } = useApiClients();
  
  const handleMove = useCallback(async (from: string, to: string) => {
    await liveGameApi.makeMove(gameId, from, to); // ❌ Knows API method
  }, [gameId, liveGameApi]);
  
  // ...
}
```

---

### 2. Hook Layer (React Adapter)

**Location**: `app/features/{feature}/hooks/`

**Responsibilities**:
- ✅ Bind UI lifecycle to use case
- ✅ Manage React state (loading, error, data)
- ✅ Handle refetch, optimistic updates
- ✅ Provide React-friendly API

**Should NOT**:
- ❌ Contain business logic
- ❌ Directly instantiate API clients
- ❌ Know HTTP details
- ❌ Mix infrastructure concerns

**Pattern**: Hook + Use Case (can be combined)

**Example 1: Thin Hook with Separate Use Case**

```typescript
// features/game/hooks/useMakeMove.ts
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
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeMoveUseCase]);
  
  return { makeMove, loading, error };
}
```

**Example 2: Combined Hook + Use Case**

```typescript
// features/game/hooks/useMakeMove.ts
// Hook and use case combined for simplicity
export function useMakeMove() {
  const gameRepository = useGameRepository();
  const chessEngine = useChessEngine();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const makeMove = useCallback(async (params: MakeMoveParams) => {
    setLoading(true);
    setError(null);
    try {
      // Use case logic inline (for simple cases)
      const game = await gameRepository.getGame(params.gameId);
      const isValid = chessEngine.validateMove(game, params);
      if (!isValid) throw new InvalidMoveError();
      
      return await gameRepository.makeMove(params);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gameRepository, chessEngine]);
  
  return { makeMove, loading, error };
}
```

**When to Use Each Pattern**:

- **Separate Use Case**: Complex business logic, reusable across features, needs unit testing
- **Combined**: Simple workflows, feature-specific, acceptable to test via integration tests

---

### 3. Use Case Layer (Application Layer)

**Location**: `app/features/{feature}/use-cases/`

**Responsibilities**:
- ✅ "What to do" - business workflows
- ✅ Orchestrate domain logic
- ✅ Coordinate repositories
- ✅ Handle business rules

**Should NOT**:
- ❌ Know React/UI details
- ❌ Know HTTP implementation
- ❌ Contain infrastructure code
- ❌ Depend on React hooks

**Pattern**: Pure functions or classes

**Example 1: Class-Based Use Case**

```typescript
// features/game/use-cases/MakeMove.ts
export class MakeMoveUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private chessEngine: IChessEngine
  ) {}
  
  async execute(params: MakeMoveParams): Promise<GameState> {
    // 1. Fetch current game state
    const game = await this.gameRepository.getGame(params.gameId);
    
    // 2. Validate move (business rule)
    const isValid = this.chessEngine.validateMove(game, params);
    if (!isValid) {
      throw new InvalidMoveError('Invalid move');
    }
    
    // 3. Check game status (business rule)
    if (game.status !== 'in_progress') {
      throw new GameNotActiveError('Game is not active');
    }
    
    // 4. Execute move
    const updatedGame = await this.gameRepository.makeMove(params);
    
    // 5. Check for game end conditions (business rule)
    if (this.chessEngine.isCheckmate(updatedGame)) {
      await this.gameRepository.endGame(updatedGame.id, {
        result: this.chessEngine.getWinner(updatedGame),
        reason: 'Checkmate'
      });
    }
    
    return updatedGame;
  }
}
```

**Example 2: Function-Based Use Case**

```typescript
// features/game/use-cases/MakeMove.ts
export async function makeMove(
  params: MakeMoveParams,
  dependencies: {
    gameRepository: IGameRepository;
    chessEngine: IChessEngine;
  }
): Promise<GameState> {
  const { gameRepository, chessEngine } = dependencies;
  
  const game = await gameRepository.getGame(params.gameId);
  const isValid = chessEngine.validateMove(game, params);
  if (!isValid) throw new InvalidMoveError();
  
  return gameRepository.makeMove(params);
}
```

**Testing Use Cases**:

```typescript
// features/game/use-cases/__tests__/MakeMove.test.ts
describe('MakeMoveUseCase', () => {
  it('should validate move before executing', async () => {
    const mockRepository = createMockGameRepository();
    const mockEngine = createMockChessEngine();
    const useCase = new MakeMoveUseCase(mockRepository, mockEngine);
    
    mockEngine.validateMove.mockReturnValue(false);
    
    await expect(
      useCase.execute({ gameId: '123', from: 'e2', to: 'e4' })
    ).rejects.toThrow(InvalidMoveError);
  });
});
```

---

### 4. Repository Layer

**Location**: `app/features/{feature}/repositories/`

**Responsibilities**:
- ✅ Abstract data access
- ✅ Provide interface for testing
- ✅ Can add caching, logging, transformation
- ✅ Hide infrastructure details

**Should NOT**:
- ❌ Contain business logic
- ❌ Know React details
- ❌ Expose HTTP implementation

**Pattern**: Interface + Implementation

**Example**:

```typescript
// features/game/repositories/IGameRepository.ts
export interface IGameRepository {
  getGame(gameId: string): Promise<GameState>;
  makeMove(params: MakeMoveParams): Promise<GameState>;
  createGame(params: CreateGameParams): Promise<GameState>;
  endGame(gameId: string, result: GameResult): Promise<void>;
}

// features/game/repositories/GameRepository.ts
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
      // ...
    };
  }
}

// features/game/repositories/GameRepositoryCache.ts
// Example: Repository with caching
export class GameRepositoryCache implements IGameRepository {
  constructor(
    private repository: IGameRepository,
    private cache: ICache
  ) {}
  
  async getGame(gameId: string): Promise<GameState> {
    const cached = await this.cache.get(`game:${gameId}`);
    if (cached) return cached;
    
    const game = await this.repository.getGame(gameId);
    await this.cache.set(`game:${gameId}`, game, { ttl: 60 });
    return game;
  }
  
  // Delegate other methods
  async makeMove(params: MakeMoveParams) {
    return this.repository.makeMove(params);
  }
}
```

**Dependency Injection**:

```typescript
// features/game/hooks/useGameRepository.ts
export function useGameRepository(): IGameRepository {
  const { liveGameApi } = useApiClients();
  return useMemo(() => new GameRepository(liveGameApi), [liveGameApi]);
}
```

---

### 5. Service Layer (Infrastructure)

**Location**: `app/services/api/`

**Responsibilities**:
- ✅ HTTP client implementation
- ✅ WebSocket connections
- ✅ Storage (AsyncStorage, SecureStore)
- ✅ External service integrations

**Should NOT**:
- ❌ Contain business logic
- ❌ Know React details
- ❌ Know use case details

**Example**: Already well-implemented in `services/api/`

```typescript
// services/api/live-game.api.ts
export interface ILiveGameApiClient {
  getGame(gameId: string): Promise<GameState>;
  makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState>;
}

export class LiveGameApiClient implements ILiveGameApiClient {
  constructor(private baseUrl: string, private token: string) {}
  
  async getGame(gameId: string): Promise<GameState> {
    // HTTP implementation
  }
  
  async makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState> {
    // HTTP implementation
  }
}
```

---

## Complete Example: MakeMove Flow

### File Structure

```
features/game/
  hooks/
    useMakeMove.ts          # React adapter
  use-cases/
    MakeMove.ts             # Business logic
  repositories/
    IGameRepository.ts      # Interface
    GameRepository.ts       # Implementation
  types/
    game.types.ts
```

### Implementation

**1. Repository Interface**

```typescript
// features/game/repositories/IGameRepository.ts
export interface IGameRepository {
  getGame(gameId: string): Promise<GameState>;
  makeMove(params: MakeMoveParams): Promise<GameState>;
}

export interface MakeMoveParams {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
}
```

**2. Repository Implementation**

```typescript
// features/game/repositories/GameRepository.ts
import { ILiveGameApiClient } from '@/services/api';

export class GameRepository implements IGameRepository {
  constructor(private apiClient: ILiveGameApiClient) {}
  
  async getGame(gameId: string): Promise<GameState> {
    return this.apiClient.getGame(gameId);
  }
  
  async makeMove(params: MakeMoveParams): Promise<GameState> {
    return this.apiClient.makeMove(
      params.gameId,
      params.from,
      params.to,
      params.promotion
    );
  }
}
```

**3. Use Case**

```typescript
// features/game/use-cases/MakeMove.ts
import { IGameRepository } from '../repositories/IGameRepository';
import { IChessEngine } from '../domain/IChessEngine';

export class MakeMoveUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private chessEngine: IChessEngine
  ) {}
  
  async execute(params: MakeMoveParams): Promise<GameState> {
    // Business logic
    const game = await this.gameRepository.getGame(params.gameId);
    
    if (game.status !== 'in_progress') {
      throw new Error('Game is not active');
    }
    
    const isValid = this.chessEngine.validateMove(game, params);
    if (!isValid) {
      throw new Error('Invalid move');
    }
    
    return this.gameRepository.makeMove(params);
  }
}
```

**4. Hook (React Adapter)**

```typescript
// features/game/hooks/useMakeMove.ts
import { useState, useCallback } from 'react';
import { MakeMoveUseCase } from '../use-cases/MakeMove';
import { useGameRepository } from './useGameRepository';
import { useChessEngine } from './useChessEngine';

export function useMakeMove() {
  const gameRepository = useGameRepository();
  const chessEngine = useChessEngine();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const makeMove = useCallback(async (params: MakeMoveParams) => {
    setLoading(true);
    setError(null);
    try {
      const useCase = new MakeMoveUseCase(gameRepository, chessEngine);
      return await useCase.execute(params);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [gameRepository, chessEngine]);
  
  return { makeMove, loading, error };
}
```

**5. Screen**

```typescript
// features/board/screens/PlayScreen.tsx
export function PlayScreen({ gameId }: PlayScreenProps) {
  const { makeMove, loading, error } = useMakeMove();
  
  const handleMove = useCallback(async (from: string, to: string) => {
    await makeMove({ gameId, from, to });
  }, [gameId, makeMove]);
  
  return (
    <View>
      <ChessBoard onMove={handleMove} />
      {loading && <Spinner />}
      {error && <ErrorDisplay error={error} />}
    </View>
  );
}
```

---

## Dependency Flow

```
Screen
  ↓ (imports)
Hook
  ↓ (uses)
Use Case
  ↓ (depends on)
Repository Interface
  ↑ (implements)
Repository
  ↓ (uses)
Service (API Client)
```

**Key Principle**: Dependencies flow inward. Inner layers don't know about outer layers.

---

## Testing Strategy

### Use Cases (Unit Tests)

```typescript
// Pure unit tests, no React
describe('MakeMoveUseCase', () => {
  it('should validate move', async () => {
    const mockRepo = createMockRepository();
    const mockEngine = createMockEngine();
    const useCase = new MakeMoveUseCase(mockRepo, mockEngine);
    
    await useCase.execute({ gameId: '1', from: 'e2', to: 'e4' });
    
    expect(mockRepo.makeMove).toHaveBeenCalled();
  });
});
```

### Hooks (Integration Tests)

```typescript
// React Testing Library
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

### Screens (Component Tests)

```typescript
// React Testing Library
describe('PlayScreen', () => {
  it('should call makeMove on move', async () => {
    const mockMakeMove = jest.fn();
    jest.spyOn(hooks, 'useMakeMove').mockReturnValue({
      makeMove: mockMakeMove,
      loading: false,
      error: null
    });
    
    render(<PlayScreen gameId="1" />);
    fireEvent.press(screen.getByTestId('square-e2'));
    fireEvent.press(screen.getByTestId('square-e4'));
    
    expect(mockMakeMove).toHaveBeenCalledWith({
      gameId: '1',
      from: 'e2',
      to: 'e4'
    });
  });
});
```

---

## Common Patterns

### Pattern 1: Query Hook (Read)

```typescript
export function useGetGame(gameId: string) {
  const gameRepository = useGameRepository();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    gameRepository.getGame(gameId)
      .then(setGame)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [gameId, gameRepository]);
  
  return { game, loading, error };
}
```

### Pattern 2: Mutation Hook (Write)

```typescript
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
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeMoveUseCase]);
  
  return { makeMove, loading, error };
}
```

### Pattern 3: Optimistic Updates

```typescript
export function useMakeMove() {
  const [game, setGame] = useState<GameState | null>(null);
  const makeMoveUseCase = useMakeMoveUseCase();
  
  const makeMove = useCallback(async (params: MakeMoveParams) => {
    // Optimistic update
    const optimisticGame = applyMoveOptimistically(game, params);
    setGame(optimisticGame);
    
    try {
      const updatedGame = await makeMoveUseCase.execute(params);
      setGame(updatedGame);
    } catch (err) {
      // Rollback on error
      setGame(game);
      throw err;
    }
  }, [game, makeMoveUseCase]);
  
  return { makeMove, game };
}
```

---

## Best Practices

1. **Keep Hooks Thin**: Hooks should only adapt React lifecycle to use cases
2. **Pure Use Cases**: Use cases should be testable without React
3. **Repository Abstraction**: Always use repository interfaces, not concrete implementations
4. **Dependency Injection**: Inject dependencies via hooks or context
5. **Single Responsibility**: Each layer has one clear responsibility
6. **Test in Isolation**: Test use cases without React, hooks with React Testing Library

---

## Related Documentation

- [DDD & SOLID Audit](./ddd-solid-audit.md) - Current violations and issues
- [Migration Guide](../how-to/migrate-to-use-cases.md) - Step-by-step refactoring
- [Folder Structure Convention](../folder-structure-convention.md) - File organization

---

*Last updated: 2025-12-03*
