---
title: Copilot Instructions
status: active
last_reviewed: 2025-12-02
type: standard
---

Please always read the repository's `AGENTS.md` and `README.md` before making any changes.

## Core Workflow: Think → Verify → Act

Before writing ANY code or documentation, complete the **Pre-Flight Checklist** in [`AGENTS.md` Section 0.0](../AGENTS.md#00-pre-flight-checklist-mandatory).

Key rules:
1. **Open and re-read `AGENTS.md` in full** — especially Section 0 (Agent Core Principles)
2. **Complete the Pre-Flight Checklist** — understand, search, plan, verify
3. **Follow context-aware guidelines** — UI work? Read DLS. Backend? Read architecture guide. Docs? Follow hierarchy.
4. **Update existing documentation** — never scatter by creating new files unnecessarily
5. **Reuse existing patterns** — search for similar functionality before creating new code
6. If a requested change conflicts with `AGENTS.md`, explicitly explain the conflict and propose a compliant alternative.

## Quick Context Activation

### Working on UI (`app/`)?
→ Activate **DLS-First Thinking**: [`AGENTS.md` Section 0.2](../AGENTS.md#-ui-development-design-language-system-dls-first)
→ Read: [`app/docs/design-language-system.md`](../app/docs/design-language-system.md)

### Working on Backend Services?
→ Activate **Architecture-First Thinking**: [`AGENTS.md` Section 0.2](../AGENTS.md#%EF%B8%8F-backend-development-architecture-patterns-first)
→ Read: `{service}/docs/overview.md` + `docs/architecture-{language}.md`

### Working on Documentation?
→ Activate **Update-Not-Scatter Thinking**: [`AGENTS.md` Section 0.2](../AGENTS.md#-documentation-update-dont-scatter)
→ Follow: Documentation Decision Tree in `AGENTS.md`

These instructions are for automated assistants and contributors using GitHub Copilot or similar tools.
