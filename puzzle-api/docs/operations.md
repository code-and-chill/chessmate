---
title: Puzzle API Operations
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: operations
---

# Operations

## Deployment
Puzzle API is deployed as a containerized service. Use the provided Dockerfile and service.yaml for deployment.

## Observability
- Metrics: Request counts, latencies, error rates.
- Logs: Puzzle served, attempt created.
- Tracing: Correlation IDs for cross-service calls.

## Scaling
- Use Redis for caching daily puzzles.
- Horizontal scaling for high read/write throughput.

## Backup & Recovery
- Regular backups of PostgreSQL database.
- Restore procedures documented in the runbook.