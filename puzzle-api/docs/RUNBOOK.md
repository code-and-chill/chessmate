---
title: Puzzle API Runbook
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: operations
---

# Puzzle API Runbook

## Deployment

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- PostgreSQL (or SQLite for local development)

### Local Deployment
```bash
cd puzzle-api
pip install -r requirements/dev.txt
python -m pytest
uvicorn app.main:app --reload
```

### Docker Deployment
```bash
docker build -t puzzle-api:latest .
docker run -p 8000:8000 puzzle-api:latest
```

## Configuration

### Environment Variables
```
DATABASE_URL=sqlite:///./test.db
FASTAPI_ENV=development
LOG_LEVEL=INFO
```

## Monitoring & Observability

### Health Check
```bash
curl http://localhost:8000/health
```

### Metrics
- Request count per endpoint
- Response time (p50, p95, p99)
- Error rate
- Daily puzzle cache hit rate

### Logs
- Puzzle served events
- Attempt creation events
- Error events

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Review logs for connection errors

### High Latency on Daily Puzzle
- Check cache hit rate
- Verify database indexes
- Monitor query performance

### Rating Calculation Issues
- Verify puzzle ratings are correct
- Check user stats table for corruption
- Review rating algorithm logs

## Backup & Recovery

### Database Backup
```bash
pg_dump chessmate_puzzles > backup.sql
```

### Restore from Backup
```bash
psql chessmate_puzzles < backup.sql
```

## Incident Response

### 500 Errors on Puzzle Submission
1. Check server logs for exceptions
2. Verify database is accessible
3. Check for out-of-memory conditions
4. Restart service if necessary

### Daily Puzzle Not Loading
1. Verify daily_puzzles table has entry for today
2. Check puzzle references are valid
3. Verify puzzle content is not corrupt
4. Fall back to cached puzzle if available

### Rating Corruption
1. Identify affected users
2. Recalculate ratings from attempt history
3. Update user_puzzle_stats table
4. Notify affected users if necessary
