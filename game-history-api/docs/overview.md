---
title: Game History API Overview
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: overview
---

# Game History API Overview

## Purpose

The game-history-api is the authoritative, durable store for completed chess games. It ingests ordered game events from live-game-api via Kafka, builds canonical game summaries, indexes games by player, and exposes REST endpoints for history retrieval.

## Scope

### In Scope
- Asynchronous ingestion of GameCreated, MoveMade, GameEnded, GameAborted, GameResigned, and GameTimeout events from the `game-events` Kafka topic.
- Construction and persistence of canonical game summaries in Postgres, including compact move lists and metadata.
- Player-centric indexing for reverse chronological history with filterable queries.
- REST APIs for fetching game details, player histories, and bulk exports.
- Archival of raw event streams and compacted records to S3 for long-term retention and analytics.

### Out of Scope
- Real-time game state management or move validation (owned by live-game-api).
- Rating calculations (owned by rating-api) or puzzle generation logic (owned by puzzle-api).
- Anti-cheat heuristics or enforcement (future fair-play-api domain).

## Key Dependencies

### Upstream
- **live-game-api** publishes ordered game events to Kafka partitioned by `gameId`.
- **dx-cli** local profiles provision Kafka/Postgres for development.

### Downstream
- **rating-api** consumes canonical move sequences and results for rating updates.
- **puzzle-api** queries games for puzzle mining based on results, ratings, and time controls.
- **future fair-play-api** leverages archived events for analysis.

## Key Flows
- **Event ingestion**: Consume ordered events, deduplicate by `eventId`/`moveNumber`, and update game summaries and player indexes.
- **Read APIs**: Serve `GET /game-history/v1/games/{gameId}`, `GET /game-history/v1/players/{playerId}/games`, and internal export endpoints from Postgres partitions.
- **Cold storage**: Periodically batch raw event streams and compacted game records to S3 partitioned by date and region.
