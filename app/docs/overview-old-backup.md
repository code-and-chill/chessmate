---
title: Chess App Overview
service: chess-app
status: active
last_reviewed: 2025-11-18
type: overview
phase: 6
---

1. Background

The /play feature is the primary game experience for the chess platform, shared across:

Web (via react-native-web)

Mobile (React Native, likely Expo)

It sits on top of:

auth-api (auth & identity)

account-api (profile info)

live-game-api (game state, moves, clocks)

Goals for /play:

Provide a chess.com-like live play experience:

Board, pieces, move interactions

Player panels & clocks

Move list

Basic in-game actions (resign; later draw, settings)

Use a shared UI kit + design tokens so future screens (Puzzles, Profile, Tournaments) feel consistent.

Keep logic & rendering separated:

Hooks + “core” for networking/state

UI components purely presentational

This spec defines the frontend architecture for /play plus the base design system it depends on.

Navigation Map (Phase 6)

- **Play**: Multi-mode hub with Online Play, Play vs Bot, Friend Challenge
  - **Online Play**: Time control selection (3+0 Blitz, 10+0 Rapid, 15|10 Rapid, 30+0 Classical) → Matchmaking → Live Game
  - **Play vs Bot**: Difficulty selection (Easy 800-1200, Medium 1200-1600, Hard 1600-2000, Expert 2000+) → Bot Game
  - **Friend Challenge**: Game ID entry or demo game → Private Game
- **Puzzle**: Daily puzzle hub and play entry
- **Learn**: Multi-mode learning hub with four core sections
  - **Lessons**: Category-based learning path (Beginner → Intermediate → Advanced) with lesson cards showing title, time estimate, and completion status
  - **Tactics Trainer**: Rating-based puzzle system with category selection (Forks, Pins, Discovered Attacks, Skewers, Back Rank Mates, Deflections)
  - **Game Review**: Analysis of past games showing opponent, result, accuracy, blunders, and mistakes
  - **Openings Explorer**: Opening database with ECO codes, games played, and win rates
- **Watch**: Placeholder for live games/streams
- **Social**: Multi-mode social hub with four core sections
  - **Friends**: Friend list with online status indicators, quick challenge buttons, add friend functionality
  - **Clubs**: Club cards showing member count and activity level, join/create club functionality, club search
  - **Messages**: Conversation list with message preview, direct messages and club chat, unread message counts
  - **Leaderboards**: Global, Friends, and Club rankings with rating, games played, and win percentage
- **Settings**: Multi-mode personalization hub with five core sections
  - **Profile**: Avatar, username, bio, country settings with profile editing
  - **Statistics**: Rating history across time controls (Blitz/Rapid/Classical), win/loss records, performance insights, recent games
  - **Achievements**: Badge system with 45 milestones, progress tracking, unlocked/locked states
  - **Game Preferences**: Board theme, piece sets, sounds, animations, gameplay options (auto-queen, legal moves, premoves)
  - **Appearance**: Light/dark/auto theme, language, time format, notation style, accessibility options

Play Flow Architecture

```
Play Hub
  ├─ Online Play
  │   ├─ Time Control Selection (3+0, 10+0, 15+10, 30+0)
  │   ├─ Find Match (matchmaking loading state)
  │   └─ Game Screen (with WebSocket connection)
  │
  ├─ Play vs Bot
  │   ├─ Difficulty Selection (Easy, Medium, Hard, Expert)
  │   └─ Game Screen (vs bot engine)
  │
  └─ Friend Challenge
      ├─ Game ID Input
      └─ Game Screen (private match)
```

Learn Module Architecture (Phase 3)

The Learn tab implements a multi-mode learning system:

```
Learn Hub
  ├─ Stats Overview (Daily Streak, Tactics Rating)
  │
  ├─ Lessons
  │   ├─ Category Tabs (Beginner, Intermediate, Advanced)
  │   ├─ Lesson Cards (Title, Time Estimate, Icon)
  │   └─ Navigation to Lesson Content (future)
  │
  ├─ Tactics Trainer
  │   ├─ Current Rating Display (e.g., 1450 ⚡ +25)
  │   ├─ Category Selection (6 tactical themes)
  │   └─ Link to Puzzle Tab for solving
  │
  ├─ Game Review
  │   ├─ Game Cards (Opponent, Result, Date)
  │   ├─ Accuracy Metrics (Accuracy %, Blunders, Mistakes)
  │   └─ Navigation to Analysis (future)
  │
  └─ Openings Explorer
      ├─ Opening Cards (Name, ECO Code)
      ├─ Statistics (Games Played, Win Rate)
      └─ Navigation to Opening Details (future)
```

Learning System Patterns

**Progressive Difficulty**: Lessons organized by skill level (Beginner → Advanced)
**Spaced Repetition**: Tactics rating system with performance tracking (+25 rating changes)
**Personalized Analysis**: Game review with accuracy metrics and error detection
**Opening Repertoire**: Database of openings with statistics for evidence-based learning

Social Module Architecture (Phase 4)

The Social tab implements a community engagement system:

```
Social Hub
  ├─ Stats Overview (Online Friends, Clubs, Unread Messages)
  │
  ├─ Friends
  │   ├─ Online/Offline Sections
  │   ├─ Friend Cards (Username, Rating, Online Status)
  │   ├─ Quick Challenge Button (for online friends)
  │   ├─ Add Friend Search
  │   └─ Friend Profile Navigation (future)
  │
  ├─ Clubs
  │   ├─ My Clubs Section (with role badges)
  │   ├─ Discover Clubs Section
  │   ├─ Club Cards (Name, Members, Activity Level)
  │   ├─ Join/Create Club Actions
  │   └─ Club Detail Navigation (future)
  │
  ├─ Messages
  │   ├─ Conversation List (Direct + Club Chats)
  │   ├─ Chat Preview (Last Message, Time, Unread Count)
  │   ├─ Search Conversations
  │   └─ Chat Detail Navigation (future)
  │
  └─ Leaderboards
      ├─ Tab Navigation (Global, Friends, Club)
      ├─ Leaderboard Entries (Rank, Username, Rating, Stats)
      ├─ User Highlight (current user position)
      └─ Profile Navigation (future)
```

Social System Patterns

**Presence Indicators**: Real-time online/offline status with "Playing" state
**Engagement Metrics**: Track online friends, club activity, unread messages
**Community Building**: Clubs with member counts, activity levels, role badges (Member, Admin)
**Communication Channels**: Direct messages and club chat with unread indicators
**Competitive Elements**: Multi-context leaderboards (Global, Friends, Club) with win rates

Personalization Module Architecture (Phase 5)

The Settings tab implements a comprehensive personalization system:

```
Settings Hub
  ├─ Profile Summary (Avatar, Username, Stats Overview)
  │
  ├─ Profile
  │   ├─ Avatar Selection
  │   ├─ User Info (Username, Email, Bio, Country)
  │   ├─ Edit Profile Form
  │   └─ Save Changes
  │
  ├─ Statistics
  │   ├─ Time Control Tabs (Blitz, Rapid, Classical)
  │   ├─ Rating Display (Current, Peak)
  │   ├─ Win/Loss/Draw Record with Visual Bar
  │   ├─ Performance Insights (Best Opening, Avg Move Time, Streak, Trend)
  │   └─ Recent Games List
  │
  ├─ Achievements
  │   ├─ Progress Bar (12 of 45 unlocked = 27%)
  │   ├─ Unlocked Badges (with unlock date)
  │   ├─ In Progress Badges (with progress counter)
  │   └─ Badge Categories (First Steps, Milestones, Mastery)
  │
  ├─ Game Preferences
  │   ├─ Board & Pieces (Theme, Piece Set, Coordinates, Highlighting)
  │   ├─ Gameplay (Auto-Queen, Legal Moves, Premoves, Confirm Moves)
  │   ├─ Sounds & Animations (Sound Effects, Move/Piece Animation, Vibration)
  │   └─ Analysis (Post-Game Analysis, Engine Lines, Evaluation Bar, Hints)
  │
  └─ Appearance
      ├─ Theme Selection (Light/Dark/Auto with visual options)
      ├─ Display (Language, Time Format, Notation Style, Font Size)
      └─ Accessibility (High Contrast, Reduce Motion, Screen Reader, Large Text)
```

Personalization System Patterns

**Comprehensive Stats Tracking**: Multi-format ratings (Blitz 1650, Rapid 1580, Classical 1720) with peak tracking
**Achievement System**: 45 total milestones across categories with visual progress tracking (27% complete)
**Performance Analytics**: Win rate visualization, opening statistics, move time analysis, rating trends
**Rich Customization**: 20+ preference options across gameplay, visual, audio, and accessibility domains
**User Identity**: Profile management with avatar, bio, country for social presence

Infrastructure Module Architecture (Phase 6)

The app implements a comprehensive API and state management infrastructure:

```
API Layer
  ├─ API Clients
  │   ├─ AccountApiClient (user profiles, friends, social features)
  │   ├─ RatingApiClient (ratings, stats, leaderboards, achievements)
  │   ├─ MatchmakingApiClient (queue management, bot games, challenges)
  │   ├─ PuzzleApiClient (daily puzzles, attempts, user stats)
  │   ├─ LiveGameApiClient (game state, moves, WebSocket connection)
  │   └─ PlayApiClient (game creation, joining)
  │
  ├─ Context Providers
  │   ├─ AuthProvider (authentication state, token management)
  │   └─ ApiProvider (API client instances with auth tokens)
  │
  └─ Data Hooks
      ├─ useProfile (fetch user profile with loading/error states)
      ├─ useFriends (fetch friends list with online status)
      ├─ useStats (fetch game statistics by time control)
      ├─ useAchievements (fetch and track achievements)
      ├─ useLeaderboard (fetch rankings by type and time control)
      └─ useMatchmaking (queue operations with polling)
```

API Client Architecture

**Base Client Pattern**:
- Consistent request/response handling across all clients
- Automatic auth token injection via headers
- Centralized error handling with descriptive messages
- Type-safe interfaces for all requests and responses

**API Endpoints**:
- AccountAPI (port 8002): `/api/v1/accounts/*`
- RatingAPI (port 8003): `/api/v1/ratings/*`
- MatchmakingAPI (port 8004): `/api/v1/matchmaking/*`
- PuzzleAPI (port 8000): `/api/v1/puzzles/*`
- LiveGameAPI (port 8001): `/api/v1/games/*`

**Environment Configuration**:
- Base URLs configured via `EXPO_PUBLIC_*_API_URL` environment variables
- Defaults to localhost for local development
- Production URLs configurable per deployment environment

State Management Patterns

**Authentication Flow**:
1. AuthProvider loads saved token/user from AsyncStorage on mount
2. ApiProvider creates API clients with current auth token
3. Token updates trigger automatic re-instantiation of clients
4. Logout clears AsyncStorage and resets all state

**Data Fetching Pattern**:
- Custom hooks (`useProfile`, `useFriends`, etc.) encapsulate API calls
- Return `{ data, loading, error, refetch }` for consistent UI patterns
- Automatic refetch on mount, manual refetch via returned function
- Loading states prevent multiple simultaneous requests

**Persistent Storage**:
- Auth tokens stored in AsyncStorage with keys `@chess_auth_token`
- User data cached in `@chess_auth_user`
- Multi-key removal on logout for security
- Async load on app startup for seamless auth restoration

**Error Handling**:
- API clients throw descriptive errors with status codes
- Hooks catch errors and expose via `error` state
- UI components can display error messages or fallback content
- Retry logic available via `refetch` function

WebSocket Integration

The app uses `useWebSocket` hook for live game updates:
- URL: `ws://localhost:8001/ws/games/{game_id}`
- Messages: Move updates, clock ticks, game state changes
- Auto-reconnection with 3s backoff
- Ready for live-game-api integration

Time Controls

| Preset | Format | Category | Description |
|--------|--------|----------|-------------|
| 3+0    | 3 min  | Blitz    | Fast-paced games |
| 10+0   | 10 min | Rapid    | Standard quick games |
| 15+10  | 15\|10  | Rapid    | Increment format |
| 30+0   | 30 min | Classical| Longer strategic games |

2. Tech Stack Used
Core

React Native (for UI primitives)

react-native-web (to reuse RN components on web)

TypeScript (strong typing across core & UI)

React Navigation (mobile routing) + Next.js routes or similar (web)

Fetch or Axios for HTTP (wrapped in a small client layer)

Monorepo structure (frontend side)
apps/
  web/            # Next.js or similar, configured with react-native-web
  mobile/         # Expo or bare RN app
packages/
  core/           # business logic, API clients, hooks, models
  ui/             # design system, tokens, reusable RN components


packages/core:

api/ → live-game client, auth client, etc.

hooks/ → useGame, useAuth, useAccount

models/ → GameState, Move, Account

packages/ui:

tokens/ → colors, spacing, typography, radii, shadows

components/ → Button, Text, Surface, ChessBoard, PlayerPanel, MoveList, GameActions

screens/ → PlayScreen

3. “Endpoints” for the Frontend

Think of these as public interfaces:

3.1 Routes
Web

GET /play/:gameId

Renders <PlayScreen /> with gameId from URL.

Expects auth context to provide token & currentAccountId.

Mobile

Navigation route: Play

Params: { gameId: string }

Screen: <PlayScreen />.

3.2 Core hooks (in packages/core)
useGame(gameId: string)

Inputs:

gameId (string)

Auth token from context (implicit or passed).

Responsibilities:

Poll GET /v1/games/{game_id} from live-game-api.

Expose current GameState.

Provide actions:

makeMove(from, to, promotion?)

resign()

refresh()

Output:

{
  game: GameState | null;
  loading: boolean;
  error: Error | null;
  makeMove(from: string, to: string, promotion?: string): Promise<void>;
  resign(): Promise<void>;
  refresh(): Promise<void>;
}

useAuth()

Provides:

{
  isAuthenticated: boolean;
  token: string | null;
  currentAccountId: string | null;
}


(Already or separately defined, but required by PlayScreen.)

3.3 UI entry point
PlayScreen (in packages/ui)
interface PlayScreenProps {
  gameId: string;
}


Reads token and currentAccountId from some auth/context hook.

Uses useGame(gameId, token) from core.

Renders:

Top player panel

Board

Bottom player panel

Game action bar

Sidebar: move list (chat later)

4. Design Tokens (Schemas)

These are your frontend equivalent of DB schemas: the canonical shapes for visual style.

Define tokens in packages/ui/tokens/:

4.1 Color tokens
// packages/ui/tokens/colors.ts
export const colors = {
  // Board
  boardLight: '#EEEED2',
  boardDark: '#769656',

  // UI surfaces
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  surfaceElevated: '#F3F3F3',

  // Text
  textPrimary: '#151515',
  textSecondary: '#555555',
  textMuted: '#8A8A8A',

  // Accents
  accentGreen: '#769656',
  accentGreenDark: '#4E6A3A',
  danger: '#D9534F',

  // Borders & lines
  borderSubtle: 'rgba(0,0,0,0.08)',

  // Background
  appBackground: '#F0F2F5',
};

4.2 Spacing tokens
// packages/ui/tokens/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

4.3 Typography tokens
// packages/ui/tokens/typography.ts
export const typography = {
  fontFamily: 'System', // or 'Inter' via custom config

  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

4.4 Radius & elevation
// packages/ui/tokens/radius.ts
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

// packages/ui/tokens/shadow.ts
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
};

4.5 Board-specific tokens
// packages/ui/tokens/board.ts
export const boardTokens = {
  size: 320,      // initial; can be responsive
  squareSize: 40, // size / 8
  borderRadius: 12,
};


All UI components should use these tokens instead of hard-coded values.

5. UI Kit Patterns (Components)
5.1 Primitives (in packages/ui/components/primitives/)
Box

Wrapper around View.

Accepts layout/style props:

padding, margin, backgroundColor, flexDirection, align, justify, etc.

Delegates to StyleSheet internally.

Text

Wrapper around RN Text with typography defaults.

Props:

variant: 'body' | 'heading' | 'label' | 'caption'

color: 'primary' | 'secondary' | 'muted'

Button

Primary and subtle variants.

Props:

variant: 'primary' | 'secondary' | 'danger'

size: 'sm' | 'md'

iconLeft, iconRight (optional).

Surface

Generic card-like container.

Uses radius.md and shadow.card by default.

5.2 Compound components (for /play)
ChessBoard

Props:

interface ChessBoardProps {
  fen: string;
  sideToMove: 'w' | 'b';
  myColor: 'w' | 'b';
  isInteractive: boolean;
  onMove(from: string, to: string, promotion?: string): void | Promise<void>;
}


Renders 8×8 grid using colors.boardLight/dark, boardTokens.

Handles click/tap selection and move attempt.

PlayerPanel

Props:

interface PlayerPanelProps {
  position: 'top' | 'bottom';
  color: 'w' | 'b';
  isSelf: boolean;
  remainingMs: number;
  accountId: string;
  // later: displayName, rating (maybe passed in for now)
}


Layout:

Avatar + Name/Rating + Clock

Uses:

Surface, Text, and some Clock helper.

MoveList

Props:

interface MoveListProps {
  moves: Move[];
}


Renders 3-column list: move number, white move, black move.

Highlight last move.

GameActions

Props:

interface GameActionsProps {
  status: GameStatus;
  result: GameState['result'];
  onResign(): void;
  // later: onOfferDraw, onAcceptDraw
}


Shows “Resign” button when game in progress.

Shows result text when ended.

5.3 Screen-level component
PlayScreen

Props (UI-facing):

interface PlayScreenProps {
  gameId: string;
}


Responsibilities:

Get token and currentAccountId via useAuth().

Use useGame(gameId, token).

Decide myColor.

Compose:

Top PlayerPanel (white)

ChessBoard

Bottom PlayerPanel (black)

GameActions

Sidebar with MoveList (chat later)

6. Frontend “Schemas”: Core Types

In packages/core/models/game.ts:

export type Color = 'w' | 'b';
export type GameStatus = 'waiting_for_opponent' | 'in_progress' | 'ended';

export interface TimeControl {
  initialSeconds: number;
  incrementSeconds: number;
}

export interface Move {
  ply: number;
  moveNumber: number;
  color: Color;
  from: string;
  to: string;
  promotion?: string;
  san: string;
  playedAt: string;
  elapsedMs: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  rated: boolean;
  variantCode: string;

  white: { accountId: string; remainingMs: number };
  black: { accountId: string; remainingMs: number };

  sideToMove: Color;
  fen: string;
  moves: Move[];

  result: '1-0' | '0-1' | '1/2-1/2' | null;
  endReason: string | null;

  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}


These map directly to your live-game-api spec and are used end-to-end.

7. Scenarios
7.1 User joins an existing game /play/:gameId

User is authenticated (token + currentAccountId available).

Web/mobile navigates to /play/:gameId.

<PlayScreen gameId="..."/> mounts.

useGame starts polling GET /v1/games/{gameId}.

First response:

Board renders initial FEN.

Player panels identify which side is self (currentAccountId).

User taps/drag two squares:

ChessBoard calls onMove(from, to).

useGame.makeMove calls POST /v1/games/{id}/moves.

On success:

State updates.

Board rerenders; move list grows; clocks adjust.

7.2 User plays until checkmate

Game transitions from in_progress to ended.

GameActions:

Hides “Resign”.

Shows result (“You won by checkmate” / “You lost by checkmate”).

Board remains interactive disabled (isInteractive = false).

Player can leave screen or view moves.

7.3 User resigns

User clicks “Resign” button in GameActions.

useGame.resign() → POST /v1/games/{id}/resign.

Response: status = ended, result = ..., endReason = "resignation".

UI reflects defeat status & disables board.

7.4 Resilience: reconnection / refresh

User’s connection drops.

They re-open app or reload /play/:gameId.

useGame runs again:

Fetches current GameState.

The board state, moves, clocks rebuild from server truth.

No client-side state beyond what’s derived from GameState.