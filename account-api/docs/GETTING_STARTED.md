# Account Service - Getting Started

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Poetry package manager

## Development Environment Setup

### 1. Install Dependencies

```bash
cd account-api
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
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/chessmate_account

# Security
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Application
APP_ENV=development
DEBUG=True
```

### 3. Database Initialization

Run migrations:

```bash
poetry run alembic upgrade head
```

### 4. Start Development Server

```bash
poetry run python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at `http://localhost:8000`

## Common Development Tasks

### Running Tests

Run all tests:

```bash
poetry run pytest
```

Run specific test file:

```bash
poetry run pytest tests/unit/domain/test_account_service.py
```

Run with coverage:

```bash
poetry run pytest --cov=app --cov-report=html
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

## API Examples

### Register Account

```bash
curl -X POST http://localhost:8000/api/v1/accounts/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "username": "username"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

### Verify Token

```bash
curl -X GET http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer {token}"
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running: `psql -U postgres`
2. Check DATABASE_URL in .env is correct
3. Ensure database exists: `createdb chessmate_account`
4. Run migrations again: `poetry run alembic upgrade head`

### JWT Errors

- Ensure JWT_SECRET_KEY is set in .env
- Check token expiration: tokens expire after JWT_EXPIRATION_HOURS
- Regenerate token by logging in again

### Migration Conflicts

If migrations conflict:

1. Check migration history: `poetry run alembic history`
2. Merge or rebase migrations
3. Create new migration with changes

## Next Steps

- Review `ARCHITECTURE.md` for system design
- Read `overview.md` for complete API specification
- Check `integrations/` for service integration patterns
