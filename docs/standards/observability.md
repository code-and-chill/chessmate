---
title: Observability Standards
status: draft
last_reviewed: 2025-11-15
type: standard
---

# Observability Standards

Metrics, tracing, and monitoring standards across the platform.

## Observability Pillars

### Logs
**Fill:** Define logging observability requirements.

- Structured JSON logging across all services
- Standard contextual fields (see logging.md)
- Log aggregation and retention policies

### Metrics
**Fill:** Define metrics collection standards.

- Sections to add:
  - Prometheus metrics format
  - Standard metric naming convention
  - Counter vs gauge vs histogram usage
  - Service-level indicator (SLI) definitions
  - Metric cardinality management

### Traces
**Fill:** Define distributed tracing standards.

- Sections to add:
  - Trace context propagation (W3C standard)
  - OpenTelemetry instrumentation
  - Sampling strategies
  - Span naming conventions
  - Critical path tracing

## Key Metrics by Service Type

**Fill:** Define core metrics for each service type.

- API services: latency, throughput, error rate, saturation
- Worker services: items processed, processing time, failure rate
- Database queries: query time, connections, cache hit ratio
- External integrations: availability, latency, retry count

## Dashboards

**Fill:** Define standard dashboards.

- Sections to add:
  - System health dashboard (all services)
  - Per-service dashboard template
  - Business metrics dashboard
  - Dependency health dashboard

## Alerting

**Fill:** Define alerting strategies.

- Sections to add:
  - Alert severity levels (critical, warning, info)
  - Alert routing and escalation
  - Alert fatigue prevention
  - Common alert patterns (SLO-based alerts)
  - On-call alert requirements

## Data Retention

**Fill:** Define retention policies for observability data.

- Sections to add:
  - Log retention periods by level
  - Metrics retention periods
  - Trace sampling and retention
  - Compliance requirements (audit trails)

---

*Last updated: 2025-11-15*
