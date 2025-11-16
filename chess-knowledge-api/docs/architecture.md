---
title: Chess Knowledge – Architecture
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: architecture
---

Components:
- HTTP API (FastAPI)
- Opening book service (queries Polyglot or custom format)
- Tablebase service (queries Syzygy tablebases)
- Mock data providers for dev

Data Flow:
1) bot-orchestrator-api → POST /v1/opening/book-moves or /v1/endgame/tablebase
2) Query appropriate data source
3) Return moves with metadata or 204 if not found

Scalability: Stateless, read-only service. Cache-friendly. Can scale horizontally.
