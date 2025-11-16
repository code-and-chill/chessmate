---
title: Bot Orchestrator – API
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: api
---

Base URL: `/v1`

POST `/bots/{bot_id}/move`
- Request:
```
{
  "game_id": "g_123",
  "bot_color": "black",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
  "move_number": 1,
  "clocks": {"white_ms": 300000, "black_ms": 300000, "increment_ms": 2000},
  "metadata": {"time_control_code": "blitz_3+2", "rated": true, "pool_id": "blitz_standard"},
  "debug": false
}
```
- Response (normal):
```
{ "game_id": "g_123", "bot_id": "bot_blitz_1200", "move": "c7c5", "thinking_time_ms": 430 }
```
- Response (debug): includes `debug_info` with phase, mistake, engine_query, candidates, chosen_reason.

GET `/bots/{bot_id}/spec`
- Returns the effective BotSpec envelope (may proxy/cache bot-config-api).

GET `/debug/last-moves?bot_id=...&limit=20`
- Returns recent orchestration logs (in-memory) for support/debugging.

GET `/health`
- Basic health check.
