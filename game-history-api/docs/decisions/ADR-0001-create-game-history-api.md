---
title: ADR-0001 Create game-history-api
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: decision
---

# ADR-0001 – Create game-history-api

## Status
Accepted

## Context
Downstream services such as rating-api and the upcoming insights-api need a canonical, query-friendly source of completed game summaries. Relying on live-game streams or ad-hoc queries against gameplay storage would make ingestion brittle and slow.

## Decision
Create `game-history-api` as the authoritative service for storing and serving summary-level chess game data. The service exposes REST endpoints to record completed games and to retrieve them by id or by player. An in-memory repository is provided for local development with a clear path to Postgres-backed persistence.

## Alternatives Considered
1. **Extend rating-api to own game summaries** – rejected to keep rating concerns isolated and avoid coupling ingest to rating logic.
2. **Use data warehouse exports** – rejected because user-facing freshness requires a write-optimized service.
3. **Append-only object storage** – rejected because interactive queries by player would be inefficient without an indexing layer.

## Consequences
- New operational surface that must be deployed and monitored.
- Downstream services can decouple from gameplay event schemas and rely on stable summaries.
- Future migrations will need to add durable storage and ingestion from Kafka topics.
