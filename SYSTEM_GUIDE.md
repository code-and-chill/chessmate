---
title: Chessmate System Guide
status: draft
last_reviewed: 2025-11-15
type: index
---

# Chessmate System Guide

Quick navigation and index for the Chessmate microservices platform.

## 🚀 Quick Start

### ⚠️ First Time Setup (Required)

Before anything else, install the dx-cli tool:

```bash
# Clone the repository
git clone <repository-url>
cd chessmate

# Install dx-cli (REQUIRED FIRST STEP)
cd dx-cli
npm install
npm run build
cd ..

# Verify installation
node dx-cli/dist/index.js doctor
```

Once dx-cli is installed, see [dx-cli/README.md](./dx-cli/README.md) for all available commands.

### For Developers
1. **Install dx-cli** (see above)
2. [Read AGENTS.md](./AGENTS.md) - Platform principles and philosophy
3. Run `node dx-cli/dist/index.js dev` - Start development environment
4. Check your service's README: `/<service>/README.md`
5. Follow dev guide: `/<service>/docs/` (use `how-to/local-dev.md` for setup)

### For Operators
1. **Install dx-cli** (see above)
2. [Read SRE Playbook](./docs/operations/sre-playbook.md)
3. [Read Incident Response Guide](./docs/operations/incident-response.md)
4. Check service runbooks: `/<service>/docs/RUNBOOK.md`

### For Product/Business
1. [Product Vision](./docs/business/product-vision.md)
2. [Glossary](./docs/business/glossary.md)
3. [Domain Overview](./docs/business/domain-overview.md)

---

## 🛠️ Developer Experience Platform (dx-cli)

The unified command-line interface for all developer workflows.

**Location**: [./dx-cli/](./dx-cli/)

**Key Commands**:
- `node dx-cli/dist/index.js dev` - Start development environment
- `node dx-cli/dist/index.js test` - Run tests
- `node dx-cli/dist/index.js build` - Build services
- `node dx-cli/dist/index.js deploy <env>` - Deploy to environment
- `node dx-cli/dist/index.js doctor` - Check system health

**Documentation**:
- [dx-cli/README.md](./dx-cli/README.md) - Complete command reference
- [dx-cli/docs/overview.md](./dx-cli/docs/overview.md) - Implementation overview
- [dx-cli/docs/DX_PLATFORM.md](./dx-cli/docs/DX_PLATFORM.md) - Platform architecture
- [dx-cli/docs/service-spec.md](./dx-cli/docs/service-spec.md) - service.yaml specification

See [Quick Start](#-quick-start) above for installation instructions.

---

## 📋 Service Directory

### API Services

#### [account-api](./account-api/)
Player account and profile management service.
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Status**: Operational
- **Quick Links**: [README](./account-api/README.md) | [Docs](./account-api/docs/) | [API Spec](./account-api/docs/overview.md)

#### [live-game-api](./live-game-api/)
Real-time active game state and moves.
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Status**: Operational
- **Quick Links**: [README](./live-game-api/README.md) | [Docs](./live-game-api/docs/) | [API Spec](./live-game-api/docs/overview.md)

#### [matchmaking-api](./matchmaking-api/)
Player matching and queue management.
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Status**: Operational
- **Quick Links**: [README](./matchmaking-api/README.md) | [Docs](./matchmaking-api/docs/) | [API Spec](./matchmaking-api/docs/overview.md)

#### [rating-api](./rating-api/)
Player ratings across pools using Glicko-2.
- **Language**: Python (FastAPI)
- **Database**: PostgreSQL
- **Status**: Draft
- **Quick Links**: [README](./rating-api/README.md) | [Docs](./rating-api/docs/) | [API Spec](./rating-api/docs/api.md)

#### [bot-orchestrator-api](./bot-orchestrator-api/)
Engine-backed bot orchestration service (BotSpec, engine, knowledge integration).
- **Language**: Python (FastAPI)
- **Database**: None (stateless)
- **Status**: Draft
- **Quick Links**: [README](./bot-orchestrator-api/README.md) | [Docs](./bot-orchestrator-api/docs/) | [API Spec](./bot-orchestrator-api/docs/api.md)

#### [engine-cluster-api](./engine-cluster-api/)
Chess engine evaluation service running Stockfish-like engines.
- **Language**: Python (FastAPI)
- **Database**: None (stateless)
- **Status**: Draft
- **Quick Links**: [README](./engine-cluster-api/README.md) | [Docs](./engine-cluster-api/docs/) | [API Spec](./engine-cluster-api/docs/api.md)

#### [chess-knowledge-api](./chess-knowledge-api/)
Chess knowledge service for opening books and endgame tablebases.
- **Language**: Python (FastAPI)
- **Database**: None (stateless)
- **Status**: Draft
- **Quick Links**: [README](./chess-knowledge-api/README.md) | [Docs](./chess-knowledge-api/docs/) | [API Spec](./chess-knowledge-api/docs/api.md)

### Client Applications

#### [chess-app](./chess-app/)
Mobile and web user interface.
- **Language**: TypeScript (React Native + React)
- **Platforms**: iOS, Android, Web
- **Status**: Operational
- **Quick Links**: [README](./chess-app/README.md) | [Docs](./chess-app/docs/)

---

## 📚 Platform Documentation

### Architecture & Design
- [System Architecture Overview](./ARCHITECTURE.md)
- [System Context](./docs/architecture/system-context.md)
- [Domain Map](./docs/architecture/domain-map.md)
- [Service Catalog](./docs/architecture/service-catalog.md)
- [Integration Flows](./docs/architecture/integration-flows.md)

### Standards & Guidelines
- [Engineering Guide (AGENTS.md)](./AGENTS.md)
- [Coding Style Standards](./docs/standards/coding-style.md)
- [Testing Standards](./docs/standards/testing.md)
- [Logging Standards](./docs/standards/logging.md)
- [Security Standards](./docs/standards/security.md)
- [Observability Standards](./docs/standards/observability.md)
- [Documentation Standards](./docs/standards/documentation.md)

### Operations & Reliability
- [SRE Playbook](./docs/operations/sre-playbook.md)
- [Incident Response Guide](./docs/operations/incident-response.md)
- [On-Call Engineer Guide](./docs/operations/oncall-guide.md)

### Business Context
- [Product Vision](./docs/business/product-vision.md)
- [Domain Overview](./docs/business/domain-overview.md)
- [Glossary](./docs/business/glossary.md)

### Decisions
- [Architectural Decision Records](./docs/decisions/)

---

## 🔍 Search by Topic

### Getting Started
- **I'm a new developer**: Read [AGENTS.md](./AGENTS.md), then your service README
- **I'm setting up my dev environment**: See `/<service>/docs/GETTING_STARTED.md`
**I need to run tests**: Check your service's README for test commands
**I need to deploy**: Read `/<service>/docs/RUNBOOK.md` → Deployment section
**I need to set up my dev environment**: See `/<service>/docs/how-to/local-dev.md`

### Development
- **How should I structure code?**: [Coding Style Standards](./docs/standards/coding-style.md)
- **What's the testing strategy?**: [Testing Standards](./docs/standards/testing.md)
- **How do I write logs?**: [Logging Standards](./docs/standards/logging.md)
- **How do services communicate?**: [Integration Flows](./docs/architecture/integration-flows.md)
- **What's the overall architecture?**: [System Architecture](./ARCHITECTURE.md)

### Operations
- **I'm on-call**: Read [On-Call Guide](./docs/operations/oncall-guide.md)
- **There's an incident**: See [Incident Response Guide](./docs/operations/incident-response.md)
- **I need to monitor a service**: Check [SRE Playbook](./docs/operations/sre-playbook.md)
- **Service won't start**: See service-specific [RUNBOOK.md](./live-game-api/docs/RUNBOOK.md)

### Business & Product
- **What's our vision?**: [Product Vision](./docs/business/product-vision.md)
- **What does term X mean?**: [Glossary](./docs/business/glossary.md)
- **How does the business model work?**: [Domain Overview](./docs/business/domain-overview.md)
- **What's the roadmap?**: [Product Vision → Roadmap](./docs/business/product-vision.md)

### Architecture & Design
- **High-level architecture?**: [System Architecture](./ARCHITECTURE.md)
- **How do services integrate?**: [Integration Flows](./docs/architecture/integration-flows.md)
- **What's a bounded context?**: [Domain Map](./docs/architecture/domain-map.md)
- **Complete service list**: [Service Catalog](./docs/architecture/service-catalog.md)
- **Why was X decided?**: [Architectural Decisions](./docs/decisions/)

---

## 🔗 Cross-References

### By Service

**account-api**
- Overview: [docs/README.md](./account-api/docs/README.md)
- API: [docs/overview.md](./account-api/docs/overview.md)
- Architecture: [docs/ARCHITECTURE.md](./account-api/docs/ARCHITECTURE.md)
- Domain: [docs/domain.md](./account-api/docs/domain.md) (if exists)
- Ops: [docs/RUNBOOK.md](./account-api/docs/RUNBOOK.md)

**live-game-api**
- Overview: [docs/README.md](./live-game-api/docs/README.md)
- API: [docs/overview.md](./live-game-api/docs/overview.md)
- Architecture: [docs/ARCHITECTURE.md](./live-game-api/docs/ARCHITECTURE.md)
- Domain: [docs/domain.md](./live-game-api/docs/domain.md) (if exists)
- Ops: [docs/RUNBOOK.md](./live-game-api/docs/RUNBOOK.md)

**matchmaking-api**
- Overview: [docs/README.md](./matchmaking-api/docs/README.md)
- API: [docs/overview.md](./matchmaking-api/docs/overview.md)
- Architecture: [docs/ARCHITECTURE.md](./matchmaking-api/docs/ARCHITECTURE.md)
- Domain: [docs/domain.md](./matchmaking-api/docs/domain.md) (if exists)
- Ops: [docs/RUNBOOK.md](./matchmaking-api/docs/RUNBOOK.md)

**chess-app**
- Overview: [docs/README.md](./chess-app/docs/README.md)
- Architecture: [docs/ARCHITECTURE.md](./chess-app/docs/ARCHITECTURE.md)

---

## 📊 Repository Structure

```
chessmate/
├── AGENTS.md                    # Engineering guide & principles
├── ARCHITECTURE.md              # System architecture overview
├── SYSTEM_GUIDE.md              # This file - navigation & index
│
├── docs/                        # Cross-service documentation
│   ├── README.md                # Docs index & navigation
│   ├── standards/               # Platform standards
│   │   ├── coding-style.md
│   │   ├── testing.md
│   │   ├── logging.md
│   │   ├── security.md
│   │   ├── observability.md
│   │   └── documentation.md
│   ├── architecture/            # System architecture
│   │   ├── system-context.md
│   │   ├── domain-map.md
│   │   ├── service-catalog.md
│   │   └── integration-flows.md
│   ├── operations/              # Operational guides
│   │   ├── sre-playbook.md
│   │   ├── incident-response.md
│   │   └── oncall-guide.md
│   ├── business/                # Business context
│   │   ├── product-vision.md
│   │   ├── domain-overview.md
│   │   └── glossary.md
│   └── decisions/               # Architectural decisions
│       ├── README.md
│       └── ADR-*.md
│
├── account-api/                 # Service: Account & Identity
│   ├── README.md
│   ├── docs/
│   │   ├── README.md
│   │   ├── overview.md
│   │   ├── ARCHITECTURE.md
│   │   ├── api.md
│   │   ├── domain.md
│   │   ├── operations.md
│   │   ├── RUNBOOK.md
│   │   ├── how-to/
│   │   ├── decisions/
│   │   └── migrations/
│   ├── app/
│   ├── migrations/
│   ├── tests/
│   └── pyproject.toml
│
├── live-game-api/               # Service: Real-Time Gaming
│   ├── README.md
│   ├── docs/
│   │   └── [same structure as account-api]
│   ├── app/
│   ├── migrations/
│   ├── tests/
│   └── pyproject.toml
│
├── matchmaking-api/             # Service: Player Matching
│   ├── README.md
│   ├── docs/
│   │   └── [same structure as account-api]
│   ├── app/
│   ├── migrations/
│   ├── tests/
│   └── pyproject.toml
│
└── chess-app/                   # Client: Mobile & Web UI
    ├── README.md
    ├── docs/
    │   ├── README.md
    │   ├── overview.md
    │   ├── ARCHITECTURE.md
    │   ├── how-to/
    │   └── decisions/
    ├── src/
    ├── package.json
    └── [React/React Native config]
```

---

## 🆘 Getting Help

| Question | Resource |
|----------|----------|
| **Where do I start?** | Read [AGENTS.md](./AGENTS.md) first |
| **How do I set up my dev environment?** | Service-specific [GETTING_STARTED.md](./account-api/docs/GETTING_STARTED.md) |
| **What's the architecture?** | [ARCHITECTURE.md](./ARCHITECTURE.md) and [system-context.md](./docs/architecture/system-context.md) |
| **How do I deploy?** | Service [RUNBOOK.md](./account-api/docs/RUNBOOK.md) under "Deployment" |
| **There's an incident!** | [Incident Response Guide](./docs/operations/incident-response.md) |
| **What does term X mean?** | [Glossary](./docs/business/glossary.md) |
| **Why was decision Y made?** | [Architecture Decisions](./docs/decisions/) |
| **How do I write code?** | [Coding Standards](./docs/standards/coding-style.md) |
| **How should I test?** | [Testing Standards](./docs/standards/testing.md) |
| **What's the product roadmap?** | [Product Vision](./docs/business/product-vision.md) |

---

*Last updated: 2025-11-15*  
*For updates to this guide, see: [Documentation Standards](./docs/standards/documentation.md)*
