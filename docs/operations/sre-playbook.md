---
title: SRE Playbook
status: draft
last_reviewed: 2025-11-15
type: operations
---

# SRE Playbook

Site Reliability Engineering practices and runbooks for the platform.

## Principles

- **Embrace Risk**: Balance velocity and reliability through SLOs
- **Eliminate Toil**: Automate repetitive operational tasks
- **Measure Everything**: Use data to drive decisions
- **Collaborate**: Engineers and operators working together

## Service Level Objectives (SLOs)

**Fill:** Define SLOs for each service tier.

### Tier 1: Core Services
- **Availability**: 99.9% uptime (43 minutes downtime/month)
- **Latency**: p95 < 200ms
- **Error Rate**: < 0.1%

Examples: account-api, live-game-api

### Tier 2: Supporting Services
- **Availability**: 99% uptime (7 hours downtime/month)
- **Latency**: p95 < 500ms
- **Error Rate**: < 1%

Examples: matchmaking-api

### Tier 3: Batch/Background Services
- **Availability**: 95% uptime (36 hours downtime/month)
- **Latency**: Job completion within SLA
- **Error Rate**: < 5%

Examples: Worker services

## Monitoring & Alerting

**Fill:** Define monitoring strategy and alert thresholds.

### Key Metrics to Monitor
- Service availability (uptime)
- Request latency (p50, p95, p99)
- Error rates by type
- Resource utilization (CPU, memory, disk)
- Database connection pool usage
- Cache hit/miss ratios

### Alert Severity Levels
- **Critical**: Immediate human response required (on-call escalation)
- **Warning**: Should be addressed within hours (morning standup)
- **Info**: Informational, no immediate action needed

## Deployment & Release

**Fill:** Document deployment procedures.

### Deployment Process
1. Code review and merge to main
2. Automated testing (unit, integration, contract tests)
3. Build container image
4. Push to container registry
5. Deploy to staging environment
6. Canary deploy to production (5% traffic)
7. Monitor metrics and logs
8. Gradual rollout (25%, 50%, 100%)
9. Rollback available at any stage

### Release Windows
- **Standard**: [Day/time for production deployments]
- **Emergency**: 24/7 availability for critical fixes
- **Freeze Periods**: [Holidays, blackout dates]

## Scaling & Capacity

**Fill:** Document scaling policies and capacity planning.

### Horizontal Scaling Triggers
- **CPU**: > 70% for 5 minutes
- **Memory**: > 80% for 5 minutes
- **Request Latency**: p95 > 300ms for 5 minutes

### Vertical Scaling
- [When and how to increase instance resources]

### Capacity Planning
- [Forecasting and planning procedures]

## Disaster Recovery

**Fill:** Document disaster recovery and backup strategies.

### Backup Strategy
- **Frequency**: [Daily/hourly]
- **Retention**: [Duration]
- **Verification**: Regular restore testing

### Recovery Time Objectives (RTO)
- **Tier 1 Services**: < 30 minutes
- **Tier 2 Services**: < 2 hours
- **Tier 3 Services**: < 24 hours

### Recovery Point Objectives (RPO)
- **Critical Data**: < 1 hour
- **Standard Data**: < 24 hours

## Maintenance Windows

**Fill:** Document planned maintenance procedures.

### Database Maintenance
- [Scheduled maintenance times]
- [Maintenance procedures]
- [Rollback procedures]

### Infrastructure Maintenance
- [OS patching schedule]
- [Dependency updates]
- [Security patches]

---

*Last updated: 2025-11-15*
