---
title: Documentation Structure Quick Reference
status: published
last_reviewed: 2025-11-15
type: index
---

# Chessmate Documentation Structure - Quick Reference

## 🎯 Quick Navigation

| Role | Start Here | Then Read |
|------|-----------|-----------|
| **New Developer** | [AGENTS.md](./AGENTS.md) | [SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md) → Service README |
| **Team Lead** | [ARCHITECTURE.md](./ARCHITECTURE.md) | [/docs/architecture/](./docs/architecture/) |
| **Operator/SRE** | [/docs/operations/](./docs/operations/) | Service [RUNBOOK.md](./matchmaking-api/docs/RUNBOOK.md) |
| **Architect** | [/docs/decisions/](./docs/decisions/) | [/docs/architecture/](./docs/architecture/) |
| **Product Manager** | [/docs/business/](./docs/business/) | [SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md) |

## 📚 Repository Structure

```
chessmate/
├── AGENTS.md                 # 🔴 Start here: Engineering guide
├── ARCHITECTURE.md           # System architecture overview
├── SYSTEM_GUIDE.md          # Navigation hub & quick links
│
├── docs/                     # Cross-service documentation
│   ├── standards/            # Coding standards & guidelines
│   ├── architecture/         # System design & domains
│   ├── operations/           # SRE, incidents, on-call
│   ├── business/             # Product, domain, glossary
│   └── decisions/            # Architectural decisions (ADRs)
│
├── account-api/              # Service: Identity & Accounts
├── live-game-api/            # Service: Real-Time Gaming
├── matchmaking-api/          # Service: Player Matching
└── chess-app/                # Service: Mobile & Web UI
```

## 🔍 Find By Topic

| Topic | Location |
|-------|----------|
| **Coding standards** | `/docs/standards/coding-style.md` |
| **How to test** | `/docs/standards/testing.md` |
| **Logging patterns** | `/docs/standards/logging.md` |
| **Security practices** | `/docs/standards/security.md` |
| **Monitoring & observability** | `/docs/standards/observability.md` |
| **Documentation how-to** | `/docs/standards/documentation.md` |
| **System architecture** | `ARCHITECTURE.md` + `/docs/architecture/` |
| **Service list & catalog** | `/docs/architecture/service-catalog.md` |
| **Bounded contexts** | `/docs/architecture/domain-map.md` |
| **How services talk** | `/docs/architecture/integration-flows.md` |
| **SRE & reliability** | `/docs/operations/sre-playbook.md` |
| **Incident procedures** | `/docs/operations/incident-response.md` |
| **On-call guide** | `/docs/operations/oncall-guide.md` |
| **Product vision** | `/docs/business/product-vision.md` |
| **Business domain** | `/docs/business/domain-overview.md` |
| **Glossary/terminology** | `/docs/business/glossary.md` |
| **Design decisions** | `/docs/decisions/README.md` |
| **Local dev setup** | `<service>/docs/how-to/local-dev.md` |
| **Common tasks** | `<service>/docs/how-to/common-tasks.md` |
| **Troubleshooting** | `<service>/docs/how-to/troubleshooting.md` |
| **Service overview** | `<service>/docs/README.md` |
| **API endpoints** | `<service>/docs/overview.md` |
| **Service architecture** | `<service>/docs/ARCHITECTURE.md` |
| **Dev environment** | `<service>/docs/GETTING_STARTED.md` |
| **Operations/Runbook** | `<service>/docs/RUNBOOK.md` |
| **Service decisions** | `<service>/docs/decisions/README.md` |

## ⚡ Common Tasks

```bash
# Setup local development
1. Read AGENTS.md
2. cd <service-name>
3. Read docs/GETTING_STARTED.md
4. Follow docs/how-to/local-dev.md

# Troubleshoot issue
1. Check <service>/docs/how-to/troubleshooting.md
2. Check /docs/operations/
3. Check <service>/docs/RUNBOOK.md for ops issues

# Make architectural decision
1. Review /docs/decisions/README.md (format)
2. Check /docs/architecture/ (existing patterns)
3. Write ADR, submit for review
4. Store in docs/decisions/ (cross-service) or 
   <service>/docs/decisions/ (service-specific)

# Understand code quality standards
1. Read /docs/standards/coding-style.md
2. Read /docs/standards/testing.md
3. Check language-specific guide in docs/architecture/

# Handle incident
1. Read /docs/operations/incident-response.md
2. Follow checklist
3. Escalate as needed
4. See /docs/operations/oncall-guide.md for help
```

## 📖 Service-Specific Structure

Each service has consistent documentation:

```
<service>/
├── README.md                 # Quick start guide
└── docs/
    ├── README.md            # Service overview
    ├── overview.md          # API specification
    ├── ARCHITECTURE.md      # Technical design
    ├── GETTING_STARTED.md   # Dev environment setup
    ├── RUNBOOK.md           # Operations procedures
    ├── how-to/
    │   ├── local-dev.md         # Full setup guide
    │   ├── troubleshooting.md   # Common issues
    │   └── common-tasks.md      # Frequent operations
    └── decisions/
        ├── README.md            # ADR index
        └── ADR-XXXX-*.md        # Individual decisions
```

## ✅ Document Conventions

- **Front Matter**: All files include YAML metadata
- **Status**: draft | review | published
- **Last Reviewed**: Updated quarterly (YYYY-MM-DD)
- **Type**: Indicates document purpose (see individual docs)
- **"Fill:" Sections**: Placeholders for team completion
- **Links**: Relative paths for portability

## 🚀 Getting Help

| Question | Answer |
|----------|--------|
| Where do I start? | [AGENTS.md](./AGENTS.md) |
| How do I set up? | Service `/docs/GETTING_STARTED.md` |
| What's broken? | Service `/docs/how-to/troubleshooting.md` |
| How should I code? | `/docs/standards/coding-style.md` |
| How do tests work? | `/docs/standards/testing.md` |
| What's the big picture? | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| How do services work? | `/docs/architecture/integration-flows.md` |
| What does X mean? | `/docs/business/glossary.md` |
| I'm on-call | `/docs/operations/oncall-guide.md` |
| There's an incident! | `/docs/operations/incident-response.md` |

---

**Last Updated**: 2025-11-15  
**Status**: Complete  
**Next Review**: Q1 2026
