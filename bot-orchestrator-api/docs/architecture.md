---
title: Bot Orchestrator – Architecture
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: architecture
---

Components:
- HTTP API (FastAPI)
- Clients: engine-cluster, bot-config, chess-knowledge
- Orchestration logic: phase detection, time management, mistake/style application
- Telemetry: structured logs + in-memory last-moves buffer

Data Flow:
1) live-game-api → `/v1/bots/{bot_id}/move`
2) Fetch BotSpec
3) Opening/tablebase checks
4) Decide engine params
5) Evaluate position (multi-PV)
6) Apply mistake band + style weighting
7) Return final move + metadata

Scalability: stateless, horizontally scalable. Configure dependency URLs via env vars.
