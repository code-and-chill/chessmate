---
title: Live Game API Operations
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: operations
---

# Live Game API Operations

Operational procedures, monitoring, and runbooks for live-game-api.

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis (for game state caching)

### Environment Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/live_game
REDIS_URL=redis://redis:6379/0
DEBUG=false
LOG_LEVEL=INFO
```

## Monitoring

### Key Metrics

- Active games count
- Move latency (p95 < 50ms)
- Validation error rate
- Database query time (p95 < 100ms)

### Health Checks

**Liveness**: `GET /health` → 200 OK

**Readiness**: `GET /ready` → Checks database and Redis

## Scaling

- **Horizontal**: Stateless API layer scales linearly
- **Database**: Connection pool 20-40 connections
- **Redis**: Session/game state cache

## Performance Targets

- Move validation: < 50ms p95
- Game creation: < 100ms p95
- Board state queries: < 50ms p95

## Troubleshooting

**Issue**: Slow move validation

**Solution**: Check database indexes on moves table, verify Redis is responsive

(Fill: Add more scenarios)

## Incident Response

See [/docs/operations/incident-response.md](../../docs/operations/incident-response.md)

---

*Last updated: 2025-11-15*
