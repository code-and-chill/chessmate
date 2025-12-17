---
title: Remediation Backlog
service: global
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Remediation Backlog

Prioritized backlog of fixes required for scale readiness (20M games/day, 200M users, 200K-2M DAU).

## Priority Legend

- **P0 (Must Fix)**: Blocking scale readiness, must complete before attempting scale
- **P1 (Should Fix)**: High risk, should fix before scale
- **P2 (Nice to Have)**: Optimization, can fix after scale

## Effort Legend

- **S (Small)**: 1-3 days
- **M (Medium)**: 1-2 weeks
- **L (Large)**: 2-4 weeks

---

## P0 - Must Fix (Blocking Scale)

### AUD-007: Implement Kafka Event Publishing (live-game-api)
**Priority**: P0  
**Owner**: live-game-api  
**Effort**: L (3-4 weeks)  
**Problem**: Events created but never published to Kafka. Downstream services cannot consume events.  
**Evidence**: 
- `live-game-api/app/domain/services/game_service.py` creates events but no Kafka producer
- `game-history-api` expects Kafka topic `game-events` but no producer exists
- `rating-api` expects to consume `game.ended` events but currently uses HTTP POST

**Fix**:
1. Add Kafka producer dependency (`confluent-kafka` or `kafka-python`)
2. Create event publisher service
3. Publish events after domain events created:
   - `GameCreated` → `game-events` topic (partitioned by gameId)
   - `MovePlayed` → `game-events` topic (partitioned by gameId)
   - `GameEnded` → `game-events` topic (partitioned by gameId)
4. Use event schema registry (e.g., Confluent Schema Registry)
5. Add idempotency keys to events
6. Add event publishing to Bruno tests

**Acceptance Criteria**:
- All domain events published to Kafka
- Events partitioned by gameId for ordering
- Event schemas versioned in schema registry
- Events consumed by game-history-api successfully
- Events consumed by rating-api successfully
- Idempotency maintained (events published once)
- Bruno tests verify event publishing

**Risks**: 
- Kafka dependency adds operational complexity
- Event ordering must be maintained (partition by gameId)
- Schema versioning requires governance
- Breaking changes affect downstream consumers

---

### AUD-008: Implement Game State Sharding (live-game-api)
**Priority**: P0  
**Owner**: live-game-api  
**Effort**: L (4-5 weeks)  
**Problem**: No sharding strategy, cannot scale horizontally. Database becomes bottleneck.  
**Evidence**: No sharding logic in codebase, no gameId-based routing

**Fix**:
1. Implement gameId-based sharding:
   - Hash gameId to determine shard (consistent hashing)
   - Route requests to correct shard instance
   - Use Redis for shard routing table
   - Add health checks and rebalancing
2. Implement in-memory state with durable append log:
   - Keep active games in Redis (in-memory, TTL 1 hour)
   - Append all moves to Kafka (durable log, partitioned by gameId)
   - Snapshot to Postgres every 10 moves or 5 minutes
   - Replay from Kafka on shard recovery
3. Add shard management:
   - Shard health checks
   - Automatic rebalancing
   - Shard assignment API

**Acceptance Criteria**:
- Games distributed across shards (consistent hashing)
- Shard routing works correctly (requests routed to correct shard)
- In-memory state with durable log (Redis + Kafka)
- Snapshots created periodically (every 10 moves or 5 minutes)
- Can replay from Kafka on shard recovery
- Can scale to 20M games/day (tested with load tests)
- Shard health monitoring and alerting

**Risks**:
- Shard rebalancing complexity (games may need to move between shards)
- Data consistency during rebalancing
- Shard failure recovery (replay from Kafka)
- Operational complexity (monitoring multiple shards)

---

### AUD-001: Implement WebSocket Client (app)
**Priority**: P0  
**Owner**: app  
**Effort**: M (2-3 weeks)  
**Problem**: No WebSocket implementation, clients must poll, creating massive load.  
**Evidence**: 
- `app/platform/environment.ts` has WebSocket URL but no client code
- `app/docs/architecture.md` mentions WebSocket but not implemented
- `app/services/api/live-game.api.ts` only has HTTP methods

**Fix**:
1. Create `app/services/ws/GameWebSocket.ts` with:
   - WebSocket connection management
   - Reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
   - Event subscription/unsubscription
   - Heartbeat/ping to keep connection alive
   - Resume token support for reconnection
2. Create `app/features/game/hooks/useGameWebSocket.ts` hook
3. Replace polling in `app/features/board/screens/PlayScreen.tsx` with WebSocket
4. Add fallback to polling if WebSocket unavailable
5. Add connection state management (connecting, connected, disconnected, reconnecting)

**Acceptance Criteria**:
- WebSocket connects successfully to live-game-api
- Reconnects automatically on disconnect (exponential backoff)
- Receives game state updates in real-time (moves, clock updates, game end)
- Fallback to polling if WebSocket fails
- Reduces polling load by 90%+ (measured)
- Connection state visible to user
- Resume token allows reconnection without losing state

**Risks**: 
- WebSocket connection management complexity
- Sticky session requirements (must route to same instance)
- Reconnection logic complexity
- Battery drain on mobile devices (keep-alive)

---

### AUD-019: Consume game.ended Events (rating-api)
**Priority**: P0  
**Owner**: rating-api  
**Effort**: M (2-3 weeks)  
**Problem**: Uses HTTP POST instead of events, tight coupling to live-game-api.  
**Evidence**: `rating-api/app/api/routes/v1/game_results.py` - HTTP endpoint

**Fix**:
1. Add Kafka consumer for `game.ended` events
2. Process events asynchronously:
   - Consume from `game-events` topic (filter for `GameEnded` events)
   - Process events in background workers
   - Maintain idempotency (existing `(game_id, pool_id)` uniqueness)
3. Keep HTTP endpoint for backward compatibility (deprecate with timeline)
4. Migrate to event-driven architecture:
   - Remove HTTP endpoint after migration period
   - Update documentation
   - Update Bruno tests

**Acceptance Criteria**:
- Consumes `game.ended` events from Kafka topic `game-events`
- Processes events asynchronously (background workers)
- HTTP endpoint deprecated (returns 410 Gone after migration period)
- Idempotency maintained (same game_id processed once)
- Can handle 20M games/day (tested with load tests)
- Bruno tests verify event consumption

**Risks**:
- Event ordering (must process in order per game)
- Event schema changes (versioning)
- Migration period (both HTTP and events during transition)

---

### AUD-004: Implement MatchCreated Event Publishing (matchmaking-api)
**Priority**: P0  
**Owner**: matchmaking-api  
**Effort**: M (1-2 weeks)  
**Problem**: MatchCreated event mentioned but not published.  
**Evidence**: 
- `matchmaking-api/docs/domain.md` mentions MatchCreated event
- `matchmaking-api/app/domain/services/matchmaking_service.py` creates matches but no event publishing

**Fix**:
1. Add Kafka producer dependency
2. Create event schema: `MatchCreatedEvent {match_id, white_player_id, black_player_id, game_id, time_control, created_at}`
3. Publish event after successful match creation in `matchmaking_service.py`
4. Add event publishing to Bruno tests

**Acceptance Criteria**:
- MatchCreated events published to Kafka topic `matchmaking.matches`
- Event schema versioned
- Events consumed by downstream services (if any)
- Idempotency maintained (event published once per match)
- Bruno tests verify event publishing

**Risks**: Kafka dependency, event schema versioning

---

## P1 - Should Fix (High Risk)

### AUD-002: Add Client Correlation IDs (app)
**Priority**: P1  
**Owner**: app  
**Effort**: S (1-2 days)  
**Problem**: Cannot trace requests across services.  
**Evidence**: No correlation ID in `app/services/api/base.api.ts`

**Fix**:
1. Generate correlation ID (UUID) per request in `app/services/api/base.api.ts`
2. Add `X-Request-ID` header to all API calls
3. Include correlation ID in error logs
4. Pass correlation ID to WebSocket connections

**Acceptance Criteria**:
- All API requests include X-Request-ID header
- Correlation ID logged with errors
- Can trace request flow across services
- Correlation ID visible in distributed traces

**Risks**: None

---

### AUD-003: Implement Offline Queue (app)
**Priority**: P1  
**Owner**: app  
**Effort**: M (1-2 weeks)  
**Problem**: Moves lost if network fails.  
**Evidence**: No offline handling in `app/features/board/hooks/useGameState.ts`

**Fix**:
1. Add offline queue using AsyncStorage
2. Queue moves when network unavailable
3. Retry queued moves when network restored
4. Show user notification when moves queued
5. Add queue size limits and cleanup

**Acceptance Criteria**:
- Moves saved to queue if network fails
- Moves retried when network restored
- User notified of queued moves
- Queue persisted across app restarts
- Queue size limits enforced (max 100 moves)

**Risks**: Queue can grow large, need cleanup strategy

---

### AUD-005: Add Circuit Breakers for External Dependencies (matchmaking-api)
**Priority**: P1  
**Owner**: matchmaking-api  
**Effort**: M (1 week)  
**Problem**: No circuit breakers, service fails if live-game-api is down.  
**Evidence**: `matchmaking-api/app/infrastructure/external/live_game_api.py` - Direct HTTP calls

**Fix**:
1. Add circuit breaker library (e.g., `pybreaker`)
2. Wrap live-game-api calls with circuit breaker
3. Add fallback: queue failed matches for retry
4. Add metrics for circuit breaker state

**Acceptance Criteria**:
- Circuit breaker opens after 5 failures in 60s
- Failed matches queued for retry
- Circuit breaker metrics exposed
- Service degrades gracefully

**Risks**: Circuit breaker complexity, fallback queue management

---

### AUD-006: Implement Rate Limiting (matchmaking-api)
**Priority**: P1  
**Owner**: matchmaking-api  
**Effort**: S (3-5 days)  
**Problem**: No rate limiting, vulnerable to queue flooding.  
**Evidence**: No rate limiting middleware found

**Fix**:
1. Add rate limiting middleware (e.g., `slowapi`)
2. Limit queue joins: max 1 per user per 10 seconds
3. Add queue size limits (max 100K entries)
4. Add IP-based rate limiting for abuse prevention

**Acceptance Criteria**:
- Rate limiting enforced on queue join endpoint
- Queue size limits enforced
- Rate limit metrics exposed
- Abuse attempts logged and alerted

**Risks**: False positives blocking legitimate users

---

### AUD-009: Implement WebSocket Support (live-game-api)
**Priority**: P1  
**Owner**: live-game-api  
**Effort**: M (2-3 weeks)  
**Problem**: WebSocket documented but not implemented.  
**Evidence**: `live-game-api/docs/RUNBOOK.md` mentions WebSocket but no routes found

**Fix**:
1. Add WebSocket routes: `/ws/games/{game_id}`
2. Implement connection management:
   - Subscribe to game updates
   - Unsubscribe on disconnect
   - Heartbeat/ping to keep connection alive
3. Implement sticky sessions:
   - Use session affinity (cookie-based or header-based)
   - Route WebSocket to same instance as game state
4. Add reconnection support:
   - Client reconnects with resume token
   - Server replays missed events

**Acceptance Criteria**:
- WebSocket connects successfully
- Real-time game updates delivered
- Sticky sessions work correctly
- Reconnection supported
- Reduces polling load by 90%+

**Risks**: Connection management complexity, sticky session requirements

---

### AUD-010: Add Timeout Budgets (bot-orchestrator-api)
**Priority**: P1  
**Owner**: bot-orchestrator-api  
**Effort**: S (2-3 days)  
**Problem**: No timeout budgets, bot moves can hang.  
**Evidence**: No timeout configuration found

**Fix**:
1. Add timeout configuration:
   - Engine query: 20s max
   - Knowledge query: 5s max
   - Total bot move: 30s max
2. Enforce timeouts in code
3. Add timeout metrics

**Acceptance Criteria**:
- Timeouts enforced
- Bot moves complete within 30s
- Timeout metrics exposed

**Risks**: Timeouts too aggressive may cause failures

---

### AUD-011: Add Fallback Behavior (bot-orchestrator-api)
**Priority**: P1  
**Owner**: bot-orchestrator-api  
**Effort**: S (2-3 days)  
**Problem**: No fallback if engine fails.  
**Evidence**: No fallback logic found

**Fix**:
1. Add fallback: return random legal move if engine fails
2. Add error handling: log error, return fallback move
3. Document failure modes

**Acceptance Criteria**:
- Fallback move returned if engine fails
- Errors logged
- Games can progress even if engine fails

**Risks**: Fallback moves may be poor quality

---

### AUD-015: Implement Caching Strategy (chess-knowledge-api)
**Priority**: P1  
**Owner**: chess-knowledge-api  
**Effort**: M (1-2 weeks)  
**Problem**: No caching, high file system load.  
**Evidence**: No caching implementation

**Fix**:
1. Add Redis caching for opening books and tablebases
2. Cache key: position FEN + depth
3. Cache TTL: 24 hours
4. Add cache hit/miss metrics

**Acceptance Criteria**:
- Cache hit rate > 80%
- p95 latency < 50ms
- Cache metrics exposed
- Cache invalidation strategy

**Risks**: Cache invalidation complexity

---

### AUD-017: Add Attempt Idempotency (puzzle-api)
**Priority**: P1  
**Owner**: puzzle-api  
**Effort**: S (2-3 days)  
**Problem**: No idempotency, duplicate attempts possible.  
**Evidence**: No idempotency keys found

**Fix**:
1. Add idempotency keys to puzzle attempts
2. Unique constraint on `(user_id, puzzle_id, attempt_id)`
3. Return same result for duplicate attempts

**Acceptance Criteria**:
- Same attempt ID returns same result
- No duplicates counted
- Idempotency tested

**Risks**: None

---

### AUD-018: Implement Feed Caching (puzzle-api)
**Priority**: P1  
**Owner**: puzzle-api  
**Effort**: S (3-5 days)  
**Problem**: No caching, high database load.  
**Evidence**: Redis mentioned but not implemented

**Fix**:
1. Add Redis caching for daily puzzle
2. Cache key: `daily_puzzle:{date}`
3. Cache TTL: 24 hours
4. Add cache hit/miss metrics

**Acceptance Criteria**:
- Cache hit rate > 90%
- p95 < 100ms
- Cache metrics exposed

**Risks**: Cache invalidation complexity

---

### AUD-020: Implement Backfill Strategy (rating-api)
**Priority**: P1  
**Owner**: rating-api  
**Effort**: M (1-2 weeks)  
**Problem**: No backfill, cannot recover from data loss.  
**Evidence**: No backfill tooling

**Fix**:
1. Add backfill tooling to replay events from Kafka
2. Add admin endpoint for backfill
3. Document backfill procedure

**Acceptance Criteria**:
- Can replay events from Kafka
- Backfill maintains idempotency
- Admin endpoint for backfill

**Risks**: Backfill complexity, data consistency

---

### AUD-021: Implement Leaderboard Materialization (rating-api)
**Priority**: P1  
**Owner**: rating-api  
**Effort**: M (2-3 weeks)  
**Problem**: No leaderboard, cannot serve queries efficiently.  
**Evidence**: No leaderboard table

**Fix**:
1. Create leaderboard table
2. Materialize leaderboard on rating updates
3. Add recomputation logic
4. Add leaderboard API endpoints

**Acceptance Criteria**:
- Leaderboard table exists
- Materialized on rating updates
- Can recompute leaderboard
- API endpoints for leaderboard queries

**Risks**: Materialization complexity, query performance

---

## P2 - Nice to Have (Optimization)

### AUD-012: Add Circuit Breakers (bot-orchestrator-api)
**Priority**: P2  
**Owner**: bot-orchestrator-api  
**Effort**: S (3-5 days)  
**Problem**: No circuit breakers for external dependencies.  
**Fix**: Add circuit breakers for engine and knowledge clients  
**Acceptance Criteria**: Circuit breakers open after failures, fallback behavior

---

### AUD-013: Add Fallback Behavior (engine-cluster-api)
**Priority**: P2  
**Owner**: engine-cluster-api  
**Effort**: S (2-3 days)  
**Problem**: No fallback if engine unavailable.  
**Fix**: Implement mock evaluation fallback  
**Acceptance Criteria**: Fallback returns valid move if engine fails

---

### AUD-014: Add SLA Tiers (engine-cluster-api)
**Priority**: P2  
**Owner**: engine-cluster-api  
**Effort**: M (1 week)  
**Problem**: No SLA tiers, cannot prioritize.  
**Fix**: Define SLA tiers (critical, normal, low) with time budgets  
**Acceptance Criteria**: Requests prioritized by tier, time budgets enforced

---

### AUD-016: Add CDN Support (chess-knowledge-api)
**Priority**: P2  
**Owner**: chess-knowledge-api  
**Effort**: M (1-2 weeks)  
**Problem**: No CDN, poor global performance.  
**Fix**: Configure CDN for static content (opening books, tablebases)  
**Acceptance Criteria**: CDN serves 90%+ of requests, global p95 < 100ms

---

## Summary

**P0 Items**: 5 items, ~12-16 weeks total effort  
**P1 Items**: 12 items, ~8-12 weeks total effort  
**P2 Items**: 4 items, ~4-6 weeks total effort  

**Total Estimated Time to Scale Readiness**: 12-16 weeks (P0 items) + 8-12 weeks (P1 items) = **20-28 weeks** with dedicated team focus.

