---
title: Glossary
status: draft
last_reviewed: 2025-11-15
type: business
---

# Glossary

Ubiquitous language and terminology across the platform.

## Core Concepts

### Player
A registered user of the Chessmate platform. Identified by unique username and ID. May have associated statistics, ratings, and profile information.

**Related**: Account, Profile, Rating

### Account
The user's authentication and identity entity. Manages login credentials, email, and basic identity information. Separate from Player profile for security purposes.

**Related**: Player, Profile, Authentication

### Profile
The public-facing representation of a player. Includes display name, avatar, biography, and reputation information. May differ from internal account data.

**Related**: Player, Account

### Game Session
A complete chess match between two players. Includes game state, move history, result, and timestamps. May be active (in progress), completed, or archived.

**Related**: Move, Board State, Game Result

### Move
A single action in a chess game (e.g., e2-e4). Includes piece, origin square, destination square, and optional promotion. Validated against game rules and current board state.

**Related**: Game Session, Board State, Chess Rule

### Match
A pairing of two players for gaming. Created by matchmaking service and results in a Game Session. Includes match parameters like time control and rating range.

**Related**: Matchmaking, Game Session, Player Queue

### Rating
A player's skill level measured on an ELO or similar scale. Updated after game completion based on opponent rating and game outcome.

**Related**: Player, Skill Level, Game Result

### Queue
A player's entry into matchmaking. Multiple players may be in queues waiting for matches. Queues may have different time controls or rating ranges.

**Related**: Match, Matchmaking, Player

## Technical Concepts

### Service
An independently deployable component providing specific business capabilities. Services communicate via APIs or events.

**Related**: API, Deployment, Domain, Bounded Context

### API
Application Programming Interface through which services communicate. Includes REST endpoints, GraphQL queries, or other interfaces.

**Related**: Service, Contract, OpenAPI

### Domain
A distinct area of business functionality with specific responsibilities and bounded context.

**Related**: Service, Bounded Context

### Bounded Context
A clear boundary within which a domain model is defined and applies. Services map roughly 1:1 to bounded contexts.

**Related**: Domain, Service, Ubiquitous Language

### Event
A fact that something important has happened in the domain. Events are immutable and represent state changes.

**Examples**: `PlayerRegistered`, `GameCompleted`, `MoveExecuted`

**Related**: Event-Driven Architecture, Domain Event

### Repository
Data access object providing abstraction over data persistence. Returns domain objects rather than raw database records.

**Related**: Persistence, Domain Model, Database

---

## Abbreviations

| Abbreviation | Full Form | Context |
|--------------|-----------|---------|
| API | Application Programming Interface | General |
| RBAC | Role-Based Access Control | Security/Auth |
| JWT | JSON Web Token | Authentication |
| ELO | ELO Rating System | Chess/Matchmaking |
| SLO | Service Level Objective | Operations |
| SRE | Site Reliability Engineering | Operations |
| DDD | Domain-Driven Design | Architecture |
| ORM | Object-Relational Mapping | Data Access |

---

## Domain Glossary by Service

### Account Service
- **Deactivate**: Temporarily disable an account; can be re-activated
- **Ban**: Permanently disable an account; cannot be re-activated
- **Privacy Setting**: User-controlled visibility rules for their profile

### Live Game Service
- **Board State**: Current position of all pieces on the board
- **Promotion**: Converting a pawn to another piece upon reaching the 8th rank
- **Check**: King is under direct threat
- **Checkmate**: King is in check with no legal moves; game over
- **Stalemate**: King is not in check but has no legal moves; game over (draw)

### Matchmaking Service
- **Rating Range**: Acceptable skill range for matching
- **Time Control**: How much time each player has (e.g., 5m+3s, 10m+0s)
- **Pool**: Set of players waiting for matches with similar parameters
- **Pairing**: Selection of two players for a match

---

*Last updated: 2025-11-15*
