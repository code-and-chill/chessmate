---
title: Architectural Decision Records Index
service: global
status: draft
last_reviewed: 2025-12-06
type: decision
---

# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records documenting significant technical decisions made for the platform.

## ADR Format

Each ADR follows this format:

```
# ADR-XXXX: [Short Title]

## Context
[What is the issue we're addressing? What constraints do we face?]

## Decision
[What decision did we make?]

## Rationale
[Why did we make this decision? What alternatives were considered?]

## Consequences
[What are the results of this decision? What benefits or trade-offs?]

## Status
[Proposed | Accepted | Superseded by ADR-XXXX | Deprecated]

## Date
[YYYY-MM-DD]
```

## Active Decisions

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](./ADR-0001-documentation-standardization.md) | Documentation Standardization | Active | 2025-11-15 |
| [ADR-0002](./ADR-0002-create-game-history-api.md) | Create Game History API | Accepted | 2025-12-06 |

## Superseded Decisions

| ADR | Title | Superseded By | Date |
|-----|-------|---------------|------|
| [None yet] | [Example] | ADR-XXXX | [Date] |

## How to Propose an ADR

1. Create a new file: `ADR-XXXX-[slug-title].md`
2. Use next available number (search existing ADRs)
3. Write in the format specified above
4. Submit for review by architecture team
5. Once approved, move status to "Accepted"
6. Archive superseded ADRs with new status

## Decision Categories

- **Architecture**: Major system or infrastructure decisions
- **Domain**: Changes to domain boundaries or ownership
- **Operations**: Deployment, observability, or reliability decisions
- **Security**: Authentication, authorization, encryption, and privacy

---

*Last updated: 2025-12-06*
