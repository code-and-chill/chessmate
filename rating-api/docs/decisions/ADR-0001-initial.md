---
title: ADR-0001 – Initial Rating API design
service: rating-api
status: active
last_reviewed: 2025-11-15
type: decision
---

## Decision
Implement Rating API as a Python FastAPI service with Glicko-2 engine behind an interface; use idempotent ingestion with `(game_id, pool_id)` uniqueness and a transactional outbox for `rating.updated` events.

## Rationale
Meets consistency-first requirements, auditability, and scalability with a proven rating algorithm and integration pattern.
