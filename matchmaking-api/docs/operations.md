---
title: Matchmaking Operations
service: matchmaking-api
status: active
last_reviewed: 2025-12-02
type: operations
---

# Matchmaking Operations

Operational procedures and runbooks for matchmaking-api.

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis (for queue state)

### Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/matchmaking
REDIS_URL=redis://redis:6379/1
LIVE_GAME_API_URL=http://live-game-api:8002
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
- `matchmaking_queue_length` (gauge) - Current number of players in matchmaking queue
- `matchmaking_matches_created_total` (counter) - Total number of matches created
- `matchmaking_match_latency_seconds` (histogram) - Time from queue join to match creation
- `matchmaking_queue_wait_time_seconds` (histogram) - Time players wait in queue before matching

#### Database Metrics
- `db_query_duration_seconds` - Database query duration by operation type

#### External Service Metrics
- `external_service_calls_total` - External service calls by service and status
- `external_service_call_duration_seconds` - External service call duration

#### Circuit Breaker Metrics
- `circuit_breaker_state` - Circuit breaker state (0=closed, 1=open, 2=half-open) by service
- `circuit_breaker_failures_total` - Circuit breaker failures by service

#### Kafka Metrics
- `kafka_events_published_total` - Kafka events published by event type and status
- `kafka_event_publish_duration_seconds` - Event publishing duration
- `kafka_event_publish_errors_total` - Event publishing errors

### Distributed Tracing

OpenTelemetry tracing is enabled and configured. Traces include:
- HTTP request/response spans
- Database query spans
- External service call spans (live-game-api, rating-api)
- Matchmaking logic spans

Trace IDs are included in structured logs for correlation.

### Structured Logging

All logs are structured (JSON format) and include:
- Correlation IDs (X-Correlation-ID header)
- Trace IDs (from OpenTelemetry)
- Timestamp, log level, service name
- Contextual information (match_id, user_id, queue_entry_id, etc.)

### Health Checks

**Liveness**: `GET /health` → 200 OK with service status

## Scaling

- Queue processing can handle 1000+ players
- Redis queue stores state
- Horizontal scaling via queue workers

## Service Level Objectives (SLOs)

### Availability

- **Target**: 99.9% uptime (approximately 43 minutes downtime per month)
- **Measurement**: Service liveness endpoint (`/health`) responding with 200 OK
- **Alerting**: Alert if availability drops below 99.9% over a 30-day window

### Latency

- **Match Creation**: p95 < 500ms, p99 < 1s
  - Measures time from queue join to match creation
- **Queue Wait Time**: p95 < 60s, p99 < 300s (5 minutes)
  - Measures time players wait in queue before being matched
- **HTTP API Requests**: p95 < 200ms, p99 < 500ms
  - Measures end-to-end HTTP request latency

### Error Rate

- **Target**: < 0.1% error rate (5xx errors / total requests)
- **Measurement**: Count of 5xx responses divided by total requests
- **Alerting**: Alert if error rate exceeds 0.5% over a 5-minute window

### Throughput

- **Match Creation**: Handle 100 matches/second at peak
- **Queue Processing**: Process 1,000+ players in queue simultaneously

## Troubleshooting

### Common Issues

#### Issue: Queue buildup / long wait times

**Symptoms**:
- `matchmaking_queue_length` increasing continuously
- `matchmaking_queue_wait_time_seconds` p95 > 60s

**Solution**:
1. Check if live-game-api is responsive (check circuit breaker state)
2. Verify rating matching algorithm is working correctly
3. Check for rating API issues (connection, latency)
4. Review matchmaking worker status and logs
5. Verify queue worker is running and processing entries

#### Issue: High match creation failure rate

**Symptoms**:
- Match creation errors in logs
- Circuit breaker opening frequently

**Solution**:
1. Check live-game-api health and availability
2. Review circuit breaker metrics (`circuit_breaker_state`, `circuit_breaker_failures_total`)
3. Check for failed matches queue buildup
4. Verify network connectivity to live-game-api
5. Review live-game-api error logs

#### Issue: Circuit breaker opening frequently

**Symptoms**:
- `circuit_breaker_state` = 1 (open) for extended periods
- `circuit_breaker_failures_total` increasing

**Solution**:
1. Check live-game-api service health
2. Review network connectivity and latency to live-game-api
3. Check for service capacity issues
4. Review circuit breaker configuration (thresholds, timeout)
5. Check failed matches queue - may need manual retry

#### Issue: High error rate

**Symptoms**:
- `http_errors_total` counter increasing
- Error rate > 0.1%

**Solution**:
1. Check logs for error patterns (filter by trace_id)
2. Review database connection errors
3. Verify external service availability (live-game-api, rating-api)
4. Check for rate limiting issues
5. Review queue storage (Redis) connectivity

---

*Last updated: 2025-11-15*
