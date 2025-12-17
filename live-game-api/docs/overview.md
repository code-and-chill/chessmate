---
title: Live Game API Specification
service: live-game-api
status: active
last_reviewed: 2025-11-15
type: overview
---

1. Background

live-game-api is the real-time chess service for two-player, live (clock-based) games.

In Phase 1, it will:

Support standard chess only (no variants yet).

Support human vs human and human vs bot games.

Handle:

Game creation (challenge)

Joining a game

Move submission & validation

Clock handling

Game termination (checkmate, resignation, timeout)

Basic persistence (game + moves)

Emit enough information that leaderboard-api can later update ratings.

It does not handle:

Matchmaking logic (queueing) → that’s matchmaking-api.

Ratings and leaderboards → that’s leaderboard-api.

Game archive browsing, deep analysis → future services.

Chat → that’s chat-api.

live-game-api is the source of truth for live game state (FEN, clocks, result).

2. Tech Stack Used

Language & Framework

Python 3.11+

FastAPI (REST + optional WebSocket)

Uvicorn / Gunicorn for serving

Game Logic

Internal chess-rules library (or python python-chess-style code) for:

Move validation

FEN update

Detection of check, checkmate, stalemate, illegal moves

Persistence

PostgreSQL:

games table

game_moves table

SQLAlchemy 2.x for ORM

Alembic for migrations

Other

Optional: Redis for caching active games / clocks (can be phase-2; for MVP, DB + in-memory is fine).

JWT from auth-api for identifying the current account (via auth_user_id → account_id mapping).

3. List of Endpoints
3.1 Public / User-facing (/v1/games)
1) Create game (challenge)

POST /v1/games

Create a new game challenge.

Auth: required

Body (MVP):

{
  "opponent_account_id": "optional-or-null",
  "color_preference": "white | black | random",
  "time_control": {
    "initial_seconds": 300,
    "increment_seconds": 0
  },
  "rated": true
}


Behavior:

Creates a games row with:

creator_account_id = current user.

status = "waiting_for_opponent" if opponent_account_id set but hasn’t joined.

Initial FEN = standard starting position.

Clocks set to initial_seconds.

Initially assign color based on color_preference when opponent joins (not at creation).

Response (summary):

{
  "id": "game-id",
  "status": "waiting_for_opponent",
  "creator_account_id": "...",
  "white_account_id": null,
  "black_account_id": null,
  "time_control": { "initial_seconds": 300, "increment_seconds": 0 },
  "rated": true,
  "fen": "startpos-fen",
  "side_to_move": "w"
}

2) Join game (accept challenge)

POST /v1/games/{game_id}/join

Opponent accepts a challenge and starts the game.

Auth: required

Behavior:

Checks:

Game status = waiting_for_opponent.

Current user is either the invited opponent (if set) or allowed for open challenges (if you support open).

Decide colors based on color_preference and assign:

white_account_id, black_account_id.

Set status = "in_progress", started_at = now.

Start clocks (both at initial time; side to move = white).

Response: updated game state (same model as GET /v1/games/{id}).

3) Get game state

GET /v1/games/{game_id}

Fetch the current state of a single game.

Auth: required (later you can allow spectators selectively)

Response (MVP):

{
  "id": "game-id",
  "status": "in_progress",
  "rated": true,
  "variant_code": "standard",

  "white": {
    "account_id": "uuid",
    "remaining_ms": 295000
  },
  "black": {
    "account_id": "uuid",
    "remaining_ms": 300000
  },

  "side_to_move": "w",
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
  "moves": [
    {
      "ply": 1,
      "move_number": 1,
      "color": "w",
      "from": "e2",
      "to": "e4",
      "promotion": null,
      "san": "e4",
      "played_at": "2025-11-13T10:00:00Z",
      "elapsed_ms": 5000
    }
  ],
  "result": null,
  "end_reason": null,
  "created_at": "...",
  "started_at": "...",
  "ended_at": null
}


MVP can limit moves to last N moves if payload becomes large.

4) Play a move

POST /v1/games/{game_id}/moves

Submit a move for the current player.

Auth: required

Body:

{
  "from": "e2",
  "to": "e4",
  "promotion": "q"   // optional
}


Behavior:

Check:

Game exists.

status = in_progress.

Current user corresponds to white_account_id or black_account_id.

It’s their turn (side_to_move matches color).

Use rules engine:

Validate move is legal from current FEN.

Apply move → new FEN.

Determine if game is now check, checkmate, stalemate.

Update clocks:

Compute elapsed time since last move by this player.

Deduct from their clock.

Add increment if configured.

If clock < 0 → game ends by timeout.

Insert row into game_moves.

Update games row:

fen, side_to_move, clocks, status/result if game ended.

Response: updated game state (same structure as GET).

5) Resign

POST /v1/games/{game_id}/resign

Current player resigns.

Auth: required

Behavior:

Check status = in_progress.

Determine resigning color.

Set:

status = "ended".

result = "1-0" or "0-1".

end_reason = "resignation".

ended_at = now.

Optionally insert a game_moves row with a pseudo-move or record in separate log.

Response: final game state.

6) Create bot game

POST /v1/games/bot

Create a new game against a bot opponent.

Auth: required

Body:

{
  "difficulty": "beginner" | "easy" | "medium" | "hard" | "expert" | "master",
  "player_color": "white" | "black" | "random",
  "time_control": {
    "initial_seconds": 300,
    "increment_seconds": 0
  },
  "rated": false  // Bot games are always unrated
}

Behavior:

Creates a game with:
- Human player assigned to requested color (or random)
- Bot assigned to opposite color
- Bot difficulty mapped to bot_id (e.g., "beginner" → "bot-beginner-400")
- Game starts immediately (bot is already assigned)
- If bot goes first, bot move is played automatically
- Bot games are always unrated

Response: GameSummaryResponse with bot_id and bot_color fields

7) Draw offer/accept (optional MVP, but good to spec)

POST /v1/games/{game_id}/offer-draw

Marks that the side offered a draw.

POST /v1/games/{game_id}/accept-draw

If opponent has a pending draw offer:

status = ended

result = "1/2-1/2"

end_reason = "draw_agreed".

You can postpone implementation if needed, but spec it early.

3.2 Internal / Service-facing

Later for integration with other services.

7) Game result event hook

POST /internal/games/{game_id}/finalize (optional)

You may not need a dedicated endpoint if leaderboard-api consumes events from a queue.
Spec idea:

When status transitions to ended, live-game-api emits an event:

{
  "type": "GameEnded",
  "game_id": "uuid",
  "white_account_id": "uuid",
  "black_account_id": "uuid",
  "result": "1-0",
  "end_reason": "checkmate",
  "time_control": { "initial_seconds": 300, "increment_seconds": 0 }
}


leaderboard-api consumes this asynchronously.

3.3 Healthcheck

GET /health

Returns:

{ "status": "ok", "service": "live-game-api" }

4. DB Schemas
4.1 games
games (
  id                UUID PRIMARY KEY,

  creator_account_id UUID NOT NULL,
  white_account_id  UUID,
  black_account_id  UUID,

  status            VARCHAR(32) NOT NULL,
    -- 'waiting_for_opponent' | 'in_progress' | 'ended'
  rated             BOOLEAN NOT NULL DEFAULT TRUE,
  variant_code      VARCHAR(32) NOT NULL DEFAULT 'standard',

  time_initial_ms   INT NOT NULL,      -- initial time per player
  time_increment_ms INT NOT NULL,      -- increment per move

  white_clock_ms    INT NOT NULL,      -- remaining time
  black_clock_ms    INT NOT NULL,

  side_to_move      CHAR(1) NOT NULL,  -- 'w' or 'b'
  fen               TEXT NOT NULL,     -- current board state

  result            VARCHAR(8),        -- '1-0','0-1','1/2-1/2', or NULL
  end_reason        VARCHAR(32),       -- 'checkmate','resignation','timeout','draw_agreed', etc.

  created_at        TIMESTAMPTZ NOT NULL,
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL
);


Indexes you’ll likely want:

idx_games_white_account_id

idx_games_black_account_id

idx_games_status (for finding active games)

Maybe idx_games_created_at for archival queries.

4.2 game_moves
game_moves (
  id          UUID PRIMARY KEY,
  game_id     UUID NOT NULL REFERENCES games(id),

  ply         INT NOT NULL,           -- half-move number (1,2,3,...)
  move_number INT NOT NULL,           -- full-move number (1,2,3,...)
  color       CHAR(1) NOT NULL,       -- 'w' or 'b'

  from_square CHAR(2) NOT NULL,       -- 'e2'
  to_square   CHAR(2) NOT NULL,       -- 'e4'
  promotion   CHAR(1),                -- 'q','r','b','n' or NULL
  san         VARCHAR(16),            -- 'e4','Nf3','O-O', etc.
  fen_after   TEXT NOT NULL,          -- FEN after this move

  played_at   TIMESTAMPTZ NOT NULL,
  elapsed_ms  INT NOT NULL            -- time consumed by this move
);


Indexes:

idx_game_moves_game_id_ply (for game reconstruction in order)

4.3 (Optional) game_events

If you want a generic log (not strictly needed for MVP):

game_events (
  id          UUID PRIMARY KEY,
  game_id     UUID NOT NULL REFERENCES games(id),
  event_type  VARCHAR(32) NOT NULL,   -- 'move','resign','draw_offer','draw_accept','timeout'
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL
);


You can skip this for now and log via game_moves + game fields.

5. Scenarios
5.1 Direct challenge and play to checkmate

User A (logged in) opens /play page.

A calls POST /v1/games with:

time_control = { initial_seconds: 300, increment_seconds: 0 }

opponent_account_id = userB

live-game-api:

Creates games row with status = waiting_for_opponent, creator_account_id = A.

Returns game_id.

User B opens challenges list or link and calls POST /v1/games/{game_id}/join.

live-game-api:

Assigns colors (e.g. A = white, B = black).

status = in_progress, started_at = now, clocks initialized.

Frontend for both A and B:

Polls GET /v1/games/{game_id} or opens WebSocket.

Shows board from fen, clocks from white_clock_ms / black_clock_ms.

A plays e2e4:

Calls POST /v1/games/{game_id}/moves.

live-game-api:

Validates move, updates FEN.

Deducts elapsed time from white’s clock, adds increment.

Inserts row into game_moves.

Returns updated game state.

B moves, and so on.

Eventually A checkmates B:

The move results in checkmate according to rules lib.

status = ended, result = '1-0', end_reason = 'checkmate', ended_at = now.

live-game-api emits a GameEnded event for leaderboard-api (later).

5.2 Resignation

Same as above, but mid-game B clicks “Resign”.

Frontend calls POST /v1/games/{id}/resign as B.

live-game-api:

Validates status = in_progress.

Sets result = '1-0', end_reason = 'resignation', status = 'ended', ended_at = now.

Both players see final state via GET /v1/games/{id}.

5.3 Illegal move attempt

A tries to move e2e5 from starting position.

POST /v1/games/{id}/moves with from = "e2", to = "e5".

Rules engine rejects move.

API returns 400 Bad Request with error payload:

{
  "error": "illegal_move",
  "message": "Move e2e5 is not legal from current position."
}


Frontend refuses to animate the move.

5.4 Timeout (basic model)

Game is in progress. It’s A’s turn with only 2 seconds left.

A does nothing.

Frontend or a scheduled check detects that:

Current time - last_move_time > remaining clock.

live-game-api:

Marks game ended, result = '0-1' (if A timed out), end_reason = 'timeout'.

Next GET /v1/games/{id} shows game as ended.

MVP can implement timeout logic as:

“Clock updated only on moves and a lightweight POST /v1/games/{id}/tick call from frontend or a cron/worker.”

You can refine after basic functionality is in.

This spec is at the same level as what you did for account-api, so you can:

Hand it to your coding agent to scaffold live-game-api (FastAPI + DB + initial routes).

Hook /play in apps/web directly to these endpoints.
