# PlayScreen Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                     PlayScreen                          │
│  (Orchestrator - 201 lines)                            │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │ Hooks (Business Logic & State)              │      │
│  ├─────────────────────────────────────────────┤      │
│  │ • useGameState()        - Game logic        │      │
│  │ • usePromotionModal()   - Promotion state   │      │
│  │ • useGameTimer()        - Timer management  │      │
│  │ • useReducedMotion()    - Accessibility     │      │
│  │ • useResponsiveLayout() - Layout calc       │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │ UI Components (Presentation)                │      │
│  ├─────────────────────────────────────────────┤      │
│  │                                             │      │
│  │  ┌───────────────────────────────────┐     │      │
│  │  │     GameHeaderCard                │     │      │
│  │  │  (Status, Mode, Time Control)     │     │      │
│  │  └───────────────────────────────────┘     │      │
│  │                                             │      │
│  │  ┌───────────────────────────────────┐     │      │
│  │  │      PlayersSection               │     │      │
│  │  │  ┌──────────────────────────┐     │     │      │
│  │  │  │   PlayerCard (Opponent)  │     │     │      │
│  │  │  └──────────────────────────┘     │     │      │
│  │  │                                    │     │      │
│  │  │  ┌──────────────────────────┐     │     │      │
│  │  │  │   GameBoardSection       │     │     │      │
│  │  │  │  ┌────────┬──────────┐   │     │     │      │
│  │  │  │  │ Board  │ MoveList │   │     │     │      │
│  │  │  │  └────────┴──────────┘   │     │     │      │
│  │  │  └──────────────────────────┘     │     │      │
│  │  │                                    │     │      │
│  │  │  ┌──────────────────────────┐     │     │      │
│  │  │  │   PlayerCard (You)       │     │     │      │
│  │  │  └──────────────────────────┘     │     │      │
│  │  └───────────────────────────────────┘     │      │
│  │                                             │      │
│  │  ┌───────────────────────────────────┐     │      │
│  │  │       GameActions                 │     │      │
│  │  │  (Resign, Draw Offer, etc.)       │     │      │
│  │  └───────────────────────────────────┘     │      │
│  │                                             │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │ Modals                                      │      │
│  ├─────────────────────────────────────────────┤      │
│  │ • PawnPromotionModal                        │      │
│  │ • GameResultModal                           │      │
│  └─────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│   User       │
│   Action     │
└──────┬───────┘
       │
       ├──> handleMove(from, to)
       │     │
       │     ├──> promotionActions.checkPromotion()
       │     │     └──> Shows PawnPromotionModal if needed
       │     │
       │     └──> makeMove(from, to)  [useGameState]
       │           ├──> Parse FEN
       │           ├──> Apply move
       │           ├──> Check game end
       │           └──> Update state
       │
       ├──> handlePawnPromotion(piece)
       │     └──> makeMove(from, to, piece)  [useGameState]
       │
       ├──> handleResign()
       │     └──> endGame(result, reason)  [useGameState]
       │
       └──> handleTimeExpire(color)  [useGameTimer]
             └──> endGame(result, reason)  [useGameState]
```

## State Management

```
┌─────────────────────────────────────────────────────┐
│                 useGameState                        │
├─────────────────────────────────────────────────────┤
│ State:                                              │
│ • status: 'in_progress' | 'ended'                   │
│ • fen: string                                       │
│ • sideToMove: 'w' | 'b'                             │
│ • moves: Move[]                                     │
│ • result: '1-0' | '0-1' | '1/2-1/2' | null          │
│ • capturedByWhite: string[]                         │
│ • capturedByBlack: string[]                         │
│                                                     │
│ Actions:                                            │
│ • makeMove(from, to, promotion?)                    │
│ • endGame(result, reason)                           │
│ • resetGame()                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              usePromotionModal                      │
├─────────────────────────────────────────────────────┤
│ State:                                              │
│ • isVisible: boolean                                │
│ • move: { from, to } | null                         │
│                                                     │
│ Actions:                                            │
│ • checkPromotion(from, to, fen, side)               │
│ • showPromotion(from, to)                           │
│ • hidePromotion()                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                useGameTimer                         │
├─────────────────────────────────────────────────────┤
│ State:                                              │
│ • whiteTimeMs: number                               │
│ • blackTimeMs: number                               │
│                                                     │
│ Actions:                                            │
│ • handleTimeExpire(color)                           │
└─────────────────────────────────────────────────────┘
```

## Hook Dependencies

```
PlayScreen
  │
  ├──> useGameState()
  │     ├─> parseFENToBoard()
  │     ├─> applyMoveToFENSimple()
  │     ├─> isCheckmate()
  │     └─> isStalemate()
  │
  ├──> usePromotionModal()
  │     └─> parseFENToBoard()
  │
  ├──> useGameTimer(endGame)
  │     └─> Depends on endGame from useGameState
  │
  ├──> useReducedMotion()
  │     └─> AccessibilityInfo.isReduceMotionEnabled()
  │
  └──> useResponsiveLayout()
        └─> Dimensions.get('window')
```

## Component Props Flow

```
PlayScreen
  │
  ├──> PlayersSection
  │     ├─ opponentName: string
  │     ├─ opponentRating: number
  │     ├─ opponentColor: 'w' | 'b'
  │     ├─ opponentActive: boolean
  │     ├─ opponentTimeMs: number
  │     ├─ opponentCapturedPieces: string[]
  │     ├─ onOpponentTimeExpire: () => void
  │     ├─ playerName: string
  │     ├─ playerRating: number
  │     ├─ playerColor: 'w' | 'b'
  │     ├─ playerActive: boolean
  │     ├─ playerTimeMs: number
  │     ├─ playerCapturedPieces: string[]
  │     ├─ onPlayerTimeExpire: () => void
  │     ├─ reduceMotion: boolean
  │     └─ children:
  │          │
  │          └──> GameBoardSection
  │                ├─ boardConfig: BoardConfig
  │                ├─ fen: string
  │                ├─ sideToMove: 'w' | 'b'
  │                ├─ lastMove: { from, to } | null
  │                ├─ isInteractive: boolean
  │                ├─ onMove: (from, to) => void
  │                ├─ moves: Move[]
  │                ├─ isWideLayout: boolean
  │                ├─ boardSize: number
  │                └─ reduceMotion: boolean
  │
  ├──> GameActions
  │     ├─ status: GameStatus
  │     ├─ result: GameResult
  │     ├─ endReason: string
  │     └─ onResign: () => void
  │
  ├──> PawnPromotionModal
  │     ├─ visible: boolean
  │     ├─ color: 'w' | 'b'
  │     ├─ onSelect: (piece) => void
  │     └─ onCancel: () => void
  │
  └──> GameResultModal
        ├─ visible: boolean
        ├─ result: GameResult
        ├─ reason: string
        ├─ isPlayerWhite: boolean
        └─ onClose: () => void
```

## Responsive Layout Logic

```
useResponsiveLayout()
  │
  ├─ Screen Width < 768px (Mobile)
  │   └─> isWideLayout: false
  │       boardSize: min(screenWidth - 48, 420)
  │       Layout: Vertical Stack
  │         ┌─────────────┐
  │         │ Board       │
  │         ├─────────────┤
  │         │ MoveList    │
  │         └─────────────┘
  │
  └─ Screen Width >= 768px (Tablet/Desktop)
      └─> isWideLayout: true
          boardSize: 480
          Layout: Horizontal
            ┌──────┬──────────┐
            │Board │ MoveList │
            └──────┴──────────┘
```

## Animation Flow

```
useReducedMotion()
  │
  ├─ User has reduced motion enabled
  │   └─> No animations (undefined)
  │
  └─ User allows animations
      └─> FadeInUp animations with delays:
          ├─ 0ms:   Top PlayerCard
          ├─ 50ms:  ChessBoard
          ├─ 100ms: MoveList
          ├─ 150ms: Bottom PlayerCard
          └─ 200ms: GameActions
```

## Testing Strategy

```
Unit Tests
  ├─ useGameState
  │   ├─ makeMove with valid moves
  │   ├─ makeMove with promotion
  │   ├─ endGame scenarios
  │   ├─ checkmate detection
  │   ├─ stalemate detection
  │   └─ captured pieces tracking
  │
  ├─ usePromotionModal
  │   ├─ checkPromotion for pawns on 8th rank
  │   ├─ checkPromotion for non-pawns
  │   └─ show/hide modal
  │
  ├─ useGameTimer
  │   └─ handleTimeExpire logic
  │
  ├─ useReducedMotion
  │   └─ accessibility setting detection
  │
  └─ useResponsiveLayout
      ├─ mobile layout calculations
      └─ tablet/desktop layout calculations

Component Tests
  ├─ GameBoardSection
  │   ├─ renders board and moves
  │   ├─ wide layout (side-by-side)
  │   └─ mobile layout (stacked)
  │
  └─ PlayersSection
      ├─ renders player cards
      ├─ renders children
      └─ animations respect accessibility

Integration Tests
  └─ PlayScreen
      ├─ full game flow
      ├─ pawn promotion flow
      ├─ resignation flow
      └─ time expiration flow
```
