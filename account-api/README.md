# Account API

Player account and profile management service for the chess platform.

## Overview

The account-api is the source of truth for player identity and profile. It manages:

- Player identity (username, display name, title, country)
- Player presentation (bio, links, avatar, banner)
- Player preferences (UI and gameplay settings)
- Privacy settings (visibility and communication rules)
- Social counters (followers, friends, games played)

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
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

# Run with type checking
mypy app
```

### Docker

```bash
# Build image
docker build -t account-api .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/account_db \
  account-api
```

## API Endpoints

### Public (/v1)

- `GET /v1/accounts/me` - Get current user's full profile (requires auth)
- `PATCH /v1/accounts/me` - Update profile (requires auth)
- `PATCH /v1/accounts/me/preferences` - Update preferences (requires auth)
- `PATCH /v1/accounts/me/privacy` - Update privacy settings (requires auth)
- `GET /v1/accounts/{username}` - Get public profile

### Internal (/internal)

- `POST /internal/accounts` - Create account
- `GET /internal/accounts/{account_id}` - Get account
- `GET /internal/accounts/by-auth-user/{auth_user_id}` - Get account by auth user ID
- `POST /internal/accounts/{account_id}/deactivate` - Deactivate account
- `POST /internal/accounts/{account_id}/ban` - Ban account
- `POST /internal/accounts/{account_id}/unban` - Unban account

## Architecture

The service follows Domain-Driven Design principles with clear separation of concerns:

- **API Layer** (`app/api/`): Request/response handling and dependency injection
- **Domain Layer** (`app/domain/`): Business logic and domain models
- **Infrastructure Layer** (`app/infrastructure/`): Database and external service integration

See `docs/` for detailed architecture documentation.

## Configuration

Configuration is managed through environment variables (12-factor style):

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/account_db
JWT_SECRET_KEY=your-secret-key
DEBUG=false
ENVIRONMENT=production
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
pytest tests/unit/domain/test_account.py
```

## Deployment

The service is containerized and can be deployed to Kubernetes using Helm charts.

```bash
# Build and push image
docker build -t ghcr.io/org/account-api:v0.1.0 .
docker push ghcr.io/org/account-api:v0.1.0

# Deploy via Helm
helm upgrade --install account-api ./helm-chart \
  --set image.tag=v0.1.0 \
  --set database.url=postgresql://...
```

## Support

For questions or issues, refer to the main [AGENTS.md](../AGENTS.md) guide or contact the team.
