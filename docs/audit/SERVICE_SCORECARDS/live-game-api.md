---
title: Live Game API Service Scorecard
service: live-game-api
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Service Scorecard: live-game-api

**Service**: live-game-api  
**Status**: ❌ **FAIL**  
**Overall Readiness**: 35%

## Bounded Context Clarity

**Evidence**:
- `live-game-api/docs/overview.md` - Clear purpose: "Real-time game state management"
- `live-game-api/docs/domain.md` - Domain entities: Game, Move, TimeControl
- `live-game-api/app/domain/models/` - Domain models separated from infrastructure
- `live-game-api/docs/ARCHITECTURE.md` - DDD layered architecture documented

**Gaps**:
- No explicit bounded context statement
- Integration boundaries not clearly documented
- No anti-corruption layer for external services

**Fix**:
- Add bounded context statement: "Live Game bounded context - authoritative source for active game state, owns game lifecycle and move validation"
- Document integration boundaries in `live-game-api/docs/domain.md`
- Clarify: matchmaking-api creates games, rating-api consumes game results

**Status**: 🟨 Partial

---

## API Contracts (Stability/Versioning)

**Evidence**:
- `live-game-api/bruno/collections/` - Bruno collections exist
- `live-game-api/app/api/routes/v1/games.py` - API routes with `/v1/` prefix
- `live-game-api/docs/api.md` - API documentation exists

**Gaps**:
- No OpenAPI spec found
- No contract testing documented
- No versioning strategy for breaking changes

**Fix**:
- Generate OpenAPI spec from FastAPI
- Add contract tests using Bruno collections
- Document versioning strategy (backward compatibility policy)

**Status**: 🟨 Partial

---

## Events (Produce/Consume, Schemas, Idempotency)

**Evidence**:
- `live-game-api/app/domain/models/game_ended_event.py` - GameEndedEvent defined
- `live-game-api/app/domain/models/move_played_event.py` - MovePlayedEvent defined
- `live-game-api/app/domain/services/game_service.py` - Events created but not published
- `live-game-api/docs/overview.md` - Mentions "emits GameEnded event" but not implemented

**Gaps**:
- **CRITICAL: No Kafka producer** - Events created but never published
- No event schema registry
- No event versioning
- `game-history-api` expects Kafka topic `game-events` but no producer exists
- `rating-api` expects to consume `game.ended` events but currently uses HTTP POST

**Fix**:
1. Add Kafka producer dependency
2. Publish events after domain events created:
   - `GameCreated` → Kafka topic `game-events`
   - `MovePlayed` → Kafka topic `game-events`
   - `GameEnded` → Kafka topic `game-events`
3. Use event schema registry (e.g., Confluent Schema Registry)
4. Partition by `gameId` for ordering
5. Add idempotency keys to events

**Status**: ❌ Fail (CRITICAL)

---

## Scalability Model (20M games/day readiness)

**Evidence**:
- `live-game-api/docs/ARCHITECTURE.md` - Mentions "stateless service design"
- `live-game-api/docs/RUNBOOK.md` - Mentions "horizontal scaling" but no implementation
- `live-game-api/docs/operations.md` - Mentions connection pooling

**Gaps**:
- **CRITICAL: No sharding strategy** - Cannot scale horizontally without gameId-based routing
- **No WebSocket implementation** - Documented but not in code
- No in-memory state management with durable append log
- No snapshotting strategy
- No gameId-based routing or partitioning

**Impact at Scale**:
- 20M games/day = ~231 games/sec average, >2k games/sec peak
- Cannot distribute game state across instances
- Database becomes bottleneck
- WebSocket connections break on load balancer rotation

**Fix**:
1. Implement gameId-based sharding:
   - Hash gameId to determine shard
   - Route requests to correct shard instance
   - Use consistent hashing for shard assignment
2. Implement in-memory state with durable append log:
   - Keep active games in Redis (in-memory)
   - Append all moves to Kafka (durable log)
   - Snapshot to Postgres periodically (every N moves or time interval)
3. Implement WebSocket with sticky sessions:
   - Use session affinity (sticky sessions)
   - Route WebSocket connections to same instance as game state
4. Add caching strategy:
   - Redis for active game state
   - Cache game state for 1 hour after game ends

**Status**: ❌ Fail (CRITICAL)

---

## Reliability (Timeouts, Retries, Fallbacks)

**Evidence**:
- `live-game-api/app/infrastructure/clients/bot_orchestrator.py` - HTTP client for bot-orchestrator
- `live-game-api/app/core/config.py` - Configuration exists

**Gaps**:
- **No circuit breakers** - If bot-orchestrator is down, bot games fail
- No retry logic for external calls
- No timeout configuration
- No fallback strategy for bot moves

**Fix**:
- Add circuit breaker for bot-orchestrator dependency
- Implement retry with exponential backoff (3 retries, max 10s)
- Add timeout configuration (e.g., 30s for bot move)
- Add fallback: skip bot move if timeout, or use simple fallback move

**Status**: ❌ Fail

---

## Storage Ownership + Migrations

**Evidence**:
- `live-game-api/migrations/` - Alembic migrations exist
- `live-game-api/app/infrastructure/database/` - Database models
- `live-game-api/docs/overview.md` - PostgreSQL schema documented

**Gaps**:
- No explicit schema ownership boundaries documented
- Shared database with other services? (needs verification)
- No migration strategy for snapshots

**Fix**:
- Document schema ownership: `games`, `game_moves` tables owned by live-game-api
- Verify no shared tables with other services
- Document snapshot migration strategy (Postgres → S3)

**Status**: 🟨 Partial

---

## Observability (Metrics/Traces/Logs/SLOs)

**Evidence**:
- `live-game-api/app/domain/services/game_service.py` - Uses Python logging
- `live-game-api/docs/operations.md` - Mentions metrics but not implemented

**Gaps**:
- **No Prometheus metrics** - Cannot monitor game state, move latency, WebSocket connections
- No distributed tracing
- No SLO definitions
- No correlation IDs in logs

**Fix**:
- Add Prometheus metrics:
  - `live_game_active_games` (gauge)
  - `live_game_moves_total` (counter)
  - `live_game_move_latency_seconds` (histogram)
  - `live_game_websocket_connections` (gauge)
  - `live_game_websocket_reconnects_total` (counter)
- Add OpenTelemetry tracing
- Define SLOs: p95 move validation < 50ms, p95 game creation < 100ms
- Add correlation IDs to all requests

**Status**: ❌ Fail

---

## Security/Abuse

**Evidence**:
- `live-game-api/app/api/dependencies.py` - JWT authentication
- `live-game-api/app/core/security.py` - Token validation

**Gaps**:
- **No rate limiting** - Users can spam moves
- No replay protection for moves
- No move validation rate limits
- No abuse detection

**Fix**:
- Add rate limiting: max 10 moves per minute per user
- Add replay protection: track move sequence numbers, reject duplicates
- Add move validation rate limits: max 100 validations per second per user
- Add abuse monitoring and alerting

**Status**: ❌ Fail

---

## Authoritative State Machine

**Evidence**:
- `live-game-api/app/domain/models/game_model.py` - Game state machine
- `live-game-api/app/domain/services/game_service.py` - State transitions

**Gaps**:
- State machine not explicitly documented
- No state transition validation
- No audit log of state changes

**Fix**:
- Document state machine: `waiting_for_opponent` → `in_progress` → `ended`
- Add state transition validation (reject invalid transitions)
- Add audit log of state changes (who, when, why)

**Status**: 🟨 Partial

---

## Move Pipeline (Validate/Apply/Broadcast)

**Evidence**:
- `live-game-api/app/domain/services/game_service.py` - `play_move` method
- Move validation using python-chess library
- Move applied to game state

**Gaps**:
- **No broadcast mechanism** - WebSocket not implemented
- No move pipeline documentation
- No idempotency for moves

**Fix**:
- Document move pipeline: validate → apply → persist → broadcast
- Add move idempotency (track move IDs, reject duplicates)
- Implement WebSocket broadcast for move updates
- Add move pipeline metrics

**Status**: 🟨 Partial

---

## Snapshot & Replay Plan

**Evidence**:
- `live-game-api/docs/overview.md` - Mentions game persistence
- `live-game-api/app/infrastructure/database/` - Database models

**Gaps**:
- **No snapshot strategy** - No periodic snapshots to S3
- No replay capability from events
- No disaster recovery plan

**Fix**:
- Implement snapshot strategy:
  - Snapshot game state to Postgres every 10 moves
  - Archive completed games to S3
  - Replay capability from Kafka events
- Document disaster recovery: replay from Kafka, restore from S3

**Status**: ❌ Fail

---

## Top 3 Risks

### 1. No Event Publishing (P0 - BLOCKING)
**Risk**: Events created but never published to Kafka. Downstream services cannot consume events.

**Impact**: 
- Cannot achieve event-driven architecture
- Tight coupling via HTTP calls
- No replay capability

**Fix**: Implement Kafka producer for all domain events.

---

### 2. No Sharding Strategy (P0 - BLOCKING)
**Risk**: Cannot scale horizontally. Database becomes bottleneck.

**Impact**:
- Cannot achieve 20M games/day
- Single point of failure
- Poor performance at scale

**Fix**: Implement gameId-based sharding with in-memory state and durable append log.

---

### 3. No WebSocket Implementation (P1 - HIGH RISK)
**Risk**: Clients must poll, creating massive load.

**Impact**:
- 200K-2M DAU polling every few seconds
- Unnecessary database load
- Poor UX

**Fix**: Implement WebSocket with sticky sessions.

---

## P0 Remediation Items

### AUD-007: Implement Kafka Event Publishing
**Owner**: live-game-api  
**Problem**: Events created but never published  
**Evidence**: 
- `live-game-api/app/domain/services/game_service.py` creates events but no Kafka producer
- `game-history-api` expects Kafka topic `game-events`

**Fix**:
1. Add Kafka producer dependency (`confluent-kafka` or `kafka-python`)
2. Create event publisher service
3. Publish events after domain events created:
   - `GameCreated` → `game-events` topic
   - `MovePlayed` → `game-events` topic  
   - `GameEnded` → `game-events` topic
4. Partition by `gameId` for ordering
5. Add event schema registry integration
6. Add idempotency keys to events

**Acceptance Criteria**:
- All domain events published to Kafka
- Events partitioned by gameId
- Event schemas versioned
- Events consumed by game-history-api
- Idempotency maintained

**Risks**: Kafka dependency, event ordering, schema versioning

---

### AUD-008: Implement Game State Sharding
**Owner**: live-game-api  
**Problem**: No sharding strategy, cannot scale horizontally  
**Evidence**: No sharding logic in codebase

**Fix**:
1. Implement gameId-based sharding:
   - Hash gameId to determine shard (consistent hashing)
   - Route requests to correct shard instance
   - Use Redis for shard routing table
2. Implement in-memory state with durable append log:
   - Keep active games in Redis (in-memory, TTL 1 hour)
   - Append all moves to Kafka (durable log, partitioned by gameId)
   - Snapshot to Postgres every 10 moves or 5 minutes
3. Add shard health checks and rebalancing

**Acceptance Criteria**:
- Games distributed across shards
- Shard routing works correctly
- In-memory state with durable log
- Snapshots created periodically
- Can scale to 20M games/day

**Risks**: Shard rebalancing complexity, data consistency

---

### AUD-009: Implement WebSocket Support
**Owner**: live-game-api  
**Problem**: WebSocket documented but not implemented  
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

