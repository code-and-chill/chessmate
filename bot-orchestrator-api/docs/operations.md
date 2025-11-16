---
title: Bot Orchestrator – Operations
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: operations
---

Environment Variables:
- `ENGINE_CLUSTER_URL`: base URL for engine evaluate endpoint
- `BOT_CONFIG_URL`: base URL for bot config service
- `CHESS_KNOWLEDGE_URL`: base URL for opening/tablebase
- `HTTP_CLIENT_TIMEOUT_MS`: HTTP timeout (ms)

Ports:
- HTTP: 8005

Health:
- `GET /health`

SLO: P99 ≤ 500–800 ms (excluding deep analysis). If dependencies degrade, return shallow engine search or knowledge-based move when possible.
