# ChessMate Monorepo

> Chess application platform built with microservices and real-time gaming capabilities.

<img width="1680" height="911" alt="image" src="https://github.com/user-attachments/assets/e4bcb9d6-b4c4-42c6-b55b-a0f5e0be36fd" />

<img width="1680" height="911" alt="image" src="https://github.com/user-attachments/assets/703615fd-ba11-4bd2-98cc-81eac17563da" />


## Quick Start

### 1. Clone & Setup Environment (Required First Step)

The `dx-cli` tool is the command-line interface for all developer workflows. It **must** be installed and setup before working with any services.

```bash
# Clone the repository
git clone <repository-url>
cd chessmate

# Install dx-cli dependencies
cd dx-cli
npm install
npm run build
cd ..

# Run comprehensive setup (checks Node.js, Python, Docker, etc.)
export PATH="$(pwd)/dx-cli/bin:$PATH"
dx setup
```

The `dx setup` command will:
- ✅ Check your operating system
- ✅ Verify all required tools (Node.js, Python 3, Git, etc.)
- ✅ Check optional tools (Docker, mise, Java)
- ✅ Provide installation instructions if anything is missing
- ✅ Verify dx-cli dependencies

### 2. Verify Your Setup

Once setup completes successfully, verify everything is working:

```bash
# Check system health and service discovery
dx doctor

# With verbose output to see all system details
dx doctor --verbose

# Check a specific service
dx doctor account-api
```

### 3. Start Development Environment

Once dx-cli is verified, you can start developing:

```bash
# View all available commands
dx --help

# Start all services
dx dev

# Run tests
dx test

# Build all services
dx build
```

## Services

The monorepo contains 4 main services:

| Service | Type | Language | Purpose |
|---------|------|----------|---------|
| **account-api** | API | Python 3.11 | User account & authentication management |
| **live-game-api** | Service | Python 3.11 | Real-time game state management |
| **matchmaking-api** | Service | Python 3.11 | Matchmaking and player rating system |
| **chess-app** | App | TypeScript | React Native mobile application |

## DX Platform Documentation

The `dx-cli` tool provides a unified interface for all workflows. See the complete documentation:

- [dx-cli/README.md](./dx-cli/README.md) - CLI usage guide
- [dx-cli/docs/overview.md](./dx-cli/docs/overview.md) - Implementation overview
- [dx-cli/docs/DX_PLATFORM.md](./dx-cli/docs/DX_PLATFORM.md) - Platform architecture
- [dx-cli/docs/service-spec.md](./dx-cli/docs/service-spec.md) - service.yaml specification

## Repository Structure

```
chessmate/
├── README.md                          # This file
├── AGENTS.md                          # Engineering guide & conventions
├── ARCHITECTURE.md                    # System architecture
├── SYSTEM_GUIDE.md                    # Services overview
│
├── dx-cli/                            # Developer Experience CLI
│   ├── README.md
│   ├── docs/
│   ├── bin/
│   ├── src/
│   ├── package.json
│   └── dx.config.yml
│
├── account-api/                       # Account management service
│   ├── README.md
│   ├── service.yaml
│   ├── app/
│   ├── tests/
│   └── docs/
│
├── live-game-api/                     # Real-time gaming service
│   ├── README.md
│   ├── service.yaml
│   ├── app/
│   ├── tests/
│   └── docs/
│
├── matchmaking-api/                   # Matchmaking service
│   ├── README.md
│   ├── service.yaml
│   ├── app/
│   ├── tests/
│   └── docs/
│
├── chess-app/                         # React Native mobile app
│   ├── README.md
│   ├── service.yaml
│   ├── src/
│   ├── docs/
│   └── package.json
│
└── docs/                              # Platform documentation
    ├── standards/
    ├── architecture/
    ├── operations/
    ├── business/
    └── decisions/
```

## Development Workflow

### Starting Development

```bash
# 1. Install dx-cli (one time)
cd dx-cli && npm install && npm run build && cd ..

# 2. Start all services
node dx-cli/dist/index.js dev

# 3. In another terminal, run migrations
node dx-cli/dist/index.js migrate --env=dev

# 4. Seed test data
node dx-cli/dist/index.js seed --env=dev

# 5. Run tests
node dx-cli/dist/index.js test
```

### Testing a Single Service

```bash
# Test with dependencies
node dx-cli/dist/index.js test account-api

# Test only (no dependencies)
node dx-cli/dist/index.js test account-api --single

# Build only
node dx-cli/dist/index.js build account-api --single
```

### Deploying

```bash
# Deploy all services to staging
node dx-cli/dist/index.js deploy staging

# Deploy single service to production
node dx-cli/dist/index.js deploy prod account-api --single
```

## Documentation

### For Developers

- [AGENTS.md](./AGENTS.md) - Engineering conventions and standards
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and C4 diagrams
- [SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md) - Services catalog
- [dx-cli/README.md](./dx-cli/README.md) - CLI command reference

### For DevOps/SRE

- [docs/operations/sre-playbook.md](./docs/operations/sre-playbook.md)
- [docs/operations/incident-response.md](./docs/operations/incident-response.md)

### Platform Decisions

- [docs/decisions/](./docs/decisions/) - Architectural decision records

## Architecture

The ChessMate platform follows microservices architecture with these principles:

- **Service-oriented** - Each service has a single responsibility
- **API contracts** - Services communicate via well-defined OpenAPI specs
- **Dependency management** - DAG-based orchestration ensures correct initialization order
- **Scalable** - Designed to grow from 4 to 40+ services
- **Observable** - Structured logging and monitoring at every layer

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed C4 diagrams and flows.

## Contributing

1. **Read [AGENTS.md](./AGENTS.md)** - Engineering guidelines and conventions
2. **Install dx-cli** - Required before any development
3. **Follow the development workflow** - Use `dx` commands for consistency
4. **Document your changes** - Add front-matter to all markdown files
5. **Keep docs in sync** - Update ADRs when making architectural decisions

## Support

### Getting Help

```bash
# General help
node dx-cli/dist/index.js --help

# Command-specific help
node dx-cli/dist/index.js dev --help

# System diagnostics
node dx-cli/dist/index.js doctor
```

### Reporting Issues

When reporting issues, include the output of:

```bash
node dx-cli/dist/index.js doctor > diagnosis.txt
```
