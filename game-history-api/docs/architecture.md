---
title: Game History API Architecture
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: architecture
---

# Game History API Architecture

## Components
- **FastAPI service** exposing REST endpoints for recording and retrieving game summaries.
- **In-memory repository** providing lightweight storage for summaries during local development; replaceable with Postgres in production.
- **Dependency injection layer** that wires the repository into request handlers so alternate implementations (e.g., Postgres, Kafka-backed ingest) can be swapped without changing routes.

## Data Storage
- Default repository keeps game summaries and player indexes in memory for rapid prototyping.
- Roadmap: persist summaries in Postgres with partitions keyed by `ended_at` and per-player secondary indexes for fast retrieval.

## External Dependencies
- None in the local stub; production will depend on Postgres for durability and Kafka for ingesting completion events.

## Request Flow
1. Client sends a completed game payload to `POST /api/v1/games`.
2. Router validates payload with Pydantic models and stores it via the repository.
3. Clients fetch data via `GET /api/v1/games/{id}` or `GET /api/v1/players/{playerId}/games` with optional limits.

## Observability
- `/health` endpoint exposes a simple liveness check. Future iterations should add metrics for ingest lag and most recent processed game timestamp.
