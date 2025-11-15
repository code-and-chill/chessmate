---
title: dx-cli - ChessMate Developer Experience CLI
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: overview
---

# dx-cli - ChessMate Developer Experience

> **Unified command-line interface for all developer workflows in the ChessMate monorepo.**

`dx-cli` provides a single, consistent command interface to orchestrate services, manage lifecycles, and streamline common developer tasks across the entire monorepo.

## Quick Start

### Installation

```bash
# Install dependencies
cd dx-cli
pnpm install

# Build the CLI
pnpm build

# Link for global use (optional)
pnpm link
```

### Enable Easy Command Invocation

To run `dx` commands without the full path, add the bin directory to your shell's PATH:

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export PATH="/path/to/chessmate/dx-cli/bin:$PATH"

# Then reload your shell
source ~/.bashrc
```

Alternatively, use it directly with the absolute path:

```bash
/workspaces/chessmate/dx-cli/bin/dx doctor
```

### Aliasing

The CLI can be invoked via multiple aliases:

```bash
dx help
monocto help
mnc help
```

All three commands execute the same CLI. Choose your favorite!

### First Commands

```bash
# Check system health
dx doctor

# View all services
dx doctor

# Start development environment
dx dev

# Run tests for all services
dx test

# Build all services
dx build
```

## Commands Reference

### `dx setup`

Initialize development environment and verify prerequisites.

```bash
dx setup
```

### `dx doctor [service]`

Check system health and configuration. Validates service discovery, DAG, and runtime setup.

```bash
# Full system check
dx doctor

# Check specific service
dx doctor account-api
```

### `dx dev [service] [--single]`

Start development environment.

```bash
# Start all services
dx dev

# Start single service with dependencies
dx dev account-api

# Start only account-api (skip dependencies)
dx dev account-api --single
```

### `dx test [service] [--single]`

Run test suite.

```bash
# Run all tests
dx test

# Test single service with dependencies
dx test account-api

# Test only account-api
dx test account-api --single
```

### `dx build [service] [--single]`

Build service(s).

```bash
# Build all services
dx build

# Build with dependencies
dx build live-game-api

# Build only live-game-api
dx build live-game-api --single
```

### `dx lint [service] [--single]`

Lint service code.

```bash
# Lint all
dx lint

# Lint specific service
dx lint chess-app

# Lint only
dx lint chess-app --single
```

### `dx migrate [service] [--single] [--env=<env>]`

Run database migrations.

```bash
# Migrate all services (dev environment)
dx migrate

# Migrate specific service
dx migrate account-api --env=dev

# Migrate only (no dependencies)
dx migrate account-api --single

# Migrate for staging
dx migrate account-api --env=staging
```

### `dx seed [service] [--single] [--env=<env>]`

Seed database with initial data.

```bash
# Seed all services
dx seed

# Seed specific service
dx seed account-api --env=dev

# Seed only
dx seed account-api --single
```

### `dx logs <service> [--follow] [--lines=<n>]`

View service logs.

```bash
# View last 50 lines
dx logs account-api

# Follow logs
dx logs account-api --follow

# View last 100 lines
dx logs account-api --lines=100
```

### `dx deploy <env> [service] [--single]`

Deploy to environment (dev, staging, prod).

```bash
# Deploy all services to staging
dx deploy staging

# Deploy single service to prod
dx deploy prod account-api --single

# Deploy to dev
dx deploy dev
```

### `dx changelog [service]`

View service changelog.

```bash
# View changelog for service
dx changelog account-api

# View all changelogs
dx changelog
```

### `dx sandbox reset [service] [--single]`

Reset sandbox environment.

```bash
# Reset all sandboxes
dx sandbox reset

# Reset specific service
dx sandbox reset account-api --single
```

## Command Behavior

### Global vs. Service-Specific

When **no service is specified**, the command runs **against all services** in parallel (respecting concurrency limits).

```bash
dx test        # Runs tests for ALL services
dx build       # Builds ALL services
```

When **a service is specified**, the CLI:
1. Resolves the dependency DAG for that service
2. Executes dependencies first (in topological order)
3. Executes the target service last

```bash
dx test account-api        # Tests dependencies + account-api
dx build live-game-api     # Builds dependencies + live-game-api
```

### `--single` Flag

The `--single` flag **skips dependency resolution** and runs only the target service.

```bash
dx test account-api --single   # Only test account-api, skip dependencies
```

## How Service Discovery Works

The CLI automatically discovers all services by scanning for `service.yaml` files in the monorepo.

```
chessmate/
├── account-api/
│   └── service.yaml              ← Discovered
├── live-game-api/
│   └── service.yaml              ← Discovered
├── matchmaking-api/
│   └── service.yaml              ← Discovered
└── chess-app/
    └── service.yaml              ← Discovered
```

Each `service.yaml` defines:
- Service metadata (name, kind, language, runtime)
- Lifecycle commands (dev, test, build, etc.)
- Dependencies (which other services must run first)
- Infrastructure requirements

See [docs/service-spec.md](./docs/service-spec.md) for the full schema.

## DAG System

The CLI builds a **Directed Acyclic Graph (DAG)** from service dependencies to ensure correct execution order.

### Dependency Resolution

For each lifecycle (dev, test, build, deploy), the DAG resolver:

1. **Identifies all dependencies** for the target service
2. **Detects cycles** (errors if found)
3. **Sorts topologically** (dependencies before dependents)
4. **Groups by depth** (enabling parallel execution where safe)

### Example

Given this dependency structure:

```
account-api (no deps)
live-game-api → account-api
matchmaking-api → account-api, live-game-api
chess-app → all APIs
```

Running `dx build chess-app` executes in this order:

```
1. account-api         (depth 0)
2. live-game-api       (depth 1, depends on account-api)
3. matchmaking-api     (depth 2, depends on both)
4. chess-app           (depth 3, depends on all)
```

Services at the same depth run in parallel (up to concurrency limit).

## Configuration

Configuration is managed via `dx.config.yml` in the monorepo root.

```yaml
# Service discovery patterns
global:
  service_discovery:
    patterns:
      - "**/service.yaml"
    root: "."

  # Logging behavior
  logging:
    level: "info"          # debug, info, warn, error
    format: "pretty"       # pretty, json
    prefix_logs: true      # Add service name to logs

  # Execution settings
  execution:
    parallel_limit: 4      # Max parallel commands
    stream_logs: true      # Stream output in real-time
    exit_on_error: true    # Stop on first failure
    timeout_ms: 0          # 0 = no timeout

# Environment definitions
environments:
  dev:
    kube_context: "docker-desktop"
    namespace: "default"
    helm_root: "charts"

  staging:
    kube_context: "staging-cluster"
    namespace: "chessmate-staging"

  prod:
    kube_context: "prod-cluster"
    namespace: "chessmate-prod"

# Tool management
mise:
  enabled: true          # Use mise for tool versioning
  auto_install: true

# Service groups
service_groups:
  apis: [account-api, live-game-api, matchmaking-api]
  apps: [chess-app]
```

## Environment Variables

Control CLI behavior via environment variables:

```bash
# Log level (default: info)
export DX_LOG_LEVEL=debug

# Parallel execution limit (default: 4)
export DX_PARALLEL_LIMIT=2

# Disable mise integration
export DX_MISE_DISABLED=1

# JSON logging output
export DX_LOG_FORMAT=json
```

## Writing service.yaml

Each service requires a `service.yaml` file at its root.

```yaml
name: account-api
kind: api
language: python
runtime: python3.11

description: Account management API

commands:
  dev: "poetry run uvicorn app.main:app --reload"
  test: "poetry run pytest"
  build: "poetry build"
  lint: "poetry run pylint app/"
  migrate: "poetry run alembic upgrade head"
  seed: "poetry run python scripts/seed.py"

dependencies:
  dev: []
  test: []
  build: []
  deploy: []

infra:
  requires:
    - database
    - cache
```

See [service-spec.md](./service-spec.md) for complete schema documentation.

## Integration with mise

If `mise` is enabled in `dx.config.yml`, all commands are executed with `mise exec --`:

```bash
# Without mise
command --version

# With mise (automatic)
mise exec -- command --version
```

This ensures:
- Tool versions are managed via `.mise.toml`
- Environment consistency across developers
- CI/CD reproducibility

## Integration with Kubernetes

For deploy commands, the CLI reads Kubernetes configuration from `dx.config.yml`:

```yaml
environments:
  prod:
    kube_context: "prod-cluster"
    namespace: "chessmate-prod"
    helm_root: "charts"
```

Deploy commands will:
1. Switch to the correct Kubernetes context
2. Deploy to the specified namespace
3. Use Helm charts from the configured root

## Kubernetes Integration

dx-cli now includes environment-aware Kubernetes workflows. Key commands:

- `dx env list|use|current` — manage environments defined in `.dx/config.yaml`.
- `dx k8s init-local` — bootstrap a local `kind` cluster for development.
- `dx deploy <env> [service]` — deploy service(s) to a Kubernetes environment.
- `dx logs <service>` — stream logs from pods when an active K8s environment is set.
- `dx shell <service>` — open an interactive shell in a pod.
- `dx open <service>` — open a service URL (ingress) or start a port-forward for local development.

See `dx-cli/docs/kubernetes/` for full documentation, examples, and troubleshooting.

## Troubleshooting

### Service Not Found

```bash
$ dx build missing-service
✗ Service 'missing-service' not found

# Solution: Check dx doctor
dx doctor
```

### Circular Dependency Detected

```bash
✗ DAG validation failed:
  - Dependency cycle detected: a → b → a

# Solution: Fix service.yaml dependencies to remove cycles
```

### Command Not Configured

```bash
⚠ account-api has no build command configured

# Solution: Add 'build' command to account-api/service.yaml
```

### Permission Denied on bin/dx

```bash
chmod +x bin/dx bin/monocto bin/mnc
```

## Development

### Build the CLI

```bash
pnpm build
```

### Run in Development Mode

```bash
pnpm dev      # Watch mode
```

### Run Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

## Architecture Overview

- **`src/core/`** - Core utilities (logging, execution, config loading)
- **`src/services/`** - Service discovery and registry
- **`src/dag/`** - Dependency resolution and validation
- **`src/commands/`** - Command implementations
- **`src/config/`** - Schema definitions
- **`bin/`** - CLI entry points (dx, monocto, mnc)

See [ARCHITECTURE.md in docs](../docs/DX_PLATFORM.md) for detailed architecture.

## Contributing

When adding new commands:

1. Create new file in `src/commands/`
2. Export a Command instance
3. Register in `src/index.ts`
4. Update this README with documentation

## Further Reading

- [docs/service-spec.md](./docs/service-spec.md) - Complete service.yaml specification
- [dx.config.yml](./dx.config.yml) - Global configuration reference
- [docs/DX_PLATFORM.md](./docs/DX_PLATFORM.md) - Platform architecture and integration guide
