---
title: Live Game Domain Model
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: domain
---

# Live Game Domain Model

Domain concepts and business rules for real-time gaming.

## Core Entities

### Game

Active or completed chess match.

**Attributes**:
- `game_id`: Unique identifier
- `white_player_id`: White player UUID
- `black_player_id`: Black player UUID
- `status`: active | checkmate | stalemate | resignation | timeout | draw
- `board_state`: Current FEN notation
- `moves`: Ordered list of moves played
- `created_at`: Game start time
- `completed_at`: Game end time (if finished)

**Invariants**:
- Only one active game per player pair per time control
- Board state must be valid chess position
- Moves must follow chess rules
- Game can only end in valid terminal state

### Move

Single action in a game.

**Attributes**:
- `notation`: Algebraic notation (e.g., "e2e4")
- `timestamp`: When move was played
- `player_id`: Player who made the move
- `is_check`: Boolean indicating if move delivers check
- `is_checkmate`: Boolean indicating if move is checkmate

**Invariants**:
- Move must be legal given current board state
- Only the active player can make a move
- No moves allowed after game ends

### TimeControl

Parameters for game timing.

**Attributes**:
- `initial_time_ms`: Starting time per player
- `increment_ms`: Time added per move

(Fill: Document specific time control formats)

## Domain Events

- `GameCreated` - New game started
- `MovePlayed` - Player made legal move
- `CheckDetected` - Move puts opponent in check
- `GameEnded` - Game concluded (checkmate, resignation, etc.)
- `TimeExpired` - Player ran out of time

## Business Rules

1. **Chess Rules**: All moves must be legal per standard chess rules
2. **Turn Order**: Players alternate moves
3. **Check/Checkmate**: Properly detected and enforced
4. **Time Management**: Players must move before time expires
5. **Resignation**: Player can resign at any time except after game end

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Game | Complete chess match |
| Move | Single player action (piece movement) |
| Board State | Current position of all pieces |
| Check | King is under direct threat |
| Checkmate | King in check with no legal moves |
| Stalemate | Non-checking king with no legal moves |
| Time Control | Game timing format (e.g., 5+3 = 5min + 3sec/move) |
| Increment | Bonus time added after each move |

---

*Last updated: 2025-11-15*
