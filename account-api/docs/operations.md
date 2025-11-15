---
title: Account API Operations
service: account-api
status: draft
last_reviewed: 2025-11-15
type: operations
---

# Account API Operations

Operational procedures, monitoring, and runbooks for account-api.

## Deployment

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Docker

### Docker Build

```bash
docker build -t account-api:latest .
```

### Kubernetes Deployment

(Fill: Document K8s deployment procedures)

### Environment Configuration

```env
DATABASE_URL=postgresql://user:pass@db:5432/account
JWT_SECRET_KEY=<generate-random-key>
DEBUG=false
LOG_LEVEL=INFO
```

## Monitoring

### Key Metrics

- Login success/failure rate
- Profile update latency (p95 < 100ms)
- Database connection pool usage
- Authentication token validation time

### Dashboards

(Fill: Link to Grafana dashboards)

### Alerts

(Fill: Define alert thresholds)

## Health Checks

**Liveness Probe**: `GET /health`

Returns 200 OK if service is running.

**Readiness Probe**: `GET /ready`

Returns 200 OK if database is accessible.

## Scaling

- **Horizontal**: Stateless service scales linearly
- **Database**: Connection pool size: 10-20 connections
- **Cache**: Redis for token validation (optional)

## Backup & Recovery

(Fill: Document backup procedures)

### RTO/RPO

- **RTO**: < 30 minutes (Tier 1 service)
- **RPO**: < 1 hour (critical user data)

## Troubleshooting

### Common Issues

**Issue**: Database connection errors

**Solution**: Check DATABASE_URL and verify PostgreSQL is running

**Issue**: Authentication failures

**Solution**: Verify JWT_SECRET_KEY matches across services

(Fill: Add more troubleshooting scenarios)

## Incident Response

See [/docs/operations/incident-response.md](../../docs/operations/incident-response.md)

---

*Last updated: 2025-11-15*
