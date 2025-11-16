---
title: Engine Cluster – Operations
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: operations
---

Environment Variables:
- `STOCKFISH_PATH`: Path to stockfish binary (auto-detected if not set)
- `ENGINE_THREADS`: Number of threads per engine instance (default: 1)
- `ENGINE_HASH_MB`: Hash table size in MB (default: 128)

Ports:
- HTTP: 9000

Health:
- `GET /health`

Performance: P99 < 2s for depth 12-15 searches. Tune threads and hash based on hardware.
