---
title: Creating a New Service
service: global
status: active
last_reviewed: 2025-11-15
type: standard
---

# Creating a New Service – Complete Lifecycle

This guide defines the mandatory process for creating a new service in the Chessmate monorepo. Follow these 7 steps **in order**.

## Step 1: Create an ADR (Architectural Decision Record)

Before writing any code, document the decision to create this service.

**Location**:
- Cross-service impact → `docs/decisions/ADR-XXXX-<slug>.md`
- Local to service → `services/<service>/docs/decisions/ADR-0001-initial.md`

**ADR must include**:
- **Context**: Why is this service needed?
- **Decision**: What is this service and what will it own?
- **Alternatives Considered**: Why not use an existing service?
- **Consequences**: What changes in architecture, deployment, operations?

**Example**:
```
# ADR-0005 – Create Live Game Service

## Status
Accepted

## Context
The current monolith cannot handle real-time game state updates with low latency.
Players experience 5+ second delays in move synchronization.

## Decision
Create a new `live-game-api` service to own real-time game state, move validation,
and clock management. It will be stateless and event-driven.

## Alternatives Considered
1. Extend the monolith – rejected due to scaling limits
2. Use WebSocket in existing API – rejected, breaks separation of concerns

## Consequences
- Operators must run a new service
- New database schema for games
- New deployment pipeline
- Integration testing complexity increases
```

---

## Step 2: Write Documentation FIRST (Before Code)

Create the complete documentation skeleton. This is **mandatory before any code**.

**Location**: `services/<service>/docs/`

**Create these files** with basic structure and placeholders:

### 2.1 `services/<service>/README.md`

```markdown
# <Service Name>

(1–3 sentence description)

## Quick Links
- [Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Domain](docs/domain.md)
- [Operations](docs/operations.md)
- [Local Development](docs/how-to/local-dev.md)
- [ADR Index](docs/decisions/README.md)
```

### 2.2 `services/<service>/docs/overview.md`

```markdown
---
title: <Service> Overview
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: overview
---

# <Service> Overview

## Purpose

(Fill: What does this service do?)

## Scope

### In Scope
- (Fill: List main responsibilities)

### Out of Scope
- (Fill: What this service does NOT do)

## Key Dependencies

### Upstream
(Fill: Services this depends on)

### Downstream
(Fill: Services that depend on this)

## Key Flows

(Fill: Primary business processes)
```

### 2.3 `services/<service>/docs/architecture.md`

```markdown
---
title: <Service> Architecture
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: architecture
---

# <Service> Architecture

## Components

(Fill: Major modules/components and their purpose)

## Data Storage

(Fill: Databases, schemas, key tables)

## External Dependencies

(Fill: Third-party services, APIs, message queues)

## Main Flows

(Fill: ASCII diagrams or descriptions of key processes)

## Technology Stack

(Fill: Language, framework, libraries, runtime)

## Scaling Assumptions

(Fill: Performance targets, concurrency limits, caching strategy)
```

### 2.4 `services/<service>/docs/api.md`

```markdown
---
title: <Service> API Reference
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: api
---

# <Service> API Reference

## Public Endpoints

(Fill: List endpoints, HTTP methods, short descriptions)

## Request/Response Schemas

(Fill: Example requests and responses)

## Error Handling

(Fill: Error codes, status codes, error response format)

## Versioning

(Fill: API versioning strategy, deprecation policy)
```

### 2.5 `services/<service>/docs/domain.md`

```markdown
---
title: <Service> Domain Model
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: domain
---

# <Service> Domain Model

## Bounded Context

(Fill: Define the boundaries of this domain)

## Core Entities

(Fill: Main domain objects, aggregates, invariants)

## Ubiquitous Language

(Fill: Domain-specific terminology and definitions)

## Business Rules

(Fill: Constraints, validations, important edge cases)
```

### 2.6 `services/<service>/docs/operations.md`

```markdown
---
title: <Service> Operations & Runbook
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: operations
---

# <Service> Operations & Runbook

## Deployment

(Fill: How to deploy this service)

## Configuration

(Fill: Environment variables, config files, required secrets)

## Monitoring & Observability

(Fill: Key metrics, dashboards, alerts, log locations)

## SLOs

(Fill: Availability target, latency targets, error budget)

## Incident Response

(Fill: Common failure modes, troubleshooting steps, escalation)
```

### 2.7 `services/<service>/docs/how-to/local-dev.md`

```markdown
---
title: <Service> Local Development Setup
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: how-to
---

# Local Development Setup

## Prerequisites

(Fill: Required tools, versions)

## Setup Steps

(Fill: Step-by-step setup instructions)

## Running the Service

(Fill: How to start the service locally)

## Running Tests

(Fill: Test commands)
```

### 2.8 `services/<service>/docs/how-to/troubleshooting.md`

```markdown
---
title: <Service> Troubleshooting
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: how-to
---

# Troubleshooting

## Common Issues

(Fill: List of known issues and solutions)
```

### 2.9 `services/<service>/docs/how-to/common-tasks.md`

```markdown
---
title: <Service> Common Tasks
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: how-to
---

# Common Tasks

## [Task Name]

(Fill: Step-by-step guide for frequent operations)
```

### 2.10 `services/<service>/docs/decisions/README.md`

```markdown
---
title: Architectural Decisions Index
service: <service-name>
status: draft
last_reviewed: YYYY-MM-DD
type: decision
---

# Architectural Decisions

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| ADR-0001 | Initial service decision | Accepted | YYYY-MM-DD |

See [Architectural Decision Records](/docs/decisions/README.md) for more info.
```

### 2.11 `services/<service>/docs/decisions/ADR-0001-initial.md`

Copy from the ADR you created in Step 1.

---

## Step 3: Scaffold the Service Folder

Create the directory structure. Do **NOT deviate**.

```
services/<service-name>/
├── README.md                    # Filled in Step 2
├── docs/
│   ├── README.md               # (optional, index of docs)
│   ├── overview.md             # Filled in Step 2
│   ├── architecture.md         # Filled in Step 2
│   ├── api.md                  # Filled in Step 2
│   ├── domain.md               # Filled in Step 2
│   ├── operations.md           # Filled in Step 2
│   ├── how-to/
│   │   ├── local-dev.md        # Filled in Step 2
│   │   ├── troubleshooting.md  # Filled in Step 2
│   │   └── common-tasks.md     # Filled in Step 2
│   └── decisions/
│       ├── README.md           # Filled in Step 2
│       └── ADR-0001-initial.md # Filled in Step 2
├── src/                        # Implementation code
├── tests/                      # Test files
├── Dockerfile                  # Container image
├── deployment/
│   ├── k8s/                    # Kubernetes manifests
│   └── helm/                   # Helm charts
├── pyproject.toml              # (Python) or package.json (Node), etc.
└── .env.example                # Environment template
```

---

## Step 4: Implement the Service (Domain-First)

Now write the code. Follow these rules:

### 4.1 Use Domain-Driven Design (DDD)

```
src/
├── domain/           # Core business logic, entities, aggregates
├── application/      # Use cases, orchestration
├── infrastructure/   # Database, external services, config
└── interfaces/       # Controllers, HTTP handlers, CLI
```

**Rule**: No business logic in controllers. All logic belongs in `domain/`.

### 4.2 Follow Platform Standards

- **Logging**: See `/docs/standards/logging.md`
- **Testing**: See `/docs/standards/testing.md`
- **Security**: See `/docs/standards/security.md`
- **Observability**: See `/docs/standards/observability.md`

### 4.3 Externalize Configuration

All configuration via environment variables (12-factor app).

```python
# ✅ Good
DATABASE_URL = os.getenv("DATABASE_URL")

# ❌ Bad
DATABASE_URL = "postgresql://localhost:5432/mydb"
```

### 4.4 Implement Multi-Tenant Context (if applicable)

Propagate tenant/user context everywhere (request → domain → database).

---

## Step 5: Testing Requirements

Mandatory test coverage:

| Type | Requirement | Location |
|------|-------------|----------|
| **Unit Tests** | All domain logic | `tests/unit/domain/` |
| **Integration Tests** | API endpoints + DB | `tests/integration/` |
| **Contract Tests** | Inter-service contracts | `tests/contract/` |
| **Load Test Plan** | For performance-critical services | `docs/load-test-plan.md` |

**Minimum coverage**: 80% of business logic, 100% of critical paths.

---

## Step 6: Deployment Requirements

Each service must include:

### 6.1 Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements/prod.txt
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 6.2 Kubernetes / Helm

- Deployment manifest
- Service definition
- ConfigMap for configuration
- Secrets for credentials
- Readiness & liveness probes
- Resource requests/limits

### 6.3 Observability

- Prometheus metrics exposed
- Structured JSON logging
- Distributed tracing headers propagated

### 6.4 Documentation

In `docs/operations.md`:
- CPU/memory recommendations
- Database connection pool size
- Cache sizing (if applicable)
- Backup/restore procedures

---

## Step 7: Update Global Indexes

Update the repository-level documentation:

### 7.1 Update `SYSTEM_GUIDE.md`

Add entry to service directory:

```markdown
#### [New Service]

Brief description.
- **Language**: Python
- **Status**: Operational
- **Quick Links**: [README](./services/new-service/README.md) | [Docs](./services/new-service/docs/)
```

### 7.2 Update `docs/architecture/service-catalog.md`

Add full service entry with:
- Service type
- Language
- Domain
- Responsibilities
- Key endpoints
- Dependencies
- Quick links

### 7.3 Update `ARCHITECTURE.md`

If the new service changes system flows or domain boundaries, update:
- System architecture diagram
- Service tiers (if applicable)
- Integration patterns

### 7.4 Update `docs/architecture/domain-map.md`

If the new service is a new bounded context, add:
- Context definition
- Entities and aggregates
- Domain events
- Communication patterns with other contexts

### 7.5 Update `docs/architecture/integration-flows.md`

If the new service participates in flows, document:
- Which flows it participates in
- Request/response cycle
- Error handling
- Message contracts

---

## Checklist

Use this to verify completion:

- [ ] ADR created and reviewed (Step 1)
- [ ] Documentation skeleton complete (Step 2)
- [ ] Folder structure scaffolded (Step 3)
- [ ] Code implements DDD principles (Step 4)
- [ ] Tests written (Step 5)
- [ ] Deployment artifacts included (Step 6)
- [ ] Global indexes updated (Step 7)
- [ ] Code review completed
- [ ] Integration tests passing
- [ ] Service deployed to staging
- [ ] Documentation reviewed and marked "active"

---

## Example: Creating `search-service`

```
1. Create ADR-0006-create-search-service.md
   - Context: Need full-text search across games/players
   - Decision: New service using OpenSearch + Python

2. Create documentation skeleton in services/search-service/docs/

3. Scaffold folder structure

4. Implement:
   src/domain/search_query.py
   src/infrastructure/opensearch_client.py
   src/interfaces/api/routes.py

5. Add tests:
   tests/unit/domain/test_search_query.py
   tests/integration/test_search_api.py

6. Add Dockerfile, K8s manifests, Helm charts

7. Update SYSTEM_GUIDE.md, service-catalog.md, integration-flows.md
```

---

## See Also

- [AGENTS.md](../../AGENTS.md) – Agent behavior rules
- [ARCHITECTURE.md](../../ARCHITECTURE.md) – System architecture
- [Service Catalog](./service-catalog.md) – List of all services
- [Documentation Standards](./documentation.md) – How to write docs
- ADR Rules: [Architectural Decisions](../decisions/README.md)

---

*Last updated: 2025-11-15*
