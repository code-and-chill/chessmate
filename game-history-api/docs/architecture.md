---
title: Game History API Architecture
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: architecture
---

# Game History API Architecture

## Components
- **HTTP API layer (Go)**: Serves REST endpoints for game and player history queries and admin rebuilds.
- **Kafka ingestion workers**: Consume `game-events` with `gameId` partitioning, enforce per-game ordering, deduplicate by `eventId`/`moveNumber`, and update persistence layers.
- **Postgres hot store**: Range-partitioned `games` and `player_games` tables for fast lookups and pagination.
- **S3 archival jobs**: Batch raw event streams and compacted summaries to S3 for long-term retention and offline analytics.
- **dx-cli integration**: Local profiles and commands to run service, migrations, Bruno tests, and ingestion simulation.

## Data Storage
- **Postgres**
  - `games` table: canonical game summary with players, ratings, time control, variant, mode, region/platform metadata, start/end timestamps, result/termination, and compact `moves_json` array.
  - `player_games` table: denormalized index keyed by `player_id`, `ended_at`, and `game_id` with role, mode, time control, result (win/loss/draw/aborted), opponent metadata, and ratings.
  - Partitioning: range by `ended_at` (monthly/weekly) for both tables to support pruning and scalable inserts.
- **S3**
  - Raw event logs organized by `region`, `dt=YYYY-MM-DD`, `hour=HH`, compressed JSON/Parquet.
  - Optional compacted game summaries for analytical reads.

## External Dependencies
- **Kafka**: Topic `game-events` (64–128 partitions, replication factor 3) with consumer group `game-history-api-ingestors`.
- **live-game-api**: Publishes gameplay events that the service ingests.
- **Downstream consumers**: rating-api, puzzle-api, future fair-play-api rely on canonical history outputs.
- **dx-cli**: Development orchestration for Kafka/Postgres containers and command wrappers.

## Main Flows
- **Ingestion pipeline**: GameCreated inserts baseline rows; MoveMade appends moves to buffers and flushes batched updates; GameEnded/Aborted/Resigned/Timeout finalize summaries and insert player indexes; idempotency enforced via `eventId` and last `moveNumber` seen.
- **Read path**: API handlers query Postgres partitions, with optional caching for hot IDs, and return JSON game summaries or player history pages.
- **Archival**: Background workers roll up ingested events and push to S3 buckets partitioned by date/region for cheap storage and analytical reuse.

## Technology Stack
- **Language**: Go
- **API**: REST/JSON over HTTP on port 8080
- **Messaging**: Kafka for event ingestion
- **Storage**: Postgres (hot, partitioned) + S3 (cold)
- **Runtime**: Kubernetes with horizontal autoscaling; containerized via Docker

## Scaling Assumptions
- Throughput: ~40M games/day (~463 games/s average; peaks >2k games/s) and ~2.4B moves/day (peaks ~100k+ events/s).
- Latency targets: ingestion visibility within ≤10s of game end; read APIs p95 ≤50ms, p99 ≤100ms for hot data.
- Reliability: 99.9%+ availability for read APIs; ingestion allowed to backlog while guaranteeing durability and ordering.
