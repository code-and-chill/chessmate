---
title: Cross-Service Documentation Index
status: draft
last_reviewed: 2025-11-15
type: index
---

# Cross-Service Documentation

This directory contains platform-wide documentation covering standards, architecture, operations, business context, and architectural decisions.

## Directory Structure

### 📋 [standards/](./standards/)
Coding and platform standards applied across all services.

- [coding-style.md](./standards/coding-style.md) - Code style and naming conventions
- [testing.md](./standards/testing.md) - Testing standards and patterns
- [logging.md](./standards/logging.md) - Logging and observability standards
- [security.md](./standards/security.md) - Security best practices and requirements
- [observability.md](./standards/observability.md) - Metrics, tracing, and monitoring
- [documentation.md](./standards/documentation.md) - Documentation standards and templates

### 🏗️ [architecture/](./architecture/)
System-wide architectural documentation and service interactions.

- [system-context.md](./architecture/system-context.md) - High-level system context and boundaries
- [domain-map.md](./architecture/domain-map.md) - Bounded contexts and domain landscape
- [service-catalog.md](./architecture/service-catalog.md) - Complete service index with descriptions
- [integration-flows.md](./architecture/integration-flows.md) - Cross-service communication patterns

### 🚀 [operations/](./operations/)
Operational and reliability guidelines.

- [sre-playbook.md](./operations/sre-playbook.md) - SRE practices and runbooks
- [incident-response.md](./operations/incident-response.md) - Incident response procedures
- [oncall-guide.md](./operations/oncall-guide.md) - On-call engineer guide

### 💼 [business/](./business/)
Business context and domain information.

- [product-vision.md](./business/product-vision.md) - Product vision and roadmap
- [domain-overview.md](./business/domain-overview.md) - Business domain overview
- [glossary.md](./business/glossary.md) - Ubiquitous language and terminology

### 🔑 [decisions/](./decisions/)
Architectural Decision Records (ADRs) tracking significant technical decisions.

- `ADR-0001-...md` - Individual decision records (numbered sequentially)
- [README.md](./decisions/README.md) - ADR index and decision process

## Quick Links

- 📖 [AGENTS.md](../AGENTS.md) - Engineering guide and principles
- 🌐 [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture overview
- 📚 [SYSTEM_GUIDE.md](../SYSTEM_GUIDE.md) - Service index and navigation

## For Service-Specific Documentation

See individual service directories:
- `/services/<service-name>/docs/` - Service-specific documentation
- `/services/<service-name>/README.md` - Service quick start

---

*Last updated: 2025-11-15*
