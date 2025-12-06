---
title: Insights API Architecture
service: insights-api
status: active
last_reviewed: 2025-12-07
type: architecture
---

# Architecture

`insights-api` runs as a FastAPI application that exposes REST endpoints and maintains aggregate state.

## Components
- **HTTP API**: FastAPI server with versioned routes under `/insights/v1`.
- **Repository**: Pluggable data access layer; current in-memory prototype simulates Postgres aggregates.
- **Kafka Consumer (future)**: Planned ingestion path for `game-completed-events` and `rating-events`.

## Data Flows
1. Game summaries arrive from `game-history-api` (future Kafka ingestion).
2. Aggregation updates keep per-player stats, streaks, and rating points current.
3. Clients call REST endpoints for overviews, performance, and trends.

## Deployment
- Containerized via Docker.
- Runs behind dx-cli profiles with dependencies on Postgres and Kafka in real environments.
