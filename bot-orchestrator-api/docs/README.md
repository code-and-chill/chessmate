---
title: Bot Orchestrator Overview
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: overview
---

The bot-orchestrator-api evaluates a BotSpec, queries engine/knowledge services, applies mistake and style models, and returns a single move for a given game state.

- Entrypoint: `POST /v1/bots/{bot_id}/move`
- Dependencies: engine-cluster-api, bot-config-api, chess-knowledge-api
- Deterministic when seeded via `metadata.seed`
