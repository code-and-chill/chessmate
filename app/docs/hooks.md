---
title: Hooks Layer Documentation
service: chess-app
status: active
last_reviewed: 2025-11-15
type: architecture
---

# Hooks Layer Documentation

## Overview

The hooks layer (`/src/hooks/`) provides custom React hooks that manage state, handle API communication, and provide business logic for the chess app. These hooks follow the hooks pattern for reusable stateful logic and are organized by functional domain.

## Architecture

### Hooks Domains

```
src/hooks/
├── useAuth.ts                    # Authentication state
├── useGame.ts                    # Live game state polling
├── useGameInteractivity.ts       # Game interactivity rules
├── useGameParticipant.ts         # Participant validation
├── useNowPlaying.ts              # Active games discovery
├── usePuzzleHistory.ts           # Puzzle attempt history
├── useRecentGames.ts             # Recent games history
└── index.ts                      # Centralized exports
```

### Principles

1. **Single Responsibility**: Each hook manages one specific concern
2. **Composability**: Hooks work together without tight coupling
3. **Separation of Concerns**: Business logic separated from UI rendering
4. **Type Safety**: Full TypeScript support with exported interfaces
5. **Error Handling**: Consistent error management across all hooks

## Authentication Hooks

### `useAuth()`

Provides authentication context and user identity information.

**Signature:**
```typescript
export const useAuth = (): AuthContext
```

**Returns:**
```typescript
interface AuthContext {
  isAuthenticated: boolean;      // Whether user is logged in
  token: string | null;           // JWT authentication token
  currentAccountId: string | null; // Current user's account ID
}
```

**Usage:**
```typescript
const { token, currentAccountId, isAuthenticated } = useAuth();
```

**Notes:**
- Currently returns mock data for development
- Will be replaced with context provider when AuthProvider is implemented
- Must be updated when moving to production authentication

## Game Management Hooks

### `useGame(gameId, token, baseUrl?, pollInterval?)`

Manages live game state with polling and action methods.

**Signature:**
```typescript
export const useGame = (
  gameId: string,
  token: string,
  baseUrl?: string,    // default: 'http://localhost:8001'
  pollInterval?: number // default: 1000ms
): UseGameReturn
```

**Returns:**
```typescript
interface UseGameReturn {
  game: GameState | null;                              // Current game state
  loading: boolean;                                    // Loading indicator
  error: Error | null;                                 // Error object if any
  makeMove(from: string, to: string, promotion?: string): Promise<void>; // Submit move
  resign(): Promise<void>;                             // Resign from game
  refresh(): Promise<void>;                            // Manual refresh
}
```

**Usage:**
```typescript
const { game, loading, error, makeMove, resign } = useGame(
  gameId,
  token,
  'http://localhost:8001',
  1000 // Poll every 1 second
);

// Make a move
await makeMove('e2', 'e4');

// Resign from game
await resign();

// Manually refresh game state
await refresh();
```

**Features:**
- Automatic polling at configurable intervals
- Error state management
- Immediate action feedback
- Cleanup on unmount

### `useGameInteractivity(game, myColor)`

Determines whether the current player can interact with the board.

**Signature:**
```typescript
export const useGameInteractivity = (
  game: GameState | null,
  myColor: Color | null
): GameInteractivity
```

**Returns:**
```typescript
interface GameInteractivity {
  isInteractive: boolean; // Whether board is interactive
  canMove: boolean;       // Whether player can move
  reason: InteractivityReason; // Why board is/isn't interactive
}

type InteractivityReason = 
  | 'not_your_turn'   // Not player's turn
  | 'game_ended'      // Game has ended
  | 'awaiting_opponent' // Waiting for opponent
  | 'not_participant' // User not in game
  | 'ready'           // Ready to move
  | null;
```

**Usage:**
```typescript
const interactivity = useGameInteractivity(game, myColor);

if (interactivity.canMove) {
  // Show interactive board
} else {
  // Show disabled board or reason
  console.log(`Cannot move: ${interactivity.reason}`);
}
```

**Logic:**
- Returns `not_participant` if no game or color
- Returns `game_ended` if game status is not "ongoing"
- Returns `not_your_turn` if current player doesn't match turn
- Returns `ready` if all checks pass

### `useGameParticipant(game, currentAccountId)`

Validates user participation in game and determines assigned color.

**Signature:**
```typescript
export const useGameParticipant = (
  game: GameState | null,
  currentAccountId: string | null
): GameParticipant | null
```

**Returns:**
```typescript
interface GameParticipant {
  myColor: Color;         // User's assigned color ('white' | 'black')
  opponentColor: Color;   // Opponent's color
  isParticipant: boolean; // Always true if not null
}

type Color = 'white' | 'black';
```

**Usage:**
```typescript
const participant = useGameParticipant(game, currentAccountId);

if (participant) {
  console.log(`You are playing as ${participant.myColor}`);
  console.log(`Your opponent is ${participant.opponentColor}`);
} else {
  console.log('You are not a participant in this game');
}
```

**Notes:**
- Returns `null` if user is not a participant
- Used by PlayScreen for validation
- Essential for permission checking

## Game Discovery Hooks

### `useNowPlaying(token, baseUrl?, pollInterval?)`

Fetches user's currently active games.

**Signature:**
```typescript
export const useNowPlaying = (
  token: string,
  baseUrl?: string,    // default: 'http://localhost:8002'
  pollInterval?: number // default: 5000ms
): UseNowPlayingReturn
```

**Returns:**
```typescript
interface UseNowPlayingReturn {
  games: Game[];          // Array of active games
  loading: boolean;       // Loading indicator
  error: Error | null;    // Error object if any
  refresh(): Promise<void>; // Manual refresh
}
```

**Usage:**
```typescript
const { games, loading, error, refresh } = useNowPlaying(token);

if (loading) return <Text>Loading active games...</Text>;
if (error) return <Text>Error: {error.message}</Text>;

return (
  <View>
    {games.map(game => (
      <GameCard key={game.id} game={game} />
    ))}
  </View>
);
```

**Features:**
- Longer polling interval (5s) than live game
- Suitable for lobby/game list views
- Error recovery

### `useRecentGames(token, baseUrl?, pollInterval?)`

Fetches user's recently completed games.

**Signature:**
```typescript
export const useRecentGames = (
  token: string,
  baseUrl?: string,    // default: 'http://localhost:8002'
  pollInterval?: number // default: 15000ms
): UseRecentGamesReturn
```

**Returns:**
```typescript
interface UseRecentGamesReturn {
  games: Game[];          // Array of recent games
  loading: boolean;       // Loading indicator
  error: Error | null;    // Error object if any
  refresh(): Promise<void>; // Manual refresh
}
```

**Usage:**
```typescript
const { games } = useRecentGames(token);

// Display last 5 games
games.slice(0, 5).map(game => (
  <RecentGameRow key={game.id} game={game} />
))
```

**Features:**
- Lowest polling frequency (15s) - infrequent updates
- Used for game history/stats screens
- Minimal network impact

## Puzzle Hooks

### `usePuzzleHistory(baseUrl?, pollInterval?)`

Fetches user's puzzle attempt history.

**Signature:**
```typescript
export const usePuzzleHistory = (
  baseUrl?: string,    // default: 'http://localhost:8000'
  pollInterval?: number // default: 10000ms
): UsePuzzleHistoryReturn
```

**Returns:**
```typescript
interface UsePuzzleHistoryReturn {
  attempts: PuzzleAttempt[];      // User's puzzle attempts
  loading: boolean;               // Loading indicator
  error: Error | null;            // Error object if any
  refresh(): Promise<void>;       // Manual refresh
}

interface PuzzleAttempt {
  puzzleId: string;     // ID of the puzzle
  attempted: boolean;   // Whether user attempted it
  solved: boolean;      // Whether user solved it
  attempts: number;     // Number of attempts
  timestamp: Date;      // When attempted
}
```

**Usage:**
```typescript
const { attempts, loading } = usePuzzleHistory();

// Show solve rate
const solveRate = (attempts.filter(a => a.solved).length / attempts.length) * 100;
console.log(`Puzzle solve rate: ${solveRate}%`);
```

**Features:**
- Tracks puzzle completion metrics
- Suitable for stats/progress screens
- Medium polling frequency (10s)

## Integration Patterns

### Pattern 1: Fetching Game Data

```typescript
function PlayScreen({ gameId }: { gameId: string }) {
  const { token, currentAccountId, isAuthenticated } = useAuth();
  const { game, loading, error, makeMove, resign } = useGame(gameId, token);
  const participant = useGameParticipant(game, currentAccountId);
  const interactivity = useGameInteractivity(game, participant?.myColor || null);

  if (!isAuthenticated) return <LoginScreen />;
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} />;
  if (!participant) return <NotParticipantScreen />;

  return (
    <GameView
      game={game}
      interactivity={interactivity}
      onMove={makeMove}
      onResign={resign}
    />
  );
}
```

### Pattern 2: Discovering Games

```typescript
function LobbyScreen() {
  const { token } = useAuth();
  const { games: active } = useNowPlaying(token);
  const { games: recent } = useRecentGames(token);

  return (
    <ScrollView>
      <Section title="Active Games">
        {active.map(g => <GameCard key={g.id} game={g} />)}
      </Section>
      <Section title="Recent Games">
        {recent.map(g => <GameCard key={g.id} game={g} />)}
      </Section>
    </ScrollView>
  );
}
```

### Pattern 3: Puzzle Learning

```typescript
function PuzzleDashboard() {
  const { attempts, loading } = usePuzzleHistory();
  const stats = {
    total: attempts.length,
    solved: attempts.filter(a => a.solved).length,
    solveRate: (attempts.filter(a => a.solved).length / attempts.length) * 100,
  };

  return (
    <View>
      <StatCard label="Puzzles Solved" value={stats.solved} />
      <StatCard label="Success Rate" value={`${stats.solveRate.toFixed(1)}%`} />
    </View>
  );
}
```

## Error Handling

All hooks implement consistent error handling:

```typescript
// Hook guarantees error state
const { error, loading } = useGame(gameId, token);

if (error) {
  console.error('Game loading failed:', error.message);
  // Render error UI
}
```

Common error scenarios:
- Network failures: Caught and wrapped in Error
- Invalid tokens: Handled by API client
- Game not found: API returns 404
- Unauthorized: API returns 401

## Performance Considerations

### Polling Intervals

Different hooks use different polling frequencies based on data freshness needs:

- **useGame**: 1s (real-time gameplay)
- **useNowPlaying**: 5s (active game list)
- **usePuzzleHistory**: 10s (historical data)
- **useRecentGames**: 15s (infrequent updates)

### Memory Management

All hooks implement cleanup:

```typescript
useEffect(() => {
  // ... setup code ...
  return () => {
    clearInterval(interval);  // Cleanup interval
    // ... other cleanup ...
  };
}, [dependencies]);
```

### Client Caching

- API clients are memoized with `useRef` to prevent recreation
- Game state updates are applied locally for instant feedback
- Polling continues in background

## Testing Hooks

### Unit Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useGame } from '../useGame';

test('useGame fetches game on mount', async () => {
  const { result } = renderHook(() => useGame('game-123', 'token'));
  
  expect(result.current.loading).toBe(true);
  
  await act(async () => {
    // Wait for initial fetch
  });
  
  expect(result.current.game).not.toBeNull();
});
```

### Integration Testing

```typescript
test('PlayScreen uses hooks correctly', async () => {
  const { getByText } = render(<PlayScreen gameId="game-123" />);
  
  // Wait for game to load
  await waitFor(() => {
    expect(getByText(/Your move/)).toBeInTheDocument();
  });
});
```

## Migration Checklist

- [x] All 7 hooks implemented
- [x] Full TypeScript support
- [x] Error handling in place
- [x] Polling configured
- [x] Exports centralized
- [ ] AuthProvider implementation
- [ ] API client method stubs filled in
- [ ] Integration tests added
- [ ] Storybook stories created
- [ ] Performance monitoring added

## Future Enhancements

1. **React Query Integration**: Replace manual polling with React Query for better caching
2. **WebSocket Support**: Real-time updates for `useGame` via WebSocket
3. **Offline Support**: Persist game state locally
4. **Optimistic Updates**: Apply moves immediately before server confirmation
5. **Rate Limiting**: Backoff strategy for rapid actions
6. **Analytics**: Track hook performance and errors

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Layer](./API_LAYER.md)
- [Types Reference](./TYPES.md)
- [Folder Structure](./FOLDER_STRUCTURE.md)
