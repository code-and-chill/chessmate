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

## Admin
- `POST /v1/admin/pools` (create/update pool)

> Note: We use Bruno collections for requests during development; standard contract to follow later.
