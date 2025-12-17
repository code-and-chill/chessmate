---
title: Rating API Operations
service: rating-api
status: active
last_reviewed: 2025-12-02
type: operations
---

## Deployment
- Containerized via Docker
- Exposes port `8013`
- Requires PostgreSQL
- Optional: NATS (JetStream) for event publishing (`rating.updated`)
- Kafka consumer for game-ended events

## Config
- `DATABASE_URL`: Postgres DSN (asyncpg)
- `REQUIRE_AUTH`: enable bearer auth for all endpoints
- `INTERNAL_BEARER_TOKEN`: shared token for internal calls
- `GLICKO_*`: engine defaults
- `OUTBOX_ENABLED`: toggle event outbox publisher (default: true)
- `OUTBOX_NATS_URL`: NATS server URL (default: `nats://nats:4222`)
- `OUTBOX_PUBLISH_INTERVAL_SEC`: polling interval for publisher
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka broker addresses
- `KAFKA_GAME_EVENTS_TOPIC`: Topic name for game events
- `KAFKA_CONSUMER_ENABLED`: Enable/disable Kafka consumer

## Health
- `GET /health` - Service liveness

## Observability

### Metrics Endpoint

**Prometheus Metrics**: `GET /metrics` → Exports Prometheus-formatted metrics

### Key Metrics

#### HTTP Metrics
- `http_requests_total` - Total HTTP requests by method, endpoint, and status
- `http_request_latency_seconds` - Request latency histogram (p50, p95, p99)
- `http_errors_total` - HTTP error count by status code

#### Business Metrics
- `rating_updates_total` (counter) - Total rating updates by pool_id
- `rating_update_latency_seconds` (histogram) - Rating update processing latency
- `rating_event_processing_lag_seconds` (histogram) - Lag between event timestamp and processing time

#### Database Metrics
- `db_query_duration_seconds` - Database query duration by operation type

#### Kafka Metrics
- `kafka_events_consumed_total` - Kafka events consumed by event type and status
- `kafka_event_processing_duration_seconds` - Event processing duration
- `kafka_event_processing_errors_total` - Event processing errors
- `kafka_consumer_lag` - Kafka consumer lag in messages

### Distributed Tracing

OpenTelemetry tracing is enabled and configured. Traces include:
- HTTP request/response spans
- Database query spans
- Kafka event processing spans
- Rating calculation spans

Trace IDs are included in structured logs for correlation.

### Structured Logging

All logs are structured (JSON format) and include:
- Correlation IDs (from request headers)
- Trace IDs (from OpenTelemetry)
- Timestamp, log level, service name
- Contextual information (game_id, user_id, pool_id, etc.)

## Service Level Objectives (SLOs)

### Availability

- **Target**: 99.9% uptime (approximately 43 minutes downtime per month)
- **Measurement**: Service liveness endpoint (`/health`) responding with 200 OK
- **Alerting**: Alert if availability drops below 99.9% over a 30-day window

### Latency

- **Rating Update Processing**: p95 < 100ms, p99 < 200ms
  - Measures time from event receipt to rating calculation and persistence
- **HTTP API Requests**: p95 < 200ms, p99 < 500ms
  - Measures end-to-end HTTP request latency
- **Event Processing Lag**: p95 < 1 minute
  - Measures time between event timestamp and processing time

### Error Rate

- **Target**: < 0.1% error rate (5xx errors / total requests)
- **Measurement**: Count of 5xx responses divided by total requests
- **Alerting**: Alert if error rate exceeds 0.5% over a 5-minute window

### Throughput

- **Rating Updates**: Handle 20M rating updates/day (peak ~230 updates/second)
- **Event Processing**: Process Kafka events with minimal lag (< 1 minute)

## Troubleshooting

### Common Issues

#### Issue: High event processing lag

**Symptoms**:
- `rating_event_processing_lag_seconds` p95 > 60s
- `kafka_consumer_lag` increasing

**Solution**:
1. Check Kafka consumer group status
2. Verify database connection pool isn't exhausted
3. Review rating calculation performance
4. Check for blocking database operations
5. Consider scaling out consumer instances

#### Issue: Slow rating updates

**Symptoms**:
- `rating_update_latency_seconds` p95 > 100ms
- High database query latency

**Solution**:
1. Check database indexes on `user_ratings` and `rating_ingestions` tables
2. Review slow query logs
3. Check connection pool configuration
4. Verify leaderboard update performance

#### Issue: High error rate

**Symptoms**:
- `http_errors_total` or `kafka_event_processing_errors_total` increasing
- Error rate > 0.1%

**Solution**:
1. Check logs for error patterns (filter by trace_id)
2. Review database connection errors
3. Check for data integrity issues (missing pools, invalid game results)
4. Verify idempotency handling (duplicate game_id processing)
