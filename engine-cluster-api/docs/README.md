---
title: Engine Cluster Overview
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: overview
---

The engine-cluster-api runs Stockfish-like chess engines as stateless workers. Receives FEN + search parameters, returns candidate moves with evaluations.

- Entrypoint: `POST /v1/evaluate`
- Engine: Stockfish (configurable path)
- Fallback: Mock evaluation when engine unavailable
