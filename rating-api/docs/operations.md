---
title: Rating API Operations
service: rating-api
status: active
last_reviewed: 2025-11-15
type: operations
---

## Deployment
- Containerized via Docker
- Exposes port `8013`
- Requires PostgreSQL
- Optional: NATS (JetStream) for event publishing (`rating.updated`)

## Config
- `DATABASE_URL`: Postgres DSN (asyncpg)
- `REQUIRE_AUTH`: enable bearer auth for all endpoints
- `INTERNAL_BEARER_TOKEN`: shared token for internal calls
- `GLICKO_*`: engine defaults
- `OUTBOX_ENABLED`: toggle event outbox publisher (default: true)
- `OUTBOX_NATS_URL`: NATS server URL (default: `nats://nats:4222`)
- `OUTBOX_PUBLISH_INTERVAL_SEC`: polling interval for publisher

## Health
- `GET /health`

## Observability
- Structured logs to stdout
- TODO: tracing and metrics
