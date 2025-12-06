---
title: Game History API Domain Model
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: domain
---

# Game History API Domain Model

## Bounded Context
Game history is a separate bounded context from live gameplay. It owns durable records of completed games, historical queries, and archival. Real-time validation, move legality, and matchmaking remain outside this context.

## Core Entities
- **Game**: Canonical summary keyed by `gameId` with players, ratings, mode (rated/casual/bot), variant, region/platform metadata, time control, start/end timestamps, result, termination reason, and compacted moves.
- **Move**: Ordered move details (SAN, UCI, optional FEN after move) with timestamps and clocks. Valid only within a game aggregate and deduplicated by `moveNumber` and side.
- **PlayerGameIndex**: Denormalized mapping from `playerId` to `gameId` with role, endedAt, mode, time control, result (win/loss/draw/aborted), opponent metadata, and ratings for pagination and filtering.

## Ubiquitous Language
- **Canonical game summary**: Durable representation of a finished game including moves and result.
- **Hot store**: Postgres partitions used for low-latency reads.
- **Cold store**: S3 archives of raw event streams and compacted records for long-term retention.
- **Termination reason**: Outcome cause such as CHECKMATE, RESIGN, TIMEOUT, ABORTED.

## Business Rules
- Preserve per-game ordering by consuming Kafka partitions keyed by `gameId` and ignoring out-of-order or duplicate moves using last `moveNumber` seen.
- Enforce idempotency with `eventId` to avoid double-applying updates during retries or replays.
- Insert `player_games` entries for both participants at game finalization to support reverse chronological queries.
- Mark games as archived or return 410 when only available in cold storage via read endpoints (optional feature flag).
- Maintain latency targets: summaries should be visible within 10s of game end; read APIs aim for p95 ≤50ms from Postgres partitions.
