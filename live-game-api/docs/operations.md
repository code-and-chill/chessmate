---
title: Live Game API Operations
service: live-game-api
status: active
last_reviewed: 2025-12-02
type: operations
---

# Live Game API Operations

Operational procedures, monitoring, and runbooks for live-game-api.

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis (for game state caching)

### Environment Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/live_game
REDIS_URL=redis://redis:6379/0
DEBUG=false
LOG_LEVEL=INFO
```

## Monitoring

### Metrics Endpoint

**Prometheus Metrics**: `GET /metrics` → Exports Prometheus-formatted metrics

### Key Metrics

#### HTTP Metrics
- `http_requests_total` - Total HTTP requests by method, endpoint, and status
- `http_request_latency_seconds` - Request latency histogram (p50, p95, p99)
- `http_errors_total` - HTTP error count by status code

#### Business Metrics
- `live_game_active_games` (gauge) - Number of currently active games
- `live_game_moves_total` (counter) - Total moves played, labeled by result (valid, invalid, checkmate, stalemate)
- `live_game_move_latency_seconds` (histogram) - Move processing latency
- `live_game_websocket_connections` (gauge) - Number of active WebSocket connections
- `live_game_websocket_reconnects_total` (counter) - Total WebSocket reconnections

#### Database Metrics
- `db_query_duration_seconds` - Database query duration by operation type

#### External Service Metrics
- `external_service_calls_total` - External service calls by service and status
- `external_service_call_duration_seconds` - External service call duration

#### Kafka Metrics
- `kafka_events_published_total` - Kafka events published by event type and status
- `kafka_event_publish_duration_seconds` - Event publishing duration
- `kafka_event_publish_errors_total` - Event publishing errors

### Distributed Tracing

OpenTelemetry tracing is enabled and configured. Traces include:
- HTTP request/response spans
- Database query spans
- External service call spans
- Business logic operation spans

Trace IDs are included in structured logs for correlation.

### Structured Logging

All logs are structured (JSON format) and include:
- Correlation IDs (X-Request-ID header)
- Trace IDs (from OpenTelemetry)
- Timestamp, log level, service name
- Contextual information (game_id, user_id, etc.)

### Health Checks

**Liveness**: `GET /health` → 200 OK

**Readiness**: `GET /ready` → Checks database and Redis

## Scaling

- **Horizontal**: Stateless API layer scales linearly
- **Database**: Connection pool 20-40 connections
- **Redis**: Session/game state cache

## Service Level Objectives (SLOs)

### Availability

- **Target**: 99.9% uptime (approximately 43 minutes downtime per month)
- **Measurement**: Service liveness endpoint (`/health`) responding with 200 OK
- **Alerting**: Alert if availability drops below 99.9% over a 30-day window

### Latency

- **Move Processing**: p95 < 50ms, p99 < 100ms
  - Measures time from move submission to persistence and event publishing
- **Game Creation**: p95 < 100ms, p99 < 200ms
  - Measures time to create game, assign players, and persist
- **HTTP API Requests**: p95 < 200ms, p99 < 500ms
  - Measures end-to-end HTTP request latency
- **Database Queries**: p95 < 100ms, p99 < 200ms
  - Measures individual database query latency

### Error Rate

- **Target**: < 0.1% error rate (5xx errors / total requests)
- **Measurement**: Count of 5xx responses divided by total requests
- **Alerting**: Alert if error rate exceeds 0.5% over a 5-minute window

### Throughput

- **Move Processing**: Handle 2,000 moves/second at peak
- **Game Creation**: Handle 500 game creations/second at peak
- **WebSocket Connections**: Support 10,000 concurrent connections

## Performance Targets

- Move validation: < 50ms p95
- Game creation: < 100ms p95
- Board state queries: < 50ms p95

## Troubleshooting

### Common Issues

#### Issue: Slow move validation

**Symptoms**:
- `live_game_move_latency_seconds` p95 > 50ms
- High database query latency

**Solution**:
1. Check database indexes on `game_moves` table
2. Verify Redis is responsive (check `redis-cli ping`)
3. Review slow query logs: `SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;`
4. Check connection pool exhaustion

#### Issue: High error rate

**Symptoms**:
- `http_errors_total` counter increasing
- Error rate > 0.1%

**Solution**:
1. Check logs for error patterns (filter by trace_id)
2. Review database connection errors
3. Verify external service availability (bot-orchestrator, auth-api)
4. Check for rate limiting issues

#### Issue: WebSocket disconnections

**Symptoms**:
- `live_game_websocket_reconnects_total` increasing rapidly
- Users reporting connection drops

**Solution**:
1. Check Redis connectivity: `redis-cli ping`
2. Verify network latency to clients
3. Check for connection timeouts
4. Review load balancer session affinity configuration
5. Check for memory pressure on instances

#### Issue: High Kafka event publishing latency

**Symptoms**:
- `kafka_event_publish_duration_seconds` p95 > 100ms
- `kafka_event_publish_errors_total` increasing

**Solution**:
1. Check Kafka broker health and connectivity
2. Verify network latency to Kafka cluster
3. Check producer buffer size and retry configuration
4. Review Kafka cluster metrics (lag, throughput)

#### Issue: Database connection exhaustion

**Symptoms**:
- Errors: "connection pool exhausted"
- High `db_query_duration_seconds`

**Solution**:
1. Increase connection pool size in configuration
2. Review connection pool usage metrics
3. Check for connection leaks (long-running transactions)
4. Verify database connection limits

## Incident Response

See [/docs/operations/incident-response.md](../../docs/operations/incident-response.md)

---

*Last updated: 2025-11-15*
