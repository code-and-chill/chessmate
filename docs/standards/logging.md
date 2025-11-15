---
title: Logging Standards
status: draft
last_reviewed: 2025-11-15
type: standard
---

# Logging Standards

Structured logging and observability standards across all services.

## Logging Principles

- **Structured Logging**: JSON-formatted logs with consistent fields
- **Contextual Information**: Include request IDs, user IDs, service names
- **Appropriate Levels**: Use ERROR, WARN, INFO, DEBUG correctly
- **No Secrets**: Never log sensitive data (passwords, tokens, PII)

## Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| **ERROR** | Actionable errors requiring attention | Database connection failed, validation error |
| **WARN** | Potential issues to investigate | Deprecated API usage, performance degradation |
| **INFO** | Significant business events | User login, payment processed, service started |
| **DEBUG** | Detailed debugging information | Variable values, execution flow, query parameters |

## Structured Log Format

**Fill:** Define standard JSON log structure.

- Sections to add:
  - Required fields (timestamp, level, service, message)
  - Contextual fields (request_id, user_id, correlation_id)
  - Error fields (error_code, error_message, stack_trace)
  - Performance fields (duration_ms, cache_hit)
  - Example JSON structure

## Language-Specific Implementation

**Fill:** Define logging implementation per language.

- Python: `structlog` or similar structured logging library
- Go: Structured JSON logging (e.g., `logrus`, `slog`)
- TypeScript: Winston or similar structured logger
- Kotlin: Logback or SLF4J with JSON encoder
- Rust: `tracing` or `slog` for structured logs

## Common Patterns

**Fill:** Define logging patterns for common scenarios.

- Sections to add:
  - Request/response logging
  - Error logging with context
  - Performance logging
  - Security event logging (auth, authorization)
  - Third-party service interaction logging

---

*Last updated: 2025-11-15*
