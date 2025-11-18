---
title: Checkmate Detection Implementation
status: active
last_reviewed: 2025-11-15
type: architecture
---

# Checkmate Detection Implementation

## Overview

Complete checkmate and stalemate detection system integrated into both PlayScreen and PuzzlePlayScreen. The system detects game-ending conditions and properly disables further moves while displaying the outcome.

## Features Implemented

### 1. Checkmate Detection
- Detects when a player's king is in check with no legal moves available
- Displays winner notification: "Checkmate! [Player] wins!"
- Automatically ends the game (status → 'ended')
- Prevents further moves on the board

### 2. Stalemate Detection
- Detects when a player has no legal moves but king is NOT in check
- Displays draw notification: "Stalemate - Game is a draw"
- Automatically ends the game
- Prevents further moves on the board

### 3. Game-Over UI
- GameActions component displays end reason when game ends
- Displays checkmate/stalemate message prominently
- Resign button disabled when game is over
- Move list shows all moves up to game end

## Architecture

### Core Functions (Chess Engine)

**File:** `/app/utils/chessEngine.ts`

```typescript
// Detect if king is in check
export const isKingInCheck = (board: Board, color: Color): boolean

// Generate all legal moves for a piece
export const getLegalMoves = (board: Board, fromFile: number, fromRank: number, piece: string): string[]

// Check if player has any legal moves
export const hasLegalMoves = (board: Board, color: Color): boolean

// Detect checkmate: in check AND no legal moves
export const isCheckmate = (board: Board, color: Color): boolean

// Detect stalemate: NOT in check AND no legal moves
export const isStalemate = (board: Board, color: Color): boolean
```

### Integration Points

**File:** `/app/screens/PlayScreen.tsx`

```typescript
// After each move:
1. Convert updated FEN to board array
2. Calculate next player's color
3. Check isCheckmate(board, nextColor)
4. Check isStalemate(board, nextColor)
5. If checkmate/stalemate: set gameState.status = 'ended'
6. Update gameState.endReason with outcome message
7. Pass endReason to GameActions component
```

**File:** `/app/screens/PuzzlePlayScreen.tsx`

Same pattern as PlayScreen with puzzle-specific messaging:
- Checkmate: "Puzzle Solved! [Player] wins!"
- Stalemate: "Stalemate - Game is a draw"

**File:** `/app/components/compound/GameActions.tsx`

```typescript
// When game ends (status === 'ended'):
- Display endReason prominently
- Show game result if available
- Disable resign button (implicit - game is over)
- Highlight result container with styling
```

## State Management

### PlayScreen Game State

```typescript
interface GameState {
  status: 'in_progress' | 'ended'
  players: string[]
  moves: Move[]
  fen: string
  sideToMove: 'w' | 'b'
  endReason: string  // NEW: stores checkmate/stalemate message
}
```

### Puzzle Screen State

```typescript
interface PuzzleState {
  status: 'in_progress' | 'ended'
  fen: string
  moves: Move[]
  sideToMove: 'w' | 'b'
  endReason: string  // NEW: stores puzzle solution message
}
```

## Move Handling Flow

```
Player makes move
    ↓
Calculate new FEN (applyMoveToFEN)
    ↓
Parse FEN to board array
    ↓
Cast board array to Board type
    ↓
Check: isCheckmate(board, nextColor)?
    ├─ YES → status='ended', endReason="Checkmate! [Player] wins!"
    └─ NO → Check isStalemate(board, nextColor)?
            ├─ YES → status='ended', endReason="Stalemate - Draw"
            └─ NO → status='in_progress', continue game
    ↓
Update game state with new FEN, sideToMove, status, endReason
    ↓
ChessBoard re-renders with isInteractive={status === 'in_progress'}
    ↓
GameActions displays endReason if game ended
```

## Visual Feedback

### Game-Over Display

When game ends, GameActions component shows:

```
┌─────────────────────────────────┐
│  Checkmate! White wins!        │
│  1 - 0 (White Wins)            │
└─────────────────────────────────┘
```

Or for stalemate:

```
┌─────────────────────────────────┐
│  Stalemate - Game is a draw     │
│  ½ - ½ (Draw)                   │
└─────────────────────────────────┘
```

### Board State

- Board becomes non-interactive (isInteractive=false)
- All piece squares disabled for movement
- Visual pieces remain visible for inspection
- Player can scroll move history

## Testing Scenarios

### Test 1: Basic Checkmate
1. Set initial position with king in vulnerable position
2. Deliver checkmate move
3. Verify: Game status → 'ended', endReason displays "Checkmate!"
4. Verify: Board becomes non-interactive
5. Verify: GameActions shows winner message

### Test 2: Block Check vs Checkmate
1. Place king in check (single piece attacking)
2. Try to block check - should NOT end game
3. Verify: Game status remains 'in_progress'
4. Verify: Board remains interactive
5. Try to deliver checkmate (remove blocker)
6. Verify: Game ends properly

### Test 3: Stalemate Detection
1. Set position where opponent king has no legal moves but NOT in check
2. Player makes final move
3. Verify: Game status → 'ended', endReason shows "Stalemate"
4. Verify: Board becomes non-interactive
5. Verify: Result shows draw (½ - ½)

### Test 4: Puzzle Checkmate
1. Start PuzzlePlayScreen with puzzle position
2. Make moves to reach checkmate
3. Verify: endReason shows "Puzzle Solved! [Player] wins!"
4. Verify: Board becomes non-interactive
5. Verify: Move list shows all puzzle moves

### Test 5: Move Prevention After Checkmate
1. Reach checkmate state
2. Try to click piece to make another move
3. Verify: No move interaction possible
4. Verify: Board.isInteractive = false prevents selections

## Console Logging

When checkmate/stalemate detected:

```
[PLAY_SCREEN] CHECKMATE DETECTED: White wins!
[PLAY_SCREEN] Side to move AFTER: b
[PLAY_SCREEN] Total moves: 40

// OR for stalemate:

[PLAY_SCREEN] STALEMATE DETECTED: Game is a draw
```

## Performance Considerations

### Complexity
- isCheckmate: O(n) where n = pieces on board
- Checks all pieces for legal moves
- Efficient attack detection with early termination

### Optimization
- Check detection only runs after opponent's move (1x per 2 moves)
- Only checks opponent's color, not current player
- Uses cached isKingInCheck result from move validation

## Edge Cases Handled

1. ✅ King in check multiple ways (multiple attackers)
2. ✅ Cannot block one attacker (multiple attacks)
3. ✅ King cannot escape (all adjacent squares attacked)
4. ✅ Pinned piece cannot block (would expose king further)
5. ✅ Stalemate vs checkmate distinction (check status matters)
6. ✅ Back rank mate patterns
7. ✅ Double check (king must move)

## Related Systems

### Dependencies
- **chessEngine.ts** - Core detection logic
- **ChessBoard.tsx** - Move validation, check visualization
- **PlayScreen.tsx** - Game state management
- **PuzzlePlayScreen.tsx** - Puzzle state management
- **GameActions.tsx** - Result display

### Dependent On
- Move validation (wouldMoveExposureKing)
- Check detection (isKingInCheck)
- Attack detection (isSquareAttackedBy)
- FEN parsing and conversion

## Future Enhancements

1. **Move History Navigation**
   - Allow reviewing moves up to checkmate
   - Show position at each move

2. **Puzzle Statistics**
   - Track puzzles solved
   - Track success/failure rates
   - Time per puzzle

3. **Sound Effects**
   - Checkmate sound (victory)
   - Stalemate sound (neutral)
   - Celebration animation

4. **Replay System**
   - Auto-replay game to checkmate point
   - Allow stepping through moves

5. **Analysis Mode**
   - Show why position is checkmate
   - Highlight all attacked squares
   - Show alternative moves

## Integration Checklist

✅ Import isCheckmate, isStalemate from chessEngine
✅ Update PlayScreen state to include endReason
✅ Implement checkmate detection after each move
✅ Update gameState.status when checkmate detected
✅ Pass isInteractive={status === 'in_progress'} to ChessBoard
✅ Pass endReason to GameActions component
✅ Update PuzzlePlayScreen with same pattern
✅ Update GameActions to display endReason
✅ Test checkmate scenarios
✅ Test stalemate scenarios
✅ Verify board becomes non-interactive when game ends
✅ Verify console logging shows game end
✅ Verify move list shows complete game
✅ Type checking passes (0 errors)

## Files Modified

1. `/app/screens/PlayScreen.tsx` - Added checkmate detection, state management
2. `/app/screens/PuzzlePlayScreen.tsx` - Added checkmate detection, puzzle-specific messaging
3. `/app/components/compound/GameActions.tsx` - Enhanced to display endReason
4. `/app/utils/chessEngine.ts` - Already contains all detection functions (from Message 27)

## Summary

Checkmate detection is now fully integrated into both game screens with:
- Automatic detection after each move
- Game-ending status updates
- Board interaction disabled
- Clear UI feedback via GameActions component
- Full console logging for debugging
- Type-safe implementation with 0 errors

The system seamlessly integrates with existing move validation and check detection to provide complete game-ending condition handling.
