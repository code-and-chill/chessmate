---
title: Game History API Reference
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: api
---

# Game History API Reference

## Health
- `GET /health`
  - Returns service identifier for monitoring.

## Record Game
- `POST /api/v1/games`
- Request body (JSON):
  - `gameId` (uuid, optional)
  - `whitePlayerId` (uuid)
  - `blackPlayerId` (uuid)
  - `result` (`WHITE_WIN` | `BLACK_WIN` | `DRAW` | `ABORTED`)
  - `timeControl` (string)
  - `timeControlBucket` (string)
  - `mode` (`RATED` | `CASUAL` | `BOT`)
  - `endedAt` (ISO timestamp)
  - `moves` (int, optional)
- Response: persisted game summary with generated `gameId` when omitted.
- Status: `201 Created`.

## Get Game By Id
- `GET /api/v1/games/{gameId}`
- Returns the recorded summary or `404` if not found.

## List Player Games
- `GET /api/v1/players/{playerId}/games?limit=20`
- Query params:
  - `limit` (1-100, defaults to 20)
- Response: newest-first array of game summaries for the player.

## Error Model
- Errors return `{ "detail": "<message>" }` with appropriate HTTP status codes.
