---
title: Rating API Endpoints
service: rating-api
status: active
last_reviewed: 2025-11-15
type: api
---

## Public (Internal) Endpoints
- `GET /v1/ratings/{user_id}`: All pool ratings for a user
- `GET /v1/ratings/{user_id}/pools/{pool_id}`: Rating for a user in a pool
- `POST /v1/ratings/bulk`:
  - Request: `{ "pool_id": "blitz_standard", "user_ids": ["u1","u2"] }`

## Ingestion
- `POST /v1/game-results`:
  - Idempotent by `(game_id, pool_id)`
  - Response: `{ game_id, white_rating_after, black_rating_after }`
 - `POST /v1/game-results/batch`:
   - Accepts an array of the above payloads
   - Processes sequentially and returns an array of results

## Leaderboards
- `GET /v1/leaderboards/{pool_id}`: Get leaderboard for a pool (paginated, top N)
  - Query parameters: `limit` (default 100), `offset` (default 0), `order` ("asc" or "desc")
  - Response: `{ pool_id, entries: [{ user_id, rating, rank }], total, limit, offset }`
- `GET /v1/leaderboards/{pool_id}/user/{user_id}`: Get user's rank in a pool
  - Response: `{ user_id, rating, rank }`

## Admin
- `POST /v1/admin/pools` (create/update pool)
- `POST /v1/admin/leaderboards/{pool_id}/recompute` (recompute leaderboard ranks)

> Note: We use Bruno collections for requests during development; standard contract to follow later.
