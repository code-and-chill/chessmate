---
title: Domain Map
status: draft
last_reviewed: 2025-11-15
type: architecture
---

# Domain Map

Bounded contexts and domain landscape across the platform.

## Bounded Contexts

A bounded context is a boundary within which a particular domain model is defined and applicable.

### Account & Identity Context

**Services**: account-api

**Responsibilities**:
- Player identity and authentication
- Profile management
- Preferences and settings
- Privacy controls

**Key Entities**:
- Player Account
- Player Profile
- Preferences
- Privacy Settings

**External Integrations**:
- [List external systems this context integrates with]

---

### Real-Time Gaming Context

**Services**: live-game-api, matchmaking-api

**Responsibilities**:
- Active game management
- Move validation and execution
- Game state synchronization
- Player matching

**Key Entities**:
- Game Session
- Chess Board
- Move/Turn
- Player Pair

**External Integrations**:
- [List external systems this context integrates with]

---

### [Domain Context 3]

**Fill:** Document additional bounded contexts as they emerge.

**Services**: [service names]

**Responsibilities**:
- [Main responsibilities]

**Key Entities**:
- [Core entities]

**External Integrations**:
- [External dependencies]

---

## Domain Events

**Fill:** Document significant domain events and their producers/consumers.

| Event | Producer | Consumers | Purpose |
|-------|----------|-----------|---------|
| `PlayerRegistered` | account-api | matchmaking-api | New player available for matching |
| `GameStarted` | live-game-api | [service] | Game session created |
| `GameCompleted` | live-game-api | [service] | Game finished, results available |
| [Add more as needed] | | | |

## Context Boundaries & Communication

**Fill:** Define how contexts communicate and any anti-corruption layers.

### Account ↔ Real-Time Gaming
- **Direction**: Async events (PlayerRegistered, AccountUpdated)
- **Synchronous**: Player lookup during matchmaking
- **Pattern**: Event-driven for state changes, sync for lookups

### [Other context boundaries]
- [Communication pattern and direction]

## Ubiquitous Language

**Fill:** Shared terminology across contexts.

| Term | Definition | Used By |
|------|-----------|---------|
| Player | A registered user of the platform | All contexts |
| Game Session | An active or completed chess match | Real-Time Gaming |
| Match | A pairing of two players | Matchmaking |
| [Add more terms] | | |

---

*Last updated: 2025-11-15*
