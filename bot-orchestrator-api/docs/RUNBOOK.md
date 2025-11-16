---
title: Bot Orchestrator – Runbook
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: operations
---

Deployment
- Build container with Dockerfile
- Configure dependency URLs
- Scale horizontally; stateless

Diagnostics
- Check `/health`
- Use `/v1/debug/last-moves` to inspect recent decisions

Common Issues
- Dependency unavailable → service returns fallback engine params and mock candidates for local dev
- Timeouts → increase `HTTP_CLIENT_TIMEOUT_MS`
