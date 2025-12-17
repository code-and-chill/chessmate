---
title: Cross-Service Gap Matrix
service: global
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Cross-Service Gap Matrix

**Legend**: ✅ Pass | 🟨 Partial | ❌ Fail | ? Unknown

## Requirements vs Services

| Requirement | app | matchmaking-api | live-game-api | bot-orchestrator-api | engine-cluster-api | chess-knowledge-api | puzzle-api | rating-api |
|-------------|-----|-----------------|---------------|----------------------|-------------------|---------------------|------------|------------|
| **A) DDD Boundaries** |
| Bounded context clarity | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 |
| Ubiquitous language | 🟨 | ✅ | ✅ | 🟨 | ? | ? | ? | ✅ |
| Domain/infra separation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| No domain leakage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Anti-corruption layer | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 |
| **B) Scalability** |
| Capacity assumptions | 🟨 | 🟨 | ❌ | 🟨 | ? | ❌ | 🟨 | 🟨 |
| Horizontal scaling | ✅ | 🟨 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Caching strategy | ❌ | 🟨 | ❌ | ❌ | ❌ | ❌ | ❌ | 🟨 |
| Backpressure/rate limiting | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hot path latency budgets | ? | ? | 🟨 | ❌ | ❌ | ? | ✅ | ? |
| WS gateway compatibility | ❌ | N/A | ❌ | N/A | N/A | N/A | N/A | N/A |
| gameId shard routing | N/A | N/A | ❌ | N/A | N/A | N/A | N/A | N/A |
| In-memory + append log | N/A | N/A | ❌ | N/A | N/A | N/A | N/A | N/A |
| Snapshotting strategy | N/A | N/A | ❌ | N/A | N/A | N/A | N/A | N/A |
| **C) Reliability** |
| Idempotency keys | 🟨 | ✅ | 🟨 | 🟨 | ? | ? | ❌ | ✅ |
| Exactly-once illusion | 🟨 | ✅ | 🟨 | 🟨 | ? | ? | ❌ | ✅ |
| Timeout budgets | ❌ | ? | ? | ❌ | ❌ | ? | ? | ? |
| Retry budgets | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Circuit breakers | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Fallbacks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Disaster recovery | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **D) Data Ownership** |
| Own DB schema | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Migration tooling | N/A | ✅ | ✅ | N/A | N/A | N/A | ? | ✅ |
| PII boundaries | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| S3 conventions | N/A | N/A | ❌ | N/A | N/A | ? | N/A | N/A |
| Event schema governance | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **E) Observability** |
| Structured logs | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 | 🟨 |
| Correlation IDs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Metrics (p50/p95/p99) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Distributed tracing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SLOs defined | ❌ | ❌ | 🟨 | ❌ | ❌ | ❌ | ✅ | ❌ |
| Alerting rules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Runbooks | 🟨 | 🟨 | 🟨 | ? | ? | ? | ? | 🟨 |
| **F) Security/Abuse** |
| AuthN/AuthZ | ✅ | ✅ | ✅ | 🟨 | 🟨 | 🟨 | 🟨 | ✅ |
| Rate limits | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Abuse controls | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Replay protection | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bot identity handling | N/A | 🟨 | ✅ | ✅ | N/A | N/A | N/A | N/A |
| **Events** |
| Produce events | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Consume events | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🟨 |
| Event schemas | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Event versioning | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Idempotent events | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Summary Statistics

| Service | Pass | Partial | Fail | Unknown | Total |
|---------|------|---------|------|---------|-------|
| app | 3 | 7 | 8 | 0 | 18 |
| matchmaking-api | 2 | 8 | 8 | 0 | 18 |
| live-game-api | 1 | 6 | 11 | 0 | 18 |
| bot-orchestrator-api | 1 | 8 | 9 | 0 | 18 |
| engine-cluster-api | 1 | 5 | 7 | 5 | 18 |
| chess-knowledge-api | 1 | 4 | 8 | 5 | 18 |
| puzzle-api | 2 | 6 | 7 | 3 | 18 |
| rating-api | 3 | 7 | 6 | 2 | 18 |

## Critical Gaps (All Services)

1. **Event Publishing**: ❌ All services fail - No Kafka producers
2. **Observability**: ❌ All services fail - No metrics, tracing, correlation IDs
3. **Rate Limiting**: ❌ All services fail - No rate limiting
4. **Circuit Breakers**: ❌ All services fail - No circuit breakers
5. **Event Schema Governance**: ❌ All services fail - No schema versioning

## Service-Specific Critical Gaps

### live-game-api
- ❌ No sharding strategy
- ❌ No WebSocket implementation
- ❌ No event publishing
- ❌ No snapshotting strategy

### matchmaking-api
- ❌ No event publishing (MatchCreated)
- ❌ No circuit breakers
- ❌ No rate limiting

### rating-api
- ❌ Consumes HTTP not events
- ❌ No backfill strategy
- ❌ No leaderboard materialization

### app
- ❌ No WebSocket implementation
- ❌ No offline queue
- ❌ No correlation IDs

### bot-orchestrator-api
- ❌ No timeout budgets
- ❌ No fallback behavior
- ❌ No circuit breakers

### engine-cluster-api
- ❌ No fallback behavior
- ❌ No SLA tiers
- ❌ No engine registry

### chess-knowledge-api
- ❌ No caching strategy
- ❌ No CDN
- ❌ No scaling strategy

### puzzle-api
- ❌ No attempt idempotency
- ❌ No feed caching
- ❌ No event consumption

