---
title: ADR-0001 - Create Game History API
service: game-history-api
status: accepted
last_reviewed: 2025-12-06
type: decision
---

# ADR-0001: Create Game History API

## Context
The platform processes ~40M games/day with ~2.4B moves/day. The live-game-api currently focuses on real-time gameplay and cannot safely own long-term durability, heavy write volume, and historical queries without impacting latency. Downstream consumers (rating-api, puzzle-api, future fair-play-api) need a reliable, queryable history source.

## Decision
Create a dedicated `game-history-api` service written in Go that:
- Consumes ordered gameplay events from the `game-events` Kafka topic partitioned by `gameId`.
- Builds canonical game summaries and move lists stored in partitioned Postgres tables (`games`, `player_games`).
- Exposes REST endpoints for game lookup, player history, and bulk export under `/game-history/v1`.
- Archives raw event streams and compacted records to S3 for long-term retention and replays.
- Provides admin rebuild capability to regenerate records from Kafka/S3 while maintaining idempotency and ordering.

## Alternatives Considered
1. **Extend live-game-api for history**: Rejected due to coupling heavy writes/reads with real-time gameplay, risking latency and availability.
2. **Rely solely on S3 analytics pipelines**: Rejected because downstream services require low-latency hot access and indexed queries.
3. **Embed history inside rating-api**: Rejected to maintain separation of concerns and allow reuse by puzzle-api and future services.

## Consequences
- New Kubernetes deployment, Postgres partitions, Kafka consumer group, and S3 buckets are required.
- Backfill tooling and admin rebuild endpoints must be built to ensure recoverability and correctness.
- Additional Bruno collections, dx-cli integration, and documentation are needed to keep the service discoverable and testable.
