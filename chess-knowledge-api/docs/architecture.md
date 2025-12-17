---
title: Chess Knowledge – Architecture
service: chess-knowledge-api
status: active
last_reviewed: 2025-12-02
type: architecture
---

## Components

- HTTP API (FastAPI)
- Opening book service (queries Polyglot or custom format)
- Tablebase service (queries Syzygy tablebases)
- Redis caching layer for performance
- Mock data providers for dev

## Data Flow

1) bot-orchestrator-api → POST /v1/opening/book-moves or /v1/endgame/tablebase
2) Check Redis cache first
3) If cache miss, query appropriate data source
4) Store result in cache (TTL: 24 hours)
5) Return moves with metadata or 204 if not found

## Caching Strategy

### Opening Book Cache
- **Cache Key**: `opening:{fen}:{depth}` (or `opening:{fen}` if no depth)
- **TTL**: 24 hours
- **Purpose**: Opening book queries are read-heavy and benefit from caching

### Tablebase Cache
- **Cache Key**: `tablebase:{fen}`
- **TTL**: 24 hours
- **Purpose**: Tablebase queries are computationally expensive and results are deterministic

### Cache Invalidation
- Manual invalidation via admin endpoint: `POST /v1/admin/cache/invalidate`
- TTL-based expiration (automatic after 24 hours)
- Can invalidate by specific FEN or all entries of a cache type

### Cache Metrics
- Cache hit/miss rates tracked per cache type
- Cache operation latency tracked
- Exposed via Prometheus metrics endpoint

## Scalability

Stateless, read-only service. Cache-friendly. Can scale horizontally.

- **Cache Hit Rate Target**: > 80% for opening book, > 80% for tablebase
- **Cached Request Latency**: p95 < 50ms
- **Cache Backend**: Redis (shared across instances)
