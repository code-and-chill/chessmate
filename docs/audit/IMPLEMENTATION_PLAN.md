---
title: Implementation Plan - Scale Readiness Fixes
service: global
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Implementation Plan: Scale Readiness Fixes

**Goal**: Fix critical gaps to achieve readiness for 20M games/day, 200M users, 200K-2M DAU  
**Timeline**: 20-28 weeks (P0 + P1 items)  
**Team Size**: 4-6 engineers (2 backend, 2 frontend, 1-2 infrastructure)

## Phase Overview

```
Phase 1: Foundation (Weeks 1-4) - Event Infrastructure
Phase 2: Core Scaling (Weeks 5-12) - Horizontal Scaling & WebSocket
Phase 3: Resilience (Weeks 13-18) - Circuit Breakers & Rate Limiting
Phase 4: Observability (Weeks 19-22) - Metrics, Tracing, SLOs
Phase 5: Optimization (Weeks 23-28) - Caching, Performance, Polish
```

---

## Phase 1: Foundation - Event Infrastructure (Weeks 1-4)

**Goal**: Establish event-driven architecture foundation  
**Dependencies**: None (foundational)  
**Team**: 2 backend engineers

### Week 1-2: Kafka Infrastructure Setup

**Tasks**:
1. **Set up Kafka cluster** (Infrastructure)
   - Provision Kafka cluster (3 brokers, replication factor 3)
   - Create topics: `game-events` (64-128 partitions), `matchmaking.matches` (32 partitions)
   - Set up Confluent Schema Registry (or equivalent)
   - Configure retention policies (7 days for hot, longer for cold)
   - Set up monitoring (Kafka lag, throughput, error rates)

2. **Define Event Schemas** (All services)
   - Create schema definitions for all events:
     - `GameCreated` event schema
     - `MovePlayed` event schema
     - `GameEnded` event schema
     - `MatchCreated` event schema
   - Version schemas (v1, v2, etc.)
   - Document schema evolution policy
   - Set up schema registry integration

**Deliverables**:
- Kafka cluster running in staging
- Event schemas defined and registered
- Schema registry configured
- Monitoring dashboards for Kafka

**Acceptance Criteria**:
- Kafka cluster healthy (all brokers up, replication working)
- Topics created with correct partitions
- Schema registry accessible
- Can publish/consume test events

---

### Week 3-4: Implement Event Publishing (live-game-api)

**Tasks**:
1. **Add Kafka Producer Library** (live-game-api)
   - Add `confluent-kafka` or `kafka-python` dependency
   - Create `app/infrastructure/events/kafka_producer.py`
   - Implement producer with:
     - Connection pooling
     - Error handling and retries
     - Schema registry integration
     - Partitioning by gameId

2. **Create Event Publisher Service** (live-game-api)
   - Create `app/infrastructure/events/event_publisher.py`
   - Implement methods:
     - `publish_game_created(game: Game)`
     - `publish_move_played(game: Game, move: Move)`
     - `publish_game_ended(game: Game)`
   - Add idempotency keys to events
   - Add correlation IDs

3. **Integrate with Domain Service** (live-game-api)
   - Modify `app/domain/services/game_service.py`:
     - After creating game → publish `GameCreated` event
     - After playing move → publish `MovePlayed` event
     - After game ends → publish `GameEnded` event
   - Handle publishing errors (log, don't fail game operations)
   - Add event publishing to transaction (outbox pattern or async)

4. **Add Tests** (live-game-api)
   - Unit tests for event publisher
   - Integration tests with test Kafka cluster
   - Verify events published with correct schema
   - Verify partitioning by gameId

**Deliverables**:
- Kafka producer integrated in live-game-api
- Events published for all game lifecycle events
- Tests passing
- Events visible in Kafka

**Acceptance Criteria**:
- All domain events published to Kafka
- Events partitioned by gameId
- Event schemas versioned
- Idempotency maintained
- Tests passing (unit + integration)

**Risks & Mitigation**:
- **Risk**: Kafka publishing fails, blocks game operations
  - **Mitigation**: Use async publishing with retry queue, don't block game operations
- **Risk**: Event ordering issues
  - **Mitigation**: Partition by gameId ensures ordering per game

---

### Week 3-4: Implement MatchCreated Event (matchmaking-api)

**Tasks**:
1. **Add Kafka Producer** (matchmaking-api)
   - Add Kafka producer dependency
   - Create event publisher service
   - Define `MatchCreated` event schema

2. **Publish MatchCreated Events** (matchmaking-api)
   - Modify `app/domain/services/matchmaking_service.py`:
     - After successful match creation → publish `MatchCreated` event
   - Add event publishing to match creation flow

3. **Add Tests** (matchmaking-api)
   - Test event publishing
   - Verify event schema

**Deliverables**:
- MatchCreated events published
- Tests passing

**Acceptance Criteria**:
- MatchCreated events published to Kafka
- Event schema versioned
- Tests passing

---

## Phase 2: Core Scaling - Horizontal Scaling & WebSocket (Weeks 5-12)

**Goal**: Enable horizontal scaling for live-game-api and real-time updates  
**Dependencies**: Phase 1 complete (events working)  
**Team**: 2 backend engineers, 1 frontend engineer

### Week 5-7: Game State Sharding (live-game-api)

**Tasks**:
1. **Design Sharding Strategy** (live-game-api)
   - Document sharding architecture:
     - Consistent hashing for gameId → shard mapping
     - Shard assignment algorithm
     - Rebalancing strategy
   - Design in-memory state + durable append log:
     - Redis for active game state (TTL 1 hour)
     - Kafka for durable append log (all moves)
     - Postgres for snapshots (every 10 moves or 5 minutes)

2. **Implement Shard Routing** (live-game-api)
   - Create `app/infrastructure/sharding/shard_router.py`:
     - Hash gameId to determine shard
     - Route requests to correct shard instance
     - Use Redis for shard routing table
   - Add shard middleware to API routes
   - Add health checks for shards

3. **Implement In-Memory State** (live-game-api)
   - Create `app/infrastructure/cache/game_cache.py`:
     - Store active games in Redis
     - TTL 1 hour after game ends
     - Cache key: `game:{gameId}`
   - Modify game service to:
     - Read from cache first, fallback to DB
     - Write to cache after updates
     - Write to Kafka (durable log)

4. **Implement Snapshotting** (live-game-api)
   - Create snapshot service:
     - Snapshot game state to Postgres every 10 moves
     - Or snapshot every 5 minutes for active games
     - Store snapshot metadata (gameId, move_count, timestamp)
   - Add snapshot recovery:
     - Load from snapshot on shard recovery
     - Replay from Kafka if snapshot missing

5. **Add Shard Management** (live-game-api)
   - Create shard health check endpoint
   - Add shard assignment API
   - Add rebalancing logic (future: automatic rebalancing)
   - Add monitoring for shard distribution

**Deliverables**:
- Sharding architecture documented
- Shard routing implemented
- In-memory state with Redis
- Snapshotting implemented
- Shard management APIs

**Acceptance Criteria**:
- Games distributed across shards (consistent hashing)
- Shard routing works correctly
- In-memory state with durable log (Redis + Kafka)
- Snapshots created periodically
- Can replay from Kafka on shard recovery
- Load tests: Can handle 2k games/sec peak

**Risks & Mitigation**:
- **Risk**: Shard rebalancing complexity
  - **Mitigation**: Start with manual rebalancing, automate later
- **Risk**: Data consistency during rebalancing
  - **Mitigation**: Use distributed locks, replay from Kafka

---

### Week 8-10: WebSocket Implementation (live-game-api)

**Tasks**:
1. **Add WebSocket Support** (live-game-api)
   - Add WebSocket routes: `/ws/games/{game_id}`
   - Implement connection management:
     - Subscribe to game updates
     - Unsubscribe on disconnect
     - Heartbeat/ping to keep connection alive
   - Add connection state tracking (Redis)
   - Add resume token support

2. **Implement Sticky Sessions** (live-game-api)
   - Configure load balancer for session affinity
   - Use cookie-based or header-based routing
   - Route WebSocket to same instance as game state
   - Add session affinity middleware

3. **Add Event Broadcasting** (live-game-api)
   - After game state updates → broadcast to WebSocket subscribers
   - Use Redis pub/sub for cross-instance broadcasting
   - Add connection pool management

4. **Add Reconnection Support** (live-game-api)
   - Generate resume tokens
   - Store connection state in Redis
   - Replay missed events on reconnection

5. **Add Tests** (live-game-api)
   - Test WebSocket connection
   - Test event broadcasting
   - Test reconnection
   - Test sticky sessions

**Deliverables**:
- WebSocket routes implemented
- Sticky sessions working
- Event broadcasting working
- Reconnection support

**Acceptance Criteria**:
- WebSocket connects successfully
- Real-time game updates delivered
- Sticky sessions work correctly
- Reconnection supported
- Load tests: 10K concurrent WebSocket connections

---

### Week 11-12: WebSocket Client (app)

**Tasks**:
1. **Create WebSocket Client** (app)
   - Create `app/services/ws/GameWebSocket.ts`:
     - WebSocket connection management
     - Reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
     - Event subscription/unsubscription
     - Heartbeat/ping to keep connection alive
     - Resume token support

2. **Create WebSocket Hook** (app)
   - Create `app/features/game/hooks/useGameWebSocket.ts`:
     - Hook for WebSocket connection
     - Connection state management
     - Event handling

3. **Replace Polling** (app)
   - Modify `app/features/board/screens/PlayScreen.tsx`:
     - Replace polling with WebSocket
     - Add fallback to polling if WebSocket unavailable
     - Add connection state UI

4. **Add Offline Queue** (app)
   - Create `app/services/offline/OfflineQueue.ts`:
     - Queue moves when network unavailable
     - Retry queued moves when network restored
     - Persist queue to AsyncStorage
   - Add user notifications for queued moves

5. **Add Tests** (app)
   - Test WebSocket connection
   - Test reconnection
   - Test offline queue

**Deliverables**:
- WebSocket client implemented
- Polling replaced with WebSocket
- Offline queue implemented
- Tests passing

**Acceptance Criteria**:
- WebSocket connects to live-game-api
- Reconnects automatically on disconnect
- Receives real-time game updates
- Fallback to polling if WebSocket fails
- Offline queue works correctly
- Reduces polling load by 90%+

---

## Phase 3: Resilience - Circuit Breakers & Rate Limiting (Weeks 13-18)

**Goal**: Add resilience patterns and abuse protection  
**Dependencies**: Phase 2 complete (scaling working)  
**Team**: 2 backend engineers

### Week 13-14: Circuit Breakers

**Tasks**:
1. **Add Circuit Breaker Library** (All services)
   - Add `pybreaker` or similar to Python services
   - Create circuit breaker wrapper utility

2. **Implement Circuit Breakers** (matchmaking-api, bot-orchestrator-api)
   - Wrap live-game-api calls with circuit breaker (matchmaking-api)
   - Wrap engine-cluster-api calls with circuit breaker (bot-orchestrator-api)
   - Wrap chess-knowledge-api calls with circuit breaker (bot-orchestrator-api)
   - Configure thresholds (5 failures in 60s → open)
   - Add fallback behavior:
     - matchmaking-api: Queue failed matches for retry
     - bot-orchestrator-api: Return random legal move

3. **Add Circuit Breaker Metrics** (All services)
   - Expose circuit breaker state (open/closed/half-open)
   - Add metrics for circuit breaker transitions
   - Add alerts for circuit breaker opens

**Deliverables**:
- Circuit breakers implemented
- Fallback behavior working
- Metrics exposed

**Acceptance Criteria**:
- Circuit breakers open after failures
- Fallback behavior works correctly
- Metrics exposed
- Alerts configured

---

### Week 15-16: Rate Limiting

**Tasks**:
1. **Add Rate Limiting Middleware** (All APIs)
   - Add `slowapi` or similar to Python services
   - Create rate limiting configuration:
     - Per-user rate limits
     - Per-endpoint rate limits
     - IP-based rate limits

2. **Implement Rate Limits** (live-game-api, matchmaking-api)
   - live-game-api:
     - Max 10 moves per minute per user
     - Max 100 move validations per second per user
   - matchmaking-api:
     - Max 1 queue join per user per 10 seconds
     - Max queue size: 100K entries

3. **Add Rate Limit Metrics** (All APIs)
   - Track rate limit hits
   - Expose rate limit metrics
   - Add alerts for rate limit abuse

**Deliverables**:
- Rate limiting implemented
- Rate limits configured
- Metrics exposed

**Acceptance Criteria**:
- Rate limiting enforced
- Abuse attempts blocked
- Metrics exposed
- Alerts configured

---

### Week 17-18: Timeout Budgets & Fallbacks

**Tasks**:
1. **Add Timeout Budgets** (bot-orchestrator-api, engine-cluster-api)
   - bot-orchestrator-api:
     - Engine query: 20s max
     - Knowledge query: 5s max
     - Total bot move: 30s max
   - engine-cluster-api:
     - Evaluation: 30s max (configurable by SLA tier)

2. **Implement Fallback Behavior** (bot-orchestrator-api, engine-cluster-api)
   - bot-orchestrator-api: Return random legal move if engine fails
   - engine-cluster-api: Return mock evaluation if engine unavailable

3. **Add Timeout Metrics** (All services)
   - Track timeout occurrences
   - Expose timeout metrics
   - Add alerts for timeout spikes

**Deliverables**:
- Timeout budgets implemented
- Fallback behavior working
- Metrics exposed

**Acceptance Criteria**:
- Timeouts enforced
- Fallback behavior works correctly
- Metrics exposed

---

## Phase 4: Observability - Metrics, Tracing, SLOs (Weeks 19-22)

**Goal**: Add comprehensive observability  
**Dependencies**: Phases 1-3 complete  
**Team**: 1 infrastructure engineer, 1 backend engineer

### Week 19-20: Metrics & Tracing

**Tasks**:
1. **Set up Prometheus** (Infrastructure)
   - Deploy Prometheus
   - Configure scraping for all services
   - Set up retention policies

2. **Add Prometheus Metrics** (All services)
   - Add metrics libraries to all services
   - Implement metrics:
     - Request counts by endpoint
     - Response latencies (p50, p95, p99)
     - Error rates
     - Business metrics (games created, moves played, etc.)
   - Expose `/metrics` endpoint

3. **Set up OpenTelemetry** (Infrastructure)
   - Deploy OpenTelemetry collector
   - Configure trace export (Jaeger or similar)

4. **Add Distributed Tracing** (All services)
   - Add OpenTelemetry SDK to all services
   - Instrument HTTP requests
   - Instrument database queries
   - Instrument external service calls
   - Add correlation IDs to all requests

5. **Set up Grafana** (Infrastructure)
   - Deploy Grafana
   - Create dashboards for all services
   - Add alerting rules

**Deliverables**:
- Prometheus collecting metrics
- OpenTelemetry tracing working
- Grafana dashboards created
- Alerts configured

**Acceptance Criteria**:
- Metrics collected for all services
- Traces visible in Jaeger
- Dashboards show key metrics
- Alerts fire on thresholds

---

### Week 21-22: SLOs & Runbooks

**Tasks**:
1. **Define SLOs** (All services)
   - Document SLOs for each service:
     - Availability targets (99.9%, 99.95%, etc.)
     - Latency targets (p95, p99)
     - Error rate targets
   - Add SLO tracking to dashboards

2. **Create Runbooks** (All services)
   - Document common incidents
   - Document resolution procedures
   - Add runbooks to Grafana

3. **Add Correlation IDs** (All services)
   - Add correlation ID generation
   - Propagate correlation IDs across services
   - Include in logs and traces

**Deliverables**:
- SLOs defined and tracked
- Runbooks created
- Correlation IDs working

**Acceptance Criteria**:
- SLOs defined for all services
- SLO tracking in dashboards
- Runbooks accessible
- Correlation IDs in all logs

---

## Phase 5: Optimization - Caching, Performance, Polish (Weeks 23-28)

**Goal**: Optimize performance and add caching  
**Dependencies**: Phases 1-4 complete  
**Team**: 2 backend engineers

### Week 23-24: Caching Strategy

**Tasks**:
1. **Implement Redis Caching** (chess-knowledge-api, puzzle-api)
   - chess-knowledge-api:
     - Cache opening book moves (key: FEN + depth, TTL: 24h)
     - Cache tablebase results (key: FEN, TTL: 24h)
   - puzzle-api:
     - Cache daily puzzle (key: `daily_puzzle:{date}`, TTL: 24h)
     - Cache puzzle feeds (key: `puzzle_feed:{user_id}`, TTL: 1h)

2. **Add Cache Metrics** (All services)
   - Track cache hit/miss rates
   - Track cache latency
   - Add cache invalidation strategies

**Deliverables**:
- Redis caching implemented
- Cache metrics exposed
- Cache invalidation working

**Acceptance Criteria**:
- Cache hit rate > 80% (chess-knowledge-api)
- Cache hit rate > 90% (puzzle-api)
- p95 latency < 50ms (cached requests)

---

### Week 25-26: Event Consumption (rating-api)

**Tasks**:
1. **Add Kafka Consumer** (rating-api)
   - Add Kafka consumer library
   - Create consumer for `game.ended` events
   - Process events asynchronously (background workers)

2. **Migrate from HTTP to Events** (rating-api)
   - Keep HTTP endpoint for backward compatibility (deprecate)
   - Process events from Kafka
   - Maintain idempotency (existing `(game_id, pool_id)` uniqueness)

3. **Add Backfill Tooling** (rating-api)
   - Create admin endpoint for backfill
   - Replay events from Kafka
   - Document backfill procedure

**Deliverables**:
- Kafka consumer implemented
- Events processed asynchronously
- Backfill tooling available

**Acceptance Criteria**:
- Consumes game.ended events from Kafka
- Processes events asynchronously
- HTTP endpoint deprecated
- Backfill works correctly

---

### Week 27-28: Leaderboard & Polish

**Tasks**:
1. **Implement Leaderboard** (rating-api)
   - Create leaderboard table
   - Materialize leaderboard on rating updates
   - Add recomputation logic
   - Add leaderboard API endpoints

2. **Add Attempt Idempotency** (puzzle-api)
   - Add idempotency keys to puzzle attempts
   - Unique constraint on `(user_id, puzzle_id, attempt_id)`
   - Return same result for duplicate attempts

3. **Performance Optimization** (All services)
   - Database query optimization
   - Connection pooling tuning
   - Async processing improvements

**Deliverables**:
- Leaderboard implemented
- Attempt idempotency working
- Performance optimizations applied

**Acceptance Criteria**:
- Leaderboard queries < 100ms p95
- Attempt idempotency working
- Performance improvements measured

---

## Success Criteria

### Phase 1 Success
- ✅ Events published to Kafka
- ✅ Events consumed by downstream services
- ✅ Event schemas versioned

### Phase 2 Success
- ✅ Games distributed across shards
- ✅ WebSocket working with sticky sessions
- ✅ Can handle 2k games/sec peak
- ✅ Polling load reduced by 90%+

### Phase 3 Success
- ✅ Circuit breakers protecting services
- ✅ Rate limiting preventing abuse
- ✅ Timeout budgets enforced

### Phase 4 Success
- ✅ Metrics collected for all services
- ✅ Distributed tracing working
- ✅ SLOs defined and tracked
- ✅ Runbooks available

### Phase 5 Success
- ✅ Caching reducing load
- ✅ Events consumed asynchronously
- ✅ Leaderboard queries fast
- ✅ Performance targets met

## Risk Management

### High-Risk Items
1. **Kafka Publishing Blocking Game Operations**
   - Mitigation: Use async publishing with retry queue
   - Fallback: Log events, don't fail game operations

2. **Shard Rebalancing Complexity**
   - Mitigation: Start with manual rebalancing, automate later
   - Fallback: Use distributed locks, replay from Kafka

3. **WebSocket Connection Management**
   - Mitigation: Use Redis for connection state, add health checks
   - Fallback: Graceful degradation to polling

### Dependencies
- **Kafka Cluster**: Must be provisioned before Phase 1
- **Redis Cluster**: Must be provisioned before Phase 2
- **Load Balancer**: Must support sticky sessions before Phase 2
- **Monitoring Infrastructure**: Must be set up before Phase 4

## Team Structure

### Backend Team (2 engineers)
- Focus: live-game-api, matchmaking-api, event infrastructure
- Skills: Python, FastAPI, Kafka, Redis, distributed systems

### Frontend Team (1 engineer)
- Focus: app WebSocket client, offline queue
- Skills: TypeScript, React Native, WebSocket

### Infrastructure Team (1 engineer)
- Focus: Kafka, Redis, monitoring, deployment
- Skills: Kubernetes, Kafka, Prometheus, Grafana

### Full-Stack Team (1-2 engineers)
- Focus: rating-api, puzzle-api, chess-knowledge-api
- Skills: Python, FastAPI, database optimization

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|-----------------|
| Phase 1: Foundation | 4 weeks | Event infrastructure, Kafka publishing |
| Phase 2: Core Scaling | 8 weeks | Sharding, WebSocket, offline queue |
| Phase 3: Resilience | 6 weeks | Circuit breakers, rate limiting, timeouts |
| Phase 4: Observability | 4 weeks | Metrics, tracing, SLOs |
| Phase 5: Optimization | 6 weeks | Caching, event consumption, leaderboard |
| **Total** | **28 weeks** | **Scale-ready platform** |

---

*This plan should be reviewed and adjusted based on team capacity, priorities, and discovered complexities during implementation.*

