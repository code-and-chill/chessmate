# Features

Vertical feature slices - each feature is self-contained with its own components, hooks, state, and types.

## Structure

Each feature follows this structure:

# Features

Vertical feature slices organized by domain.

## Structure

Each feature follows this pattern:

```
features/{feature}/
  components/       # Feature-specific UI components
  hooks/           # Feature-specific React hooks
  state/           # Feature state management (Redux slices/Zustand stores)
  types/           # Feature-specific TypeScript types
  __tests__/       # Feature tests
  index.ts         # Public API (barrel file)
```

## Available Features

### ✅ Board (Migrated)
Chess board rendering and interaction.

**Status**: Fully migrated
**Location**: `features/board/`

**Exports:**
- `ChessBoard` - Basic chess board component
- `ChessBoardPro` - Enhanced board with animations
- Types: `BoardProps`, `Square`, `Piece`, `ChessBoardProps`, `ChessBoardProProps`, `Color`

**Import:**
```tsx
import { ChessBoard, ChessBoardPro, type BoardProps } from '@/features/board';
```

### ✅ Game (Migrated)
Live game management and display.

**Status**: Components migrated, hooks/state pending
**Location**: `features/game/`

**Exports:**
- `PlayerPanel` - Player information display with timer
- `MoveList` - Move history in algebraic notation
- `GameActions` - Game control buttons (resign, draw offer)
- Types: `GameState`, `Move`, `PlayerInfo`, `GameStatus`, `GameResult`, `Color`

**Import:**
```tsx
import { PlayerPanel, MoveList, GameActions, type GameState } from '@/features/game';
```

### 🚧 Puzzles (In Progress)
Puzzle solving interface.

**Status**: Folder structure created, components pending
**Location**: `features/puzzles/`

**Planned exports:**
- `PuzzleBoard` - Puzzle-specific board
- `PuzzleTimer` - Timer component
- `PuzzleHints` - Hint system
- `PuzzleResult` - Result display

### 🚧 Matchmaking (In Progress)
Game creation and matchmaking.

**Status**: Folder structure created, components pending
**Location**: `features/matchmaking/`

**Planned exports:**
- `QuickMatchButton` - Quick match finder
- `CustomGameForm` - Custom game settings
- `MatchmakingStatus` - Waiting for opponent display

### 📋 Learn (Planned)
Educational content and lessons.

**Status**: Not started
**Location**: `features/learn/`

### 📋 Social (Planned)
Friends, chat, and community features.

**Status**: Not started
**Location**: `features/social/`

## Migration Status

| Feature | Structure | Components | Hooks | State | Types | Tests | Public API |
|---------|-----------|------------|-------|-------|-------|-------|------------|
| board | ✅ | ✅ | 📋 | 📋 | ✅ | 📋 | ✅ |
| game | ✅ | ✅ | 📋 | 📋 | ✅ | 📋 | ✅ |
| puzzles | ✅ | 🚧 | 📋 | 📋 | 📋 | 📋 | 📋 |
| matchmaking | ✅ | 🚧 | 📋 | 📋 | 📋 | 📋 | 📋 |
| learn | 📋 | 📋 | 📋 | 📋 | 📋 | 📋 | 📋 |
| social | 📋 | 📋 | 📋 | 📋 | 📋 | 📋 | 📋 |

**Legend**: ✅ Complete | 🚧 In Progress | 📋 Not Started

## Guidelines

1. **No circular dependencies** between features
2. **Use public APIs** - import from `@/features/{feature}`, never internal paths
3. **Feature independence** - features should be self-contained
4. **Shared code** goes in `/core`, `/services`, or `/ui`
5. **Tests** alongside the code they test
6. **Old imports still work** - temporary re-exports in `/components/compound/index.ts`

## Adding a New Feature

See `/docs/ai-agent-quick-reference.md` for step-by-step guide.

## Backward Compatibility

During migration, old imports continue to work via re-exports:

```tsx
// ✅ NEW (preferred)
import { PlayerPanel } from '@/features/game';

// ⚠️ OLD (deprecated, still works)
import { PlayerPanel } from '@/components/compound';
```

Once migration is complete, old import paths will be removed.

## Features

### board
Chess board rendering and piece interaction.

**Exports:**
- `ChessBoard` - Main board component


### game
Live game orchestration and controls.

**Planned exports:**
- `GameScreen` - Full game UI
- `PlayerBar` - Player info + clock
- `MoveHistory` - Move list display
- `GameControls` - In-game actions

### puzzles
Tactical puzzle system.

**Planned exports:**
- `PuzzleScreen` - Puzzle UI
- `PuzzleHint` - Hint system
- `PuzzleSolution` - Solution display

### matchmaking
Opponent matching and queue management.

**Planned exports:**
- `MatchmakingScreen` - Queue UI
- `TimeControlSelector` - Time control picker

### learn
Educational content and lessons.

**Planned exports:**
- `LessonList` - Lesson catalog
- `LessonPlayer` - Interactive lesson

### social
Friends, clubs, and social features.

**Planned exports:**
- `FriendsList` - Friend management
- `ClubList` - Club browsing

## Guidelines

1. **Import from feature root**: `import { ChessBoard } from '@/features/board'`
2. **No cross-feature imports**: Features should not import from each other
3. **Use shared layers**: Import from `/ui`, `/services`, `/core` as needed
4. **Export public API**: Always export through `index.ts`
5. **Keep internal files private**: Prefix with `_` if not exported

## Adding a New Feature

1. Create folder structure: `mkdir -p features/{name}/{components,hooks,types,__tests__}`
2. Create `index.ts` with public exports
3. Add components and logic
4. Export only what's needed externally
5. Update this README
