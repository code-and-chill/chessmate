---
title: DLS Migration Guide
service: app
status: active
last_reviewed: 2025-12-02
type: how-to
---

# Migrating Existing Screens to Production DLS

This guide shows how to upgrade existing ChessMate screens to use the new production-grade Design Language System.

## Before & After

### ❌ Before (Old Pattern)

```tsx
// app/app/(tabs)/play/online.tsx - OLD VERSION

export default function OnlinePlayScreen() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <ActivityIndicator />;
  }
  
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Play Online
      </Text>
      <View style={{ gap: 12 }}>
        {games.map(game => (
          <View
            key={game.id}
            style={{
              padding: 16,
              backgroundColor: '#fff',
              borderRadius: 12,
            }}
          >
            <Text>{game.white.username} vs {game.black.username}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
```

### ✅ After (New DLS Pattern)

```tsx
// app/app/(tabs)/play/online.tsx - NEW VERSION

import {
  ComponentStateManager,
  GameCard,
  Text,
  spacingScale,
  textVariants,
} from '@/ui';

export default function OnlinePlayScreen() {
  const [games, setGames] = useState([]);
  const [state, setState] = useState<ComponentState>('loading');
  const { isDark } = useTheme();
  
  return (
    <View style={{ padding: spacingScale.gutter }}>
      <Text {...textVariants.display} style={{ marginBottom: spacingScale.lg }}>
        Play Online
      </Text>
      
      <ComponentStateManager
        state={state}
        emptyState={{
          title: 'No active games',
          description: 'Start a new game to begin playing',
          action: { label: 'New Game', onPress: startNewGame },
        }}
        loadingState={{ message: 'Loading games...' }}
        errorState={{
          message: 'Failed to load games',
          retry: fetchGames,
        }}
      >
        <View style={{ gap: spacingScale.md }}>
          {games.map(game => (
            <GameCard
              key={game.id}
              gameId={game.id}
              players={{
                white: game.white,
                black: game.black,
              }}
              currentTurn={game.currentTurn}
              timeControl={game.timeControl}
              status={game.status}
              userColor={game.userColor}
              lastMove={game.lastMove}
              moveCount={game.moveCount}
              onPress={() => openGame(game.id)}
              isDark={isDark}
            />
          ))}
        </View>
      </ComponentStateManager>
    </View>
  );
}
```

---

## Step-by-Step Migration

### Step 1: Import DLS Components

**Replace scattered imports:**

```tsx
// ❌ OLD
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// ✅ NEW
import {
  View,
  StyleSheet,
  // Keep native View for layout
} from 'react-native';

import {
  Text,
  Button,
  Card,
  GameCard,
  ComponentStateManager,
  EmptyState,
  LoadingState,
  spacingScale,
  spacingTokens,
  textVariants,
  colorTokens,
  getColor,
} from '@/ui';
```

### Step 2: Replace Hard-Coded Styles with Tokens

**Colors:**
```tsx
// ❌ OLD
backgroundColor: '#3B82F6'
color: '#6B7280'

// ✅ NEW
import { colorTokens, getColor } from '@/ui';
backgroundColor: getColor(colorTokens.blue[600], isDark)
color: getColor(colorTokens.neutral[600], isDark)
```

**Spacing:**
```tsx
// ❌ OLD
padding: 16
marginTop: 24
gap: 12

// ✅ NEW
import { spacingScale, spacingTokens } from '@/ui';
padding: spacingScale.lg  // 16px
marginTop: spacingScale.xl  // 24px
gap: spacingTokens[3]  // 12px
```

**Typography:**
```tsx
// ❌ OLD
<Text style={{ fontSize: 24, fontWeight: '700' }}>
  Title
</Text>

// ✅ NEW
import { Text, textVariants } from '@/ui';
<Text {...textVariants.title}>
  Title
</Text>
```

### Step 3: Add Component Lifecycle States

**Replace simple loading checks:**

```tsx
// ❌ OLD
if (loading) return <ActivityIndicator />;
if (error) return <Text>Error: {error.message}</Text>;
if (!games.length) return <Text>No games</Text>;

// ✅ NEW
<ComponentStateManager
  state={state}  // Compute from loading/error/data
  emptyState={{
    title: 'No games found',
    description: 'Start a new game to see it here',
    action: { label: 'New Game', onPress: startGame },
  }}
  loadingState={{ message: 'Loading games...' }}
  errorState={{
    message: 'Failed to load games',
    retry: retryFetch,
  }}
>
  <GamesList games={games} />
</ComponentStateManager>
```

**Compute state from data:**

```tsx
const getComponentState = (): ComponentState => {
  if (loading) return 'loading';
  if (error) return 'error';
  if (!games || games.length === 0) return 'empty';
  return 'ready';
};

const state = getComponentState();
```

### Step 4: Replace Custom Components with DLS Components

**Buttons:**
```tsx
// ❌ OLD
<Pressable
  onPress={onPress}
  style={{
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
  }}
>
  <Text style={{ color: '#fff' }}>Play</Text>
</Pressable>

// ✅ NEW
<Button
  variant="primary"
  size="md"
  onPress={onPress}
>
  Play
</Button>
```

**Cards:**
```tsx
// ❌ OLD
<View
  style={{
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  }}
>
  {children}
</View>

// ✅ NEW
<Card variant="elevated" size="md">
  {children}
</Card>
```

**Lists:**
```tsx
// ❌ OLD
<View>
  {items.map(item => (
    <Pressable key={item.id} onPress={() => select(item)}>
      <View style={{ padding: 16, flexDirection: 'row' }}>
        <Text>{item.title}</Text>
        <Text>{item.subtitle}</Text>
      </View>
    </Pressable>
  ))}
</View>

// ✅ NEW
<List divided spacing="md">
  {items.map(item => (
    <ListItem
      key={item.id}
      title={item.title}
      subtitle={item.subtitle}
      onPress={() => select(item)}
    />
  ))}
</List>
```

### Step 5: Use Chess-Specific Components

**Game Cards:**
```tsx
// ❌ OLD - Custom game card implementation
<View style={styles.gameCard}>
  <View style={styles.playerRow}>
    <Text>{game.white.username}</Text>
    <Text>{game.white.rating}</Text>
  </View>
  <Text>vs</Text>
  <View style={styles.playerRow}>
    <Text>{game.black.username}</Text>
    <Text>{game.black.rating}</Text>
  </View>
  {game.status === 'active' && <Badge>Live</Badge>}
</View>

// ✅ NEW - Use GameCard component
<GameCard
  gameId={game.id}
  players={{ white: game.white, black: game.black }}
  currentTurn={game.currentTurn}
  timeControl={game.timeControl}
  status={game.status}
  result={game.result}
  userColor={game.userColor}
  lastMove={game.lastMove}
  moveCount={game.moveCount}
  onPress={() => openGame(game.id)}
/>
```

### Step 6: Add Animations

**Button press:**
```tsx
// ❌ OLD - No animation
<Pressable onPress={onPress}>
  <Text>Click me</Text>
</Pressable>

// ✅ NEW - Animated by default
<Button
  variant="primary"
  animated  // Spring animation on press
  onPress={onPress}
>
  Click me
</Button>
```

**Card hover (web):**
```tsx
// ✅ NEW - Animated by default
<Card
  variant="elevated"
  animated  // Hover lift + scale
  pressable  // Press interaction
  onPress={onPress}
>
  {children}
</Card>
```

---

## Common Patterns

### Pattern 1: List Screen with States

```tsx
import {
  ComponentStateManager,
  List,
  ListItem,
  Text,
  spacingScale,
  textVariants,
} from '@/ui';

export default function PuzzleListScreen() {
  const { puzzles, loading, error, refetch } = usePuzzles();
  
  const state = loading ? 'loading' : error ? 'error' : puzzles.length === 0 ? 'empty' : 'ready';
  
  return (
    <View style={{ padding: spacingScale.gutter }}>
      <Text {...textVariants.display} style={{ marginBottom: spacingScale.lg }}>
        Puzzles
      </Text>
      
      <ComponentStateManager
        state={state}
        emptyState={{
          title: 'No puzzles available',
          description: 'Check back later for new puzzles',
        }}
        loadingState={{ message: 'Loading puzzles...' }}
        errorState={{
          message: 'Failed to load puzzles',
          retry: refetch,
        }}
      >
        <List divided spacing="md">
          {puzzles.map(puzzle => (
            <ListItem
              key={puzzle.id}
              title={puzzle.title}
              subtitle={`Rating: ${puzzle.rating}`}
              trailing={<ChevronRight />}
              onPress={() => openPuzzle(puzzle.id)}
            />
          ))}
        </List>
      </ComponentStateManager>
    </View>
  );
}
```

### Pattern 2: Form Screen

```tsx
import {
  Button,
  Input,
  Modal,
  Text,
  spacingScale,
  textVariants,
} from '@/ui';

export default function SettingsScreen() {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  
  return (
    <View style={{ padding: spacingScale.gutter }}>
      <Text {...textVariants.display} style={{ marginBottom: spacingScale.lg }}>
        Settings
      </Text>
      
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />
      
      <Button
        variant="primary"
        size="md"
        onPress={() => setShowModal(true)}
        style={{ marginTop: spacingScale.lg }}
      >
        Save Changes
      </Button>
      
      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Changes"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onPress={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onPress={saveSettings}>
              Confirm
            </Button>
          </>
        }
      >
        <Text>Are you sure you want to save these changes?</Text>
      </Modal>
    </View>
  );
}
```

### Pattern 3: Game Screen

```tsx
import {
  GameCard,
  EvaluationBar,
  ComponentStateManager,
  Button,
  spacingScale,
} from '@/ui';

export default function GameScreen({ gameId }) {
  const { game, loading, error } = useGame(gameId);
  
  const state = loading ? 'loading' : error ? 'error' : !game ? 'empty' : 'ready';
  
  return (
    <ComponentStateManager
      state={state}
      loadingState={{ message: 'Loading game...' }}
      errorState={{ message: 'Failed to load game', retry: refetch }}
    >
      <View style={{ flexDirection: 'row', gap: spacingScale.md }}>
        <EvaluationBar
          evaluation={game.evaluation}
          isMate={game.isMate}
          mateIn={game.mateIn}
          showScore
        />
        
        <View style={{ flex: 1 }}>
          <ChessBoard position={game.position} />
          
          <GameCard
            gameId={game.id}
            players={game.players}
            currentTurn={game.currentTurn}
            timeControl={game.timeControl}
            status={game.status}
            moveCount={game.moveCount}
          />
          
          <Button
            variant="primary"
            size="lg"
            disabled={!game.canMove}
            onPress={makeMove}
          >
            Confirm Move
          </Button>
        </View>
      </View>
    </ComponentStateManager>
  );
}
```

---

## Checklist for Each Screen

When migrating a screen, ensure:

- [ ] All hard-coded colors replaced with `colorTokens`
- [ ] All hard-coded spacing replaced with `spacingScale`/`spacingTokens`
- [ ] All text uses `textVariants` or `<Text>` component
- [ ] All buttons use `<Button>` component
- [ ] All cards use `<Card>` component
- [ ] Component lifecycle states handled with `ComponentStateManager`
- [ ] Chess-specific components replaced with DLS versions
- [ ] Animations enabled (`animated` prop)
- [ ] Dark mode support via `isDark` prop
- [ ] No raw error messages (use `ErrorState`)
- [ ] Empty states use `EmptyState` component

---

## Testing After Migration

1. **Visual Test**: Verify spacing, colors, typography match design
2. **State Test**: Test empty, loading, error, ready states
3. **Interaction Test**: Verify button press animations, card hovers
4. **Dark Mode Test**: Toggle dark mode and verify colors
5. **Accessibility Test**: Verify screen reader labels

---

## Getting Help

- **DLS Overview**: [`dls-implementation-guide.md`](./dls-implementation-guide.md)
- **Component Docs**: Check inline JSDoc comments in component files
- **Examples**: See migrated screens in `app/` directory
- **Tokens**: Review `ui/tokens/` directory for available values

---

**Migration Status**: ⏳ In Progress  
**Priority**: 🔥 High — Migrate core screens first (Play, Puzzle, Profile)
