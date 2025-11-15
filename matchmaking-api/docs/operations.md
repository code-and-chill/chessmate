---
title: Matchmaking Operations
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: operations
---

# Matchmaking Operations

Operational procedures and runbooks for matchmaking-api.

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis (for queue state)

### Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/matchmaking
REDIS_URL=redis://redis:6379/1
LIVE_GAME_API_URL=http://live-game-api:8002
```

## Monitoring

### Key Metrics

- Queue length (players waiting)
- Match creation rate (matches/sec)
- Average wait time
- Match success rate (games actually started)

### Alerts

(Fill: Define alert thresholds for queue buildup, match failure, etc.)

## Scaling

- Queue processing can handle 1000+ players
- Redis queue stores state
- Horizontal scaling via queue workers

## Troubleshooting

**Issue**: Queue buildup / long wait times

**Solution**: Check if live-game-api is responsive, verify rating matching is working

(Fill: Add more scenarios)

---

*Last updated: 2025-11-15*
