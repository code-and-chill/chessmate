---
title: Matchmaking API Operational Runbook
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: operations
---

# Matchmaking API - Operational Runbook

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis

### Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/matchmaking
REDIS_URL=redis://redis:6379/1
LIVE_GAME_API_URL=http://live-game-api:8002
WORKER_INTERVAL_SECONDS=2
```

## Monitoring

### Key Metrics

- Queue length (players waiting)
- Match creation rate (matches/minute)
- Average wait time
- Worker cycle duration

### Alerts

- Queue length > 1000 (potential performance issue)
- Match failure rate > 1% (live-game-api connectivity)
- Worker cycle > 5 seconds (DB slowness or queue saturation)

## Health Checks

**Liveness**: `GET /health` → 200 OK

**Readiness**: `GET /ready` → Checks DB, Redis, live-game-api

## Incident Response

**Issue**: Queue buildup / matches not being created

**Investigation**:
1. Check worker logs: `tail -f /var/log/matchmaking-worker.log`
2. Verify Redis: `redis-cli KEYS queue:*`
3. Verify DB: `SELECT COUNT(*) FROM queue_entries WHERE status='waiting';`
4. Test live-game-api: `curl http://live-game-api:8002/health`

**Resolution**:
- Restart worker if stuck
- Check live-game-api connectivity
- Verify database indexes on time_control, rating columns

## Maintenance

### Queue Cleanup

Remove expired queue entries (players who left):

```sql
DELETE FROM queue_entries 
WHERE status='cancelled' 
AND created_at < NOW() - INTERVAL '1 hour';
```

### Index Optimization

Ensure indexes on common matching queries:

```sql
CREATE INDEX IF NOT EXISTS idx_queue_by_time_control_rating 
ON queue_entries(time_control, rating);
```

---

*Last updated: 2025-11-15*
