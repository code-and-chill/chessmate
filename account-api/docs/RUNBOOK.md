---
title: Account Service Operational Runbook
service: account-api
status: active
last_reviewed: 2025-11-15
type: operations
---

# Account Service - Operational Runbook

## Deployment

### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database running and accessible
- Environment variables configured

### Deployment Steps

1. **Build Docker Image**

```bash
docker build -t chessmate/account-api:latest .
```

2. **Run Container**

```bash
docker run -d \
  --name account-api \
  -p 8000:8000 \
  --env-file .env \
  -e DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/chessmate_account \
  chessmate/account-api:latest
```

3. **Verify Service Health**

```bash
curl http://localhost:8000/health
```

## Monitoring and Alerts

### Key Metrics

- **Request Latency**: Authentication should complete within 100ms
- **Error Rate**: Should remain below 0.1%
- **Database Connection Pool**: Monitor active connections < 50
- **Token Validation Cache**: Monitor hit rate > 95%

### Health Checks

Liveness endpoint:

```bash
GET /health
```

Readiness endpoint:

```bash
GET /ready
```

### Structured Logging

All logs are emitted in JSON format with fields:
- `timestamp`: UTC timestamp
- `level`: DEBUG, INFO, WARNING, ERROR
- `service`: account-api
- `user_id`: User ID if available
- `request_id`: Correlation ID for tracing
- `message`: Log message

## Incident Response

### Authentication Service Down

1. **Detect**: Incoming requests receive 503 Service Unavailable
2. **Impact**: All platform services cannot authenticate users
3. **Response**:
   - Check database connectivity: `psql connection-string`
   - Review logs for errors: `docker logs account-api`
   - Verify environment variables are set correctly
   - Restart service: `docker restart account-api`

### Database Connection Pool Exhausted

1. **Detect**: New connections receive timeout errors
2. **Impact**: New authentication requests are rejected
3. **Response**:
   - Check active connections: `SELECT count(*) FROM pg_stat_activity;`
   - Identify long-running queries
   - Increase connection pool size in .env
   - Restart service to reset connections

### High Error Rate in Token Validation

1. **Detect**: Token validation errors > 1% of requests
2. **Impact**: User sessions becoming invalid
3. **Response**:
   - Check JWT_SECRET_KEY hasn't changed
   - Review JWT_EXPIRATION_HOURS configuration
   - Check for clock skew between services
   - Verify cryptographic library versions

## Performance Tuning

### Database Query Optimization

- Add indexes on frequently searched columns: `email`, `user_id`
- Review query plans for N+1 issues
- Consider materialized views for complex role lookups

### Token Caching

- Implement Redis cache for token validation (configure REDIS_URL in .env)
- TTL should match JWT expiration time
- Monitor cache hit rate

### Connection Pooling

- Adjust `DATABASE_POOL_SIZE` based on concurrent load (default: 20)
- Increase for high-traffic periods
- Monitor with: `SELECT count(*) FROM pg_stat_activity;`

## Backup and Recovery

### Database Backup

```bash
pg_dump -h localhost -U postgres chessmate_account > backup.sql
```

### Database Recovery

```bash
psql -h localhost -U postgres chessmate_account < backup.sql
poetry run alembic upgrade head
```

### Disaster Recovery

1. Restore database from backup
2. Reset all tokens (users must re-authenticate)
3. Verify service functionality
4. Alert users of maintenance window

## Dependency Management

### Regular Updates

- Monthly: Update Python dependencies
  ```bash
  poetry update
  ```
- Quarterly: Review and update security packages
- Monitor: CVE alerts for active dependencies

## Maintenance Windows

### Recommended Schedule

- **Database Maintenance**: Sunday 2:00 AM UTC (low traffic)
- **Dependency Updates**: Second Tuesday of month
- **Schema Migrations**: During planned maintenance windows

### Communication

1. Notify users 24 hours before maintenance
2. Set status page to maintenance mode
3. Post updates in incident channel during window
4. Update status page when complete

## Troubleshooting Guide

### Users Unable to Login

**Symptoms**: Login requests return 401 Unauthorized

**Investigation**:
1. Check user exists: `SELECT * FROM accounts WHERE email='user@example.com';`
2. Verify password hash: Check bcrypt validation in logs
3. Check JWT generation: Verify JWT_SECRET_KEY is set

**Resolution**:
- Reset password if needed
- Check environment variables
- Verify clock sync between servers

### Token Validation Failures

**Symptoms**: 401 responses from other services

**Investigation**:
1. Verify token format: Should be `Bearer {token}`
2. Check token expiration: `jwt.decode(token, verify_exp=False)`
3. Verify signing key matches

**Resolution**:
- Ensure all services use same JWT_SECRET_KEY
- Check token hasn't expired
- Regenerate token

### Database Connection Issues

**Symptoms**: "Cannot connect to database" errors

**Investigation**:
1. Verify PostgreSQL running: `pg_isready -h localhost`
2. Check connection string: `echo $DATABASE_URL`
3. Check credentials: `psql -h localhost -U user -d chessmate_account`

**Resolution**:
- Start PostgreSQL: `pg_ctl -D /path/to/data start`
- Update DATABASE_URL with correct credentials
- Verify firewall allows connection
