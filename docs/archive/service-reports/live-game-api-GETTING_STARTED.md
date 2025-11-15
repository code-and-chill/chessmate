# Live Game Service - Getting Started

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Poetry package manager

## Development Environment Setup

### 1. Install Dependencies

```bash
cd live-game-api
poetry install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/chessmate_livegame

# Authentication
AUTH_SERVICE_URL=http://localhost:8000
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Application
APP_ENV=development
DEBUG=True
```

### 3. Database Initialization

Run migrations:

```bash
poetry run alembic upgrade head
```

This creates the `games` and `game_moves` tables with proper indexes.

### 4. Start Development Server

```bash
poetry run python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

The service will be available at `http://localhost:8001`

API documentation (Swagger): `http://localhost:8001/docs`

## Common Development Tasks

### Running Tests

Run all tests:

```bash
poetry run pytest
```

Run only unit tests:

```bash
poetry run pytest tests/unit/
```

Run only integration tests:

```bash
poetry run pytest tests/integration/
```

Run with coverage:

```bash
poetry run pytest --cov=app --cov-report=html
```

View coverage report:

```bash
open htmlcov/index.html
```

### Database Migrations

Create new migration:

```bash
poetry run alembic revision --autogenerate -m "description of change"
```

Apply migrations:

```bash
poetry run alembic upgrade head
```

Rollback last migration:

```bash
poetry run alembic downgrade -1
```

View migration history:

```bash
poetry run alembic history
```

### Code Quality

Format code:

```bash
poetry run black app tests
poetry run isort app tests
```

Type checking:

```bash
poetry run mypy app
```

Linting:

```bash
poetry run flake8 app tests
```

### Interactive Development

Start Python REPL with app context:

```bash
poetry run python
```

Then import and test:

```python
from app.domain.models.game import Game, TimeControl, GameStatus
from app.domain.services.game_service import GameService

# Create a test game
game = Game.create_challenge(
    creator_id="test-user-1",
    time_control=TimeControl.BLITZ
)
print(f"Game created: {game.id}")
```

## API Examples

### Create a Game Challenge

```bash
curl -X POST http://localhost:8001/api/v1/games/challenge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "time_control": "blitz"
  }'

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "waiting_for_opponent",
#   "creator_id": "user-1",
#   "challenger_id": null,
#   "time_control": "blitz",
#   "created_at": "2024-01-15T10:30:00Z"
# }
```

### Join a Game

```bash
curl -X POST http://localhost:8001/api/v1/games/550e8400-e29b-41d4-a716-446655440000/join \
  -H "Authorization: Bearer {token}"

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "in_progress",
#   "white_player_id": "user-1",
#   "black_player_id": "user-2",
#   "current_turn": "white",
#   "board_fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
#   "moves": []
# }
```

### Make a Move

```bash
curl -X POST http://localhost:8001/api/v1/games/550e8400-e29b-41d4-a716-446655440000/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "move_uci": "e2e4"
  }'

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "in_progress",
#   "current_turn": "black",
#   "board_fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
#   "moves": [
#     {
#       "player_id": "user-1",
#       "move_uci": "e2e4",
#       "timestamp": "2024-01-15T10:30:05Z"
#     }
#   ]
# }
```

### Resign from Game

```bash
curl -X POST http://localhost:8001/api/v1/games/550e8400-e29b-41d4-a716-446655440000/resign \
  -H "Authorization: Bearer {token}"

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "completed",
#   "result": "loss",
#   "end_reason": "resignation"
# }
```

### Get Game Details

```bash
curl -X GET http://localhost:8001/api/v1/games/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {token}"
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running: `psql -U postgres`
2. Check DATABASE_URL in .env is correct
3. Ensure database exists: `createdb chessmate_livegame`
4. Run migrations again: `poetry run alembic upgrade head`

### Move Validation Errors

If moves are being rejected:

1. Verify move format is valid UCI notation (e.g., `e2e4`)
2. Ensure it's the current player's turn
3. Verify the move is legal according to chess rules
4. Check for board state inconsistencies in logs

### Token Validation Errors

- Ensure JWT token is passed in Authorization header
- Format: `Authorization: Bearer {token}`
- Check token hasn't expired
- Verify account service is running and accessible

### Import Errors

If you see `ModuleNotFoundError` when running code:

1. Ensure Poetry environment is activated: `poetry shell`
2. Or prefix commands with `poetry run`
3. Run `poetry install` again to ensure dependencies are installed

## Project Structure

```
live-game-api/
├── README.md              # Quick start guide
├── pyproject.toml         # Python dependencies
├── Dockerfile             # Container configuration
├── alembic.ini            # Database migration config
│
├── app/
│   ├── main.py            # FastAPI application entry point
│   ├── core/              # Core application layer
│   │   ├── config.py      # Settings and configuration
│   │   ├── exceptions.py  # Custom exception types
│   │   └── security.py    # JWT authentication
│   ├── domain/            # Domain layer (business logic)
│   │   ├── models/        # Aggregate roots and entities
│   │   ├── services/      # Domain services
│   │   └── repositories/  # Data access interfaces
│   ├── infrastructure/    # Infrastructure layer
│   │   └── database/      # ORM models and repository implementation
│   └── api/               # HTTP API layer
│       ├── models.py      # Pydantic request/response models
│       ├── dependencies.py # Dependency injection
│       └── routes/        # API endpoints
│
├── tests/
│   ├── unit/              # Unit tests for domain models
│   └── integration/       # Integration tests for API endpoints
│
├── migrations/            # Alembic database migrations
├── docs/
│   ├── README.md          # Documentation index
│   ├── GETTING_STARTED.md # This file
│   ├── overview.md        # API specification
│   ├── ARCHITECTURE.md    # System design
│   └── migrations/        # Phase documentation
```

## Next Steps

- Review `overview.md` for complete API specification
- Read `ARCHITECTURE.md` for system design and patterns
- Check `migrations/phase-1.md` for implementation details
- See `integrations/` for service integration patterns
