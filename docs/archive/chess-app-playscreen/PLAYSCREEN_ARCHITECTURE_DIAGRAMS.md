# PlayScreen Architecture Diagrams

## Component Hierarchy

```
PlayScreen (Main Component)
├─ Props:
│  ├─ gameId: string
│  └─ config?: Partial<PlayScreenConfig>
│
├─ State & Hooks:
│  ├─ useI18n() → i18n context
│  ├─ useTheme() → theme context
│  ├─ useAuth() → authentication state
│  ├─ useGame() → game state & actions
│  ├─ useGameParticipant() → participant info
│  └─ useGameInteractivity() → interactivity state
│
├─ Conditional Rendering:
│  ├─ ErrorScreen → Not authenticated
│  ├─ LoadingScreen → Loading state
│  ├─ ErrorScreen → Error state
│  ├─ ErrorScreen → Game not found
│  ├─ ErrorScreen → Not a participant
│  └─ GameLayout → Game rendered
│
└─ GameLayout Components:
   ├─ GameBoardSection
   │  ├─ PlayerPanel (opponent, top)
   │  ├─ ChessBoard
   │  ├─ PlayerPanel (self, bottom)
   │  └─ GameActions
   └─ MoveListSidebar
      └─ MoveList
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PlayScreen Props                        │
│  { gameId, config?: Partial<PlayScreenConfig> }             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Configuration Composition Layer                 │
│  - Merge user config with defaultPlayScreenConfig          │
│  - Shallow merge nested objects (board, theme)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  PlayScreenConfig (Merged) │
        │  ├─ board: BoardConfig     │
        │  ├─ theme: ThemeConfig     │
        │  ├─ apiBaseUrl: string     │
        │  ├─ pollInterval: number   │
        │  └─ moveListWidth: number  │
        └────────────────────────────┘
                     │
         ┌───────────┴──────────────┬──────────────┬──────────────┐
         │                          │              │              │
         ▼                          ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐ │ ┌─────────┐ │ ┌──────────┐
    │  useAuth   │  │  useGame   │ │ │useTheme │ │ │useI18n   │
    │            │  │            │ │ └─────────┘ │ └──────────┘
    │ Returns:   │  │ Returns:   │ │
    │ - token    │  │ - game     │ │
    │ - accountId│  │ - actions  │ │
    │ - authed   │  │ - loading  │ │
    └────────────┘  │ - error    │ │
                    └────────────┘ │
                     │             │
         ┌───────────┘             └──────────────┐
         │                                        │
         ▼                                        ▼
    ┌──────────────────────┐          ┌─────────────────────────┐
    │useGameParticipant    │          │useGameInteractivity     │
    │                      │          │                         │
    │Input:                │          │Input:                   │
    │ - game               │          │ - game                  │
    │ - currentAccountId   │          │ - myColor               │
    │                      │          │                         │
    │Output:               │          │Output:                  │
    │ - myColor            │          │ - isInteractive         │
    │ - opponentColor      │          │ - canMove               │
    │ - isParticipant      │          │ - reason                │
    └──────────────────────┘          └─────────────────────────┘
         │                                        │
         └────────────────┬───────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │     Render State Determination         │
         │  Priority:                             │
         │  1. Not authenticated → ErrorScreen    │
         │  2. Loading → LoadingScreen            │
         │  3. Error → ErrorScreen                │
         │  4. Game not found → ErrorScreen       │
         │  5. Not participant → ErrorScreen      │
         │  6. All valid → GameLayout             │
         └────────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │         Game Layout Rendering          │
         │                                        │
         │  ┌─────────────────────────────────┐  │
         │  │  GameBoardSection               │  │
         │  │  ├─ PlayerPanel (opponent)      │  │
         │  │  ├─ ChessBoard (with config)    │  │
         │  │  ├─ PlayerPanel (self)          │  │
         │  │  └─ GameActions                 │  │
         │  └─────────────────────────────────┘  │
         │                                        │
         │  ┌─────────────────────────────────┐  │
         │  │  MoveListSidebar                │  │
         │  │  └─ MoveList                    │  │
         │  │     (width from config)         │  │
         │  └─────────────────────────────────┘  │
         │                                        │
         └────────────────────────────────────────┘
```

## Configuration Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PlayScreenConfig                              │
│  Unified configuration interface combining:                      │
│  • Board presentation (BoardConfig)                             │
│  • Theme customization (ThemeConfig)                            │
│  • API & polling settings                                       │
│  • UI layout parameters                                         │
└────────────┬─────────────────────────┬──────────────┬───────────┘
             │                         │              │
     ┌───────▼──────────┐  ┌───────────▼─────┐  ┌────▼──────────┐
     │  BoardConfig     │  │  ThemeConfig    │  │ API/UI Config │
     ├─────────────────┤  ├─────────────────┤  ├───────────────┤
     │ • size          │  │ • mode          │  │ • apiBaseUrl  │
     │ • squareSize    │  │ • boardTheme    │  │ • pollInterval│
     │ • borderRadius  │  │ • customColors  │  │ • moveListWid │
     │ • interactive   │  │                 │  │               │
     │ • disabledOpacity│ │                 │  │               │
     └─────────────────┘  └─────────────────┘  └───────────────┘
             │                     │                    │
     ┌───────▼──────────┐  ┌───────▼─────┐  ┌────▼──────────┐
     │ Defaults:        │  │ Defaults:   │  │ Defaults:    │
     │ • 320px board    │  │ • light     │  │ • localhost  │
     │ • 40px squares   │  │ • green     │  │ • 1000ms     │
     │ • 12px radius    │  │ • no custom │  │ • 200px      │
     │ • interactive    │  │   colors    │  │              │
     │ • 0.7 opacity    │  │             │  │              │
     └──────────────────┘  └─────────────┘  └──────────────┘
             │                     │                    │
             └─────────────────────┴────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   Configuration Factories     │
         ├──────────────────────────────┤
         │ • defaultPlayScreenConfig    │
         │ • createPlayScreenConfig()   │
         │ • createResponsiveBoardConfig()
         │ • Custom user factories      │
         └──────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Used by PlayScreen Component │
         │  • board config for sizing    │
         │  • theme config for styling   │
         │  • API config for data fetch  │
         │  • UI config for layout       │
         └──────────────────────────────┘
```

## Hook Responsibility Division

```
┌──────────────────────────────────────────────────────────────┐
│                      useGame Hook                            │
│  Responsibility: Fetch and manage game state                │
│  Data: { game, loading, error, makeMove, resign }          │
│  Source: API via LiveGameApiClient                          │
└──────────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│               useGameParticipant Hook                        │
│  Responsibility: Validate participation & assign colors    │
│  Input: { game, currentAccountId }                         │
│  Output: { myColor, opponentColor, isParticipant } | null  │
│  Logic: Single concern - participant validation only       │
└──────────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│              useGameInteractivity Hook                       │
│  Responsibility: Determine board interactivity state       │
│  Input: { game, myColor }                                  │
│  Output: { isInteractive, canMove, reason }                │
│  Logic: Single concern - interactivity rules only          │
│                                                              │
│  States:                                                    │
│  ├─ 'not_participant' → !game || !myColor                  │
│  ├─ 'game_ended' → game.status !== 'in_progress'          │
│  ├─ 'not_your_turn' → game.sideToMove !== myColor         │
│  └─ 'ready' → All conditions met                           │
└──────────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│                   PlayScreen Component                       │
│  Responsibility: Orchestrate state & render layout          │
│  Uses: All hooks above + context + config                  │
│  Output: Rendered game screen with proper error handling   │
└──────────────────────────────────────────────────────────────┘
```

## SOLID Principles Mapping

```
┌─────────────────────────────────────────────────────────────┐
│ SOLID Principle ➜ Implementation in PlayScreen             │
├─────────────────────────────────────────────────────────────┤
│ S: Single Responsibility                                     │
│   • PlayScreen → Layout composition only                    │
│   • useGameParticipant → Participant validation             │
│   • useGameInteractivity → Interactivity determination      │
│   • Sub-components → Specific UI sections                   │
│                                                              │
│ O: Open/Closed                                              │
│   • Extensible via PlayScreenConfig without modification   │
│   • New themes don't require code changes                   │
│   • Board factories support different sizing strategies    │
│                                                              │
│ L: Liskov Substitution                                      │
│   • ErrorScreen, LoadingScreen, GameLayout are             │
│     interchangeable based on state                          │
│   • Each component honors its interface contract           │
│                                                              │
│ I: Interface Segregation                                    │
│   • BoardConfig (board concerns only)                       │
│   • ThemeConfig (theme concerns only)                       │
│   • PlayScreenConfig (combines focused interfaces)         │
│   • Each hook returns focused data structure              │
│                                                              │
│ D: Dependency Inversion                                     │
│   • Depends on abstractions (configs, hooks)               │
│   • Not on concrete implementations                        │
│   • Can inject different configs at runtime               │
└─────────────────────────────────────────────────────────────┘
```

## Extensibility Points

```
PlayScreen Extensibility Diagram:

┌────────────────────────────────────────────┐
│        Add New Board Theme                 │
│  Extend boardThemes in tokens/themes.ts   │
│  ✓ No PlayScreen modification needed       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│      Custom Board Sizing Strategy          │
│  Create new config factory function        │
│  ✓ No PlayScreen modification needed       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│     Add New Game State Logic               │
│  Create new hook (e.g., useGameTimer)     │
│  ✓ No PlayScreen modification needed       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│    Custom Error/Loading Screens            │
│  Create new screen components              │
│  ✓ No PlayScreen modification needed       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│    Different API Implementation             │
│  Create new LiveGameApiClient variant      │
│  ✓ No PlayScreen modification needed       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│    Device-Specific Configurations          │
│  Create platform-specific config factory   │
│  ✓ No PlayScreen modification needed       │
└────────────────────────────────────────────┘
```

All extension points follow: **Configuration ➜ Factory ➜ Compose ➜ Use**
No modification of PlayScreen core required!
