---
title: Game History API Operations & Runbook
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: operations
---

# Game History API Operations & Runbook

## Deployment
- Containerized Go service deployed to Kubernetes, listening on port 8080.
- Use dx-cli profiles to provision Kafka, Postgres, and S3 credentials for each environment.
- Apply database migrations before enabling ingestion workers; ensure partitions for `games` and `player_games` exist for the target time window.

## Configuration
- `PORT`: HTTP listen port (default 8080).
- `POSTGRES_URL`: Connection string for partitioned hot store.
- `KAFKA_BROKERS`: Comma-separated broker list for `game-events` topic.
- `KAFKA_GROUP_ID`: Consumer group (default `game-history-api-ingestors`).
- `GAME_EVENTS_TOPIC`: Kafka topic name (default `game-events`).
- `S3_BUCKET_RAW`: Bucket for raw event archives (e.g., `chessmate-game-history-raw`).
- `S3_BUCKET_SUMMARIES`: Bucket for compact summaries (optional).
- `REGION`: Deployment region for partitioned archival paths.
- `INGEST_FLUSH_INTERVAL_MS`: Batch flush cadence for move buffers.
- `METRICS_ENDPOINT`: Prometheus scrape path.

## Monitoring & Observability
- Metrics: Kafka consumer lag per partition, events processed/sec by type, Postgres write latency, API p95/p99 latency, 4xx/5xx error rates, S3 archival success/failure counts.
- Logs: Structured JSON with `traceId`, `spanId`, `gameId`, `playerId`, and event type.
- Tracing: OpenTelemetry spans for ingestion pipeline and HTTP handlers.

## SLOs
- Availability: ≥99.9% for read APIs.
- Latency: p95 ≤50ms, p99 ≤100ms for hot-store reads; ingestion visibility ≤10s from game end.
- Durability: zero data loss; Kafka + Postgres in multi-AZ, S3 retention for multi-year history.

## Incident Response
- **Kafka degradation**: Pause ingestion workers, monitor lag, and alert on backlog thresholds; replay once brokers recover.
- **Postgres latency/outage**: Allow Kafka to buffer; disable ingestion flushes, prioritize DB recovery, then reprocess backlog.
- **Data corruption/logical bugs**: Use `admin/games/{gameId}/rebuild` to replay from Kafka/S3; for bulk issues, perform backfill replay with guarded idempotency.
- **Archival failures**: Queue failed batches for retry, alert on S3 write errors, and validate manifest completeness.
