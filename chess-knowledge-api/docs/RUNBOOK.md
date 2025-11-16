---
title: Chess Knowledge – Runbook
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: operations
---

Deployment
- Build container with Dockerfile
- Mount opening book and tablebase volumes
- Configure paths via environment variables
- Scale horizontally for high query load

Diagnostics
- Check `/health`
- Monitor 200 vs 204 response rates (hit rate)
- Verify data files exist at configured paths

Common Issues
- 204 responses → data not loaded or position out of scope
- Slow queries → index opening books, use SSD for tablebases
- Missing data files → mount volumes correctly
