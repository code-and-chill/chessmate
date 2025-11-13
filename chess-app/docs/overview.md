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