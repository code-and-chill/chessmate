---
title: Rating API Runbook
service: rating-api
status: active
last_reviewed: 2025-11-15
type: operations
---

## On-Call Checklist
- Verify database connectivity
- Check ingestion idempotency (unique constraint violations)
- Inspect `event_outbox` for backlog

## Common Issues
- 409 on ingestion → duplicate `(game_id, pool_id)`; safe to ignore

## Deployments
- Rolling deploy; ensure outbox publisher (future) drains
