---
title: Rating API Overview
service: rating-api
status: active
last_reviewed: 2025-11-15
type: overview
---

## Scope

- Single source of truth for player ratings across pools (bullet, blitz, rapid, classical) and variants.
- Implements Glicko-2 initially; engine is swappable.
- Idempotent ingestion of game results; batch recomputation hooks.

## In Scope
- rating_pool, user_rating, rating_event models
- Read endpoints and bulk fetch
- Game ingestion with idempotency and event outbox

## Out of Scope
- Game rules/adjudication
- Leaderboard rendering
- Anti-cheat decisions
