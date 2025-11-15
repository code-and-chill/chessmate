---
title: Local Development Setup
service: account-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Local Development Setup

Step-by-step guide to set up account-api for local development.

## Prerequisites

- Python 3.11+
- PostgreSQL 13+
- pip or poetry
- Git
- Docker (optional, for running PostgreSQL in container)

## Environment Setup

### 1. Clone and Navigate

```bash
cd /workspaces/chessmate/account-api
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements/dev.txt
```

### 4. Create .env File

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/account_db
JWT_SECRET_KEY=your-dev-secret-key
DEBUG=true
ENVIRONMENT=development
```

### 5. Set Up Database

```bash
# Run migrations
alembic upgrade head

# Create initial data (if applicable)
python -m app.scripts.seed_data
```

## Running the Application

### Development Server

```bash
# With auto-reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Interactive API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app

# Specific test file
pytest tests/unit/domain/test_account.py

# Specific test marker
pytest -m integration

# Watch mode (requires pytest-watch)
ptw
```

## Common Development Tasks

### Creating a Database Migration

```bash
alembic revision --autogenerate -m "Description of change"
alembic upgrade head
```

### Running Code Quality Tools

```bash
# Format code
black app tests

# Sort imports
isort app tests

# Lint
flake8 app tests

# Type checking
mypy app

# All of the above
make lint  # if Makefile exists
```

### Working with Database

```bash
# Connect to database (requires psql)
psql postgresql://user:password@localhost:5432/account_db

# View current schema
\dt

# View table structure
\d table_name
```

### Debugging

```bash
# Using pdb (Python debugger)
import pdb; pdb.set_trace()

# Using VS Code debugger
# Set breakpoint in code, then run:
# python -m debugpy --listen 5678 --wait-for-client -m uvicorn app.main:app --reload
```

## Docker Setup (Optional)

### Run PostgreSQL in Docker

```bash
docker run -d \
  --name account-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=account_db \
  -p 5432:5432 \
  postgres:13
```

### Run Application in Docker

```bash
docker build -t account-api .
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:password@db:5432/account_db \
  --network account-network \
  account-api
```

## Troubleshooting

See [troubleshooting.md](./troubleshooting.md) for common issues and solutions.

---

*Last updated: 2025-11-15*
