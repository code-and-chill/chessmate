---
title: Architecture Decision Record - Phase 1
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: decision
---

# ADR-0001: Puzzle API Architecture Decisions

## Decision 1: Elo-Based Rating System

### Context
Need a rating system to track user puzzle-solving skill progression.

### Decision
Implement Elo-based rating calculation instead of Glicko/other systems.

### Rationale
- **Simplicity**: Easier to understand and implement for MVP
- **Performance**: Minimal computation overhead
- **Standard**: Well-established in chess community
- **Migration Path**: Can upgrade to Glicko-2 in Phase 2 without API changes

### Implementation
- Base K-factor: 32 (affects rating volatility)
- Time bonus: 0.5-1.5x multiplier based on solve time
- Expected score calculation: 1 / (1 + 10^(rating_diff / 400))

### Future Considerations
- Monitor rating distribution for fairness
- Consider RD (rating deviation) if implementing Glicko later

---

## Decision 2: Repository Pattern for Data Access

### Context
Need to decouple domain logic from database implementation.

### Decision
Use Repository pattern with SQLAlchemy ORM.

### Rationale
- **Testability**: Easy to mock for unit tests
- **Flexibility**: Can switch databases without changing domain code
- **Maintainability**: Clear separation of concerns
- **DDD**: Aligns with domain-driven design principles

### Implementation
```python
class PuzzleRepository:
    @staticmethod
    def create_puzzle(db, puzzle)
    @staticmethod
    def get_puzzle_by_id(db, puzzle_id)
    # ... more methods
```

### Benefits
- Business logic in services doesn't know about database
- Can add caching layer transparently
- Easy to add query optimizations

---

## Decision 3: SQLite for Local Development, PostgreSQL for Production

### Context
Need database for development and production environments.

### Decision
Use SQLite for local development, PostgreSQL for production.

### Rationale
- **Development**: SQLite requires no setup, lightweight, file-based
- **Production**: PostgreSQL provides reliability, scalability, advanced features
- **Cost**: SQLite is free, PostgreSQL is cost-effective
- **Performance**: PostgreSQL better for concurrent users

### Implementation
```python
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./test.db"
)
```

### Migration Path
- Same SQLAlchemy code works for both
- Use Alembic for schema migrations when needed

---

## Decision 4: Pydantic for Schema Validation

### Context
Need to validate API request/response data.

### Decision
Use Pydantic for all schemas.

### Rationale
- **FastAPI Integration**: Native support
- **Type Safety**: Runtime validation with type hints
- **Error Messages**: Clear validation error reporting
- **Performance**: Compiled validators

### Implementation
```python
class PuzzleAttemptSubmission(BaseModel):
    is_daily: bool
    moves_played: List[str]
    status: StatusEnum
    time_spent_ms: int
```

---

## Decision 5: Attempt History as Append-Only Log

### Context
Need to track user puzzle attempts for stats and history.

### Decision
Store attempts as immutable append-only records; aggregate to stats table.

### Rationale
- **Auditability**: Full history preserved
- **Recovery**: Can recalculate stats if corrupted
- **Analytics**: Raw data available for analysis
- **Performance**: Stats table denormalized for fast reads

### Implementation
- `puzzle_attempts` table: raw attempt records
- `user_puzzle_stats` table: aggregated statistics
- Stats updated on each attempt submission

### Trade-offs
- Slightly more storage for attempt history
- Clean separation between raw data and aggregates

---

## Decision 6: Daily Puzzle as Date-Based Mapping

### Context
Need to associate puzzles with specific dates.

### Decision
Create DailyPuzzle table mapping puzzle_id → date_utc.

### Rationale
- **Flexibility**: Can change puzzle for a date
- **History**: Can look back at past daily puzzles
- **Consistency**: Global puzzle ID for same puzzle across clients
- **Extensibility**: Can support regional/locale variants

### Implementation
```sql
CREATE TABLE daily_puzzles (
    id VARCHAR(36) PRIMARY KEY,
    puzzle_id VARCHAR(36) FOREIGN KEY,
    date_utc VARCHAR(10) UNIQUE,
    -- ...
)
```

### Future Extensibility
- Add region column for regional daily puzzles
- Add locale column for localized descriptions
- Partitioning strategy for large datasets

---

## Decision 7: User Stats as Materialized Table

### Context
Need fast access to user statistics.

### Decision
Use materialized user_puzzle_stats table instead of view.

### Rationale
- **Performance**: Faster queries for stats
- **Consistency**: Single source of truth
- **Flexibility**: Can add computed columns
- **Future**: Can schedule periodic recalculation jobs

### Implementation
- Updated on each attempt
- Can add background job for periodic recalculation
- Indexes on user_id for fast lookups

### Upgrade Path
- Keep append-only attempts table for recovery
- Can verify stats by recalculating from attempts

---

## Decision 8: REST API over GraphQL

### Context
Need API design for puzzle service.

### Decision
Use REST/HTTP for public API.

### Rationale
- **Simplicity**: Familiar to all developers
- **Caching**: HTTP caching headers work well
- **CDN**: Easy to cache responses
- **Monitoring**: Standard tools support REST
- **Phase 1 Focus**: REST sufficient for MVP

### Implementation
- Standard HTTP methods (GET, POST, PUT)
- Consistent response structures
- Error codes follow HTTP conventions

### GraphQL Future
- Can add GraphQL layer in Phase 2 if needed
- Won't conflict with REST API

---

## Decision 9: Synchronous Rating Calculation

### Context
Need to calculate rating changes when attempts submitted.

### Decision
Calculate ratings synchronously on attempt submission.

### Rationale
- **Consistency**: Rating calculated immediately
- **Simplicity**: No async overhead for MVP
- **Latency**: Sub-150ms target is achievable
- **Correctness**: No race conditions

### Scalability Path
- If SLA breached, move to async + caching
- Rating calculator is pure function (easy to optimize)

---

## Decision 10: Admin Authentication Placeholder

### Context
Admin endpoints need protection.

### Decision
Use placeholder admin_id parameter for Phase 1.

### Rationale
- **MVP**: Auth system managed by account-api
- **Placeholder**: Clear integration point
- **Security**: Production deployment must add real auth

### Implementation
```python
admin_id: str = "admin-user-id"  # Replace with auth token
```

### Production Upgrade
- Extract user from JWT token
- Verify admin role
- Audit log admin actions

---

## Summary of Architectural Principles

1. **Separation of Concerns**: Domain, Repository, API layers
2. **Testability**: Mockable dependencies, clear interfaces
3. **Scalability**: Designed for horizontal scaling
4. **Extensibility**: Clear extension points for Phase 2+
5. **Maintainability**: Type hints, clear naming, comprehensive docs
6. **Security**: Input validation, user isolation, audit-ready
7. **Performance**: Indexes, caching hooks, async-ready

## Approved By
- Architecture Review: Pending
- Security Review: Pending

## Related ADRs
- (Future ADRs for Phase 2, 3, etc.)
