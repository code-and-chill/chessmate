---
title: Engine Cluster – API
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: api
---

Base URL: `/v1`

POST `/evaluate`
- Request:
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "side_to_move": "w",
  "max_depth": 12,
  "time_limit_ms": 1000,
  "multi_pv": 4
}
```
- Response:
```json
{
  "candidates": [
    {"move": "e2e4", "eval": 0.25, "depth": 12, "pv": ["e2e4", "c7c5"]},
    {"move": "d2d4", "eval": 0.20, "depth": 12, "pv": ["d2d4", "d7d5"]}
  ],
  "fen": "...",
  "time_ms": 450
}
```

GET `/health`
- Basic health check.
