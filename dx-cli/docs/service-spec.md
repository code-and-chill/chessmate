---
title: service.yaml Specification
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: standard
---

# service.yaml Specification

> **Complete schema and reference for service metadata in the ChessMate monorepo.**

Every service in the monorepo must have a `service.yaml` file at its root that defines metadata, commands, dependencies, and infrastructure requirements.

## File Location

```
<service-root>/
  service.yaml         ← Required
```

## Complete Schema

```yaml
# ============================================================================
# REQUIRED: Service Identity
# ============================================================================

name: account-api                    # Unique service identifier
kind: api                            # Service type: api | service | worker | engine | app
language: python                     # Primary language
runtime: python3.11                  # Runtime version

# ============================================================================
# OPTIONAL: Metadata
# ============================================================================

description: Account management API  # Brief description
tags:                                # Searchable tags
  - identity
  - user-management

# ============================================================================
# REQUIRED: Lifecycle Commands
# ============================================================================

commands:
  # Development: Start service locally with hot-reload
  dev: "poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"

  # Testing: Run test suite
  test: "poetry run pytest tests/ -v --cov=app"

  # Building: Compile/package service
  build: "poetry build"

  # Linting: Check code quality
  lint: "poetry run pylint app/ && poetry run black --check app/"

  # Migrations: Run database migrations
  migrate: "poetry run alembic upgrade head"

  # Seeding: Populate database with initial data
  seed: "poetry run python scripts/seed.py"

  # Logs: Display service logs (template variables supported)
  logs: "docker logs account-api --tail ${lines}"

# ============================================================================
# OPTIONAL: Lifecycle Dependencies
# ============================================================================

dependencies:
  # Services that must run before 'dx dev'
  dev:
    - database-service              # If this service needs a database service running

  # Services that must be tested before this one
  test:
    - account-api                   # (rarely used - usually empty)

  # Services that must be built before this one
  build:
    - shared-lib                    # If this service depends on a shared library

  # Services that must be deployed before this one
  deploy:
    - account-api                   # Core API must be deployed first

# ============================================================================
# OPTIONAL: Infrastructure Requirements
# ============================================================================

infra:
  requires:                          # Required infrastructure
    - database                       # PostgreSQL, MySQL, etc.
    - cache                          # Redis, Memcached, etc.
  
  optional:                          # Optional infrastructure
    - queue                          # RabbitMQ, Kafka, etc.
    - search                         # Elasticsearch, OpenSearch, etc.

# ============================================================================
# Validation Rules
# ============================================================================

# name:
#   - Must be unique across monorepo
#   - Must match directory name
#   - Must be kebab-case (lowercase with hyphens)
#   - Pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
#
# kind:
#   - api: External-facing REST/GraphQL endpoint
#   - service: Internal synchronous service
#   - worker: Asynchronous background job processor
#   - engine: Specialized compute (ML, pricing, etc.)
#   - app: Client application (mobile, web)
#
# language:
#   - python, typescript, kotlin, go, rust, etc.
#   - Should match actual implementation
#
# runtime:
#   - Must be valid version for language
#   - Examples: python3.11, node18, kotlin17, go1.21, rust1.73
#
# commands:
#   - All values are bash commands
#   - Will be executed in service root directory
#   - Will be wrapped with 'mise exec --' if mise is enabled
#   - Must not be empty strings (omit if not applicable)
#   - Can use template variables like ${lines}
#
# dependencies:
#   - Values must reference existing services
#   - Cycles are detected and reported as errors
#   - Each lifecycle has independent dependencies
#   - Empty arrays can be omitted
#
# infra:
#   - Valid values: database, cache, queue, search, kubernetes, docker
#   - Used for validation and planning
#   - Can be omitted if no special requirements
```

## Examples

### API Service (REST)

```yaml
name: account-api
kind: api
language: python
runtime: python3.11

description: RESTful API for account management

commands:
  dev: "poetry run uvicorn app.main:app --reload"
  test: "poetry run pytest tests/"
  build: "poetry build"
  lint: "poetry run black app/ && poetry run isort app/"
  migrate: "poetry run alembic upgrade head"
  seed: "poetry run python scripts/seed.py"
  logs: "docker logs account-api --tail ${lines}"

dependencies:
  dev: []
  test: []
  build: []
  deploy: []

infra:
  requires:
    - database
    - cache
  optional:
    - queue
```

### TypeScript Service with Dependencies

```yaml
name: recommendation-service
kind: engine
language: typescript
runtime: node18

description: ML-based recommendation engine

commands:
  dev: "npm run dev"
  test: "npm run test"
  build: "npm run build"
  lint: "npm run lint && npm run format:check"
  migrate: "npm run migrate"
  seed: "npm run seed"

dependencies:
  dev:
    - account-api        # Needs account service running
    - search-service
  test: []
  build: []
  deploy:
    - account-api

infra:
  requires:
    - database
    - search
  optional:
    - cache
    - queue
```

### Background Worker

```yaml
name: email-worker
kind: worker
language: python
runtime: python3.11

description: Asynchronous email processing worker

commands:
  dev: "poetry run celery -A app.tasks worker --loglevel=info"
  test: "poetry run pytest tests/"
  build: "poetry build"
  lint: "poetry run pylint app/"

dependencies:
  dev:
    - message-broker
  test: []
  build: []
  deploy:
    - message-broker

infra:
  requires:
    - queue
    - cache
```

### Client Application

```yaml
name: chess-app
kind: app
language: typescript
runtime: node18

description: React Native chess application

commands:
  dev: "npm start"
  test: "npm run test"
  build: "npm run build"
  lint: "npm run lint"

dependencies:
  dev:
    - account-api
    - live-game-api
    - matchmaking-api
  test: []
  build: []
  deploy: []

infra: {}
```

### Kotlin Microservice

```yaml
name: pricing-service
kind: service
language: kotlin
runtime: kotlin17

description: Dynamic pricing calculation service

commands:
  dev: "./gradlew bootRun"
  test: "./gradlew test"
  build: "./gradlew build"
  lint: "./gradlew lint"
  migrate: "./gradlew flywayMigrate"
  seed: "./gradlew seed"

dependencies:
  dev:
    - account-api
  test: []
  build: []
  deploy:
    - account-api

infra:
  requires:
    - database
    - cache
  optional:
    - queue
```

### Go Service

```yaml
name: search-service
kind: api
language: go
runtime: go1.21

description: Full-text search API

commands:
  dev: "go run main.go"
  test: "go test ./..."
  build: "go build -o dist/search-service"
  lint: "golangci-lint run ./..."

dependencies:
  dev: []
  test: []
  build: []
  deploy: []

infra:
  requires:
    - search
```

## Command Variables

### Available Template Variables

When defining commands, you can use template variables that will be substituted at runtime:

| Variable | Description | Example |
|----------|-------------|---------|
| `${lines}` | Number of log lines (for logs command) | `docker logs app --tail ${lines}` |
| `${service}` | Current service name | Used in hooks |
| `${env}` | Current environment | dev, staging, prod |

### Example Usage

```yaml
commands:
  logs: "docker logs ${service} --tail ${lines}"
  seed: "DB_ENV=${env} npm run seed"
```

## Dependency Resolution

### How Dependencies Work

When you run `dx test account-api`, the CLI:

1. Reads `account-api/service.yaml`
2. Looks up `dependencies.test` (which services must be tested first)
3. Recursively resolves dependencies of dependencies
4. Creates a topological order
5. Executes in order

### Lifecycle-Specific Dependencies

Each lifecycle has independent dependencies:

```yaml
dependencies:
  dev:
    - auth-service         # Need auth-service running for dev
  test:
    - test-fixtures        # Need test data for testing
  build:
    - shared-lib           # Need to build shared-lib first
  deploy:
    - auth-service         # Auth must be deployed first in prod
```

### Cycle Detection

The CLI validates the DAG and rejects cyclic dependencies:

```bash
✗ DAG validation failed:
  - Dependency cycle detected: a → b → a

# Fix: Remove the circular dependency
```

## Infrastructure Requirements

Infrastructure requirements are informational and used for planning/validation:

### Valid Infrastructure Types

| Type | Description | Examples |
|------|-------------|----------|
| `database` | Relational or NoSQL database | PostgreSQL, MongoDB, Cassandra |
| `cache` | In-memory cache | Redis, Memcached |
| `queue` | Message queue | RabbitMQ, Kafka, SQS |
| `search` | Search engine | Elasticsearch, OpenSearch |
| `kubernetes` | Kubernetes cluster | Required for deployment |
| `docker` | Docker runtime | For containerized services |

### Usage

```yaml
infra:
  requires:
    - database          # Must have database
    - cache             # Must have cache
  optional:
    - queue             # Optional, if needed
```

## Service Types (kind)

Choose the appropriate kind for your service:

### `api` - External-Facing API

REST, GraphQL, or other external endpoints.

```yaml
kind: api
# Examples: account-api, search-api, booking-api
```

### `service` - Internal Service

Synchronous, request-response, internal service-to-service communication.

```yaml
kind: service
# Examples: ranking-service, feature-service, pricing-service
```

### `worker` - Background Job Processor

Asynchronous, event-driven, long-running processes.

```yaml
kind: worker
# Examples: search-indexer-worker, email-worker, analytics-worker
```

### `engine` - Specialized Compute

ML models, complex algorithms, specialized computation.

```yaml
kind: engine
# Examples: recommendation-engine, pricing-engine, ml-inference-engine
```

### `app` - Client Application

Web, mobile, desktop application.

```yaml
kind: app
# Examples: web-app, mobile-app, admin-dashboard
```

## Best Practices

### 1. Keep Commands Simple

Good:
```yaml
dev: "npm run dev"
```

Avoid:
```yaml
dev: "npm install && npm run build && npm run dev:watch"
```

(Complex initialization belongs in setup scripts, not here)

### 2. Make Commands Idempotent

Commands should be safe to run multiple times:

```yaml
# Good - idempotent
migrate: "alembic upgrade head"

# Bad - could fail if already migrated
migrate: "alembic upgrade +1"
```

### 3. Explicit Dependencies Only

Only list services that are truly required:

```yaml
# Good - account-api needed for dev
dev:
  - account-api

# Bad - including everything isn't helpful
dev:
  - account-api
  - cache-service
  - logging-service
```

### 4. Use Consistent Naming

Service names should be descriptive and kebab-case:

```yaml
# Good
name: account-api
name: search-service
name: email-worker

# Bad
name: AccountAPI
name: search_service
name: emailWorker
```

### 5. Document Special Requirements

```yaml
description: |
  Payment processing service.
  
  Requires:
  - PCI-DSS compliance
  - Hardware security module (HSM) for key storage
  - Separate database for sensitive data
  
  Cannot be deployed to staging/dev
```

### 6. Test Your service.yaml

```bash
# Validate all services
dx doctor

# Check specific service
dx doctor account-api

# Verify DAG has no cycles
dx doctor
```

## Validation

The CLI validates `service.yaml` files and will error if:

- `name` is missing or not unique
- `kind` is not a valid type
- `language` doesn't match implementation
- `runtime` is invalid for language
- A dependency references non-existent service
- Circular dependencies are detected
- Required `commands` have empty values

Run validation:

```bash
dx doctor
```

## Migration

When refactoring services:

1. Update `service.yaml` with new commands
2. Run `dx doctor` to validate
3. Test individual commands: `dx build service-name --single`
4. Test with dependencies: `dx build service-name`
5. Update this documentation

## FAQ

**Q: Can I have optional commands?**

A: Yes! Only include commands your service supports. Others can be omitted.

```yaml
commands:
  dev: "npm run dev"
  test: "npm run test"
  # build, lint, migrate, seed not applicable
```

**Q: Can dependencies vary by environment?**

A: Not in `service.yaml` directly. Use different deployment strategies per environment in your deployment manifests.

**Q: Should I include database in dependencies?**

A: No. Infrastructure requirements (`infra`) are different from service dependencies. Use `infra.requires` for databases.

**Q: What if my service has no dev command?**

A: Omit it. The CLI will warn if you try to run `dx dev` on that service.

```yaml
commands:
  # No dev command
  test: "npm run test"
  build: "npm run build"
```

**Q: Can I use environment variables in commands?**

A: Yes, treat commands as bash:

```yaml
commands:
  dev: "PORT=3000 npm run dev"
  seed: "DB_ENV=${env} npm run seed"
```

## Examples Repository

See the monorepo for real examples:

- [account-api/service.yaml](../../account-api/service.yaml)
- [live-game-api/service.yaml](../../live-game-api/service.yaml)
- [matchmaking-api/service.yaml](../../matchmaking-api/service.yaml)
- [chess-app/service.yaml](../../chess-app/service.yaml)
