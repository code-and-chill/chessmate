---
title: API Layer Implementation
service: chess-app
status: active
last_reviewed: 2025-11-17
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

## Future Enhancements

1. **Retry Logic**: Implement exponential backoff for transient failures
2. **Caching**: Add client-side caching for frequently accessed data
3. **Request Cancellation**: Support abort signals for in-flight requests
4. **Rate Limiting**: Client-side rate limiting with queuing
5. **WebSocket**: Real-time updates for game state (Phase 2)
6. **Analytics**: Track API latency and error rates
