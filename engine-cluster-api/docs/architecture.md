---
title: Engine Cluster – Architecture
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: architecture
---

Components:
- HTTP API (FastAPI)
- Stockfish integration (python-chess library)
- Mock fallback evaluator

Data Flow:
1) bot-orchestrator-api → POST /v1/evaluate
2) Parse FEN and create board
3) Run Stockfish with time/depth limits
4) Collect multi-PV candidates
5) Return evaluations

Scalability: Stateless workers, horizontally scalable. Each instance runs independent engine processes.
