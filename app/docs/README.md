---
title: App Documentation Index
service: app
status: active
last_reviewed: 2025-12-02
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
- [production-architecture.md](./production-architecture.md) — Production-grade architecture
- [folder-structure-convention.md](./folder-structure-convention.md) — Directory structure rules

### Migration History
- [migrations/README.md](./migrations/README.md) — Phase-based development history
  - Phase 0: Initial audit
  - Phase 1: Folder structure migration
  - Phase 2: Component refactoring
  - Phase 3: Hooks implementation
  - Phase 4: Design Language System
  - Phase 5-7: UI/UX, API, Game logic

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

### [design-language-system.md](./design-language-system.md) ⭐
**Complete Design Language System** (1850+ lines):
- Design tokens (colors, spacing, typography, radius, shadows, motion)
- Primitive components (17+ components)
- Chess-specific components
- State management components
- Theme system
- Responsive design
- Accessibility (WCAG 2.1 AA)
- Implementation guide

### [component-index.md](./component-index.md)
Component catalog and reference:
- Primitives (Box, Text, Button, etc.)
- Compound components (ChessBoard, PlayerPanel, etc.)
- Feature components
- Usage examples

### [hooks.md](./hooks.md)
Custom hooks reference:
- State management hooks
- UI/responsive hooks
- Game logic hooks
- API integration hooks

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

### [api-layer.md](./api-layer.md)
API layer architecture and implementation

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

---

## 📚 How-To Guides

### [how-to/local-dev.md](./how-to/local-dev.md)
Local development workflow:
- Running the app
- Hot reload
- Debugging
- Common tasks

### [how-to/troubleshooting.md](./how-to/troubleshooting.md)
Common issues and solutions

### [how-to/common-tasks.md](./how-to/common-tasks.md)
Frequently performed operations

---

## 🗂️ Architecture Decisions

### [decisions/](./decisions/)
Architecture Decision Records (ADRs):
- Track significant architectural decisions
- Document rationale and trade-offs
- Follow ADR template

---

## 📜 Implementation History

### [migrations/](./migrations/)
Phase-based development history:
- [migrations/README.md](./migrations/README.md) — Phase index
- [migrations/phase-0-audit.md](./migrations/phase-0-audit.md) — Initial audit
- [migrations/phase-1-folder-structure.md](./migrations/phase-1-folder-structure.md) — Structure migration
- [migrations/phase-2-playscreen-refactor.md](./migrations/phase-2-playscreen-refactor.md) — PlayScreen refactor
- [migrations/phase-3-hooks-complete.md](./migrations/phase-3-hooks-complete.md) — Hooks system
- [migrations/phase-4-dls-complete.md](./migrations/phase-4-dls-complete.md) — Design Language System
- [migrations/phase-5-ui-ux.md](./migrations/phase-5-ui-ux.md) — UI/UX enhancements
- [migrations/phase-6-api-context.md](./migrations/phase-6-api-context.md) — API refactoring
- [migrations/phase-7-checkmate.md](./migrations/phase-7-checkmate.md) — Game logic

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
  ├─ production-architecture.md
  └─ folder-structure-convention.md

Design System
  ├─ design-language-system.md ⭐ (PRIMARY)
  ├─ component-index.md
  └─ hooks.md

Development
  ├─ ai-agent-quick-reference.md (for AI agents)
  ├─ how-to/local-dev.md
  ├─ how-to/troubleshooting.md
  ├─ how-to/common-tasks.md
  └─ domain.md

APIs & Integration
  ├─ api.md
  ├─ api-layer.md
  ├─ api-client-conventions.md
  └─ i18n.md

Operations
  └─ operations.md

History
  └─ migrations/ (phase-based development log)

Decisions
  └─ decisions/ (ADRs)
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
