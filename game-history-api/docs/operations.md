---
title: Game History Operations
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: operations
---

# Game History Operations

## Runtime
- Default port: **8014** (configurable via `PORT` env when containerized).
- FastAPI app is stateless; repository binding is configured at startup.

## Configuration
- `PORT`: HTTP listener port.
- `LOG_LEVEL`: uvicorn log level (`info` default).
- `DATABASE_URL` (future): Postgres connection string when persistence is enabled.

## Observability
- `/health` for liveness.
- Future improvements: metrics for processed game count, most recent `endedAt`, and repository size.

## Backup & Restore
- Not required for in-memory prototype.
- Production: rely on Postgres PITR and Kafka replay for rebuilds.

## Deployment
- Containerized via Dockerfile (to be added); uses uvicorn entrypoint.
- Recommended readiness checks: HTTP 200 on `/health`.
