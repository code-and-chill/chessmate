---
title: ADR-0002 - Create Game History API
service: global
status: accepted
last_reviewed: 2025-12-06
type: decision
---

# ADR-0002: Create Game History API

## Context
- The platform ingests ~40M games/day (~463 games/s average, >2k games/s peak) with ~2.4B moves/day (~100k+ events/s peak).
- live-game-api is optimized for low-latency gameplay and cannot simultaneously handle high-volume durable writes and historical read traffic without risking user-facing latency.
- Downstream services (rating-api, puzzle-api, planned fair-play-api) need authoritative historical data, while analytics require long-term storage.

## Decision
Create a dedicated `game-history-api` service (Go) to own historical game data:
- Consume ordered events (GameCreated, MoveMade, GameEnded/Aborted/Resigned/Timeout) from Kafka topic `game-events` partitioned by `gameId` under consumer group `game-history-api-ingestors`.
- Persist canonical game summaries and move lists to partitioned Postgres tables (`games`, `player_games`).
- Expose REST APIs for game lookup, player histories with filters/pagination, bulk export, health, and admin rebuild endpoints under `/game-history/v1`.
- Archive raw event streams and compact summaries to S3 partitioned by date/region for durable, low-cost storage and replays.
- Provide rebuild tooling to reconstruct records from Kafka/S3 with idempotency and per-game ordering.

## Alternatives Considered
1. **Extend live-game-api**: Rejected due to coupling historical durability with real-time latency-sensitive gameplay.
2. **S3-only archival with offline readers**: Rejected because downstream services require low-latency indexed access and near-real-time availability (≤10s) after game end.
3. **Embed history within rating-api**: Rejected to keep rating-specific logic separate and avoid coupling other consumers (puzzle/fair-play) to rating deployment.

## Consequences
- Introduces new Go-based deployment, Kafka consumer group, Postgres partitions, and S3 buckets to operate and monitor.
- Requires ingestion idempotency mechanisms, buffer flush strategies, and partition maintenance for `games`/`player_games` tables.
- Necessitates Bruno collections, dx-cli commands, and documentation updates to keep the service discoverable and testable across environments.
