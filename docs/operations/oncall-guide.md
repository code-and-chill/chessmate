---
title: On-Call Guide
status: draft
last_reviewed: 2025-11-15
type: operations
---

# On-Call Guide

Guide for engineers on on-call rotation.

## Before Your Shift

### Preparation (1 week before)

1. **Review Recent Incidents**
   - Read post-incident reports
   - Understand common failure modes
   - Note any systemic issues

2. **Familiarize Yourself**
   - Check service status page
   - Review current alerts and thresholds
   - Verify alert routing is correct

3. **Update Contact Info**
   - Confirm phone number in system
   - Verify Slack notifications enabled
   - Test escalation procedures

### Day Before Shift

1. **Verify Tools Access**
   - Confirm access to monitoring dashboards
   - Test VPN connection
   - Verify SSH keys for production access

2. **Check on Existing Issues**
   - Any ongoing investigations?
   - Any degradation or warnings?
   - Any recent deployments?

3. **Review Runbooks**
   - Refresh memory on common procedures
   - Check for any new runbooks

## During Your Shift

### Responsibilities

- **Ownership**: You own all platform alerts during your shift
- **Responsiveness**: Acknowledge alerts within 5 minutes
- **Communication**: Keep stakeholders informed
- **Prevention**: Proactive monitoring to catch issues early

### Tools You'll Use

| Tool | Purpose | Access |
|------|---------|--------|
| **PagerDuty** | Alert routing and escalation | [Link] |
| **Grafana** | Metrics and dashboards | [Link] |
| **CloudWatch/ELK** | Logs and traces | [Link] |
| **Sentry** | Error tracking | [Link] |
| **GitHub** | Code and deployments | [Link] |

### Daily Checks

**Morning**:
- Review overnight alerts and metrics
- Check for any deployments that went out
- Note any degradation or warnings

**Throughout Shift**:
- Monitor dashboards regularly
- Proactive log review for errors
- Check for any slow queries or resource issues

**End of Shift**:
- Brief handoff to next on-call engineer
- Highlight any ongoing issues
- Pass along any context

## Common Procedures

### Service Is Down

1. **Immediate Actions**
   - Declare severity level
   - Open war room channel
   - Alert incident commander
   - Begin triage

2. **Investigation**
   - Check recent deployments (rollback?)
   - Check service logs for errors
   - Check database connection pool
   - Check external service dependencies
   - Check CPU/memory/disk usage

3. **See Also**
   - [Incident Response Guide](./incident-response.md)
   - Service [RUNBOOK.md] files

### High Latency

1. **Check Metrics**
   - Request latency by endpoint
   - Database query performance
   - Cache hit ratios
   - Resource utilization

2. **Potential Causes**
   - Database slow query
   - Cache miss causing load
   - External service slow
   - Resource exhaustion (scaling trigger)

### Error Rate Spike

1. **Investigate**
   - Error logs in Sentry/CloudWatch
   - Recent deployments
   - Database migration issues
   - Dependency failures

2. **Common Fixes**
   - Rollback recent deployment
   - Increase error threshold for circuit breaker
   - Scale up resource limits

## Escalation

### When to Escalate

- Can't determine root cause within 15 minutes
- Need specialized knowledge (database team, security)
- Requires executive decision (feature flag rollout)

### Escalation Contacts

**Fill:** Add actual escalation contacts.

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| Tech Lead | [Name] | [Phone] | [@slack] |
| Engineering Manager | [Name] | [Phone] | [@slack] |
| VP Engineering | [Name] | [Phone] | [@slack] |
| Ops Lead | [Name] | [Phone] | [@slack] |

## After Your Shift

### Handoff

Provide incoming on-call engineer with:
- Summary of any alerts triggered
- Any ongoing investigations
- Recent deployments
- Any known issues or warnings
- Anything unusual to watch for

### Post-Incident

- If incidents occurred, attend post-incident review
- Create action items for prevention
- Update documentation/runbooks as needed

## Resources

- [Incident Response Guide](./incident-response.md)
- [SRE Playbook](./sre-playbook.md)
- Service Runbooks: `/{service}/docs/RUNBOOK.md`
- [Architecture Overview](../architecture/system-context.md)
- [Service Catalog](../architecture/service-catalog.md)

---

*Last updated: 2025-11-15*
