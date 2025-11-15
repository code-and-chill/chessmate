---
title: Live Game API Operational Runbook
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: operations
---

# Live Game API - Operational Runbook

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis (for connection state cache)

### Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/live_game
REDIS_URL=redis://redis:6379/0
DEBUG=false
LOG_LEVEL=INFO
```

### Startup

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002
```

## Monitoring

### Key Metrics

- Active games count
- Move validation latency (p95 < 50ms)
- WebSocket connection count
- Database transaction time

### Health Endpoints

- `GET /health` - Service liveness
- `GET /ready` - Service readiness (checks DB/Redis)

## Scaling

### Horizontal Scaling

Live Game API is stateless except for active WebSocket connections.

- API layer: Horizontal scaling via load balancer
- Connection affinity: Use sticky sessions for WebSocket clients
- Database: Connection pool 20-40 per instance

### High Availability

- Multiple replicas behind load balancer
- Automatic failover on instance failure
- Database replication for data redundancy

## Incident Response

**Issue**: WebSocket connections disconnecting unexpectedly

**Steps**:
1. Check Redis connectivity: `redis-cli ping`
2. Verify database connections: `SELECT count(*) FROM pg_stat_activity;`
3. Check network latency to clients
4. Review logs for error patterns

**Resolution**: Restart affected instances if Redis/DB issue, or adjust connection timeout settings.

---

*Last updated: 2025-11-15*
