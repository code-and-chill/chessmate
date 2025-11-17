---
title: Puzzle API Domain
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: domain
---

# Domain Model

## Entities

### Puzzle
- `id`: UUID
- `fen`: Starting position
- `solution_moves`: List of moves in SAN and UCI
- `side_to_move`: "white" / "black"
- `difficulty`: Enum (BEGINNER, EASY, MEDIUM, HARD, MASTER)
- `themes`: List of tags
- `rating`: Numeric difficulty rating
- `created_at`, `updated_at`

### DailyPuzzle
- `id`: UUID
- `puzzle_id`
- `date_utc`: Date
- `title`, `short_description`
- `featured`: Boolean

### UserPuzzleAttempt
- `id`
- `user_id`
- `puzzle_id`
- `status`: Enum (IN_PROGRESS, SUCCESS, FAILED, ABANDONED)
- `moves_played`: List of moves
- `time_spent_ms`

### UserPuzzleStats
- `user_id`
- `tactics_rating`
- `total_attempts`
- `current_daily_streak`