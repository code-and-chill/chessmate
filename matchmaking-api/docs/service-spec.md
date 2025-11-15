# matchmaking-api – Service Specification

## 1. Purpose & Scope

The `matchmaking-api` is responsible for moving a user from **“I want to play”** to **“You have a game, here’s the game_id”**.

It:

- Manages **matchmaking queues** for different time controls / variants / tenants / regions.
- Pairs players based on **rating, time in queue, and configurable policies**.
- Creates game sessions in `live-game-api` and returns a `game_id` to both players.
- Optionally supports **direct challenges** (A challenges B).

It **does not**:

- Handle real-time game state (that’s `live-game-api`).
- Store full game history (that’s `game-history-api`).
- Manage ratings and stats (that’s `rating-and-stats-api` or similar).

Target scale: up to **hundreds of millions of registered users** over product lifetime, with **millions of concurrent users** and **high matchmaking throughput (10k–50k req/s peak)**.

---

## 2. Responsibilities

### 2.1 Functional Responsibilities

1. **Queue Management**
   - Enqueue player into a matchmaking pool given:
     - `time_control` (e.g., `3+2`, `5+0`, `10+0`)
     - `mode` (`rated` / `casual`)
     - `variant` (optional, e.g., `standard`, `chess960`)
     - `region` or `pool` (optional)
   - Ensure a user:
     - is not in multiple queues simultaneously,
     - is not queued while having an active game (best-effort check via `live-game-api` or cached state).

2. **Matchmaking Logic**
   - Periodically or event-driven, match players based on:
     - rating proximity,
     - time spent in queue,
     - per-queue configuration (max diff, widening rate, regional bias).
   - Support rating per time control (e.g., blitz rating vs rapid).

3. **Game Creation**
   - When two players are paired:
     - call `live-game-api` (internal RPC/HTTP/gRPC) to **create a new game** with:
       - players (white/black),
       - time control,
       - rated/casual,
       - initial rating snapshot, metadata.
     - on success, persist a short-lived **match record** with `game_id`.
   - Expose `game_id` to clients via status endpoint(s).

4. **Direct Challenges (Optional v1, but designed)**
   - Allow Player A to challenge Player B with a chosen time control & mode.
   - Allow Player B to accept/decline.
   - On accept, create game via `live-game-api`.

5. **Status & Introspection**
   - Provide endpoints for:
     - queue status (searching/matched/timed-out/cancelled),
     - currently active matchmaking for a user,
     - internal/admin views of queue health (counts, average wait, etc.).

### 2.2 Non-Functional Responsibilities

- **Low latency** for queue join and status checks.
- **High throughput** and **horizontal scalability** via stateless HTTP + shardable matching workers.
- **High availability** (≥ 99.9% for matchmaking operations).
- **Strong invariants** (user not matched into multiple simultaneous games).
- **Config-driven behavior** (per-pool matching policies).
- **Observability** (metrics, logs, traces, alarms).

---

## 3. Architecture Overview

### 3.1 High-Level Components

- **HTTP API Layer**
  - Stateless service nodes handling:
    - public REST endpoints.
    - auth (JWT validation).
  - Delegates matchmaking operations to internal queue/matcher layer.

- **Matchmaking Workers**
  - Long-running worker processes (can be within same service or separate deployment) responsible for:
    - consuming queue data from in-memory store (Redis or similar),
    - grouping candidates into matches,
    - calling `live-game-api` to create games,
    - writing match results back to durable store.
  - Sharded by:
    - `tenant_id`
    - `region`
    - `time_control` / `mode` as needed.

- **In-Memory Store (Redis-like)**
  - Holds active queues:
    - queue entries keyed by `(tenant_id, pool_key)` (e.g., `blitz_5+0_rated_ASIA`).
    - sorted sets or priority structures by rating / waiting-time.
  - Holds ephemeral “user_in_queue” / “user_in_matchmaking” flags to enforce invariants.

- **Persistent Store (SQL/NoSQL)**
  - Stores:
    - matchmaking sessions (match records),
    - direct challenges,
    - configuration overrides,
    - audit logs (for debugging, fairness analysis).

- **Integration Points**
  - `auth-api` – validate JWT and extract `user_id`, `tenant_id`.
  - `live-game-api` – create a new game session (`game_id`).
  - `account-api` / `rating-api` – get rating snapshot (or via rating cache).

---

## 4. API Design

All endpoints require a valid **JWT** issued by `auth-api`.  
Assume standard header: `Authorization: Bearer <token>`.

Multi-tenant: `tenant_id` is derived from JWT claims.

### 4.1 Matchmaking Queue

#### 4.1.1 POST `/v1/matchmaking/queue`

**Description**  
Join a matchmaking queue for a given configuration.

**Request Body**

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
time_control – string "<minutes>+<increment_seconds>", required.

mode – "rated" or "casual", required.

variant – optional, default "standard".

region – optional; server may infer from geo/tenant if omitted.

client_metadata – optional free-form context.

Response 201

json
Copy code
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "SEARCHING",
  "estimated_wait_seconds": 10
}
Error Codes

400 INVALID_REQUEST – invalid time control, mode, etc.

409 ALREADY_IN_QUEUE – user already queued.

409 ACTIVE_GAME_EXISTS – user currently in active game (if enforced).

503 MATCHMAKING_UNAVAILABLE – service is degraded/disabled.

4.1.2 DELETE /v1/matchmaking/queue/{queue_entry_id}
Description
Cancel matchmaking for a specific queue entry.

Response 200

json
Copy code
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "CANCELLED"
}
Error Codes

404 NOT_FOUND – queue entry not found or already finalized (matched/timed-out).

409 CANNOT_CANCEL – e.g., already matched and game created.

4.1.3 GET /v1/matchmaking/queue/{queue_entry_id}
Description
Check status of a matchmaking request.

Response 200 – Searching

json
Copy code
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "SEARCHING",
  "estimated_wait_seconds": 7
}
Response 200 – Matched

json
Copy code
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
Response 200 – Timed Out

json
Copy code
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "TIMED_OUT"
}
Response 200 – Cancelled

json
Copy code
{
  "queue_entry_id": "q_01hqxf4b8qk1",
  "status": "CANCELLED"
}
Error Codes

404 NOT_FOUND – invalid queue_entry_id or does not belong to this user.

4.1.4 GET /v1/matchmaking/active
Description
Get current matchmaking state for the authenticated user (queue or matched but not yet joined game).

Response 200

json
Copy code
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
or

json
Copy code
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
Error Codes

200 with both fields null if no active matchmaking.

4.2 Direct Challenge (Optional v1)
If you want to stub now and implement later, keep the API simple.

4.2.1 POST /v1/matchmaking/challenges
Description
Create a direct challenge to another user.

Request Body

json
Copy code
{
  "opponent_user_id": "u_02ab...",
  "time_control": "5+0",
  "mode": "rated",
  "variant": "standard",
  "preferred_color": "random"
}
preferred_color – "white" | "black" | "random".

Response 201

json
Copy code
{
  "challenge_id": "c_01hr08p9m7h4",
  "status": "PENDING"
}
4.2.2 POST /v1/matchmaking/challenges/{challenge_id}/accept
Description
Accept a direct challenge. Creates a game via live-game-api.

Response 200

json
Copy code
{
  "challenge_id": "c_01hr08p9m7h4",
  "status": "ACCEPTED",
  "game_id": "g_01hr08bkj1x9"
}
Error Codes

404 NOT_FOUND

409 INVALID_STATE – already accepted/declined/expired.

409 CANNOT_ACCEPT – user not the target opponent, already in queue, etc.

4.2.3 POST /v1/matchmaking/challenges/{challenge_id}/decline
Response 200

json
Copy code
{
  "challenge_id": "c_01hr08p9m7h4",
  "status": "DECLINED"
}
4.2.4 GET /v1/matchmaking/challenges/incoming
Description
List pending incoming challenges for the authenticated user.

4.3 Internal / Admin Endpoints
These should be secured by service-to-service auth or admin roles.

4.3.1 GET /internal/queues/summary
Description
Return snapshot of queue metrics per pool for dashboards / alerts.

Response 200

json
Copy code
{
  "timestamp": "2025-11-15T02:40:00Z",
  "queues": [
    {
      "tenant_id": "t_default",
      "pool_key": "standard_5+0_rated_ASIA",
      "waiting_count": 1234,
      "avg_wait_seconds": 8.5,
      "p95_wait_seconds": 20.1
    }
  ]
}
5. Data Model (Conceptual)
These are conceptual models; actual DB schema can vary.

5.1 QueueEntry
queue_entry_id: string

tenant_id: string

user_id: string

time_control: string

mode: "rated" | "casual"

variant: string

region: string

status: "SEARCHING" | "MATCHED" | "CANCELLED" | "TIMED_OUT"

enqueued_at: datetime

updated_at: datetime

match_id: string | null

5.2 MatchRecord
match_id: string

tenant_id: string

game_id: string

white_user_id: string

black_user_id: string

time_control: string

mode: string

variant: string

created_at: datetime

queue_entry_ids: [string]

Stored for debug/audit, not necessarily long-term history.

5.3 Challenge
challenge_id: string

tenant_id: string

challenger_user_id: string

opponent_user_id: string

time_control: string

mode: string

variant: string

preferred_color: string

status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED"

created_at: datetime

expires_at: datetime

game_id: string | null

6. Integration Contracts
6.1 auth-api
JWT validation:

sub → user_id

tenant_id claim

Token expiry, issuer, audience.

All public endpoints require a valid JWT.

6.2 live-game-api
Internal call: CreateGame

Example REST-ish contract (you can adapt to gRPC/RPC):

Request

json
Copy code
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
Response

json
Copy code
{
  "game_id": "g_01hr08bkj1x9"
}
On failure, matchmaking-api must:

log the error with correlation id,

not mark queue entries as matched (or revert them),

optionally requeue both players or return an error status.

7. Non-Functional Requirements (NFRs)
7.1 Performance
POST /queue: P95 < 100 ms under normal load (excluding network).

GET /queue/{id}: P95 < 50 ms.

Match assignment: target < 1 second from both players being eligible in queue.

7.2 Scalability
Stateless API layer with horizontal scaling.

Matchmaking workers can be sharded per (tenant_id, region, time_control_group).

Queue operations use in-memory store (e.g., Redis) to avoid DB hot spots.

7.3 Availability & Resilience
Target availability ≥ 99.9% for matchmaking.

Graceful degradation:

if live-game-api is down, block new matching and surface clear error.

Idempotent operations (e.g., queue join for same user / same conditions within short window).

7.4 Security
JWT auth on all public endpoints.

Rate limiting per IP and per user to prevent abuse (queue spam).

No PII exposure in responses; opponent info is limited to:

user_id, username, rating snapshot, maybe country/flag.

7.5 Observability
Metrics:

request counts, latencies, error rates.

queue length per pool.

average & percentiles of waiting time.

match success vs timeout ratio.

Logs:

structured logs for enqueue, cancel, match decisions, CreateGame calls.

Tracing:

propagate correlation IDs across API → matcher → live-game-api.

8. Configuration & Feature Flags
Per-queue configuration:

initial rating window (e.g., ±100).

widening rules over time (every X seconds widen by Y).

max rating gap.

max queue time.

region preferences.

Feature flags:

enable/disable direct challenges.

enable experimental matching algorithms for subset of users (A/B).

Configs should be stored in DB and cached, not hardcoded, to avoid redeploys for tuning.

9. Open Questions / Future Extensions
Tournament matchmaking (Swiss, arena, etc.) – separate flow or extended queues.

Party/friend matchmaking (multi-player pools).

Integration with anti-cheat / fair play system (e.g., avoid matching flagged users together).

Multi-region routing:

how app decides which region’s queue to hit (DNS, gateway, etc.).

Support for bots / AI opponents with their own pools.