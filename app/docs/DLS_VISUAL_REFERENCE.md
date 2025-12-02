---
title: DLS Visual Component Reference
service: app
status: active
last_reviewed: 2025-12-02
type: reference
---

# ChessMate DLS — Visual Component Reference

Quick visual guide to all DLS components and their usage.

---

## 🎨 Design Tokens

### Spacing Scale
```
4px  → spacingTokens[1]  → xs (tight)
8px  → spacingTokens[2]  → sm (compact)
12px → spacingTokens[3]  → gap (standard list spacing)
16px → spacingTokens[4]  → gutter (screen padding)
24px → spacingTokens[5]  → section (between sections)
32px → spacingTokens[6]  → large (major separations)
```

### Typography Hierarchy
```
Display → 32px, 700 → Page titles
Title   → 24px, 600 → Section headers
Body    → 16px, 400 → Primary content
Caption → 13px, 400 → Metadata, hints
```

### Motion Timing
```
Fast     → 150ms → Button press
Normal   → 200ms → Card hover
Moderate → 250ms → Modal appear
```

---

## 🧱 Primitive Components

### Button
**5 variants × 3 sizes = 15 combinations**

```tsx
// Primary (main actions)
<Button variant="primary" size="lg">Start Game</Button>
<Button variant="primary" size="md">Save</Button>
<Button variant="primary" size="sm">OK</Button>

// Secondary (alternative actions)
<Button variant="secondary">Cancel</Button>

// Ghost (tertiary actions)
<Button variant="ghost">Skip</Button>

// Outline (emphasis without fill)
<Button variant="outline">Learn More</Button>

// Destructive (dangerous actions)
<Button variant="destructive">Delete</Button>

// With icons
<Button icon={<Icon />} iconPosition="left">With Icon</Button>
<Button icon={<Icon />} iconOnly /> // Icon only

// States
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
```

**Accessibility**: ✅ ARIA labels, keyboard support, focus states

---

### Card
**5 variants for different use cases**

```tsx
// Default (subtle)
<Card variant="default">Content</Card>

// Elevated (floating)
<Card variant="elevated">Lifted card</Card>

// Outlined (bordered)
<Card variant="outlined">With border</Card>

// Filled (solid background)
<Card variant="filled">Solid background</Card>

// Interactive (pressable)
<Card variant="interactive" onPress={handlePress}>
  Clickable card
</Card>
```

---

### Modal
**4 sizes × 3 placements**

```tsx
<Modal
  visible={showModal}
  onClose={handleClose}
  size="sm"          // sm | md | lg | fullscreen
  placement="center" // center | bottom | top
>
  <Content />
</Modal>
```

**Features**:
- Animated backdrop fade
- Spring content animation
- Focus trap
- Scrollable content

---

### List / ListItem
**Flexible list layouts**

```tsx
<List>
  <ListItem
    leading={<Avatar />}
    trailing={<Badge />}
    onPress={handlePress}
  >
    List item content
  </ListItem>
  
  <ListSection title="Section Title">
    <ListItem>Item 1</ListItem>
    <ListItem>Item 2</ListItem>
  </ListSection>
</List>
```

**States**: Default, hover, pressed, selected, disabled

---

## ♟️ Chess Components

### GameCard
**Chess game overview card**

```tsx
<GameCard
  gameId="game-123"
  players={{
    white: {
      id: '1',
      name: 'Player1',
      rating: 1725,
      avatar: 'https://...',
    },
    black: {
      id: '2',
      name: 'Player2',
      rating: 1680,
      avatar: 'https://...',
    },
  }}
  currentTurn="white"
  timeControl="10+5"
  status="active" // active | ended | paused
  result="white_wins" // optional
  onPress={() => openGame('game-123')}
/>
```

**Visual Elements**:
- Player avatars
- Player names + ratings
- Turn indicator
- Time control badge
- Status badge (Live/Won/Lost)
- Hover/press animations

---

### EvaluationBar
**Position evaluation visualization**

```tsx
// Centipawn evaluation
<EvaluationBar
  evaluation={0.5}  // -1 (black winning) to +1 (white winning)
  height={12}
/>

// Mate detection
<EvaluationBar
  evaluation={0}
  mate={5}  // Mate in 5 moves
  height={12}
/>
```

**Features**:
- Smooth animated transitions
- Centipawn display (+2.3)
- Mate detection (M5)
- White/black color coding

---

### MoveList
**PGN move notation with navigation**

```tsx
<MoveList
  moves={[
    {
      moveNumber: 1,
      white: { san: 'e4', from: 'e2', to: 'e4', timestamp: 595 },
      black: { san: 'e5', from: 'e7', to: 'e5', timestamp: 592 },
    },
    // ... more moves
  ]}
  currentMoveIndex={3}
  onMovePress={(index) => jumpToMove(index)}
  variant="detailed"  // compact | detailed | inline
  showTimestamps={true}
  showAnnotations={true}  // !!, !, !?, ?!, ?, ??
/>
```

**Visual Elements**:
- Move numbers (1., 2., 3.)
- White/black move pairs
- Current move highlight (blue background)
- Past moves (gray background)
- Annotations (!!, ?, etc.)
- Timestamps (9:45)
- Scrollable list

---

### GameClock
**Live countdown timer**

```tsx
<GameClock
  timeRemaining={600}  // seconds
  increment={5}        // seconds per move
  isActive={currentTurn === 'white'}
  isPaused={false}
  player="white"
  lowTimeThreshold={30}  // Warning at 30s
  onTimeUp={() => handleTimeout('white')}
  onTick={(time) => console.log('Time:', time)}
/>
```

**Visual States**:
- **Active**: Green background, pulse animation
- **Inactive**: Gray background, no animation
- **Low Time**: Orange background, rapid pulse
- **Expired**: Red background, time at 0:00
- **Paused**: Gray with "PAUSED" badge

**Features**:
- Animated pulse for active clock
- Low-time warning
- Increment badge (+5s)
- Tabular numbers for readability

---

### ResultDialog
**Game end modal with statistics**

```tsx
<ResultDialog
  visible={gameEnded}
  result="win"       // win | loss | draw
  reason="checkmate" // checkmate | resignation | timeout | stalemate | etc.
  winner="white"
  playerColor="white"
  opponentName="Opponent123"
  stats={{
    duration: 780,        // seconds
    totalMoves: 45,
    accuracy: {
      player: 92,
      opponent: 85,
    },
    ratingChange: {
      player: +12,
      opponent: -12,
    },
  }}
  onClose={handleClose}
  onRematch={handleRematch}
  onReview={handleReview}
  onNewGame={handleNewGame}
/>
```

**Visual Sections**:
1. **Header** — Result icon (👑/💔/🤝), title, subtitle
2. **Stats** — Duration, moves, accuracy, rating change
3. **Actions** — Review Game (primary), Rematch/New Game (secondary)

**Colors**:
- Win: Green theme
- Loss: Red theme
- Draw: Gray theme

---

## 🎭 Component States

### ComponentStateManager
**Unified state management for all screens**

```tsx
<ComponentStateManager
  state={currentState}  // 'empty' | 'loading' | 'ready' | 'error' | 'disabled'
  
  emptyState={{
    title: 'No games yet',
    description: 'Start your first game to see it here',
    icon: '♟️',
    action: {
      label: 'Start Game',
      onPress: handleStartGame,
    },
  }}
  
  loadingState={{
    message: 'Loading games...',
  }}
  
  errorState={{
    message: 'Failed to load games',
    retry: handleRetry,
  }}
>
  <GamesList games={games} />
</ComponentStateManager>
```

**States**:
1. **Empty** — No data, with CTA button
2. **Loading** — Spinner + message
3. **Ready** — Shows children (normal content)
4. **Error** — Error message + retry button
5. **Disabled** — Muted visual, no interaction

---

## 📱 Example Screens

### home-example.tsx
**Demonstrates**:
- ComponentStateManager (all 5 states)
- GameCard integration
- List with quick actions
- Stats grid
- Animated entrance (FadeInDown)

### live-game-example.tsx
**Demonstrates**:
- GameClock (both players)
- MoveList (detailed variant)
- EvaluationBar
- ResultDialog
- Player sections
- Pause/resume functionality

### online.tsx
**Demonstrates**:
- DLS migration pattern
- Token usage (spacing, typography)
- LoadingState component
- Button component

---

## 🎯 Usage Patterns

### Pattern 1: Feature Screen
```tsx
function FeatureScreen() {
  const [state, setState] = useState<ComponentState>('loading');
  const [data, setData] = useState<Data[]>([]);

  return (
    <ComponentStateManager
      state={state}
      emptyState={{ ... }}
      loadingState={{ ... }}
      errorState={{ ... }}
    >
      <List>
        {data.map(item => (
          <ListItem key={item.id}>{item.name}</ListItem>
        ))}
      </List>
    </ComponentStateManager>
  );
}
```

### Pattern 2: Modal Dialog
```tsx
function ConfirmDialog({ visible, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} onClose={onCancel} size="sm">
      <Text {...textVariants.title}>Confirm Action</Text>
      <Text {...textVariants.body}>Are you sure?</Text>
      
      <View style={styles.actions}>
        <Button variant="primary" onPress={onConfirm}>
          Confirm
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          Cancel
        </Button>
      </View>
    </Modal>
  );
}
```

### Pattern 3: Interactive Card
```tsx
function GameItem({ game, onPress }) {
  return (
    <Card variant="interactive" onPress={onPress}>
      <GameCard
        gameId={game.id}
        players={game.players}
        status={game.status}
      />
    </Card>
  );
}
```

---

## ♿ Accessibility Quick Reference

**Every interactive element MUST have**:
- ✅ `accessibilityRole` (button, link, etc.)
- ✅ `accessibilityLabel` (descriptive text)
- ✅ `accessibilityState` (disabled, selected, etc.)
- ✅ `accessibilityHint` (optional, for complex actions)

**Example**:
```tsx
<Button
  accessibilityRole="button"
  accessibilityLabel="Start new game"
  accessibilityHint="Opens game creation screen"
  accessibilityState={{ disabled: false }}
>
  New Game
</Button>
```

---

## 🚀 Quick Start

1. **Import components**:
```tsx
import { Button, Card, GameCard, MoveList } from '@/ui';
```

2. **Use tokens for spacing**:
```tsx
style={{ padding: spacingScale.gutter, gap: spacingScale.gap }}
```

3. **Use typography variants**:
```tsx
<Text {...textVariants.title}>Heading</Text>
<Text {...textVariants.body}>Content</Text>
```

4. **Add accessibility**:
```tsx
<Button accessibilityLabel="Descriptive label">Action</Button>
```

---

**All components are production-ready** ✅  
**WCAG 2.1 AA compliant** ♿  
**Fully animated** 🎬  
**Chess-optimized** ♟️
