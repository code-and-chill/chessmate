---
title: Chess Knowledge – API
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: api
---

Base URL: `/v1`

POST `/opening/book-moves`
- Request:
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "repertoire": "aggro_mainline"
}
```
- Response (200):
```json
{
  "moves": [
    {"move": "e2e4", "weight": 0.35, "games": 5000, "win_rate": 0.52},
    {"move": "d2d4", "weight": 0.30, "games": 4500, "win_rate": 0.51}
  ],
  "fen": "..."
}
```
- Response (204): Position not in book

POST `/endgame/tablebase`
- Request:
```json
{
  "fen": "8/8/8/8/8/4k3/4P3/4K3 w - - 0 1"
}
```
- Response (200):
```json
{
  "best_move": "e2e3",
  "result": "win",
  "dtm": 15
}
```
- Response (204): Position not in tablebase

GET `/health`
- Basic health check.
