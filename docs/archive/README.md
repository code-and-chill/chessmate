---
title: Archive Index
service: global
status: active
last_reviewed: 2025-11-15
type: index
---

# Documentation Archive

This directory contains historical, temporary, and phase-specific documentation that has been retired from the canonical structure to maintain AGENTS.md compliance.

## Structure

### temporary-reports/
Project completion reports, status summaries, and one-time documentation created during service implementation phases.

**Contents:**
- Service completion reports
- Project status summaries
- Build/deployment summaries
- One-time analysis documents

**These should NOT be referenced for ongoing development.** For current service status, see the canonical service documentation in `services/<service>/docs/`.

### phase-documentation/
Service development phases and their specific documentation.

**Contents:**
- Phase implementation plans
- Phase-specific requirements
- Phase completion notes

**Reference:** See `/services/<service>/docs/migrations/phase-N.md` for current approach to phase tracking.

### feature-specs/
Feature-specific documentation and enhancement specifications created during development iterations.

**Contents:**
- Feature enhancement specifications
- Feature implementation details
- Feature task lists and checklists

**For current features, see:**
- Service `/docs/architecture.md` for design
- Service `/docs/decisions/` for architectural choices
- Service `/docs/how-to/` for usage guides

## Migration Guide

If you need information from archived documents:

1. **For feature behavior**: Check `/services/<service>/docs/how-to/common-tasks.md`
2. **For design decisions**: Check `/services/<service>/docs/decisions/ADR-*.md`
3. **For current architecture**: Check `/services/<service>/docs/architecture.md`
4. **For APIs**: Check `/services/<service>/docs/api.md`
5. **For operations**: Check `/services/<service>/docs/operations.md`

## How to Handle New Documentation

Per AGENTS.md:

- **Service-specific docs** → `services/<service>/docs/`
- **Cross-service docs** → `/docs/` (standards, architecture, operations, business, decisions)
- **Feature specifications** → Create ADR in `/docs/decisions/` or `services/<service>/docs/decisions/`
- **Temporary reports** → Don't create; use ADRs and phase tracking instead
- **All docs** → Must have YAML front-matter

---

*Archive guidelines*  
*Last updated: 2025-11-15*
