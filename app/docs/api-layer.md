---
title: API Layer Implementation
service: chess-app
status: active
last_reviewed: 2025-12-03
type: architecture
---

# API Layer Implementation

## Overview

The API layer (`/src/api`) contains HTTP client classes that handle communication with backend services. All API clients are implemented with proper error handling, type safety, and reusable request methods.

## API Clients

### LiveGameApiClient

**File**: `src/api/liveGameClient.ts`

**Purpose**: Handles communication with live-game-api for real-time chess games.

**Key Methods**:
- `getGame(gameId: string)` - Fetch current game state
- `makeMove(gameId, from, to, promotion?)` - Submit a move
- `resign(gameId)` - Resign from a game

**Usage**:
```typescript
const client = new LiveGameApiClient('http://localhost:8001', token);
const game = await client.getGame(gameId);
const updated = await client.makeMove(gameId, 'e2', 'e4');
```

### PlayApiClient

**File**: `src/api/playApi.ts`

**Purpose**: Handles game creation, joining, and play operations.

**Key Methods**:
- `createGame(request)` - Create a new game challenge
- `joinGame(gameId, request)` - Join an existing game
- `getGameById(gameId)` - Fetch game details
- `getRecentGames(userId, limit)` - Get player's recent games
- `getActiveGamesForUser(userId)` - Get player's active games
- `makeMove(gameId, from, to, promotion?)` - Play a move
- `resign(gameId)` - Resign from a game

**Usage**:
```typescript
const client = new PlayApiClient('http://localhost:8001', token);
const game = await client.createGame({
  timeControl: { initialSeconds: 300, incrementSeconds: 0 },
  colorPreference: 'white',
  rated: true
});
```

### PuzzleApiClient

**File**: `src/api/puzzleApi.ts`

**Purpose**: Handles puzzle fetching and attempt submission.

**Key Methods**:
- `getDailyPuzzle(date?)` - Fetch today's (or specific date's) daily puzzle
- `getPuzzle(puzzleId)` - Fetch a puzzle by ID
- `submitAttempt(puzzleId, attempt)` - Submit puzzle attempt
- `getUserStats(userId)` - Get user puzzle statistics
- `getUserHistory(userId, limit, offset)` - Get user puzzle attempt history

**Usage**:
```typescript
const client = new PuzzleApiClient('http://localhost:8000');
const puzzle = await client.getDailyPuzzle();
const result = await client.submitAttempt(puzzleId, {
  isDaily: true,
  movesPlayed: ['e2e4'],
  status: 'SUCCESS',
  timeSpentMs: 5000,
  hintsUsed: 0
});
```

### EngineApiClient

**File**: `app/services/api/engine.api.ts`

**Purpose**: Handles communication with engine-cluster-api for chess position evaluation and analysis.

**Key Methods**:
- `evaluatePosition(request)` - Evaluate a chess position and return candidate moves with evaluations
- `healthCheck()` - Check engine service health

**Usage**:
```typescript
import { EngineApiClient } from '@/services/api';

const client = new EngineApiClient('http://localhost:9000');
const analysis = await client.evaluatePosition({
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  side_to_move: 'w',
  max_depth: 12,
  time_limit_ms: 1000,
  multi_pv: 3
});

// Returns:
// {
//   candidates: [
//     { move: 'e2e4', eval: 0.25, depth: 12, pv: ['e2e4', 'c7c5'] },
//     { move: 'd2d4', eval: 0.20, depth: 12, pv: ['d2d4', 'd7d5'] }
//   ],
//   fen: '...',
//   time_ms: 450
// }
```

**Mock Client**: `MockEngineApiClient` is available for development/testing when engine-cluster-api is unavailable.

## Common Patterns

### Authentication

All clients that require authentication accept a token in the constructor:

```typescript
const client = new LiveGameApiClient(baseUrl, token);
```

The token is automatically included in all requests via the `Authorization: Bearer <token>` header.

### Error Handling

All API methods throw descriptive errors on failure:

```typescript
try {
  await client.makeMove(gameId, from, to);
} catch (error) {
  console.error(`API error: ${error.message}`);
}
```

### Type Safety

All API clients use TypeScript generics for request/response types:

```typescript
private async request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> { ... }
```

## Integration with Hooks

API clients are typically used within custom hooks:

```typescript
// In useGame.ts
const client = new LiveGameApiClient(baseUrl, token);
const gameState = await client.getGame(gameId);
```

See `/src/hooks` for hook implementations that use these API clients.

## Base URLs

Default base URLs (can be overridden in constructor):

- **Live Game API**: `http://localhost:8001`
- **Play API**: `http://localhost:8001`
- **Puzzle API**: `http://localhost:8000`
- **Engine Cluster API**: `http://localhost:9000`

Engine Cluster API URL is configured via environment config (`api.engineClusterUrl`).

## Future Enhancements

1. **Retry Logic**: Implement exponential backoff for transient failures
2. **Caching**: Add client-side caching for frequently accessed data (✅ Implemented for engine analysis)
3. **Request Cancellation**: Support abort signals for in-flight requests (✅ Implemented for engine analysis)
4. **Rate Limiting**: Client-side rate limiting with queuing
5. **WebSocket**: Real-time updates for game state (Phase 2)
6. **Analytics**: Track API latency and error rates

## Related Documentation

- [Analysis Features](./analysis-features.md) - Chess analysis features using EngineApiClient
- [Engine-Cluster-API Audit](../audits/engine-cluster-api-audit-2025-12-03.md) - Usage audit and integration details
