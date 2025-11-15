---
title: Rating API Architecture
service: rating-api
status: active
last_reviewed: 2025-11-15
type: architecture
---

## Components
- FastAPI app with modular routers
- SQLAlchemy models (PostgreSQL)
- Glicko-2 engine behind `RatingEngine` interface
- Transactional Outbox table for `rating.updated`

## Data Model
- rating_pool: pool definitions and Glicko defaults
- user_rating: latest rating state per user+pool
- rating_event: append-only audit of changes
- rating_ingestion: idempotency log for (game_id, pool_id)
- event_outbox: async integration (publisher TBD)

## Flows
1. Game finished → POST /v1/game-results
2. Transaction: ensure idempotency, compute updates, persist events, write outbox, commit
3. Publisher forwards outbox to bus (future: Kafka/NATS). 

## Idempotency
- Unique constraint on `(game_id, pool_code)` in `rating_ingestion`
- On conflict: return stored `*_rating_after`

## Extensibility
- `RatingEngine` base for pluggable rating systems (Elo, TrueSkill)
- Pool-level params control Glicko constants
