---
title: Engine Cluster – Runbook
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: operations
---

Deployment
- Build container with Dockerfile (includes stockfish)
- Configure ENGINE_THREADS based on CPU cores
- Scale horizontally for load

Diagnostics
- Check `/health`
- Monitor response times for `/v1/evaluate`
- Verify stockfish binary available: `which stockfish`

Common Issues
- Stockfish not found → install: `apt-get install stockfish` or set STOCKFISH_PATH
- Slow evaluations → reduce depth or increase ENGINE_THREADS
