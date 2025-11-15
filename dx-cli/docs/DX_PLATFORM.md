---
title: DX Platform - Developer Experience System
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: architecture
---

# DX Platform - ChessMate Developer Experience

> **Unified platform for consistent developer workflows across the ChessMate monorepo.**

The DX Platform provides a modern, developer-friendly command-line interface and tooling infrastructure to streamline all common workflows: development, testing, building, deploying, and more.

## Platform Overview

The DX Platform consists of:

1. **dx-cli** - Command-line interface (orchestration engine)
2. **dx.config.yml** - Global configuration
3. **service.yaml** - Per-service metadata contract
4. **Directory structure** - Organized for long-term scalability

### Core Principles

✓ **Single, consistent interface** - One `dx` command for all workflows

✓ **Dependency-aware** - Automatic DAG resolution and topological ordering

✓ **Service-centric** - All orchestration based on service.yaml metadata

✓ **Developer-first** - Beautiful logs, clear errors, helpful messages

✓ **Scalable** - Designed to grow from 4 to 40+ services

✓ **Cross-platform** - Works on macOS, Linux, Windows (via WSL2)

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository>
cd chessmate

# Install dx-cli
cd dx-cli
pnpm install
pnpm build

# Now you can use dx
cd ..
dx doctor
```

### First Commands

```bash
# Check system health
dx doctor

# Start development environment
dx dev

# Run tests
dx test

# Build services
dx build

# Check help
dx --help
```

### Aliases

Choose your favorite:

```bash
dx help         # Classic DX name
monocto help    # Monorepo CLI name
mnc help        # Quick shorthand
```

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Developer Terminal                   │
│  $ dx dev [service] [--single]                      │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│               dx-cli (Command Handler)               │
│  ├─ src/commands/    (dev, test, build, deploy...)  │
│  ├─ src/core/        (logger, exec, paths, config)  │
│  ├─ src/services/    (registry, discovery)          │
│  └─ src/dag/         (resolver, validator)          │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐ ┌──────────┐ ┌────────────┐
   │ service │ │ dx.config│ │ misc tools │
   │ registry│ │   .yml   │ │  (mise)    │
   └────┬────┘ └──────────┘ └────────────┘
        │
        ▼
   ┌──────────────┐
   │ DAG Resolver │
   │ (topo sort)  │
   └────┬─────────┘
        │
        ▼
   ┌──────────────────────────────────┐
   │ Execution Engine (execStream)    │
   │ ├─ Stream logs with prefixes     │
   │ ├─ Parallel with concurrency     │
   │ ├─ Sequential on dependency      │
   │ └─ Handle errors gracefully      │
   └────┬─────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────┐
   │ Services (in correct order)      │
   │ ├─ Run dev/test/build commands   │
   │ ├─ Wrapped with 'mise exec'      │
   │ └─ Output prefixed with name     │
   └──────────────────────────────────┘
```

### Component Breakdown

#### dx-cli

The orchestration engine written in TypeScript/Node.js.

```
dx-cli/
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── commands/
│   │   ├── dev.ts           # Development environment
│   │   ├── test.ts          # Testing
│   │   ├── build.ts         # Building
│   │   ├── lint.ts          # Linting
│   │   ├── deploy.ts        # Deployment
│   │   ├── migrate.ts       # Database migrations
│   │   ├── seed.ts          # Database seeding
│   │   ├── logs.ts          # Log viewing
│   │   ├── doctor.ts        # Health checks
│   │   ├── changelog.ts     # Changelog
│   │   └── sandbox.ts       # Sandbox management
│   ├── core/
│   │   ├── logger.ts        # Structured logging
│   │   ├── exec.ts          # Command execution
│   │   ├── paths.ts         # Path resolution
│   │   └── config.ts        # Config loading
│   ├── services/
│   │   ├── registry.ts      # Service registry
│   │   └── service-loader.ts # YAML parsing
│   ├── dag/
│   │   ├── resolver.ts      # Dependency resolution
│   │   └── validator.ts     # DAG validation
│   └── config/
│       └── schema.ts        # TypeScript types/schemas
├── bin/
│   ├── dx               # Main executable
│   ├── monocto          # Alias
│   └── mnc              # Shorthand alias
├── dx.config.yml        # Global configuration
├── package.json
├── tsconfig.json
└── README.md
```

#### Service Discovery

Services are discovered by scanning for `service.yaml` files:

```bash
$ dx doctor
ℹ INFO Discovering services...
✓ Found 4 service(s)
  - account-api (api, python)
  - live-game-api (service, python)
  - matchmaking-api (service, python)
  - chess-app (app, typescript)
```

Each service.yaml defines:
- Metadata (name, kind, language, runtime)
- Commands (dev, test, build, lint, migrate, seed, logs)
- Dependencies (per-lifecycle)
- Infrastructure requirements

#### DAG System

Dependency resolution builds a DAG (Directed Acyclic Graph):

```
dev lifecycle dependencies:
  chess-app → live-game-api → account-api (no deps)

Running: dx dev chess-app

Executes in order:
  1. account-api (no dependencies)
  2. live-game-api (depends on account-api)
  3. chess-app (depends on live-game-api)
```

The DAG:
- **Validates** that all references exist
- **Detects cycles** and reports errors
- **Sorts topologically** for correct execution order
- **Groups by depth** for parallel execution optimization

#### Execution Engine

Commands are executed via the execution engine:

```typescript
// Executes with proper logging, error handling, streaming
await execStream(command, args, {
  cwd: servicePath,
  serviceName: "account-api",
  useMise: true,  // Wrap with mise exec
  timeout: 0
});
```

Features:
- ✓ Real-time streaming logs
- ✓ Service-name prefix on all output
- ✓ Graceful error handling
- ✓ Configurable timeouts
- ✓ Sequential or parallel execution
- ✓ Mise integration for tool versioning

## Command Reference

### Global Commands

```bash
dx help                    # Show help
dx --version              # Show version
dx doctor [service]       # Health check
dx setup                  # Initialize environment
```

### Lifecycle Commands

```bash
dx dev [service] [--single]        # Development
dx test [service] [--single]       # Testing
dx build [service] [--single]      # Building
dx lint [service] [--single]       # Linting
dx migrate [service] [--env=ENV]   # Database migrations
dx seed [service] [--env=ENV]      # Database seeding
```

### Operations

```bash
dx logs <service> [--follow]       # View logs
dx deploy <env> [service]          # Deploy to environment
dx changelog [service]             # View changelog
dx sandbox reset [service]         # Reset sandbox
```

### Command Behavior

**No service specified** → Run against all services
```bash
dx test                # Test all services
```

**Service specified** → Run with dependencies
```bash
dx test account-api    # Test dependencies + account-api
```

**--single flag** → Run only specified service
```bash
dx test account-api --single  # Only account-api
```

## Configuration

### dx.config.yml

Global configuration at `/dx.config.yml`:

```yaml
version: "1.0"
title: ChessMate Developer Experience Platform

# Service discovery
global:
  service_discovery:
    patterns:
      - "**/service.yaml"
    root: "."
  
  # Logging
  logging:
    level: "info"        # debug, info, warn, error
    format: "pretty"     # pretty, json
    prefix_logs: true
  
  # Execution
  execution:
    parallel_limit: 4    # Max concurrent commands
    stream_logs: true
    exit_on_error: true
    timeout_ms: 0        # 0 = no timeout

# Environment definitions
environments:
  dev:
    kube_context: "docker-desktop"
    namespace: "default"
  staging:
    kube_context: "staging-cluster"
    namespace: "chessmate-staging"
  prod:
    kube_context: "prod-cluster"
    namespace: "chessmate-prod"

# Tool management
mise:
  enabled: true
  auto_install: true

# Service groups
service_groups:
  apis: [account-api, live-game-api, matchmaking-api]
  apps: [chess-app]
```

### Environment Variables

Control CLI behavior:

```bash
export DX_LOG_LEVEL=debug          # Verbose logging
export DX_PARALLEL_LIMIT=2         # Reduce parallelism
export DX_LOG_FORMAT=json          # JSON output
```

## Integration Points

### Mise (Tool Versioning)

If enabled, all commands are wrapped with `mise exec --`:

```yaml
# dx.config.yml
mise:
  enabled: true
  version_file: ".mise.toml"
```

Benefits:
- Tool versions defined in `.mise.toml`
- Automatic version switching
- CI/CD reproducibility

### Kubernetes & Helm

Deploy commands support Kubernetes:

```bash
dx deploy staging account-api --single
```

Reads from dx.config.yml:
```yaml
environments:
  staging:
    kube_context: "staging-cluster"
    namespace: "chessmate-staging"
    helm_root: "charts"
```

### Docker & Docker Compose

Services can use Docker for infrastructure:

```yaml
# service.yaml
infra:
  requires:
    - docker
```

## Workflows

### Morning Setup

```bash
# 1. Check system health
dx doctor

# 2. Start dev environment
dx dev

# 3. In another terminal, run migrations
dx migrate --env=dev

# 4. Seed test data
dx seed --env=dev
```

### Testing Changes

```bash
# 1. Make code changes
# 2. Lint
dx lint

# 3. Test single service
dx test account-api --single

# 4. Test with dependencies
dx test chess-app
```

### Building for Deployment

```bash
# 1. Build all services
dx build

# 2. Run full test suite
dx test

# 3. Deploy to staging
dx deploy staging

# 4. Deploy to production
dx deploy prod
```

### Onboarding New Developer

```bash
# 1. Clone repo
git clone <repo>
cd chessmate

# 2. Setup environment
dx setup

# 3. Check health
dx doctor

# 4. Start developing
dx dev
```

## Troubleshooting

### Service Not Found

```bash
$ dx build missing-service
✗ Service 'missing-service' not found

# Check available services
dx doctor
```

### Circular Dependency

```bash
✗ DAG validation failed:
  - Dependency cycle detected: a → b → a

# Fix service.yaml to remove cycle
```

### Command Not Configured

```bash
⚠ account-api has no build command configured

# Add 'build' command to service.yaml
```

### Permission Denied

```bash
chmod +x bin/dx bin/monocto bin/mnc
```

## Development

### Building dx-cli

```bash
cd dx-cli
pnpm install
pnpm build
```

### Running in Development Mode

```bash
pnpm dev           # Watch mode
```

### Type Checking

```bash
pnpm type-check
```

### Testing

```bash
pnpm test
```

## Migration Guide

### From Manual Scripts

Old way:
```bash
cd account-api && npm run dev
# In another terminal
cd live-game-api && npm run dev
# etc...
```

New way:
```bash
dx dev
```

### From Makefile

Old:
```bash
make dev
make test
make build
```

New:
```bash
dx dev
dx test
dx build
```

## Best Practices

### 1. Define service.yaml Early

Create `service.yaml` when adding new services. It's part of the contract.

### 2. Keep Dependencies Minimal

Only list services actually required:

```yaml
# Good
dependencies:
  dev:
    - account-api

# Bad - including everything
dependencies:
  dev:
    - account-api
    - cache-service
    - logging-service
    - monitoring-service
```

### 3. Test DAG Regularly

```bash
dx doctor
```

Ensure no cycles, all references valid.

### 4. Use Consistent Commands

Keep commands simple and idempotent:

```yaml
commands:
  dev: "npm run dev"           # Simple
  test: "npm run test"         # Consistent
  build: "npm run build"
```

### 5. Document in README

Each service README should mention:

```markdown
# Starting Development

```bash
dx dev service-name
```

# Running Tests

```bash
dx test service-name
```
```

## Future Roadmap

### Phase 2 (Q1 2026)

- [ ] IDE integration (VSCode extension)
- [ ] Service scaffolding (`dx new service`)
- [ ] Automated dependency suggestion
- [ ] Performance profiling
- [ ] Deployment previews

### Phase 3 (Q2 2026)

- [ ] GraphQL federation support
- [ ] Canary deployments
- [ ] Blue-green deployments
- [ ] Automated rollback
- [ ] Advanced monitoring dashboards

### Phase 4 (Q3+ 2026)

- [ ] Multi-monorepo support
- [ ] Team workspace management
- [ ] Advanced observability
- [ ] Cost optimization tools
- [ ] Enterprise licensing

## Reference

- [../README.md](../README.md) - dx-cli usage guide
- [service-spec.md](./service-spec.md) - service.yaml reference
- [../dx.config.yml](../dx.config.yml) - Configuration reference
- [../../AGENTS.md](../../AGENTS.md) - Engineering guidelines

## Support

### Getting Help

```bash
# General help
dx --help

# Command-specific help
dx dev --help
dx test --help

# System diagnostics
dx doctor
```

### Reporting Issues

Issues should be reported with:

```bash
dx doctor > diagnosis.txt
# Include diagnosis.txt in issue
```

### Contributing

To improve the DX Platform:

1. File an issue describing the improvement
2. Discuss with team
3. Submit PR with changes
4. Update documentation
5. Deploy in next release

---

**Last Updated:** November 15, 2025

**Platform Version:** 1.0.0

**Maintained By:** ChessMate Engineering Team
