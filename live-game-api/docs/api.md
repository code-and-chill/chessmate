---
title: Live Game API Reference
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: api
---

# Live Game API Reference

REST API endpoints for real-time chess game management.

## Public Endpoints (/v1)

### Create Game

**Endpoint**: `POST /v1/games`

**Description**: Start a new chess game.

**Request Body**:
```json
{
  "opponent_id": "player-uuid",
  "time_control": "5+3",
  "color": "white | black | random"
}
```

**Response** (201 Created):
```json
{
  "game_id": "game-uuid",
  "white_player": "player1-uuid",
  "black_player": "player2-uuid",
  "status": "active",
  "board_state": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
  "current_player": "white",
  "created_at": "2025-11-15T10:00:00Z"
}
```

### Get Game State

**Endpoint**: `GET /v1/games/{game_id}`

**Description**: Retrieve current game state.

**Response** (200 OK): Game state object

### Play Move

**Endpoint**: `POST /v1/games/{game_id}/moves`

**Description**: Submit a move in the game.

**Request Body**:
```json
{
  "move": "e2e4",
  "move_type": "normal | castle | en_passant | promotion"
}
```

**Response** (200 OK): Updated game state

### Resign

**Endpoint**: `POST /v1/games/{game_id}/resign`

**Description**: Resign from the game.

**Response** (200 OK): Game result

## Error Codes

| Code | Message | Meaning |
|------|---------|----------|
| 400 | Invalid Move | Move violates chess rules |
| 404 | Game Not Found | Game ID does not exist |
| 409 | Not Your Turn | Not the current player |
| 410 | Game Over | Game has ended |

---

*Last updated: 2025-11-15*
