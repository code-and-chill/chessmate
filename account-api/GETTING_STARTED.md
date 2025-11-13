# Getting Started with Account API Development

## Prerequisites

- Python 3.11+
- PostgreSQL 13+ (or use Docker)
- Docker & Docker Compose (optional but recommended)

## Quick Setup (Local Development)

### 1. Virtual Environment

```bash
cd account-api
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements/dev.txt
```

### 3. Database Setup

Option A: Using Docker Compose (recommended)
```bash
# Run PostgreSQL in Docker
docker run -d \
  --name account_db \
  -e POSTGRES_DB=account_db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

Option B: Using existing PostgreSQL
```bash
createdb account_db
```

### 4. Environment Configuration

```bash
cp .env.example .env
# Edit .env if using non-default database settings
```

### 5. Database Migrations

```bash
alembic upgrade head
```

### 6. Start Development Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

## API Documentation

### Interactive Documentation (Swagger UI)
- http://localhost:8000/docs

### ReDoc Documentation
- http://localhost:8000/redoc

## Testing

### Run All Tests
```bash
pytest
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Run Specific Tests
```bash
# Unit tests only
pytest tests/unit/

# Specific test file
pytest tests/unit/domain/test_account_service.py

# Specific test function
pytest tests/unit/domain/test_account_service.py::TestAccountService::test_create_account
```

### Watch Mode (requires pytest-watch)
```bash
pip install pytest-watch
ptw
```

## Code Quality

### Format Code
```bash
black app tests
```

### Sort Imports
```bash
isort app tests
```

### Lint
```bash
flake8 app tests
```

### Type Check
```bash
mypy app
```

### All at Once
```bash
black app tests && isort app tests && flake8 app tests && mypy app
```

## Project Structure Reference

```
account-api/
├── app/                     # Application code
│   ├── api/                 # API layer (routes, models, dependencies)
│   ├── domain/              # Domain layer (models, services, repos interfaces)
│   ├── core/                # Cross-cutting concerns (config, security, exceptions)
│   ├── infrastructure/      # Infrastructure layer (DB, repositories)
│   └── main.py              # FastAPI application entry point
├── tests/                   # Test code
│   ├── unit/                # Unit tests (no external dependencies)
│   └── integration/         # Integration tests (with DB)
├── migrations/              # Alembic database migrations
├── docs/                    # Documentation
├── requirements/            # Python dependencies
├── pyproject.toml          # Project configuration
├── alembic.ini             # Alembic configuration
├── Dockerfile              # Container definition
└── README.md               # Project README
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application factory |
| `app/core/config.py` | Environment configuration |
| `app/domain/models/account.py` | Domain models |
| `app/domain/services/account_service.py` | Business logic |
| `app/infrastructure/repositories.py` | Database implementations |
| `app/api/routes/v1/accounts.py` | Public API endpoints |
| `app/api/routes/internal/accounts.py` | Internal endpoints |
| `tests/conftest.py` | Pytest configuration |

## Common Tasks

### Create a Database Migration

After modifying models, generate a migration:
```bash
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### Add a New API Endpoint

1. Create request/response model in `app/api/models.py`
2. Add endpoint function in `app/api/routes/v1/accounts.py` (or appropriate file)
3. Use `@router.get()`, `@router.post()`, etc. decorator
4. Add tests in `tests/unit/` or `tests/integration/`

### Add a New Domain Service Method

1. Add method to `AccountService` in `app/domain/services/account_service.py`
2. Add corresponding repository method if needed in `app/infrastructure/repositories.py`
3. Add unit test in `tests/unit/domain/test_account_service.py`
4. Use the service in API endpoint

### Debug an Issue

Enable debug logging:
```python
# In app/main.py or your code
import logging
logging.basicConfig(level=logging.DEBUG)
```

Or use the DEBUG environment variable:
```bash
DEBUG=true python -m uvicorn app.main:app --reload
```

## Production Deployment

### Build Docker Image
```bash
docker build -t account-api:v0.1.0 .
```

### Run with Docker Compose
```bash
# Create docker-compose.yml first (see Docker docs)
docker-compose up
```

### Environment Variables
Set these in production:
- `ENVIRONMENT=production`
- `DEBUG=false`
- `DATABASE_URL=postgresql://user:pass@prod-db:5432/account_db`
- `JWT_SECRET_KEY=<strong-random-key>`
- `ALLOWED_HOSTS=api.example.com`

## Troubleshooting

### ModuleNotFoundError
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements/dev.txt
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
psql -U postgres -d account_db -c "SELECT 1"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Tests Failing with Import Errors
```bash
# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Reinstall in development mode
pip install -e .
```

### Port Already in Use
```bash
# Use a different port
python -m uvicorn app.main:app --reload --port 8001

# Or find and kill the process
lsof -i :8000
kill -9 <PID>
```

## Next Steps

1. ✅ Run the development server
2. ✅ Explore the API documentation at /docs
3. ✅ Run the test suite
4. ✅ Read the ARCHITECTURE.md guide
5. ✅ Make changes and see them reload automatically

## Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Pydantic Documentation**: https://docs.pydantic.dev/
- **Alembic Documentation**: https://alembic.sqlalchemy.org/
- **Project Architecture Guide**: See `docs/ARCHITECTURE.md`
- **API Overview**: See `docs/overview.md`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the ARCHITECTURE.md guide
3. Check existing test cases for examples
4. Refer to the main AGENTS.md engineering guide

Happy coding! 🎉
