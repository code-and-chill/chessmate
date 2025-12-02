---
title: Component Index
service: chess-app
status: active
last_reviewed: 2025-11-17
type: overview
---

# Chess App Component Index

Quick reference guide for all components in the new architecture.

## 📍 Location Structure

```
src/components/
├── primitives/           ← Base building blocks
├── compound/             ← Reusable complex components
├── play/                 ← Play feature components
├── puzzle/               ← Puzzle feature components
├── identity/             ← User/identity components
└── DailyPuzzleCard.tsx  ← Top-level card component
```

---

## 🧱 Primitives (Base Blocks)

Minimal, reusable building blocks with no business logic.

| Component | Purpose | Props | Status |
|-----------|---------|-------|--------|
| **Box** | Layout container | spacing, padding, bg | ✅ Complete |
| **Text** | Typography | size, weight, color | ✅ Complete |
| **Button** | Clickable button | onPress, variant | ✅ Complete |
| **Surface** | Card/elevated surface | elevation | ✅ Complete |

**Import**: `import { Box, Text, Button, Surface } from '../components/primitives'`

---

## 🔗 Compound (Complex Reusable)

Generic components combining primitives for larger units.

| Component | Purpose | Dependencies | Status |
|-----------|---------|--------------|--------|
| **ChessBoard** | Interactive chess board | None | ✅ Complete |
| **GameActions** | Action buttons for game | None | ✅ Complete |
| **MoveList** | List of game moves | None | ✅ Complete |
| **PlayerPanel** | Player info display | None | ✅ Complete |

**Import**: `import { ChessBoard, GameActions } from '../components/compound'`

---

## 🎮 Play Feature Components

Feature-specific components for play/game screens.

| Component | Purpose | Used By | Status |
|-----------|---------|---------|--------|
| **GameBoardSection** | Wraps ChessBoard with layout | PlayScreen, GameScreen | ✅ Complete |
| **RatingStrip** | Player rating display | PlayHubScreen | 🔄 [STUB] |
| **NowPlayingBanner** | Active game banner | PlayHubScreen | 🔄 [STUB] |
| **PlayNowPanel** | Quick play options | PlayHubScreen | 🔄 [STUB] |
| **GameHistoryList** | Past games list | PlayHubScreen, PostGameSummaryScreen | 🔄 [STUB] |

**Import**: `import { GameBoardSection } from '../components/play'`

---

## 🎯 Puzzle Feature Components

Feature-specific components for puzzle/tactics screens.

| Component | Purpose | Used By | Status |
|-----------|---------|---------|--------|
| **DailyPuzzleCard** | Daily puzzle card | DailyPuzzleScreen | ✅ Complete |
| **PuzzleBoardSection** | Puzzle board container | PuzzlePlayScreen, TacticsTrainingScreen | 🔄 [STUB] |
| **PuzzleFooterControls** | Puzzle action buttons | PuzzlePlayScreen | 🔄 [STUB] |
| **DailyPuzzleHero** | Daily puzzle hero section | DailyPuzzleScreen | 🔄 [STUB] |
| **TacticsStatsCard** | Tactics statistics | PuzzleStatsScreen | 🔄 [STUB] |
| **TacticsQuickTrainRow** | Quick training option | PuzzleHubScreen | 🔄 [STUB] |

**Import**: `import { DailyPuzzleCard } from '../components/puzzle'`

---

## 👤 Identity Components

User/identity-related components.

| Component | Purpose | Used By | Status |
|-----------|---------|---------|--------|
| **IdentityHeader** | User header/profile | PlayScreen, PuzzlePlayScreen | 🔄 [STUB] |

**Import**: `import { IdentityHeader } from '../components/identity'`

---

## 📋 Stub Components (Ready for Implementation)

These components are created with minimal implementations. They're ready to be replaced with full functionality:

```typescript
// Current stub structure:
export interface ComponentNameProps {
  // TODO: Define props
}

export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  return (
    <Surface>
      <Text>ComponentName - TODO: Implement</Text>
    </Surface>
  );
};
```

### Priority Implementation Order

1. **High Priority** (Used by multiple screens):
   - `GameHistoryList` - Game history display
   - `PuzzleBoardSection` - Puzzle rendering
   - `PuzzleFooterControls` - Puzzle controls

2. **Medium Priority** (Feature completeness):
   - `RatingStrip` - Rating display
   - `NowPlayingBanner` - Active game banner
   - `TacticsStatsCard` - Statistics display

3. **Low Priority** (Nice to have):
   - `PlayNowPanel` - Quick play options
   - `DailyPuzzleHero` - Hero section
   - `TacticsQuickTrainRow` - Training options
   - `IdentityHeader` - User header

---

## 📦 Index Files

All component categories export from index files for clean imports:

```typescript
// src/components/primitives/index.ts
export { Box } from './Box';
export { Text } from './Text';
export { Button } from './Button';
export { Surface } from './Surface';

// src/components/compound/index.ts
export { ChessBoard } from './ChessBoard';
export { GameActions } from './GameActions';
export { MoveList } from './MoveList';
export { PlayerPanel } from './PlayerPanel';

// src/components/play/index.ts
export { GameBoardSection } from './GameBoardSection';
export { RatingStrip } from './RatingStrip';
// ... etc
```

---

## 🔍 Import Examples

```typescript
// ✅ Correct - From category
import { Box, Text } from '../components/primitives';
import { ChessBoard } from '../components/compound';
import { GameBoardSection } from '../components/play';

// ✅ Correct - Direct file
import { DailyPuzzleCard } from '../components/DailyPuzzleCard';

// ❌ Avoid - Old paths
import { Box } from '../ui/components/primitives'; // OLD!
```

---

## 🛠️ Adding New Components

When adding a new component:

1. **Choose the right category**:
   - Reusable building block? → `primitives/`
   - Generic complex component? → `compound/`
   - Feature-specific? → `play/` or `puzzle/` or `identity/`

2. **Create the file**: `src/components/{category}/MyComponent.tsx`

3. **Use TypeScript**: Define props interface, add JSDoc comments

4. **Update index file**: Add export to `{category}/index.ts`

5. **Add to this index**: Update component table above

---

## 📚 Related Documentation

- **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)** - Complete directory layout
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Migration details
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[overview.md](./overview.md)** - App overview

---

**Last Updated**: November 17, 2025  
**Status**: ✅ Core complete | ⏳ 9 stubs awaiting implementation
