---
title: Insights API Operations
service: insights-api
status: active
last_reviewed: 2025-12-07
type: operations
---

# Operations

## Runtime
- Container exposes port 8020.
- Depends on Postgres for aggregates and Kafka for event ingestion in production.

## Observability
- Health endpoint: `GET /insights/v1/health`.
- Metrics to watch: consumer lag, aggregation latency, API p95/p99, DB error rates.

## Deployment
- Build Docker image from `Dockerfile`.
- Configure environment for DB and Kafka connectivity; current prototype runs in-memory.

## SLOs
- Read p95 ≤ 50ms, p99 ≤ 100ms for cached aggregates.
- Aggregates refreshed within minutes of new games.
