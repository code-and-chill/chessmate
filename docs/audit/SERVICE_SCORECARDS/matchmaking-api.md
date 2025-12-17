---
title: Matchmaking API Service Scorecard
service: matchmaking-api
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Service Scorecard: matchmaking-api

**Service**: matchmaking-api  
**Status**: 🟨 **PARTIAL**  
**Overall Readiness**: 55%

## Bounded Context Clarity

**Evidence**:
- `matchmaking-api/docs/overview.md` - Clear purpose: "Player pairing and queue management"
- `matchmaking-api/docs/domain.md` - Domain entities: Queue, Match, MatchmakingPolicy
- `matchmaking-api/docs/domain.md` - Ubiquitous language glossary
- `matchmaking-api/app/domain/models/` - Domain models separated from infrastructure

**Gaps**:
- No explicit bounded context statement
- Integration with live-game-api via HTTP (tight coupling)
- No anti-corruption layer for external services

**Fix**:
- Add bounded context statement: "Matchmaking bounded context - owns queue state and pairing logic, delegates game creation to live-game-api"
- Document integration boundaries in `matchmaking-api/docs/domain.md`
- Consider event-driven integration instead of HTTP calls

**Status**: 🟨 Partial

---

## API Contracts (Stability/Versioning)

**Evidence**:
- `matchmaking-api/bruno/collections/` - Bruno collections exist
- `matchmaking-api/app/api/routes/` - API routes defined
- `matchmaking-api/docs/api.md` - API documentation exists

**Gaps**:
- No API versioning strategy (no `/v1/` prefix in routes)
- No OpenAPI spec found
- No contract testing documented

**Fix**:
- Add versioning to routes (`/v1/matchmaking/queue`)
- Generate OpenAPI spec from FastAPI
- Add contract tests using Bruno collections

**Status**: 🟨 Partial

---

## Events (Produce/Consume, Schemas, Idempotency)

**Evidence**:
- `matchmaking-api/docs/domain.md` - Mentions `MatchCreated` event
- `matchmaking-api/docs/overview.md` - Mentions "Event Bus: Publish match events"
- `matchmaking-api/app/domain/services/matchmaking_service.py` - Creates matches but no event publishing

**Gaps**:
- **No event publishing implemented** - MatchCreated event mentioned but not published
- No Kafka producer found
- No event schema definitions
- Integration with live-game-api is synchronous HTTP call, not event-driven

**Fix**:
- Implement Kafka producer for `MatchCreated` event
- Define event schema: `{match_id, white_player_id, black_player_id, game_id, time_control, created_at}`
- Publish event after match creation
- Consider consuming `PlayerRegistered` events from account-api (if needed)

**Status**: ❌ Fail

---

## Scalability Model (20M games/day readiness)

**Evidence**:
- `matchmaking-api/docs/ARCHITECTURE.md` - Redis for queue indexing (O(1) lookups)
- `matchmaking-api/app/infrastructure/repositories/redis_queue_store.py` - Redis implementation
- `matchmaking-api/docs/ARCHITECTURE.md` - Worker runs every 1-5 seconds

**Gaps**:
- **No sharding strategy** - Single worker may not scale to 20M games/day
- No horizontal scaling strategy for workers
- Queue flooding protection missing
- No rate limiting on queue joins

**Impact at Scale**:
- 20M games/day = ~231 games/sec average, >2k games/sec peak
- Single worker may become bottleneck
- Queue flooding can overwhelm Redis

**Fix**:
- Implement worker sharding (partition queue by player_id hash)
- Add rate limiting (max 1 queue join per user per 10 seconds)
- Add queue size limits and backpressure
- Horizontal scaling for workers (multiple instances)

**Status**: 🟨 Partial

---

## Reliability (Timeouts, Retries, Fallbacks)

**Evidence**:
- `matchmaking-api/app/infrastructure/external/live_game_api.py` - HTTP client for live-game-api
- `matchmaking-api/app/clients/rating_client.py` - Rating API client

**Gaps**:
- **No circuit breakers** - If live-game-api is down, matchmaking fails
- No retry logic for live-game-api calls
- No timeout configuration
- No fallback strategy (e.g., queue match for later processing)

**Fix**:
- Add circuit breaker for live-game-api dependency
- Implement retry with exponential backoff (3 retries, max 5s)
- Add timeout configuration (e.g., 5s for game creation)
- Add fallback: queue failed matches for retry

**Status**: ❌ Fail

---

## Storage Ownership + Migrations

**Evidence**:
- `matchmaking-api/migrations/` - Alembic migrations exist
- `matchmaking-api/app/infrastructure/database/` - Database models
- `matchmaking-api/docs/ARCHITECTURE.md` - PostgreSQL for queue persistence

**Gaps**:
- No explicit schema ownership boundaries documented
- Shared database with other services? (needs verification)
- No migration strategy documented

**Fix**:
- Document schema ownership: `match_tickets`, `match_records` tables owned by matchmaking-api
- Verify no shared tables with other services
- Document migration strategy in `matchmaking-api/docs/operations.md`

**Status**: 🟨 Partial

---

## Observability (Metrics/Traces/Logs/SLOs)

**Evidence**:
- `matchmaking-api/app/domain/services/matchmaking_service.py` - Uses Python logging
- `matchmaking-api/docs/operations.md` - Mentions metrics but not implemented

**Gaps**:
- **No Prometheus metrics** - Cannot monitor queue length, match rate, latency
- No distributed tracing
- No SLO definitions
- No correlation IDs in logs

**Fix**:
- Add Prometheus metrics:
  - `matchmaking_queue_length` (gauge)
  - `matchmaking_matches_created_total` (counter)
  - `matchmaking_match_latency_seconds` (histogram)
  - `matchmaking_queue_wait_time_seconds` (histogram)
- Add OpenTelemetry tracing
- Define SLOs: p95 match creation < 500ms, queue join < 100ms
- Add correlation IDs to all requests

**Status**: ❌ Fail

---

## Security/Abuse

**Evidence**:
- `matchmaking-api/app/api/dependencies.py` - JWT authentication
- `matchmaking-api/app/domain/services/matchmaking_service.py` - Idempotency keys implemented

**Gaps**:
- **No rate limiting** - Users can spam queue joins
- No queue flooding protection
- No bot detection
- Idempotency keys help but don't prevent abuse

**Fix**:
- Add rate limiting: max 1 queue join per user per 10 seconds
- Add queue size limits (max 100K entries)
- Add bot detection (rate limit by IP, user behavior)
- Add abuse monitoring and alerting

**Status**: ❌ Fail

---

## Match Fairness

**Evidence**:
- `matchmaking-api/docs/overview.md` - Mentions rating matching algorithm
- `matchmaking-api/app/domain/services/matchmaking_service.py` - Rating-based matching logic

**Gaps**:
- Color distribution fairness not documented
- No metrics for match fairness
- No verification that matches are balanced

**Fix**:
- Document color distribution algorithm
- Add metrics: `matchmaking_color_balance` (white/black distribution)
- Add fairness verification in tests

**Status**: 🟨 Partial

---

## Bot Fallback Policy

**Evidence**:
- `matchmaking-api/docs/overview.md` - Mentions bot fallback but not implemented
- No bot fallback logic found in code

**Gaps**:
- **No bot fallback** - If no human match found, no bot fallback
- No policy for when to use bots
- No bot difficulty selection

**Fix**:
- Implement bot fallback policy:
  - If wait time > 60s and no match found, offer bot game
  - Bot difficulty based on player rating
  - User can opt-in/opt-out
- Document policy in `matchmaking-api/docs/domain.md`

**Status**: ❌ Fail

---

## Top 3 Risks

### 1. No Event Publishing (P0 - BLOCKING)
**Risk**: MatchCreated events not published, tight coupling via HTTP calls.

**Impact**: 
- Cannot achieve event-driven architecture
- Single point of failure (live-game-api must be up)
- No replay capability

**Fix**: Implement Kafka producer for MatchCreated events.

---

### 2. No Circuit Breakers (P1 - HIGH RISK)
**Risk**: If live-game-api is down, matchmaking fails completely.

**Impact**:
- Service unavailable during live-game-api outages
- No graceful degradation

**Fix**: Add circuit breakers and fallback queue for failed matches.

---

### 3. No Rate Limiting (P1 - HIGH RISK)
**Risk**: Queue flooding can overwhelm service.

**Impact**:
- DoS vulnerability
- Redis memory exhaustion
- Service degradation

**Fix**: Add rate limiting and queue size limits.

---

## P0 Remediation Items

### AUD-004: Implement MatchCreated Event Publishing
**Owner**: matchmaking-api  
**Problem**: MatchCreated event mentioned but not published  
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

**Risks**: Kafka dependency, event schema versioning

---

### AUD-005: Add Circuit Breakers for External Dependencies
**Owner**: matchmaking-api  
**Problem**: No circuit breakers, service fails if live-game-api is down  
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

### AUD-006: Implement Rate Limiting
**Owner**: matchmaking-api  
**Problem**: No rate limiting, vulnerable to queue flooding  
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

