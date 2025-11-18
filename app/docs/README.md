---
title: App Documentation Index
service: app
status: active
last_reviewed: 2025-11-18
type: overview
---

# ChessMate App Documentation

Cross-platform chess application for iOS, Android, and Web built with React Native and Expo.

## 📋 Essential Reading

**Start here for comprehensive understanding:**

### [overview.md](./overview.md) — Complete App Overview
The single source of truth for understanding the entire application:
- Purpose and philosophy
- Architecture (current and target)
- All features (Play, Puzzles, Learn, Social, Settings)
- Design system and tokens
- Internationalization
- API integration
- State management
- Testing strategy
- Performance, security, accessibility
- Build and deployment
- Roadmap

**This is the main document. Read it first.**

---

## 🚀 Quick Start

### [getting-started.md](./getting-started.md)
Complete setup guide for new developers:
- Prerequisites installation
- Environment setup
- First run
- Common issues

---

## 🏗️ Architecture & Structure

### Current State
- [architecture.md](./architecture.md) — System design and technical patterns
- [folder-structure.md](./folder-structure.md) — Current directory layout

### Target State (Production-Grade)
- [folder-structure-convention.md](./folder-structure-convention.md) — Full specification
- [folder-structure-visual.md](./folder-structure-visual.md) — Visual diagrams and flows
- [decisions/adr-0001-folder-structure-convention.md](./decisions/adr-0001-folder-structure-convention.md) — Decision rationale

### Migration
- [how-to/migration-to-production-structure.md](./how-to/migration-to-production-structure.md) — Step-by-step migration guide

---

## 🤖 For AI Agents

### [ai-agent-quick-reference.md](./ai-agent-quick-reference.md)
Quick decision tree for AI-assisted development:
- Where to place new files
- Common mistakes to avoid
- Naming conventions
- Import patterns
- Testing locations

---

## 🎨 Design & UI

### [component-index.md](./component-index.md)
Complete component catalog:
- Primitives (Box, Text, Button, etc.)
- Compound components (ChessBoard, PlayerPanel, etc.)
- Feature components
- Usage examples

### Design System
Covered in [overview.md](./overview.md#design-system):
- Design tokens (colors, spacing, typography)
- Theme system (light/dark)
- UI components

---

## 🌍 Internationalization

### [i18n.md](./i18n.md)
Translation guide:
- 7 supported languages
- Translation structure
- Adding new languages
- Usage patterns

---

## 🔌 API & Integration

### [api.md](./api.md)
API client documentation:
- HTTP clients
- WebSocket integration
- Service endpoints
- Error handling

### [api-client-conventions.md](./api-client-conventions.md)
API client patterns and best practices

---

## 🪝 Hooks & Logic

### [hooks.md](./hooks.md)
Custom React hooks:
- Data fetching hooks
- State management hooks
- Utility hooks
- Usage examples

---

## 📖 Domain Knowledge

### [domain.md](./domain.md)
Chess domain concepts:
- Glossary (FEN, PGN, ELO, etc.)
- Game rules
- Rating systems
- Chess notation

---

## 🚀 Operations

### [operations.md](./operations.md)
Deployment and monitoring:
- Build process
- Environment configuration
- Deployment targets
- Monitoring and logging

### [runbook.md](./runbook.md)
Operational procedures:
- Incident response
- Common issues
- Troubleshooting

---

## 📚 How-To Guides

### [how-to/local-dev.md](./how-to/local-dev.md)
Local development workflow:
- Running the app
- Hot reload
- Debugging
- Common tasks

### [how-to/migration-to-production-structure.md](./how-to/migration-to-production-structure.md)
Migration guide to production-grade structure

---

## 🗂️ Architecture Decisions

### [decisions/](./decisions/)
Architecture Decision Records (ADRs):
- ADR-0001: Folder structure convention
- Future ADRs as needed

---

## 📜 Historical Documents

These documents capture past migration phases and are kept for reference:

- [migration-summary.md](./migration-summary.md) — November 2025 restructuring
- [migration-complete.md](./migration-complete.md) — Completion report
- [hooks-completion-report.md](./hooks-completion-report.md) — Hooks migration
- [ui-ux-improvements.md](./ui-ux-improvements.md) — UI/UX evolution
- [ui-ux-quick-start.md](./ui-ux-quick-start.md) — UI/UX guide
- [api-layer.md](./api-layer.md) — API layer documentation

---

## 📝 Documentation Standards

All documentation in this folder follows [AGENTS.md](../../../AGENTS.md) standards:

### Required Front Matter
```yaml
---
title: Document Title
service: app
status: active | draft | deprecated
last_reviewed: YYYY-MM-DD
type: overview | architecture | api | domain | operations | how-to | decision
---
```

### Naming Convention
- Use **lowercase with hyphens**: `folder-structure.md`
- Not uppercase: ~~`FOLDER_STRUCTURE.md`~~
- Not camelCase: ~~`folderStructure.md`~~

### Organization
- **Level 1** (Platform-wide): `/docs/` at repo root
- **Level 2** (Domain-specific): `/docs/{domain}/`
- **Level 3** (Platform integrations): `/docs/integrations/`
- **Level 4** (Service-specific): `/app/docs/` (this folder)

---

## 🎯 Documentation Map

```
Quick Start
  └─ getting-started.md

Core Understanding
  └─ overview.md (READ THIS FIRST)

Architecture
  ├─ architecture.md
  ├─ folder-structure-convention.md
  ├─ folder-structure-visual.md
  └─ folder-structure.md (current)

Development
  ├─ ai-agent-quick-reference.md
  ├─ how-to/local-dev.md
  ├─ how-to/migration-to-production-structure.md
  └─ domain.md

Components & APIs
  ├─ component-index.md
  ├─ hooks.md
  ├─ api.md
  └─ i18n.md

Operations
  ├─ operations.md
  └─ runbook.md

Decisions
  └─ decisions/adr-0001-folder-structure-convention.md
```

---

## ❓ Getting Help

1. **New to the project?** → Read [getting-started.md](./getting-started.md)
2. **Need to understand the app?** → Read [overview.md](./overview.md)
3. **Looking for a specific topic?** → Use the sections above
4. **AI agent working on code?** → Check [ai-agent-quick-reference.md](./ai-agent-quick-reference.md)
5. **Still stuck?** → Ask in team Slack #frontend-help

---

*Last updated: 2025-11-18*
