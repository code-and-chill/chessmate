"""Matchmaking API README."""

# Matchmaking API

Matchmaking service for chess platform. Responsible for pairing players and creating games.

## Overview

The matchmaking-api is the service responsible for moving a user from **"I want to play"** to **"You have a game, here's the game_id"**.

It:
- Manages matchmaking queues for different time controls, variants, and regions
- Pairs players based on rating, time in queue, and configurable policies
- Creates game sessions in live-game-api and returns game_id to both players
- Supports direct challenges between players

See `docs/` for detailed documentation.

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis 5.0+
- Docker (optional)

### Setup

```bash
# Install dependencies
pip install -r requirements/dev.txt

# Create .env file
cp .env.example .env

# Run migrations
alembic upgrade head

# Start development server
python -m uvicorn app.main:app --reload

# Run tests
pytest

# Run type checking
mypy app
```

### Docker

```bash
# Build image
docker build -t matchmaking-api .

# Run container
docker run -p 8003:8003 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/matchmaking_db \
  -e REDIS_URL=redis://redis:6379/0 \
  matchmaking-api
```

## API Endpoints

### Public (/v1)

- `POST /v1/matchmaking/queue` - Join matchmaking queue
- `DELETE /v1/matchmaking/queue/{queue_entry_id}` - Cancel queue entry
- `GET /v1/matchmaking/queue/{queue_entry_id}` - Get queue status
- `GET /v1/matchmaking/active` - Get active matchmaking for user
- `POST /v1/matchmaking/challenges` - Create direct challenge
- `POST /v1/matchmaking/challenges/{challenge_id}/accept` - Accept challenge
- `POST /v1/matchmaking/challenges/{challenge_id}/decline` - Decline challenge
- `GET /v1/matchmaking/challenges/incoming` - Get incoming challenges

### Internal (/internal)

- `GET /internal/queues/summary` - Get queue metrics

## Architecture

The service follows Domain-Driven Design with clear separation of concerns:

- **API Layer** (`app/api/`): Request/response handling and HTTP routes
- **Domain Layer** (`app/domain/`): Business logic and domain models
- **Infrastructure Layer** (`app/infrastructure/`): Database, Redis, and external service integration
- **Workers** (`app/workers/`): Background matchmaking processes

See `docs/ARCHITECTURE.md` for detailed design.

## Configuration

Configuration is managed through environment variables (12-factor style):

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/matchmaking_db
REDIS_URL=redis://localhost:6379/0
LIVE_GAME_API_URL=http://live-game-api:8002
JWT_SECRET_KEY=your-secret-key
```

## Development

### Code Quality

```bash
# Format code
black app tests

# Sort imports
isort app tests

# Run linter
flake8 app tests

# Type checking
mypy app
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/unit/domain/test_matchmaking_service.py
```

## Deployment

The service is containerized and can be deployed to Kubernetes using Helm charts.

```bash
# Build and push image
docker build -t ghcr.io/org/matchmaking-api:v0.1.0 .
docker push ghcr.io/org/matchmaking-api:v0.1.0

# Deploy via Helm
helm upgrade --install matchmaking-api ./helm-chart \
  --set image.tag=v0.1.0 \
  --set database.url=postgresql://...
```

## Support

For questions or issues, refer to:
- `docs/` folder for detailed documentation
- `AGENTS.md` in repository root for engineering guidelines
- Service glossary in `/docs/service-spec.md`

## API Specification

Full API specification and contracts are in `docs/overview.md`.

Per service-spec (section 4), all public endpoints require JWT authentication via `Authorization: Bearer <token>` header.
