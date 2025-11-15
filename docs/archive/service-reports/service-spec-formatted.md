# matchmaking-api – Service Specification

## 1. Purpose & Scope

The `matchmaking-api` is responsible for moving a user from **"I want to play"** to **"You have a game, here's the game_id"**.

### Responsibilities

| Responsibility | Details |
|---|---|
| **✅ Queue Management** | Manages matchmaking queues for time controls, variants, tenants, regions |
| **✅ Player Pairing** | Pairs players by rating proximity, time in queue, configurable policies |
| **✅ Game Creation** | Creates game sessions in `live-game-api`, returns `game_id` |
| **✅ Direct Challenges** | Supports player-to-player challenge system |

### Out of Scope

| Component | Owner |
|---|---|
| Real-time game state | `live-game-api` |
| Full game history | `game-history-api` |
| Player ratings & stats | `rating-and-stats-api` |

### Scale Target

| Metric | Target |
|---|---|
| Registered Users (lifetime) | 100M+ |
| Concurrent Users | Millions |
| Peak Throughput | 10k–50k req/s |

---

## 2. Responsibilities

### 2.1 Functional Responsibilities

#### Queue Management

| Aspect | Details |
|---|---|
| **Enqueue Parameters** | `time_control` (e.g., `5+0`), `mode` (rated/casual), `variant` (optional, default standard), `region` (optional) |
| **User Invariants** | User cannot be in multiple queues simultaneously; user cannot queue while having active game |
| **Implementation** | Check via live-game-api or cached state |

#### Matchmaking Logic

| Factor | Details |
|---|---|
| **Matching Criteria** | Rating proximity, time in queue, per-queue configuration |
| **Rating Support** | Per time-control rating (blitz vs rapid) |
| **Configuration** | Max rating diff, widening rate, regional bias |

#### Game Creation

When two players are paired:

```
Queue Entry + Queue Entry
    ↓
Call live-game-api::CreateGame()
    ↓
Persist Match Record with game_id
    ↓
Update both Queue Entries → MATCHED status
```

**Parameters sent to live-game-api:**
- `white_user_id`, `black_user_id`
- `time_control`, `mode`, `variant`
- `rating_snapshot` (at match time)
- `metadata` (matchmaking_source, region)

#### Direct Challenges

| Step | Details |
|---|---|
| 1. Create Challenge | Player A challenges Player B with time control & mode |
| 2. Pending State | Challenge waits for Player B's response |
| 3. Accept | Player B accepts → trigger game creation |
| 4. Decline | Player B declines → challenge ends |

#### Status & Introspection

| Endpoint | Purpose |
|---|---|
| Queue Status | Check entry state (searching/matched/timed-out/cancelled) |
| User Active State | Get current queue or match for authenticated user |
| Queue Health | Admin view: counts, avg wait, percentiles |

### 2.2 Non-Functional Responsibilities

| Attribute | Target |
|---|---|
| **Latency** | Low (sub-100ms for queue ops) |
| **Throughput** | High: stateless HTTP + shardable workers |
| **Availability** | ≥ 99.9% for matchmaking operations |
| **Invariants** | User not matched to multiple simultaneous games |
| **Configuration** | Per-pool policies, no hardcoded values |
| **Observability** | Metrics, logs, traces, alarms |

---

## 3. Architecture Overview

### 3.1 High-Level Components

```
┌─────────────────────────────────────────────┐
│         HTTP API Layer (Stateless)          │
│  - Public REST endpoints (/v1/...)          │
│  - Internal admin endpoints (/internal/...) │
│  - JWT authentication                       │
└──────────────────┬──────────────────────────┘
                   │
     ┌─────────────┴──────────────┐
     ▼                            ▼
┌──────────────────────┐   ┌────────────────────────┐
│  Matchmaking Service │   │  Domain Models         │
│  - Orchestration     │   │  - QueueEntry          │
│  - Matching Logic    │   │  - MatchRecord         │
│  - Game Creation     │   │  - Challenge           │
└──────────────┬───────┘   └────────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌──────────────────┐  ┌────────────────────────┐
│  Redis Queue     │  │  PostgreSQL Repos      │
│  (In-Memory)     │  │  - MatchRecords        │
│  - Fast queues   │  │  - Challenges          │
│  - User tracking │  │  - Audit logs          │
└──────────────────┘  └────────────────────────┘
     ▲
     │
┌────┴──────────────────────────────────┐
│   Matchmaking Worker (Background)     │
│   - Polls queues every N seconds      │
│   - Finds matches                     │
│   - Calls live-game-api               │
│   - Persists results                  │
└───────────────────────────────────────┘
```

#### Components Table

| Component | Purpose | Technology |
|---|---|---|
| **HTTP API Layer** | Handle requests, validate JWT, delegate to service | FastAPI |
| **Matchmaking Service** | Core business logic: enqueue, cancel, match players | Python service class |
| **Domain Models** | QueueEntry, MatchRecord, Challenge | Python dataclasses |
| **Redis Queue Store** | Fast, in-memory queue operations | Redis Sorted Sets |
| **PostgreSQL Repositories** | Persistent storage for matches, challenges | SQLAlchemy ORM |
| **Matchmaking Worker** | Background loop for match discovery | Async coroutine |

#### Integration Points

| Service | Purpose | Protocol |
|---|---|---|
| `auth-api` | Validate JWT, extract user_id & tenant_id | JWT tokens |
| `live-game-api` | Create game session with players & ratings | HTTP/gRPC |
| Redis | In-memory queue store for low-latency ops | Redis protocol |
| PostgreSQL | Durable storage for matches & challenges | SQL |

---

## 4. API Design

### Authentication

All endpoints require valid JWT issued by `auth-api`:

```
Authorization: Bearer <token>
```

**Token Claims:**
- `sub` → user_id
- `tenant_id` → multi-tenancy identifier
- Standard claims (exp, iat, aud, iss)

### 4.1 Matchmaking Queue Endpoints

#### POST `/v1/matchmaking/queue`

Join matchmaking queue.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 201 Created |

**Request Body:**

```json
{
  "time_control": "5+0",
  "mode": "rated",
  "variant": "standard",
  "region": "ASIA",
  "client_metadata": {
    "app_version": "1.2.3",
    "platform": "ios"
  }
}
```

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `time_control` | string | ✅ | — | Format: `<minutes>+<increment_seconds>` (e.g., `5+0`, `3+2`) |
| `mode` | enum | ✅ | — | `"rated"` \| `"casual"` |
| `variant` | string | ❌ | `"standard"` | `"standard"` \| `"chess960"` |
| `region` | string | ❌ | inferred | Regional pool (e.g., `"ASIA"`, `"EU"`) |
| `client_metadata` | object | ❌ | — | Free-form client context |

**Response 201:**

```json
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "SEARCHING",
  "estimated_wait_seconds": 10
}
```

**Error Responses:**

| Code | Error | Details |
|---|---|---|
| 400 | `INVALID_REQUEST` | Invalid time control, mode, variant |
| 409 | `ALREADY_IN_QUEUE` | User already queued |
| 409 | `ACTIVE_GAME_EXISTS` | User has active game |
| 503 | `MATCHMAKING_UNAVAILABLE` | Service degraded |

---

#### DELETE `/v1/matchmaking/queue/{queue_entry_id}`

Cancel queue entry.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 200 OK |

**Response 200:**

```json
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "CANCELLED"
}
```

**Error Responses:**

| Code | Error | Details |
|---|---|---|
| 404 | `NOT_FOUND` | Entry not found or not owned by user |
| 409 | `CANNOT_CANCEL` | Entry already matched or finalized |

---

#### GET `/v1/matchmaking/queue/{queue_entry_id}`

Check queue status.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 200 OK |

**Response 200 – SEARCHING State:**

```json
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "SEARCHING",
  "estimated_wait_seconds": 7
}
```

**Response 200 – MATCHED State:**

```json
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "MATCHED",
  "game_id": "g_01hr08bkj1x9",
  "opponent": {
    "user_id": "u_02ab...",
    "username": "opponent123",
    "rating_snapshot": {
      "time_control": "5+0",
      "mode": "rated",
      "rating": 1543
    }
  }
}
```

**Response 200 – TIMED_OUT State:**

```json
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "TIMED_OUT"
}
```

**Response 200 – CANCELLED State:**

```json
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "CANCELLED"
}
```

**Error Responses:**

| Code | Error | Details |
|---|---|---|
| 404 | `NOT_FOUND` | Entry not found or not owned by user |

---

#### GET `/v1/matchmaking/active`

Get active matchmaking state for authenticated user.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 200 OK |

**Response 200 – Searching:**

```json
{
  "queue_entry": {
    "queue_entry_id": "q_01hqxf4b8qk1",
    "status": "SEARCHING",
    "time_control": "5+0",
    "mode": "rated",
    "variant": "standard",
    "region": "ASIA",
    "enqueued_at": "2025-11-15T02:34:12Z"
  },
  "match": null
}
```

**Response 200 – Matched:**

```json
{
  "queue_entry": null,
  "match": {
    "game_id": "g_01hr08bkj1x9",
    "time_control": "5+0",
    "mode": "rated",
    "variant": "standard",
    "opponent": {
      "user_id": "u_02ab...",
      "username": "opponent123",
      "rating": 1543
    }
  }
}
```

**Response 200 – No Activity:**

```json
{
  "queue_entry": null,
  "match": null
}
```

---

### 4.2 Direct Challenge Endpoints

#### POST `/v1/matchmaking/challenges`

Create direct challenge.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 201 Created |

**Request Body:**

```json
{
  "opponent_user_id": "u_02ab...",
  "time_control": "5+0",
  "mode": "rated",
  "variant": "standard",
  "preferred_color": "random"
}
```

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `opponent_user_id` | string | ✅ | — | User being challenged |
| `time_control` | string | ✅ | — | Format: `<minutes>+<increment_seconds>` |
| `mode` | enum | ✅ | — | `"rated"` \| `"casual"` |
| `variant` | string | ❌ | `"standard"` | Chess variant |
| `preferred_color` | enum | ❌ | `"random"` | `"white"` \| `"black"` \| `"random"` |

**Response 201:**

```json
{
  "challenge_id": "c_01hr08p9m7h4",
  "status": "PENDING"
}
```

---

#### POST `/v1/matchmaking/challenges/{challenge_id}/accept`

Accept challenge and create game.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 200 OK |

**Response 200:**

```json
{
  "challenge_id": "c_01hr08p9m7h4",
  "status": "ACCEPTED",
  "game_id": "g_01hr08bkj1x9"
}
```

**Error Responses:**

| Code | Error | Details |
|---|---|---|
| 404 | `NOT_FOUND` | Challenge not found |
| 409 | `INVALID_STATE` | Already accepted/declined/expired |
| 409 | `CANNOT_ACCEPT` | User not target opponent or already in queue |

---

#### POST `/v1/matchmaking/challenges/{challenge_id}/decline`

Decline challenge.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 200 OK |

**Response 200:**

```json
{
  "challenge_id": "c_01hr08p9m7h4",
  "status": "DECLINED"
}
```

---

#### GET `/v1/matchmaking/challenges/incoming`

List incoming challenges.

| Aspect | Details |
|---|---|
| **Auth** | Required (JWT) |
| **Status Code** | 200 OK |

**Response 200:**

```json
{
  "challenges": [
    {
      "challenge_id": "c_01hr08p9m7h4",
      "challenger": {
        "user_id": "u_01ab...",
        "username": "opponent123",
        "rating": 1520
      },
      "time_control": "5+0",
      "mode": "rated",
      "variant": "standard",
      "preferred_color": "random",
      "created_at": "2025-11-15T02:30:00Z",
      "expires_at": "2025-11-15T02:35:00Z"
    }
  ]
}
```

---

### 4.3 Internal / Admin Endpoints

#### GET `/internal/queues/summary`

Queue metrics dashboard (internal/admin only).

| Aspect | Details |
|---|---|
| **Auth** | Service-to-service or admin JWT |
| **Status Code** | 200 OK |

**Response 200:**

```json
{
  "timestamp": "2025-11-15T02:40:00Z",
  "queues": [
    {
      "tenant_id": "t_default",
      "pool_key": "standard_5+0_rated_ASIA",
      "waiting_count": 1234,
      "avg_wait_seconds": 8.5,
      "p95_wait_seconds": 20.1
    },
    {
      "tenant_id": "t_default",
      "pool_key": "standard_3+2_casual_EU",
      "waiting_count": 456,
      "avg_wait_seconds": 12.3,
      "p95_wait_seconds": 35.7
    }
  ]
}
```

---

## 5. Data Models

### QueueEntry

Represents a player in the matchmaking queue.

| Field | Type | Notes |
|---|---|---|
| `queue_entry_id` | string | Unique identifier (ULID format) |
| `tenant_id` | string | Multi-tenancy identifier |
| `user_id` | string | Player identifier |
| `time_control` | string | Format: `<minutes>+<increment>` |
| `mode` | enum | `"SEARCHING"` \| `"MATCHED"` \| `"CANCELLED"` \| `"TIMED_OUT"` |
| `variant` | string | Chess variant (e.g., `"standard"`, `"chess960"`) |
| `region` | string | Regional pool |
| `status` | enum | Queue entry state |
| `enqueued_at` | datetime | Entry creation timestamp |
| `updated_at` | datetime | Last modification timestamp |
| `match_id` | string | Reference to MatchRecord (if matched) |

### MatchRecord

Represents a completed matchmaking result.

| Field | Type | Notes |
|---|---|---|
| `match_id` | string | Unique identifier |
| `tenant_id` | string | Multi-tenancy identifier |
| `game_id` | string | Reference to live-game-api game |
| `white_user_id` | string | Player with white pieces |
| `black_user_id` | string | Player with black pieces |
| `time_control` | string | Matched time control |
| `mode` | string | `"rated"` or `"casual"` |
| `variant` | string | Chess variant |
| `rating_snapshot` | object | Ratings at match time |
| `queue_entry_ids` | array | Source queue entries |
| `created_at` | datetime | Match creation timestamp |

### Challenge

Represents a direct player challenge.

| Field | Type | Notes |
|---|---|---|
| `challenge_id` | string | Unique identifier |
| `tenant_id` | string | Multi-tenancy identifier |
| `challenger_user_id` | string | Player who initiated |
| `opponent_user_id` | string | Player being challenged |
| `time_control` | string | Proposed time control |
| `mode` | string | `"rated"` or `"casual"` |
| `variant` | string | Chess variant |
| `preferred_color` | enum | `"white"` \| `"black"` \| `"random"` |
| `status` | enum | `"PENDING"` \| `"ACCEPTED"` \| `"DECLINED"` \| `"EXPIRED"` |
| `game_id` | string | Reference to created game (if accepted) |
| `created_at` | datetime | Challenge creation timestamp |
| `expires_at` | datetime | Challenge expiration timestamp |

---

## 6. Integration Contracts

### auth-api Contract

**JWT Token Validation:**

```json
{
  "sub": "u_user_id",
  "tenant_id": "t_tenant_id",
  "exp": 1700100000,
  "iat": 1700096400,
  "aud": "matchmaking-api",
  "iss": "https://auth-api"
}
```

| Claim | Mandatory | Notes |
|---|---|---|
| `sub` | ✅ | User identifier |
| `tenant_id` | ✅ | Tenant for multi-tenancy |
| `exp` | ✅ | Expiration time (Unix) |
| `iat` | ✅ | Issued at (Unix) |

---

### live-game-api Contract

**CreateGame Request:**

```json
{
  "tenant_id": "t_default",
  "white_user_id": "u_01...",
  "black_user_id": "u_02...",
  "time_control": "5+0",
  "mode": "rated",
  "variant": "standard",
  "rating_snapshot": {
    "white": 1520,
    "black": 1543
  },
  "metadata": {
    "matchmaking_source": "auto",
    "region": "ASIA"
  }
}
```

**CreateGame Response:**

```json
{
  "game_id": "g_01hr08bkj1x9"
}
```

**Error Handling:**
- Log error with correlation ID
- Do NOT mark queue entries as matched
- Optionally requeue both players
- Return error status to client

---

## 7. Non-Functional Requirements

### Performance

| Metric | Target |
|---|---|
| POST /queue (p95) | < 100 ms |
| GET /queue/{id} (p95) | < 50 ms |
| Match assignment | < 1 second from eligibility |

### Scalability

| Aspect | Implementation |
|---|---|
| API Layer | Stateless, horizontal scaling via load balancer |
| Matching Workers | Sharded by tenant_id, region, time_control group |
| Queue Storage | Redis for fast in-memory operations |

### Availability

| Target | Details |
|---|---|
| Availability | ≥ 99.9% uptime |
| Graceful Degradation | Block matching if live-game-api down, show clear error |
| Idempotency | Queue join repeatable within short window |

### Security

| Control | Implementation |
|---|---|
| Authentication | JWT via auth-api on all public endpoints |
| Rate Limiting | Per-user and per-IP limits to prevent queue spam |
| PII Minimization | Opponent info limited to user_id, username, rating snapshot |

### Observability

| Signal | Details |
|---|---|
| **Metrics** | Request counts, latencies, error rates per endpoint |
| **Metrics** | Queue length per pool, avg/p95/p99 wait times |
| **Metrics** | Match success rate vs timeout rate |
| **Logging** | Structured logs for enqueue, cancel, match decisions, game creation calls |
| **Tracing** | Correlation IDs propagated across API → matcher → live-game-api |

---

## 8. Configuration & Feature Flags

### Per-Pool Configuration

| Setting | Type | Default | Purpose |
|---|---|---|---|
| `initial_rating_window` | int | 100 | Initial rating diff tolerance (±N) |
| `widening_interval_seconds` | int | 10 | How often to widen window |
| `widening_amount` | int | 25 | How much to widen each interval |
| `max_rating_gap` | int | 200 | Hard limit on rating difference |
| `max_queue_time_seconds` | int | 600 | Timeout after N seconds |
| `regional_bias` | bool | true | Prefer same region matches |

### Feature Flags

| Flag | Type | Purpose |
|---|---|---|
| `enable_direct_challenges` | bool | Enable/disable challenge system |
| `enable_experimental_matching` | bool | Enable experimental matching for subset |
| `matching_algorithm` | enum | `"simple"` \| `"advanced"` \| `"ml"` |

**Storage:** Configuration stored in database, cached in-memory. Updates require cache refresh (no redeploy).

---

## 9. Open Questions & Future Extensions

| Topic | Details |
|---|---|
| **Tournament Matchmaking** | Swiss/arena system (separate flow or extended queues?) |
| **Party Matchmaking** | Multi-player pools and group queuing |
| **Anti-Cheat Integration** | Avoid matching flagged users together |
| **Multi-Region Routing** | How clients choose region (DNS, gateway, geo-IP?) |
| **Bot/AI Opponents** | Support for AI players with own pools |
| **Rating Caching** | Should we cache ratings or call rating-api each time? |
| **Concurrency Limits** | Max simultaneous queues per user? |

---

## 10. Compliance Checklist

- ✅ Section 2.1: All functional responsibilities documented
- ✅ Section 2.2: All non-functional responsibilities documented
- ✅ Section 4.1: All queue endpoints with correct status codes
- ✅ Section 4.2: Direct challenge endpoints (design, not full implementation)
- ✅ Section 4.3: Internal admin endpoints for queue health
- ✅ Section 5: Data models with all fields per spec
- ✅ Section 6: Integration contracts (auth-api, live-game-api)
- ✅ Section 7: All NFRs documented with targets
- ✅ Section 8: Configuration and feature flags documented
- ✅ Section 9: Open questions and future extensions listed
