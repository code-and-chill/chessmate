---
title: Game History Domain
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: domain
---

# Game History Domain

## Invariants
- Each `gameId` is unique and immutable once recorded.
- Results use the platform-wide enum: `WHITE_WIN`, `BLACK_WIN`, `DRAW`, `ABORTED`.
- `timeControlBucket` matches matchmaking pools (bullet, blitz, rapid, classical, puzzle) and is required for downstream aggregation.
- `mode` aligns with allowed game types: `RATED`, `CASUAL`, `BOT`.

## Rules
- A game must include both participants even for bot games (the bot is identified by id).
- Summaries represent completed games; aborted games are explicitly marked with `ABORTED`.
- `endedAt` timestamps are stored in UTC and drive recency/freshness reporting.
- `moves` is optional because some sources may not provide full PGN; when present it should reflect half-moves (plies).

## Edge Cases
- Multiple writes with the same `gameId` should overwrite existing records once durable storage is added; the in-memory repository simply replaces the entry.
- Requests for players with no games return an empty list, not a 404.
- Invalid enum values return 422 validation errors before reaching the repository.
