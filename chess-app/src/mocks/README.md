---
title: Mock System Guide
service: chess-app
status: active
last_reviewed: 2025-01-15
type: how-to
---

# Mock System Guide

The mock system allows you to test chess-app **without requiring backend services** to be running. It provides realistic mock data for all API endpoints with configurable network delay simulation.

## Quick Start

### Enable Mocks in Your Component

```typescript
import { 
  enableMockMode, 
  createAllApiClients,
  toggleMockMode 
} from '@mocks';

// Enable mock mode for development
enableMockMode();

// Create API clients (will use mocks)
const { puzzleApi, liveGameApi, playApi } = createAllApiClients();

// Use like normal
const puzzle = await puzzleApi.getDailyPuzzle();
```

### Toggle Mocks at Runtime

```typescript
// Toggle between real and mock APIs
toggleMockMode(); // Returns true if now enabled

// Or explicitly set
import { disableMockMode } from '@mocks';
disableMockMode(); // Switch to real API
```

## Mock System Architecture

```
/src/mocks/
├── index.ts                    # Main exports
├── factory.ts                  # Client factory & configuration
├── mockData.ts                 # Data generators
├── MockPuzzleApiClient.ts      # Mock puzzle API
├── MockLiveGameApiClient.ts    # Mock live game API
└── MockPlayApiClient.ts        # Mock play API
```

## API Reference

### Configuration

#### `enableMockMode()`
Enable mock mode globally.
```typescript
import { enableMockMode } from '@mocks';
enableMockMode();
// All new clients will use mocks
```

#### `disableMockMode()`
Disable mock mode and use real API endpoints.
```typescript
import { disableMockMode } from '@mocks';
disableMockMode();
```

#### `toggleMockMode()`
Toggle between mock and real mode.
```typescript
import { toggleMockMode } from '@mocks';
const isNowEnabled = toggleMockMode();
```

#### `getMockConfig()`
Get current mock configuration.
```typescript
import { getMockConfig } from '@mocks';
const config = getMockConfig();
console.log(config.enabled, config.simulateDelay);
```

#### `setMockConfig(config)`
Update mock configuration.
```typescript
import { setMockConfig } from '@mocks';
setMockConfig({
  enabled: true,
  simulateDelay: 1000, // 1 second delay
  simulateErrors: true,
  errorRate: 0.2,
});
```

### Client Factories

#### `createPuzzleApiClient(baseUrl?, overrideMock?)`
Create Puzzle API client.
```typescript
import { createPuzzleApiClient } from '@mocks';

// Uses global mock config
const client = createPuzzleApiClient();

// Override global config
const mockClient = createPuzzleApiClient('http://localhost:8000', true);
const realClient = createPuzzleApiClient('http://api.example.com', false);
```

#### `createLiveGameApiClient(baseUrl?, token?, overrideMock?)`
Create Live Game API client.
```typescript
import { createLiveGameApiClient } from '@mocks';

const client = createLiveGameApiClient(
  'http://localhost:8000',
  'auth-token',
  true // force mock
);
```

#### `createPlayApiClient(baseUrl?, token?, overrideMock?)`
Create Play API client.
```typescript
import { createPlayApiClient } from '@mocks';

const client = createPlayApiClient(
  'http://localhost:8000',
  'auth-token'
);
```

#### `createAllApiClients(baseUrl?, token?, overrideMock?)`
Create all three API clients at once.
```typescript
import { createAllApiClients } from '@mocks';

const { puzzleApi, liveGameApi, playApi } = createAllApiClients(
  'http://localhost:8000',
  'auth-token'
);
```

### Data Generators

#### `generateMockPuzzle(id?)`
Generate a single puzzle.
```typescript
import { generateMockPuzzle } from '@mocks';

const puzzle = generateMockPuzzle('custom-id');
```

#### `generateMockDailyPuzzle()`
Generate today's puzzle.
```typescript
import { generateMockDailyPuzzle } from '@mocks';

const dailyPuzzle = generateMockDailyPuzzle();
```

#### `generateMockGame(id?)`
Generate a single game.
```typescript
import { generateMockGame } from '@mocks';

const game = generateMockGame('game-1');
```

#### `generateMockGameState()`
Generate game state for live games.
```typescript
import { generateMockGameState } from '@mocks';

const state = generateMockGameState();
```

#### `generateMockUserStats(userId?)`
Generate user puzzle statistics.
```typescript
import { generateMockUserStats } from '@mocks';

const stats = generateMockUserStats('user-123');
```

## Usage Examples

### Example 1: Test Puzzle Flow

```typescript
import { enableMockMode, createPuzzleApiClient } from '@mocks';

export const usePuzzleDemo = () => {
  const [puzzle, setPuzzle] = useState(null);

  useEffect(() => {
    enableMockMode();
    const api = createPuzzleApiClient();

    (async () => {
      const daily = await api.getDailyPuzzle();
      setPuzzle(daily);
    })();
  }, []);

  return puzzle;
};
```

### Example 2: Toggle Mocks in Settings

```typescript
import { toggleMockMode, getMockConfig } from '@mocks';

export const SettingsScreen = () => {
  const [config, setConfig] = useState(getMockConfig());

  const handleToggleMocks = () => {
    const enabled = toggleMockMode();
    setConfig(getMockConfig());
  };

  return (
    <View>
      <Text>Mock Mode: {config.enabled ? 'ON' : 'OFF'}</Text>
      <Button title="Toggle" onPress={handleToggleMocks} />
    </View>
  );
};
```

### Example 3: Development with Configurable Delay

```typescript
import { 
  setMockConfig, 
  enableMockMode, 
  createAllApiClients 
} from '@mocks';

// Simulate slow network
setMockConfig({
  enabled: true,
  simulateDelay: 2000, // 2 seconds
});

const { puzzleApi, liveGameApi, playApi } = createAllApiClients();

// All calls will have ~2 second delay
const puzzle = await puzzleApi.getPuzzle('puzzle-123');
```

### Example 4: Integration Testing

```typescript
import { createAllApiClients, setMockConfig } from '@mocks';

describe('Puzzle Screen', () => {
  beforeEach(() => {
    setMockConfig({ enabled: true, simulateDelay: 0 });
  });

  test('displays daily puzzle', async () => {
    const { puzzleApi } = createAllApiClients();
    const puzzle = await puzzleApi.getDailyPuzzle();
    
    expect(puzzle.id).toBeDefined();
    expect(puzzle.fen).toBeDefined();
  });
});
```

## Mock Data

### Puzzle Data
- **ID**: Auto-generated or custom
- **FEN**: Valid chess position
- **Solution Moves**: Realistic solution paths
- **Difficulty**: 'easy', 'medium', 'hard'
- **Rating**: 1200-2200 range
- **Themes**: Chess themes (opening, tactics, endgame, etc.)

### Game Data
- **Players**: player-1, player-2
- **Status**: 'ongoing' or 'completed'
- **Moves**: Empty list for new games
- **Winner**: Set on completion

### GameState Data
- **Board**: 8x8 array representation
- **Turn**: 'white' or 'black'
- **Status**: 'ongoing', 'checkmate', 'stalemate', 'draw'

### User Stats
- **Puzzles Solved**: ~945
- **Current Rating**: ~1950
- **Solve Rate**: ~75%
- **Streaks**: Best and current

## Network Simulation

### Simulate Slow Network

```typescript
import { setMockConfig } from '@mocks';

// Add 2-3 second delay
setMockConfig({
  simulateDelay: 2000,
});
```

### Simulate Realistic Jitter

```typescript
// The mock system automatically adds ±200ms jitter
// so 500ms becomes 300-700ms variation
setMockConfig({
  simulateDelay: 500,
});
```

## Best Practices

### 1. Development Setup

```typescript
// App.tsx
if (__DEV__) {
  import('@mocks').then(({ enableMockMode }) => {
    enableMockMode();
  });
}
```

### 2. Demo/Presentation Mode

```typescript
import { enableMockMode, setMockConfig } from '@mocks';

// Zero delay for smooth demos
setMockConfig({
  enabled: true,
  simulateDelay: 0,
});
```

### 3. Testing

```typescript
import { createAllApiClients, setMockConfig } from '@mocks';

beforeEach(() => {
  setMockConfig({
    enabled: true,
    simulateDelay: 0, // No delay in tests
    simulateErrors: false,
  });
});
```

### 4. Progressive Testing

```typescript
// Test without mocks first
disableMockMode();

// Then test with mocks
enableMockMode();

// Then test with simulated delays
setMockConfig({ simulateDelay: 3000 });
```

## Common Scenarios

### Offline Development

```typescript
enableMockMode();
// App works without internet connection
```

### Rapid Prototyping

```typescript
setMockConfig({ enabled: true, simulateDelay: 0 });
// Instant responses for fast iteration
```

### Demo/Presentation

```typescript
setMockConfig({ enabled: true, simulateDelay: 200 });
// Realistic but responsive
```

### Testing Edge Cases

```typescript
// Test with various puzzle difficulties
const { puzzleApi } = createAllApiClients();
const puzzle1 = generateMockPuzzle('easy');
const puzzle2 = generateMockPuzzle('hard');
```

## Troubleshooting

### "Mock clients not responding"
Check that `enableMockMode()` was called before creating clients:
```typescript
enableMockMode(); // Call this first
const api = createPuzzleApiClient(); // Then create clients
```

### "Real API being called"
Verify mock mode is enabled:
```typescript
import { getMockConfig } from '@mocks';
console.log(getMockConfig().enabled); // Should be true
```

### "Unexpected delays"
Check `simulateDelay` config:
```typescript
import { getMockConfig } from '@mocks';
const delay = getMockConfig().simulateDelay;
console.log(`Current delay: ${delay}ms`);
```

## Migration to Real API

When ready to use real backends:

```typescript
import { disableMockMode } from '@mocks';

// In production
if (!__DEV__) {
  disableMockMode();
}

// Factory will now return real clients
const { puzzleApi } = createAllApiClients('https://api.example.com');
```

## File Structure Reference

```
src/mocks/
├── index.ts                    # Main exports (import from '@mocks')
├── factory.ts                  # 140 lines - Configuration & factories
├── mockData.ts                 # 110 lines - Data generators
├── MockPuzzleApiClient.ts      # 60 lines - Puzzle mocks
├── MockLiveGameApiClient.ts    # 85 lines - Live game mocks
└── MockPlayApiClient.ts        # 120 lines - Play API mocks
```

## Performance Notes

- Mock responses: **Instant (0ms) to configured delay**
- Network simulation: **Configurable delay + ±200ms jitter**
- Memory: **Minimal** - stores only active game state
- CPU: **Negligible** - simple data generation

---

**Last Updated**: 2025-01-15
**Status**: Active & Maintained
