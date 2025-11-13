# Live Game API

Real-time chess service for live, clock-based games. Handles game creation, move validation, clock management, and game termination.

## Features

- Create and join live chess games
- Real-time move validation and submission
- Clock-based time management
- Game state tracking (in progress, ended)
- Checkmate and resignation detection
- Event-driven architecture for rating updates

## Technology Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy 2.x ORM
- **Chess Engine**: python-chess library
- **async/await**: Fully async implementation

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Docker (optional)

### Local Development

1. **Setup environment**

```bash
cd live-game-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**

```bash
pip install -r requirements/dev.txt
```

3. **Configure environment**

```bash
# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/live_game
DEBUG=true
EOF
```

4. **Run migrations**

```bash
# Create tables (automatic on first run in dev mode)
python -c "from app.infrastructure.database import database_manager; import asyncio; asyncio.run(database_manager.connect())"
```

5. **Start development server**

```bash
uvicorn app.main:app --reload --port 8000
```

Server will be available at `http://localhost:8000`

### API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Watch mode
pytest-watch
```

## Project Structure

```
live-game-api/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── api/                    # API layer
│   │   ├── routes/            # Endpoint handlers
│   │   ├── models.py          # Request/response models
│   │   └── dependencies.py    # Dependency injection
│   ├── core/                  # Core application
│   │   ├── config.py          # Configuration
│   │   ├── exceptions.py      # Custom exceptions
│   │   └── security.py        # Authentication
│   ├── domain/                # Domain logic
│   │   ├── models/           # Domain models (Game, Move)
│   │   ├── services/         # Domain services
│   │   └── repositories/     # Repository interfaces
│   └── infrastructure/        # Infrastructure
│       └── database/         # Database access layer
├── tests/                     # Test suite
├── requirements/              # Dependency files
├── pyproject.toml            # Project configuration
└── README.md                 # This file
```

## API Endpoints

### Games

- `POST /api/v1/games` - Create new game challenge
- `GET /api/v1/games/{game_id}` - Get game state
- `POST /api/v1/games/{game_id}/join` - Join game
- `POST /api/v1/games/{game_id}/moves` - Play move
- `POST /api/v1/games/{game_id}/resign` - Resign from game

### Health

- `GET /health` - Health check

## Architecture

### Domain-Driven Design

The service follows DDD principles:

- **Aggregates**: Game (root) with Move collection
- **Value Objects**: TimeControl, GameStatus, GameResult
- **Domain Events**: GameCreated, GameStarted, MovePlayed, GameEnded
- **Repository Pattern**: GameRepository abstraction

### Async-First

All I/O operations are non-blocking:

- FastAPI async handlers
- SQLAlchemy async ORM
- Proper connection pooling

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/live_game` | Database connection string |
| `DEBUG` | `false` | Debug mode |
| `PORT` | `8000` | Server port |
| `API_V1_STR` | `/api/v1` | API v1 base path |
| `JWT_SECRET_KEY` | `your-secret-key` | JWT secret (change in production) |

## Production Deployment

### Docker

```bash
docker build -t live-game-api .
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://... \
  live-game-api
```

### Performance Tuning

- Adjust `DATABASE_POOL_SIZE` based on concurrent connections
- Use Redis caching for active games (phase 2)
- Implement rate limiting for API endpoints
- Monitor move validation latency

## Future Enhancements (Phase 2+)

- WebSocket support for real-time board updates
- Redis caching for active game state
- Time control enforcement with background jobs
- Draw offer/accept mechanics
- Game variants support (Chess960, etc.)
- Spectator mode
- PGN export

## Development Workflow

1. Start with domain models
2. Write repository tests
3. Implement services
4. Create API endpoints
5. Add integration tests
6. Update documentation

## Contributing

1. Follow SOLID principles rigorously
2. Write tests for business logic
3. Use type hints comprehensively
4. Format with Black, lint with flake8
5. Run mypy strict type checking

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/)
- [Python Chess Library](https://python-chess.readthedocs.io/)
- [AGENTS.md](/AGENTS.md) - Engineering standards
- [Python Guidelines](/docs/python-guideline.md) - Python architecture patterns
