---
title: Troubleshooting
service: rating-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

## Common Problems
- Cannot connect to DB → verify `DATABASE_URL` and Postgres is up
- 404 pool not found → create with `POST /v1/admin/pools`
- 409 ingestion → duplicate game id; idempotent behavior
