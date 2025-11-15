# PlayScreen Configuration Quick Reference

## Import Configuration Types

```typescript
import {
  PlayScreenConfig,
  BoardConfig,
  ThemeConfig,
  defaultPlayScreenConfig,
  createPlayScreenConfig,
  createResponsiveBoardConfig,
} from '../config';
```

## Common Configurations

### Minimal (Uses All Defaults)
```tsx
<PlayScreen gameId="game-123" />
```

### Dark Theme
```tsx
<PlayScreen
  gameId="game-123"
  config={{ theme: { mode: 'dark' } }}
/>
```

### Blue Board Theme
```tsx
<PlayScreen
  gameId="game-123"
  config={{ theme: { boardTheme: 'blue' } }}
/>
```

### Large Board (480px)
```tsx
<PlayScreen
  gameId="game-123"
  config={{ board: { size: 480, squareSize: 60 } }}
/>
```

### Responsive Board
```tsx
import { Dimensions } from 'react-native';
import { createResponsiveBoardConfig } from '../config';

const screenWidth = Dimensions.get('window').width;
const boardConfig = createResponsiveBoardConfig(screenWidth);

<PlayScreen
  gameId="game-123"
  config={{ board: boardConfig }}
/>
```

### Staging API Server
```tsx
<PlayScreen
  gameId="game-123"
  config={{ apiBaseUrl: 'https://staging-api.example.com/live-games' }}
/>
```

### Faster Polling (2 seconds)
```tsx
<PlayScreen
  gameId="game-123"
  config={{ pollInterval: 2000 }}
/>
```

### Custom Move List Width
```tsx
<PlayScreen
  gameId="game-123"
  config={{ moveListWidth: 300 }}
/>
```

## Complete Configuration Example

```typescript
const customConfig: PlayScreenConfig = {
  // Board appearance
  board: {
    size: 400,
    squareSize: 50,
    borderRadius: 16,
    isInteractive: true,
    disabledOpacity: 0.6,
  },

  // Theme
  theme: {
    mode: 'dark',
    boardTheme: 'purple',
    customColors: {
      primary: '#FF00FF',
    },
  },

  // API Configuration
  apiBaseUrl: 'https://api.example.com/live-games',
  pollInterval: 1500,
  moveListWidth: 250,
};

<PlayScreen gameId="game-123" config={customConfig} />
```

## Configuration Factory Pattern

### Create and Reuse Configuration

```typescript
// Create a configuration factory for your app
const createAppPlayScreenConfig = (isDarkMode: boolean): Partial<PlayScreenConfig> => ({
  theme: {
    mode: isDarkMode ? 'dark' : 'light',
    boardTheme: isDarkMode ? 'purple' : 'green',
  },
});

// Use throughout your app
const userPrefersDark = useUserThemePreference();
const config = createAppPlayScreenConfig(userPrefersDark);

<PlayScreen gameId="game-123" config={config} />
```

## Customization by Device

```typescript
import { Platform, Dimensions } from 'react-native';
import { createResponsiveBoardConfig } from '../config';

const getDeviceConfig = (): Partial<PlayScreenConfig> => {
  const { width } = Dimensions.get('window');

  if (Platform.OS === 'web') {
    return {
      board: createResponsiveBoardConfig(width * 0.6),
      moveListWidth: 300,
    };
  }

  return {
    board: createResponsiveBoardConfig(width * 0.9),
    moveListWidth: 150,
  };
};

<PlayScreen gameId="game-123" config={getDeviceConfig()} />
```

## Using Custom Hooks

### Check Game Participant Status

```typescript
import { useGameParticipant } from '../../core/hooks/useGameParticipant';

const { game } = useGame(gameId, token, apiUrl);
const { currentAccountId } = useAuth();
const participant = useGameParticipant(game, currentAccountId);

if (!participant) {
  return <Text>Not a participant in this game</Text>;
}

console.log(participant.myColor); // 'w' or 'b'
console.log(participant.opponentColor); // opposite
```

### Check Board Interactivity

```typescript
import { useGameInteractivity } from '../../core/hooks/useGameInteractivity';

const { game } = useGame(gameId, token, apiUrl);
const { currentAccountId } = useAuth();
const participant = useGameParticipant(game, currentAccountId);
const interactivity = useGameInteractivity(game, participant?.myColor || null);

if (!interactivity.canMove) {
  console.log('Cannot move because:', interactivity.reason);
  // Possible reasons:
  // - 'not_your_turn'
  // - 'game_ended'
  // - 'not_participant'
  // - 'ready'
}
```

## Board Themes Available

```
'green'  - Classic green theme (default)
'blue'   - Blue board squares
'brown'  - Brown/wooden theme
'gray'   - Gray neutral theme
'purple' - Purple theme
```

## Theme Modes

```
'light'  - Light mode (default)
'dark'   - Dark mode
```

## TypeScript Type Safety

All configurations are fully typed:

```typescript
// ✅ Valid
const config: PlayScreenConfig = {
  board: { size: 320 },
  theme: { boardTheme: 'blue' },
  apiBaseUrl: 'http://localhost:8001',
  pollInterval: 1000,
  moveListWidth: 200,
};

// ❌ Invalid - Type error
const badConfig: PlayScreenConfig = {
  theme: { boardTheme: 'invalid' }, // Error: not in type union
};

// ✅ Partial config (merges with defaults)
const partialConfig: Partial<PlayScreenConfig> = {
  theme: { mode: 'dark' },
};
```

## Best Practices

1. **Create configuration factories** for common scenarios
2. **Use responsive board sizing** on mobile devices
3. **Compose configurations** rather than passing large objects
4. **Type-check configurations** with TypeScript
5. **Reuse configurations** across multiple screens
6. **Document custom board themes** in your app's design system

## Debugging Configuration

```typescript
// Log the final configuration used
const screenConfig: PlayScreenConfig = {
  ...defaultPlayScreenConfig,
  ...userConfig,
};

console.log('PlayScreen config:', screenConfig);

<PlayScreen gameId="game-123" config={userConfig} />
```

## Performance Tips

1. Memoize configuration objects in parent components
2. Use `useMemo` for responsive board calculations
3. Configurations have no runtime cost - they're pure data
4. Component sub-sections render independently

```typescript
import { useMemo } from 'react';

const MyComponent = ({ screenWidth }) => {
  // Memoize to prevent recalculation
  const boardConfig = useMemo(
    () => createResponsiveBoardConfig(screenWidth),
    [screenWidth]
  );

  return <PlayScreen gameId="game-123" config={{ board: boardConfig }} />;
};
```
