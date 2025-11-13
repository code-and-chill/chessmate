# Live Game API - Architecture

## Overview

Live Game API is a Domain-Driven Design (DDD) implementation of a real-time chess service using FastAPI, SQLAlchemy 2.x async ORM, and PostgreSQL. The architecture follows the patterns established in the Chessmate engineering guide with a focus on type safety, testability, and maintainability.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│                  (Web/Mobile Frontends)                  │
└──────────────────────────┬──────────────────────────────┘
                           │
                    HTTP/REST (FastAPI)
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   API Layer (FastAPI)                    │
│  Routes (games, health) │ Models │ Dependencies         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Business Domain Layer (DDD)                │
│  Services │ Aggregates │ Value Objects │ Domain Events │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│           Infrastructure Layer (Data Access)            │
│  Repository │ ORM Models │ Database Queries             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│         Persistence Layer (PostgreSQL)                   │
│         games table │ game_moves table                   │
└──────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. API Layer (`app/api/`)

**Responsibility**: Handle HTTP requests/responses and orchestration

**Components**:
- `routes/`: Endpoint handlers organized by resource
  - `health.py`: Health check endpoints
  - `v1/games.py`: Game management endpoints
- `models.py`: Pydantic models for request/response validation
- `dependencies.py`: Dependency injection (authentication, services, database)
- `middleware/`: Custom middleware for request processing

**Key Patterns**:
- Pydantic models for input validation and OpenAPI generation
- FastAPI dependency injection for loose coupling
- Async route handlers for non-blocking I/O
- Proper HTTP status codes and error responses

### 2. Domain Layer (`app/domain/`)

**Responsibility**: Implement business logic and domain concepts

**Components**:
- `models/`: Domain entities and value objects
  - `game.py`: Game aggregate root, Move entity, TimeControl value object
  - `base.py`: Base entity and domain event classes
  
- `services/`: Domain services orchestrating business logic
  - `game_service.py`: GameService with game lifecycle methods
  
- `repositories/`: Repository interfaces (abstraction for data access)
  - `game_repository.py`: GameRepositoryInterface defining contracts

**Key Patterns**:
- Aggregate roots (Game) containing related entities (Moves)
- Value objects (TimeControl, GameStatus) for domain concepts
- Domain events (GameCreatedEvent, GameEndedEvent) for inter-service communication
- Repository pattern abstracting data access
- Service layer coordinating domain logic

### 3. Infrastructure Layer (`app/infrastructure/`)

**Responsibility**: Implement technical concerns and cross-cutting infrastructure

**Components**:
- `database/`
  - `models.py`: SQLAlchemy ORM models (GameORM, GameMoveORM)
  - `repository.py`: Repository implementation for data access
  - `__init__.py`: Database connection management and session factory
  
- `external/`: External service integrations (placeholder for future)

**Key Patterns**:
- SQLAlchemy 2.x async ORM for non-blocking database access
- ORM models separate from domain models (DDD principle)
- Repository implementation encapsulating database queries
- Database session lifecycle management

### 4. Core Layer (`app/core/`)

**Responsibility**: Cross-cutting concerns and configuration

**Components**:
- `config.py`: Pydantic Settings for configuration management
- `exceptions.py`: Custom exception hierarchy and global exception handlers
- `security.py`: JWT token verification and authentication utilities

**Key Patterns**:
- Environment-based configuration with Pydantic
- Custom exceptions for domain-specific errors
- Global exception handlers for consistent error responses
- Security utilities for authentication integration

## Data Flow

### Create Game Scenario

```
1. Client Request
   POST /api/v1/games
   {
     "time_control": {"initial_seconds": 300, "increment_seconds": 0},
     "color_preference": "white",
     "rated": true
   }

2. API Layer (routes/v1/games.py)
   - Extract current user from JWT token (dependencies.py)
   - Validate request with Pydantic model
   - Call game_service.create_challenge()

3. Domain Layer (domain/services/game_service.py)
   - Create Game aggregate root
   - Assign colors based on preference
   - Generate GameCreatedEvent
   - Call repository.create()

4. Infrastructure Layer (infrastructure/database/repository.py)
   - Convert domain Game to ORM GameORM
   - Persist to database via SQLAlchemy
   - Return domain Game object

5. API Response
   GameSummaryResponse with created game state
   HTTP 201 Created
```

### Play Move Scenario

```
1. Client Request
   POST /api/v1/games/{game_id}/moves
   {"from_square": "e2", "to_square": "e4"}

2. API Layer Validation
   - Authenticate user
   - Validate request format

3. Domain Layer (game_service.play_move)
   - Fetch game from repository
   - Verify game is in progress
   - Verify player's turn
   - Validate move legality (TODO: python-chess integration)
   - Create Move entity
   - Update game state (clock, side_to_move)
   - Generate MovePlayedEvent
   - Persist updated game

4. Response
   Updated GameResponse with new state
   HTTP 200 OK
```

## Domain Model

### Game Aggregate

```python
class Game(BaseEntity):
    # Players
    creator_account_id: UUID
    white_account_id: Optional[UUID]
    black_account_id: Optional[UUID]
    
    # Game State
    status: GameStatus  # waiting_for_opponent, in_progress, ended
    fen: str  # Current board position
    side_to_move: str  # 'w' or 'b'
    moves: List[Move]  # Move history
    
    # Time Control
    time_control: TimeControl  # initial_seconds, increment_seconds
    white_clock_ms: int
    black_clock_ms: int
    
    # Game Result
    result: Optional[GameResult]  # 1-0, 0-1, 1/2-1/2
    end_reason: Optional[EndReason]  # checkmate, resignation, timeout
    
    # Metadata
    rated: bool
    variant_code: str  # standard, chess960, etc.
    created_at: datetime
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
```

### Key Value Objects

```python
class TimeControl:
    initial_seconds: int
    increment_seconds: int

class GameStatus(Enum):
    WAITING_FOR_OPPONENT
    IN_PROGRESS
    ENDED

class GameResult(Enum):
    WHITE_WIN = "1-0"
    BLACK_WIN = "0-1"
    DRAW = "1/2-1/2"

class EndReason(Enum):
    CHECKMATE
    RESIGNATION
    TIMEOUT
    DRAW_AGREED
```

## Data Model

### Games Table

```sql
CREATE TABLE games (
    id UUID PRIMARY KEY,
    
    -- Players
    creator_account_id UUID NOT NULL,
    white_account_id UUID,
    black_account_id UUID,
    
    -- State
    status VARCHAR(32) NOT NULL,  -- waiting_for_opponent, in_progress, ended
    fen TEXT NOT NULL,
    side_to_move CHAR(1) NOT NULL,
    
    -- Clocks (milliseconds)
    time_initial_ms INT NOT NULL,
    time_increment_ms INT NOT NULL,
    white_clock_ms INT NOT NULL,
    black_clock_ms INT NOT NULL,
    
    -- Result
    result VARCHAR(8),  -- 1-0, 0-1, 1/2-1/2
    end_reason VARCHAR(32),
    
    -- Metadata
    rated BOOLEAN NOT NULL,
    variant_code VARCHAR(32) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL,
    
    -- Indexes
    INDEX idx_creator_account_id,
    INDEX idx_white_account_id,
    INDEX idx_black_account_id,
    INDEX idx_status
);
```

### Game Moves Table

```sql
CREATE TABLE game_moves (
    id UUID PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id),
    
    -- Move Info
    ply INT NOT NULL,  -- half-move number
    move_number INT NOT NULL,
    color CHAR(1) NOT NULL,  -- w or b
    
    -- Square Notation
    from_square CHAR(2) NOT NULL,
    to_square CHAR(2) NOT NULL,
    promotion CHAR(1),  -- q, r, b, n
    san VARCHAR(16) NOT NULL,  -- Standard Algebraic Notation
    
    -- State After Move
    fen_after TEXT NOT NULL,
    
    -- Timing
    played_at TIMESTAMPTZ NOT NULL,
    elapsed_ms INT NOT NULL,
    
    -- Indexes
    INDEX idx_game_id_ply
);
```

## Async/Await Patterns

### Database Access

```python
# Async session management
async with AsyncSessionLocal() as session:
    # Query within transaction
    stmt = select(GameORM).where(GameORM.id == game_id)
    result = await session.execute(stmt)
    game = result.scalar_one_or_none()
```

### Service Methods

```python
# Async service methods
async def create_challenge(
    self,
    creator_id: UUID,
    time_control: TimeControl,
    ...
) -> Game:
    game = Game(...)  # Create aggregate
    saved_game = await self.repository.create(game)  # Persist
    self.events.append(GameCreatedEvent(...))  # Record event
    return saved_game
```

### Route Handlers

```python
# Async FastAPI routes
@router.post("/games", response_model=GameSummaryResponse)
async def create_game(
    request: CreateGameRequest,
    current_user: UUID = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
):
    game = await game_service.create_challenge(...)
    return GameSummaryResponse.from_orm(game)
```

## Error Handling

### Exception Hierarchy

```
ApplicationException (base)
├── GameNotFoundError (404)
├── GameStateError (400)
├── InvalidMoveError (400)
├── UnauthorizedError (401)
├── GameAlreadyEndedError (400)
└── NotPlayersTurnError (400)
```

### Global Exception Handlers

```python
@app.exception_handler(ApplicationException)
async def application_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )
```

## Dependency Injection

### FastAPI Dependencies

```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UUID:
    """Extract and validate JWT token"""
    return extract_user_id_from_token(credentials.credentials)

async def get_game_service(
    db: AsyncSession = Depends(get_db_session)
) -> GameService:
    """Inject game service with database session"""
    repository = GameRepository(db)
    return GameService(repository)
```

## Testing Strategy

### Unit Tests

- Domain model tests (Game, Move, TimeControl)
- Service logic tests (create_challenge, play_move)
- Validation tests (illegal moves, state transitions)

### Integration Tests

- API endpoint tests with TestClient
- Database persistence tests
- End-to-end game flow tests

### Fixtures

```python
@pytest.fixture
def client(db_session: AsyncSession) -> TestClient:
    """Test client with database override"""
    app.dependency_overrides[get_db_session] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()
```

## Performance Considerations

### Database Optimization

- Connection pooling (default: 10 connections)
- Indexes on frequently queried columns (status, player IDs)
- Eager loading of move history with relationships
- Query optimization for game list retrieval

### Async Best Practices

- Non-blocking I/O for all database operations
- Proper connection management with context managers
- Concurrent request handling
- Background task considerations for future enhancements

### Scalability

- Stateless service design
- Horizontal scaling capability
- Connection pooling for database efficiency
- Future: Redis caching for active games

## Deployment Architecture

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements/prod.txt .
RUN pip install -r prod.txt
COPY app/ /app/app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

### Environment Configuration

- Database URL via environment variable
- Port configuration
- Debug mode for development
- Logging level configuration

## Future Enhancements

### Phase 2 Features

- WebSocket support for real-time updates
- Redis caching for active game state
- Background task for clock management
- Draw offer/accept mechanics
- Game variants support

### Phase 3+ Features

- Spectator mode with restricted view
- PGN export functionality
- Game analysis with evaluation
- Tournament support
- Rating system integration

---

**See Also**:
- [AGENTS.md](/AGENTS.md) - Engineering standards
- [python-guideline.md](/docs/python-guideline.md) - Python architecture patterns
- [overview.md](overview.md) - API specification
- [GETTING_STARTED.md](../GETTING_STARTED.md) - Development guide
