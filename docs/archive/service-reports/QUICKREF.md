"""Matchmaking API - Quick Reference

Architecture Overview and Key File Reference
"""

# Matchmaking API - Quick Reference Guide

## Architecture Overview

```
┌─────────────────────────────────────┐
│      HTTP Clients (Web/Mobile)      │
└──────────────────┬──────────────────┘
                   │ JWT Auth
                   ▼
┌─────────────────────────────────────┐
│   FastAPI Application (app/main.py) │
│  - CORS, TrustedHost middleware     │
│  - Exception handlers               │
│  - Route registration               │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  V1 Public Routes│  │ Internal Routes  │
│  (v1/queue.py)   │  │(internal/queue.py)
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  MatchmakingService (Domain Layer)       │
│  - enqueue_player()                      │
│  - cancel_queue_entry()                  │
│  - match_players()                       │
│  - find_matches_for_pool()               │
│  - process_timed_out_entries()           │
└────────┬──────────────┬──────────────────┘
         │              │
    ┌────▼──┐      ┌────▼──────┐
    │ Redis │      │ PostgreSQL │
    └────▲──┘      └────▲──────┘
         │              │
┌────────┴──┐  ┌────────┴────────────┐
│ QueueStore│  │MatchRecord & Chal.  │
│(In-Memory)│  │ Repositories        │
└───────────┘  └─────────────────────┘

┌──────────────────────────────────────────┐
│  MatchmakingWorker (Background Process)  │
│  - Runs every N seconds                  │
│  - Finds matches from Redis queues       │
│  - Creates games via live-game-api       │
│  - Handles timeouts                      │
└──────────────────────────────────────────┘
```

## Key Files by Responsibility

### Configuration & Startup
- `app/core/config.py` - Settings (all env vars)
- `app/main.py` - FastAPI app factory, lifespan
- `.env.example` - Configuration template

### Domain Models (Business Logic)
- `app/domain/models/queue_entry.py` - QueueEntry aggregate
- `app/domain/models/match_record.py` - MatchRecord aggregate  
- `app/domain/models/challenge.py` - Challenge aggregate

### Repository Interfaces (Contracts)
- `app/domain/repositories/queue_store.py` - Abstract queue operations
- `app/domain/repositories/match_record.py` - Abstract match persistence
- `app/domain/repositories/challenge.py` - Abstract challenge persistence

### Repository Implementations (Infrastructure)
- `app/infrastructure/repositories/redis_queue_store.py` - Redis queue impl
- `app/infrastructure/repositories/postgres_match_record_repo.py` - PostgreSQL impl
- `app/infrastructure/repositories/postgres_challenge_repo.py` - PostgreSQL impl

### Services (Orchestration)
- `app/domain/services/matchmaking_service.py` - Core matchmaking logic
  - enqueue_player() - 4.1.1
  - cancel_queue_entry() - 4.1.2
  - get_queue_status() - 4.1.3
  - get_active_matchmaking() - 4.1.4
  - match_players() - Game creation
  - find_matches_for_pool() - Matching algorithm
  - process_timed_out_entries() - Timeout handling

### HTTP API (Routes & Models)
- `app/api/models.py` - Pydantic request/response schemas
- `app/api/dependencies.py` - JWT token extraction
- `app/api/routes/v1/queue.py` - Public queue endpoints (4.1)
- `app/api/routes/internal/queues.py` - Admin endpoints (4.3)

### Security & Error Handling
- `app/core/security.py` - JWT decoding, JWTTokenData
- `app/core/exceptions.py` - Exception definitions & HTTP handlers

### External Integration
- `app/infrastructure/external/live_game_api.py` - live-game-api client (6.2)

### Database
- `app/infrastructure/database/models.py` - SQLAlchemy ORM
- `app/infrastructure/database/connection.py` - AsyncIO DB manager
- `migrations/env.py` - Alembic async support
- `migrations/versions/001_initial.py` - Initial schema

### Background Processing
- `app/workers/matchmaking_worker.py` - Background worker loop (3.1)

### Tests
- `tests/conftest.py` - pytest fixtures
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests

## Service-Spec Mapping

| Spec Section | Implementation |
|--------------|-----------------|
| 1. Purpose & Scope | Overall design |
| 2.1.1 Queue Management | `enqueue_player()` |
| 2.1.2 Matchmaking Logic | `find_matches_for_pool()`, rating window |
| 2.1.3 Game Creation | `match_players()` → live-game-api |
| 2.1.4 Direct Challenges | Challenge model & endpoints (stub) |
| 2.1.5 Status & Introspection | Status endpoints |
| 3.1 HTTP API Layer | `app/api/` routes |
| 3.1 Matchmaking Workers | `app/workers/matchmaking_worker.py` |
| 3.1 Redis Store | `redis_queue_store.py` |
| 3.1 PostgreSQL Store | `postgres_*_repo.py` files |
| 4.1.1 POST /queue | `join_queue()` in queue.py |
| 4.1.2 DELETE /queue/{id} | `cancel_queue()` |
| 4.1.3 GET /queue/{id} | `get_queue_status()` |
| 4.1.4 GET /active | `get_active_matchmaking()` |
| 4.2.1-4 Challenges | Challenge endpoints (stubs) |
| 4.3.1 /internal/queues/summary | `get_queues_summary()` |
| 5.1 QueueEntry Model | `app/domain/models/queue_entry.py` |
| 5.2 MatchRecord Model | `app/domain/models/match_record.py` |
| 5.3 Challenge Model | `app/domain/models/challenge.py` |
| 6.1 Auth Integration | JWT in `app/core/security.py` |
| 6.2 Live Game API | `live_game_api.py` client |
| 7.1 Performance | Redis O(1), batch matching |
| 7.2 Scalability | Stateless API, shardable workers |
| 7.3 Availability | Error handling, graceful degradation |
| 7.4 Security | JWT auth, rate limiting hooks |
| 7.5 Observability | Structured logging, metrics hooks |
| 8 Configuration | `app/core/config.py` |

## Data Flow - Queue Join Request

```
1. Client: POST /v1/matchmaking/queue (with JWT)
   │
2. HTTP Handler (queue.py:join_queue)
   │ - Extract JWT token
   │ - Validate user_id, tenant_id
   │
3. MatchmakingService.enqueue_player()
   │ - Check user not already queued
   │ - Create QueueEntry with ID
   │ - Store in Redis
   │
4. Redis (in-memory)
   │ - queue_entry:{id} → JSON entry
   │ - user_queue:{tenant}:{user_id} → entry_id
   │ - pool:{tenant}:{pool_key}:{SEARCHING} → sorted set
   │
5. Response: QueueResponse (201)
   │ - queue_entry_id
   │ - status: "SEARCHING"
   │ - estimated_wait_seconds
   └─> Client
```

## Data Flow - Matching Process

```
1. Worker: MatchmakingWorker.start()
   │ - Runs every WORKER_INTERVAL_SECONDS (1s)
   │
2. For each pool:
   │
3. find_matches_for_pool() queries Redis
   │ - Get all SEARCHING entries
   │ - Sort by time_in_queue
   │ - Calculate rating windows
   │
4. For each candidate pair:
   │
5. match_players() orchestrates:
   │ - Call live-game-api CreateGame
   │ - Save MatchRecord to PostgreSQL
   │ - Update Redis entries to MATCHED
   │ - Store game_id in Redis
   │
6. Client: GET /v1/matchmaking/queue/{queue_entry_id}
   │ - Query Redis for entry
   │ - If MATCHED, return game_id
   └─> Client has game_id, joins live-game-api
```

## Performance Targets (Service-Spec 7.1)

| Operation | Target | Implementation |
|-----------|--------|-----------------|
| POST /queue | P95 < 100ms | Redis write in pipeline |
| GET /queue/{id} | P95 < 50ms | Redis read |
| Match assignment | < 1s | Worker batch processing |
| Queue lookup | O(1) | Redis hash lookup |
| Sorted retrieval | O(log n) | Redis sorted set |
| Match creation | ~250-500ms | live-game-api latency |

## Configuration Parameters

From `app/core/config.py`:

```python
# Matching Algorithm
INITIAL_RATING_WINDOW = 100          # ±100 rating points
RATING_WINDOW_WIDENING_INTERVAL = 10 # Widen every 10 seconds
RATING_WINDOW_WIDENING_AMOUNT = 25   # Widen by 25 points

# Queue
MAX_QUEUE_TIME_SECONDS = 600         # 10 minutes timeout

# Worker
WORKER_INTERVAL_SECONDS = 1.0        # Run cycle every 1 second
WORKER_BATCH_SIZE = 100              # Process up to 100 pairs
MATCH_PAIRS_PER_BATCH = 50           # Per-batch matches

# External Service
LIVE_GAME_API_TIMEOUT_SECONDS = 5.0  # RPC timeout
```

## HTTP Status Codes

Per service-spec section 4 error codes:

| Code | Meaning | Exception |
|------|---------|-----------|
| 201 | Created | POST queue |
| 200 | OK | All successful GET/DELETE/POST |
| 400 | Bad Request | InvalidRequestException |
| 401 | Unauthorized | UnauthorizedException |
| 404 | Not Found | QueueEntryNotFoundException |
| 409 | Conflict | AlreadyInQueue, CannotCancel, etc |
| 503 | Unavailable | MatchmakingUnavailableException |

## Running & Testing

```bash
# Setup
pip install -r requirements/dev.txt
cp .env.example .env

# Migrations
alembic upgrade head

# Development
python -m uvicorn app.main:app --reload

# Testing
pytest -v
pytest --cov=app

# Quality
black app tests
isort app tests
flake8 app tests
mypy app
```

## Integration Checklist

Before production:

- [ ] Route handlers call matchmaking_service
- [ ] Worker started in app lifespan
- [ ] Rating service integration (placeholder)
- [ ] Challenge endpoints implemented
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Load testing performed
- [ ] OpenAPI spec generated
- [ ] Documentation complete
- [ ] Error monitoring setup

## Key Design Decisions

1. **Repository Pattern** - Abstract interfaces allow Redis ↔ PostgreSQL swaps
2. **DDD Aggregate Roots** - QueueEntry, MatchRecord, Challenge encapsulate logic
3. **Async/Await** - Non-blocking I/O for scalability
4. **Stateless API** - Horizontal scaling without session affinity
5. **Batch Worker** - Efficient matching, not one-by-one
6. **Rating Window Widening** - Balances fast matches (tight window) vs fairness (wide window)
7. **Redis + PostgreSQL** - Fast transient state (Redis), durable audit log (PostgreSQL)

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Queue entries not matching | Rating window too tight | Increase INITIAL_RATING_WINDOW |
| Matches timing out | live-game-api slow | Increase timeout, check service |
| High memory usage | Redis entries growing | Check cleanup, reduce TTL |
| Queue stuck in SEARCHING | Worker not running | Start matchmaking_worker |
| JWT validation fails | Bad token | Check JWT_SECRET_KEY |

---

See `IMPLEMENTATION.md` for complete details.
See `docs/` folder for full documentation.
