---
title: Puzzle API Architecture
service: puzzle-api
status: active
last_reviewed: 2025-12-02
type: architecture
---

# Architecture

## High-Level Design
Puzzle API is built using Python and FastAPI. It uses PostgreSQL for data storage, Redis for caching, and integrates with other services for validation and analytics.

### Key Components
- **Puzzle Management**: Handles CRUD operations for puzzles.
- **Daily Puzzle**: Manages the daily puzzle feature.
- **User Stats**: Tracks user progress and ratings.
- **Admin Tools**: Provides capabilities for bulk import and metadata management.
- **Caching Layer**: Redis-based caching for daily puzzles and user feeds.
- **Idempotency**: Client-generated attempt_id for duplicate submission prevention.

### External Integrations
- **Account API**: For user authentication.
- **Engine Cluster API**: For puzzle validation and generation.
- **Chess Knowledge API**: For educational content and metadata.
- **Rating API**: For advanced rating calculations (future).

### Database Schema
- `puzzles`
- `daily_puzzles`
- `puzzle_attempts` (with `attempt_id` for idempotency)
- `user_puzzle_stats`

### Caching Strategy

#### Daily Puzzle Cache
- **Cache Key**: `daily_puzzle:{date}` (e.g., `daily_puzzle:2025-12-02`)
- **TTL**: 24 hours
- **Purpose**: Daily puzzle is the same for all users on a given date, making it highly cacheable
- **Cache Hit Rate Target**: > 90%

#### Puzzle Feed Cache (User History)
- **Cache Key**: `puzzle_feed:{user_id}`
- **TTL**: 1 hour
- **Purpose**: Cache first page of user's puzzle history to reduce database load
- **Note**: Only first page (offset=0) is cached

### Idempotency

Puzzle attempts support idempotency via client-generated `attempt_id`:

- **Unique Constraint**: `(user_id, puzzle_id, attempt_id)` ensures no duplicate processing
- **Behavior**: If same `attempt_id` is submitted twice, the endpoint returns the original result without processing again
- **Use Case**: Prevents duplicate submissions from network retries or client-side errors
- **Client Responsibility**: Generate UUID for `attempt_id` before submission

### Event Streaming
- Emits `PuzzleAttemptCreated` events for analytics.