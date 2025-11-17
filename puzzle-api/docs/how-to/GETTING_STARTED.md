---
title: Puzzle API Getting Started
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: how-to
---

# Getting Started with Puzzle API

## Prerequisites
- Python 3.11 or higher
- pip or poetry for package management
- PostgreSQL or SQLite
- Git

## Local Development Setup

### 1. Clone and Navigate
```bash
git clone <repository>
cd puzzle-api
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

### 4. Setup Database
```bash
# For local development with SQLite
# Database is created automatically on first run
```

### 5. Run the Application
```bash
uvicorn app.main:app --reload --port 8000
```

The API should now be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Running Tests

### Run all tests
```bash
pytest
```

### Run tests with coverage
```bash
pytest --cov=app
```

### Run specific test file
```bash
pytest tests/test_puzzles.py
```

### Run specific test
```bash
pytest tests/test_puzzles.py::test_get_daily_puzzle_not_found
```

## Common Tasks

### Import Puzzles
```bash
curl -X POST http://localhost:8000/api/v1/admin/puzzles/import \
  -H "Content-Type: application/json" \
  -d '[{"fen": "...", "solution_moves": [...], ...}]'
```

### Get Daily Puzzle
```bash
curl http://localhost:8000/api/v1/puzzles/daily
```

### Submit Puzzle Attempt
```bash
curl -X POST http://localhost:8000/api/v1/puzzles/{puzzle_id}/attempt \
  -H "Content-Type: application/json" \
  -d '{"is_daily": true, "moves_played": [...], "status": "SUCCESS", "time_spent_ms": 5000}'
```

### Get User Stats
```bash
curl http://localhost:8000/api/v1/puzzles/user/stats
```

## Code Structure

```
puzzle-api/
  app/
    main.py              # FastAPI application entry point
    api/                 # API route handlers
      puzzles.py         # Puzzle endpoints
      admin.py           # Admin endpoints
      user.py            # User endpoints
    core/
      models.py          # SQLAlchemy models
      schemas.py         # Pydantic schemas
      database.py        # Database configuration
      rating.py          # Rating calculation logic
    domain/
      services.py        # Business logic services
    infrastructure/
      repository.py      # Data access layer
  tests/                 # Test files
    test_puzzles.py
    test_admin.py
    test_user.py
  requirements/          # Python dependencies
  Dockerfile
  pytest.ini
```

## Debugging

### Enable Debug Logging
Set `LOG_LEVEL=DEBUG` environment variable

### Database Inspection
```bash
sqlite3 test.db  # or psql for PostgreSQL
.tables  # Show all tables
SELECT * FROM puzzles LIMIT 5;  # Query puzzles
```

### API Response Inspection
Use browser DevTools or Postman to inspect API responses and headers

## Next Steps

1. Read the [Architecture documentation](docs/architecture.md)
2. Review the [Domain Model](docs/domain.md)
3. Check the [API documentation](docs/api.md)
4. Read [Operations Guide](docs/RUNBOOK.md)
