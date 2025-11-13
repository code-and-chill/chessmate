# Getting Started with Live Game API

## Overview

Live Game API is a real-time chess service built with Python, FastAPI, and PostgreSQL. This guide walks you through setting up the development environment and running the service locally.

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- pip or poetry
- Git

## Setup Instructions

### 1. Clone and Navigate

```bash
cd live-game-api
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
# Using pip
pip install -r requirements/dev.txt

# OR using poetry
poetry install
```

### 4. Setup PostgreSQL

```bash
# Create database
createdb live_game

# If you need to set PostgreSQL credentials, create .env file
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/live_game
DEBUG=true
EOF
```

For Docker-based PostgreSQL:

```bash
docker run --name live-game-postgres \
  -e POSTGRES_DB=live_game \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Run Database Migrations

```bash
# Using Alembic
alembic upgrade head

# OR automatic on first run (if using development mode)
python -c "from app.infrastructure.database import database_manager; import asyncio; asyncio.run(database_manager.connect())"
```

### 6. Start Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Common Development Tasks

### View API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app tests/

# Run specific test file
pytest tests/unit/domain/test_game.py

# Run tests in watch mode (install pytest-watch first)
ptw
```

### Code Quality Checks

```bash
# Format code with Black
black app/ tests/

# Sort imports with isort
isort app/ tests/

# Lint with flake8
flake8 app/ tests/

# Type checking with mypy
mypy app/

# All checks at once
black . && isort . && flake8 . && mypy app/
```

### Database Management

```bash
# Create new migration
alembic revision --autogenerate -m "migration name"

# Upgrade to latest
alembic upgrade head

# Downgrade one version
alembic downgrade -1

# View migration history
alembic history
```

## API Usage Examples

### Create a Game

```bash
curl -X POST http://localhost:8000/api/v1/games \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "time_control": {
      "initial_seconds": 300,
      "increment_seconds": 0
    },
    "color_preference": "white",
    "rated": true
  }'
```

### Get Game State

```bash
curl -X GET http://localhost:8000/api/v1/games/{game_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Join a Game

```bash
curl -X POST http://localhost:8000/api/v1/games/{game_id}/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "color_preference": "black"
  }'
```

### Play a Move

```bash
curl -X POST http://localhost:8000/api/v1/games/{game_id}/moves \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from_square": "e2",
    "to_square": "e4",
    "promotion": null
  }'
```

### Resign

```bash
curl -X POST http://localhost:8000/api/v1/games/{game_id}/resign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
live-game-api/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/                 # API layer
│   │   ├── routes/         # Endpoint handlers (games, health)
│   │   ├── models.py       # Request/response Pydantic models
│   │   └── dependencies.py # Dependency injection
│   ├── core/               # Core application components
│   │   ├── config.py       # Settings management
│   │   ├── exceptions.py   # Custom exception handlers
│   │   └── security.py     # Authentication utilities
│   ├── domain/             # Business domain logic
│   │   ├── models/        # Domain entities (Game, Move)
│   │   ├── services/      # Domain services (GameService)
│   │   └── repositories/  # Repository interfaces
│   └── infrastructure/     # Infrastructure layer
│       └── database/      # Database layer (ORM models, repositories)
├── tests/                  # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── conftest.py        # Pytest fixtures
├── migrations/            # Alembic database migrations
├── requirements/          # Dependency specifications
├── pyproject.toml         # Project configuration
├── Dockerfile             # Container image
└── README.md              # Project documentation
```

## Environment Variables

See `.env.example` for complete list. Key variables:

```
DATABASE_URL                # PostgreSQL connection string
DEBUG                       # Enable debug mode
PORT                        # Server port (default: 8000)
API_V1_STR                  # API v1 base path (default: /api/v1)
JWT_SECRET_KEY              # JWT signing key
AUTH_API_URL                # Authentication service URL
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -l | grep live_game

# Recreate database
dropdb live_game && createdb live_game
```

### Import Errors

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install --force-reinstall -r requirements/dev.txt
```

### Port Already in Use

```bash
# Run on different port
uvicorn app.main:app --port 8001

# Or find process using port 8000
lsof -i :8000
```

## Next Steps

1. Read [AGENTS.md](/AGENTS.md) for engineering standards
2. Review [docs/python-guideline.md](/docs/python-guideline.md) for architecture patterns
3. Check [live-game-api/docs/overview.md](docs/overview.md) for API specification
4. Start implementing features following DDD principles

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Async Docs](https://docs.sqlalchemy.org/en/20/)
- [Python Chess Library](https://python-chess.readthedocs.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## Support

For issues or questions:
1. Check existing documentation
2. Review test examples
3. Check git history for similar implementations
