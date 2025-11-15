---
title: Rating Domain
service: rating-api
status: active
last_reviewed: 2025-11-15
type: domain
---

## Invariants
- Each `(user_id, pool)` has exactly one current rating state
- All mutations are traceable to a game or admin action (rating_event)
- Ingestion is idempotent; same game never double-counted

## Pools
- `code` pattern examples: `blitz_standard`, `bullet_standard`, `arena_blitz`
- Engine defaults derived from pool config

## Provisional & Decay
- Provisional until `games_played >= 10` (configurable)
- Inactivity decay handled by RD growth (future scheduler)
