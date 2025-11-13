TASKS – /play Frontend (React Native + react-native-web)
0. Goal & Scope

Build a shared /play experience that works on:

Web (via react-native-web)

Mobile (React Native / Expo)

using:

@chess/core for API + domain models + hooks

@chess/ui for design system + components + PlayScreen

Backends already available:

auth-api

account-api

live-game-api

1. Monorepo Frontend Layout

Objective: Establish consistent frontend workspaces.

Tasks:

Ensure root workspace supports:

apps/web

apps/mobile

packages/core

packages/ui

Configure TypeScript path aliases (in root tsconfig.base.json):

@chess/core → packages/core/src

@chess/ui → packages/ui/src

Ensure bundlers (Next.js / Expo / Metro) can transpile @chess/core and @chess/ui.

2. @chess/core – Domain Models & API Hooks
2.1 Game models

Objective: Strongly-typed Game data to mirror live-game-api.

Tasks:

Create packages/core/src/models/game.ts with:

type Color = 'w' | 'b'

type GameStatus = 'waiting_for_opponent' | 'in_progress' | 'ended'

interface TimeControl { initialSeconds: number; incrementSeconds: number }

interface Move { ply; moveNumber; color; from; to; promotion?; san; playedAt; elapsedMs }

interface GameState { ... } matching live-game-api spec:

id, status, rated, variantCode

white / black objects with accountId & remainingMs

sideToMove, fen, moves

result, endReason

createdAt, startedAt?, endedAt?

Export these types from packages/core/src/index.ts.

2.2 Live game client

Objective: Thin API client for live-game-api.

Tasks:

Create packages/core/src/api/liveGameClient.ts with functions:

getGame(gameId: string, token: string): Promise<GameState>

GET /v1/games/{game_id}

playMove(gameId: string, body: { from; to; promotion? }, token: string): Promise<GameState>

POST /v1/games/{game_id}/moves

resign(gameId: string, token: string): Promise<GameState>

POST /v1/games/{game_id}/resign

API base URL should come from env/config (no hard-coded URLs).

Handle non-2xx responses by throwing Error.

Export liveGameClient from packages/core/src/index.ts.

2.3 useGame(gameId) hook

Objective: Central hook to manage game state & polling.

Tasks:

Create packages/core/src/hooks/useGame.ts that:

Accepts: gameId: string, token: string, optional pollMs = 1000.

Internally uses liveGameClient to:

Fetch initial GameState.

Poll getGame() every pollMs ms.

Maintains:

game: GameState | null

loading: boolean

error: Error | null

Expose actions:

makeMove(from: string, to: string, promotion?: string): Promise<void>

resign(): Promise<void>

refresh(): Promise<void>

Export from packages/core/src/index.ts.

Assumption: Auth token is provided by caller; useGame doesn’t own auth.

3. @chess/ui – Design Tokens & Primitives
3.1 Design tokens

Objective: Shared visual language.

Tasks:

Create token modules:

packages/ui/src/tokens/colors.ts

boardLight, boardDark, surface, surfaceMuted, surfaceElevated, textPrimary, textSecondary, textMuted, accentGreen, accentGreenDark, danger, borderSubtle, appBackground.

packages/ui/src/tokens/spacing.ts

xs, sm, md, lg, xl, xxl.

packages/ui/src/tokens/typography.ts

fontFamily, sizes (xs..xxl), weights (regular, medium, semibold, bold).

packages/ui/src/tokens/radius.ts

sm, md, lg, xl.

packages/ui/src/tokens/shadow.ts

card shadow preset.

packages/ui/src/tokens/board.ts

size, squareSize, borderRadius.

Ensure all components use these tokens (no magic numbers/colors).

3.2 UI primitives

Objective: Base components for consistent layout & text.

Tasks:

Create packages/ui/src/components/primitives/Box.tsx:

Wrapper around View.

Accepts layout/style props and merges them into style.

Create packages/ui/src/components/primitives/Text.tsx:

Wrapper around RN Text.

Props:

variant?: 'body' | 'heading' | 'caption'

color?: 'primary' | 'secondary' | 'muted'

Uses typography + colors.

Create packages/ui/src/components/primitives/Button.tsx:

Variants: 'primary' | 'secondary' | 'danger'.

Sizes: 'sm' | 'md'.

Uses colors, radius, spacing.

Create packages/ui/src/components/primitives/Surface.tsx:

Card container with:

background = colors.surface

radius = radius.lg

shadow = shadow.card.

Export primitives from packages/ui/src/index.ts.

4. @chess/ui – Chess Components for /play
4.1 ChessBoard component

Objective: Render board from FEN + handle user move input.

Tasks:

Create packages/ui/src/components/chess/ChessBoard.tsx with props:

interface ChessBoardProps {
  fen: string;
  sideToMove: 'w' | 'b';
  myColor: 'w' | 'b';
  isInteractive: boolean;
  onMove(from: string, to: string, promotion?: string): void | Promise<void>;
}


Implement:

FEN parsing:

Convert piece placement section into array of 64 squares.

Square ordering:

Flip board if myColor === 'b'.

Rendering:

8×8 grid of Pressable squares.

Colors: colors.boardLight / colors.boardDark.

Apply boardTokens.squareSize, boardTokens.borderRadius.

Interaction:

First tap: select origin square if piece exists.

Second tap: call onMove(selected, target) and clear selection.

For MVP, use placeholder piece sprites or simple text (♙, ♜, etc.).

4.2 PlayerPanel component

Objective: Show player info + clock for top & bottom.

Tasks:

Create packages/ui/src/components/chess/PlayerPanel.tsx with props:

interface PlayerPanelProps {
  position: 'top' | 'bottom';
  color: 'w' | 'b';
  isSelf: boolean;
  remainingMs: number;
  accountId: string;
}


Render:

Label:

If isSelf → “You”

Else temporary placeholder (Player (White/Black)).

Clock:

Convert remainingMs → MM:SS.

Use Text variants.

Layout:

Avatar placeholder + name + clock aligned.

4.3 MoveList component

Objective: Display move history.

Tasks:

Create packages/ui/src/components/chess/MoveList.tsx with props:

interface MoveListProps {
  moves: Move[];
}


Render a scrollable list:

Group by moveNumber.

Columns: move number, white SAN, black SAN.

Highlight last move row.

4.4 GameActions component

Objective: Central place for game-level actions.

Tasks:

Create packages/ui/src/components/chess/GameActions.tsx with props:

interface GameActionsProps {
  status: GameStatus;
  result: GameState['result'];
  onResign(): void;
}


Behavior:

If status === 'in_progress':

Show “Resign” button (danger variant).

If status === 'ended':

Hide “Resign”.

Show result text (You won / lost / drew – can be simple for now).

5. @chess/ui – PlayScreen Composition

Objective: Assemble the full /play screen using core hook + UI kit.

Tasks:

Create packages/ui/src/screens/PlayScreen.tsx with props:

interface PlayScreenProps {
  gameId: string;
}


Inside PlayScreen:

Get token and currentAccountId using useAuth() from @chess/core or via props/context (depending on your auth integration).

Use useGame(gameId, token):

Handle loading/error states with a centered spinner / message.

Determine myColor:

If game.white.accountId === currentAccountId → 'w'

Else 'b'.

Layout:

Root: View with flexDirection: 'row' on large screens (web), default column on small screens (can be refined later).

Left column:

PlayerPanel (white, position="top").

ChessBoard.

PlayerPanel (black, position="bottom").

GameActions.

Right column (sidebar):

Surface/card with “Moves” header.

MoveList.

Use tokens for padding, spacing, colors – no raw constants where possible.

Export PlayScreen from packages/ui/src/index.ts.

6. Integrate /play in Apps
6.1 Web app route

Tasks:

In apps/web, add a route (e.g. Next.js pages/play/[gameId].tsx):

Parse gameId from route params.

Ensure auth context is available so PlayScreen can access token & currentAccountId.

Render <PlayScreen gameId={gameId} />.

6.2 Mobile app route

Tasks:

In apps/mobile, add a navigation route named Play:

Param: { gameId: string }.

Screen component:

Extract gameId from navigation route.

Render <PlayScreen gameId={gameId} />.

7. Scenarios to Verify

Scenario 1: Load in-progress game

Given a valid gameId and auth:

/play/:gameId loads.

Board and panels show correct FEN, side to move, clocks.

Scenario 2: Play moves

User taps from-square and to-square:

ChessBoard calls onMove.

useGame sends POST /moves.

Board and move list update accordingly.

Scenario 3: Resign

User clicks “Resign”:

GameActions calls onResign.

useGame sends POST /resign.

Game ends and UI shows final result.

Scenario 4: Refresh

User refreshes browser or reopens app:

PlayScreen re-mounts.

useGame refetches current GameState.

Board, clocks, moves correctly match server state.