# Live Game Service - Phase 1: Real-Time Chess MVP

**Version**: 1.0  
**Date**: 2024  
**Status**: Complete

## Phase Objectives

Establish foundational real-time chess game infrastructure:
- Enable players to create challenges and join games
- Implement chess move validation and game state tracking
- Provide real-time game APIs for synchronous play
- Support multiple time controls (bullet, blitz, rapid, classical)

## Scope

### Included

- Game creation with time control options
- Challenge/join workflow for two-player games
- Move validation using python-chess library
- Complete game state tracking (board, move history, turn)
- Game outcomes (checkmate, stalemate, resignation)
- Move history storage and retrieval
- Player turn management
- Database persistence with PostgreSQL

### Excluded

- Real-time WebSocket subscriptions (Phase 2)
- Game search and discovery (Phase 2)
- Ratings and rankings (Phase 2)
- Tournament support (Phase 3)
- Chess analysis and engine integration (Phase 3)
- Time management and clock integration (Phase 2)
- Spectator mode (Phase 2)

## Architecture Decisions

### 1. Domain-Driven Design (DDD) Pattern

**Decision**: Implement Game as aggregate root with rich domain models

**Rationale**:
- Game encapsulates all related state (moves, players, status)
- Business logic isolated from infrastructure
- Easy to test and maintain
- Prepared for future event sourcing

**Trade-off**: Additional code structure; offset by maintainability

### 2. Repository Pattern for Data Access

**Decision**: Abstract data access through GameRepository interface

**Rationale**:
- Domain models don't depend on ORM
- Easy to swap storage mechanisms
- Testable without database
- Clear separation of concerns

**Trade-off**: Extra layer of indirection; worth it for clean architecture

### 3. Domain Events for State Changes

**Decision**: Emit domain events (GameCreatedEvent, MovePlayedEvent, etc.)

**Rationale**:
- Enables future event-driven features (notifications, subscriptions)
- Clear audit trail of what happened
- Decouples components
- Prepared for event sourcing

**Trade-off**: Synchronous event handling for now; events are in-memory

### 4. python-chess for Move Validation

**Decision**: Use battle-tested python-chess library for rules enforcement

**Rationale**:
- Comprehensive chess rule implementation
- Well-maintained and trusted
- Handles edge cases (en passant, castling, promotion)
- Provides board state and move generation

**Trade-off**: External dependency; mitigated by library maturity

### 5. Async/Await Throughout

**Decision**: All I/O operations use async/await with non-blocking patterns

**Rationale**:
- Handles concurrent games efficiently
- Scalable to hundreds of simultaneous games
- Aligns with platform standards

**Trade-off**: Requires async-aware database driver (asyncpg); standard for FastAPI

### 6. FEN (Forsyth-Edwards Notation) for Board Storage

**Decision**: Store board state as FEN string rather than full position objects

**Rationale**:
- Compact representation (100 chars vs. 1KB objects)
- Reversible to board position anytime
- Human-readable for debugging
- Standard chess format

**Trade-off**: Slight parsing overhead; negligible for performance

## Database Schema

### Tables Created

**games**
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id VARCHAR(255) NOT NULL,
  challenger_id VARCHAR(255),
  white_player_id VARCHAR(255),
  black_player_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'waiting_for_opponent',
  result VARCHAR(50),
  end_reason VARCHAR(50),
  time_control VARCHAR(20) NOT NULL,
  board_fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  move_count INT NOT NULL DEFAULT 0,
  current_turn VARCHAR(5) NOT NULL DEFAULT 'white',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX idx_games_creator_id ON games(creator_id);
CREATE INDEX idx_games_challenger_id ON games(challenger_id);
CREATE INDEX idx_games_white_player_id ON games(white_player_id);
CREATE INDEX idx_games_black_player_id ON games(black_player_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at);
```

**game_moves**
```sql
CREATE TABLE game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id VARCHAR(255) NOT NULL,
  move_uci VARCHAR(10) NOT NULL,
  move_san VARCHAR(10),
  board_fen_before TEXT NOT NULL,
  board_fen_after TEXT NOT NULL,
  move_number INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_moves_game_id ON game_moves(game_id);
CREATE INDEX idx_game_moves_player_id ON game_moves(player_id);
CREATE INDEX idx_game_moves_created_at ON game_moves(created_at);
```

## API Endpoints

### Game Management

**POST /api/v1/games/challenge**
- Create a new game challenge
- Auth: Required (JWT token)
- Input: time_control ("bullet", "blitz", "rapid", "classical")
- Output: Game object with status="waiting_for_opponent"
- Status: 201 Created

**POST /api/v1/games/{game_id}/join**
- Join an existing game challenge
- Auth: Required
- Input: none
- Output: Game object with status="in_progress"
- Status: 200 OK / 409 Conflict (already joined or game full)

**GET /api/v1/games/{game_id}**
- Retrieve game details
- Auth: Optional (return public info if not authenticated)
- Output: Complete game object including move history
- Status: 200 OK / 404 Not Found

**GET /api/v1/games**
- List player's active and recent games
- Auth: Required
- Query: ?status=in_progress, ?limit=20, ?offset=0
- Output: Array of Game objects
- Status: 200 OK

### Game Play

**POST /api/v1/games/{game_id}/move**
- Make a move in the game
- Auth: Required (must be current player)
- Input: move_uci ("e2e4")
- Output: Updated Game object
- Status: 200 OK / 400 Bad Request / 409 Conflict (invalid move, not your turn)

**POST /api/v1/games/{game_id}/resign**
- Resign from the game
- Auth: Required (must be player in game)
- Input: none
- Output: Game object with status="completed", result="loss"
- Status: 200 OK / 404 Not Found

**POST /api/v1/games/{game_id}/draw**
- Offer draw (Phase 2)
- Status: 501 Not Implemented

## Breaking Changes

None for initial release (v1.0).

## Testing Strategy

### Unit Tests (60% coverage)

- **Game Aggregate**: Test create, join, assign colors, start, end operations
- **Move Validation**: Test legal/illegal moves using python-chess
- **Game State**: Test turn management, board updates, move history
- **Domain Events**: Test event emission and pending events list

### Integration Tests (25% coverage)

- **Full Game Flow**: Create → Join → Play moves → End game
- **API Endpoints**: Test all 5 routes with valid and invalid inputs
- **Error Handling**: Test validation, authentication, conflict scenarios
- **Database**: Test persistence and retrieval of games and moves

### Contract Tests (15% coverage)

- **Request Schemas**: Verify input validation against OpenAPI spec
- **Response Schemas**: Verify all responses match defined models
- **Status Codes**: Verify correct HTTP status codes returned

### Test Files

- `tests/unit/domain/test_game.py`: Domain model logic (8 tests)
- `tests/unit/domain/test_move_validation.py`: Chess rules (in progress)
- `tests/integration/test_games_api.py`: Full API flow (in progress)

### Coverage Target: 80%+

Current status: Unit tests complete; integration tests in progress

## Deployment Considerations

### Prerequisites

- PostgreSQL 14+ running and accessible
- Account Service running for authentication
- python-chess library available
- JWT secret key configured

### Database Initialization

```bash
poetry run alembic upgrade head
```

Creates `games` and `game_moves` tables with indexes.

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SERVICE_URL`: Account service endpoint
- `JWT_SECRET_KEY`: Token validation secret
- `APP_ENV`: "production" or "development"

### Deployment Steps

1. Build Docker image: `docker build -t live-game-api:latest .`
2. Run database migrations: `poetry run alembic upgrade head`
3. Start service: `docker run -e DATABASE_URL=... live-game-api:latest`
4. Verify: `curl http://localhost:8001/docs`

## Service Dependencies

### External Services

- **Account Service**: JWT token validation, player identity verification

### External Libraries

- `fastapi`: Web framework
- `sqlalchemy`: ORM with async support
- `asyncpg`: PostgreSQL async driver
- `python-chess`: Chess rules and board logic
- `pydantic`: Request/response validation
- `alembic`: Database migrations

## Blockers and Risks

### Known Limitations

1. **No Real-time Updates**
   - Clients must poll for game updates
   - Mitigation: Implement WebSocket subscriptions in Phase 2
   - Impact: Not suitable for fast bullet games < 1 min

2. **No Time Management**
   - Time controls stored but not enforced
   - Players could take unlimited time
   - Mitigation: Implement clock in Phase 2
   - Risk: Defeats purpose of timed games

3. **No Move Undo/Takeback**
   - Moves are permanent once made
   - No dispute resolution mechanism
   - Mitigation: Add undo in Phase 2 with rules
   - Risk: No recovery from accidental moves

4. **Synchronous Game State**
   - All operations must go through API
   - No offline capability
   - Risk: Lost connection = lost game

### Future Enhancements

- Phase 1.1: Move validation optimization and edge case handling
- Phase 2.0: WebSocket real-time updates, clock management
- Phase 2.1: Draw offers and game analysis
- Phase 3.0: Rating system, rankings, tournaments
- Phase 3.1: Chess engine analysis and hints
- Phase 4.0: Spectator mode and streaming
