---
title: Matchmaking API Architecture
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: architecture
---

# Matchmaking API Architecture

Queue management and player pairing for game matching.

## Architecture Layers

### API Layer (`app/api/`)
- Queue endpoints (`POST /queue`, `GET /queue/{id}`, `DELETE /queue/{id}`)
- Dependency injection
- Request validation

### Domain Layer (`app/domain/`)
- Queue entities (domain models)
- MatchmakingService (pairing logic)
- QueueRepository (interface)

### Infrastructure Layer (`app/infrastructure/`)
- PostgreSQL for queue persistence
- Redis for fast queue indexing
- QueueRepository implementation

### Worker Layer (`app/workers/`)
- Background matchmaking job
- Runs every 1-5 seconds
- Scans for compatible pairs

## Matching Algorithm

```
FOR EACH player_a in queue WHERE status='waiting':
  FOR EACH player_b in queue WHERE status='waiting' AND player_b.id > player_a.id:
    IF rating_compatible(player_a, player_b):
      IF regional_compatible(player_a, player_b):
        CREATE match(player_a, player_b)
        UPDATE queue_entry.status = 'matched'
        CALL live-game-api.POST /games
        BREAK
```

## Data Models

**queue_entries**
- id (UUID)
- player_id (UUID)
- status (waiting|matched|cancelled)
- time_control (time control format)
- rating (player's current rating)
- regions (array of region codes)
- joined_at (when entered queue)
- matched_at (when matched, NULL if waiting)

**matches** (historical)
- id (UUID)
- white_player_id (UUID)
- black_player_id (UUID)
- game_id (UUID, FK to live-game-api)
- created_at

## Performance Characteristics

- Queue join: < 100ms (write to DB, add to Redis index)
- Matching cycle: 1-5 seconds (background worker)
- Match creation: < 500ms (includes call to live-game-api)

## Scalability

- Redis: All-in-memory queue index for O(1) lookups
- Worker: Single thread sufficient for millions of players
- Database: Connection pool 10-20

## Future Enhancements

- Machine learning for better rating predictions
- Skill-based competitive matching
- Tournament/ladder support
- Skill progression tracking
