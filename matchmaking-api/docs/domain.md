---
title: Matchmaking Domain Model
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: domain
---

# Matchmaking Domain Model

Domain concepts and business rules for player pairing.

## Core Entities

### Queue

Player waiting for a match.

**Attributes**:
- `queue_id`: Unique identifier
- `player_id`: Player UUID
- `time_control`: Desired time format (5+3, 10+0, etc.)
- `rating_range`: Min and max acceptable opponent rating
- `joined_at`: When player entered queue
- `status`: waiting | matched | cancelled

**Invariants**:
- One active queue per player per time control
- Rating range must be valid
- Time control must be supported

### Match

Pairing of two players for a game.

**Attributes**:
- `match_id`: Unique identifier
- `white_player_id`: White player UUID
- `black_player_id`: Black player UUID
- `white_rating`: White player's rating
- `black_rating`: Black player's rating
- `created_at`: When match was made

**Invariants**:
- Both players must be in queue
- Ratings must be within acceptable range
- Players cannot be matched against themselves

### MatchmakingPolicy

Configuration for matching algorithm.

(Fill: Document rating range calculation, time wait thresholds, etc.)

## Domain Events

- `PlayerQueuedJoined` - Player entered matching queue
- `PlayerQueueLeft` - Player left queue
- `PlayersMatched` - Two players paired for game
- `MatchCreated` - Match result sent to live-game-api

## Business Rules

1. **Rating Matching**: Prefer closer rating matches
2. **Wait Time**: Broaden rating range after wait time threshold
3. **Regional Preference**: Respect player region preferences when possible
4. **Fairness**: Distribute colors fairly across players

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Queue | Waiting list for matchmaking |
| Match | Pairing of two players |
| Time Control | Game timing format (e.g., 5+3) |
| Rating | Player's skill level (ELO or similar) |
| Pairing | Process of matching two players |

---

*Last updated: 2025-11-15*
