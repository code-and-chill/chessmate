---
title: Troubleshooting
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

- 404 on `/v1/bots/{id}/move`: verify base path `/v1` and port 8005
- Empty candidates: engine not reachable; ensure `ENGINE_CLUSTER_URL` or use local fallback
- No book/tablebase moves: ensure `CHESS_KNOWLEDGE_URL` configured and data present
