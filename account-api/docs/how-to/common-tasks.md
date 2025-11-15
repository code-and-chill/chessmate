---
title: Common Tasks
service: account-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Common Development Tasks

Quick recipes for frequent development operations.

## Database Operations

### Reset Database to Clean State

```bash
# Drop and recreate database
dropdb account_db
createdb account_db

# Run all migrations fresh
alembic upgrade head
```

### Add Initial Test Data

```bash
python -c "
from app.infrastructure.database import SessionLocal
from app.domain.account import Account
# Add seed logic here
"
```

### Export Database Backup

```bash
pg_dump account_db > backup_$(date +%s).sql
```

### Restore from Backup

```bash
psql account_db < backup_*.sql
```

## Code Changes

### Add a New API Endpoint

1. Define request/response models in `app/api/models.py`
2. Create handler in `app/api/routes/accounts.py`
3. Add route: `@router.get("/endpoint")`
4. Add tests in `tests/integration/test_accounts.py`
5. Update OpenAPI spec if needed

### Add a Database Migration

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Review generated migration file
# Edit if needed

# Apply migration
alembic upgrade head
```

### Update Domain Model

1. Modify entity in `app/domain/account.py`
2. Create migration: `alembic revision --autogenerate -m ""`
3. Update repository methods if needed
4. Add tests
5. Update API models if exposed

## Testing Workflows

### Run Tests Before Commit

```bash
# Full test suite
pytest

# With coverage
pytest --cov=app --cov-report=html

# Quick smoke test (fast tests only)
pytest -m "not slow"
```

### Debug a Single Test

```bash
# Run specific test with verbose output
pytest tests/unit/domain/test_account.py::test_create_account -vv

# Drop into pdb on failure
pytest --pdb

# Show print statements
pytest -s
```

### Generate Coverage Report

```bash
pytest --cov=app --cov-report=html
# View in browser: htmlcov/index.html
```

## Build & Deployment

### Build Docker Image

```bash
# With default tag
docker build -t account-api .

# With version tag
docker build -t account-api:v0.1.0 .

# With registry
docker build -t ghcr.io/org/account-api:latest .
```

### Run Locally from Docker

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  account-api
```

### Push Image to Registry

```bash
docker tag account-api ghcr.io/org/account-api:latest
docker push ghcr.io/org/account-api:latest
```

## Code Quality

### Apply All Formatting

```bash
black app tests && isort app tests
```

### Check All Quality Standards

```bash
black --check app tests
isort --check app tests
flake8 app tests
mypy app
```

### Fix Common Issues Automatically

```bash
# Sort imports
isort app tests

# Format code
black app tests

# Remove unused imports
autoflake --remove-all-unused-imports -r app tests
```

## Debugging Techniques

### Enable Debug Logging

```python
# In your code
import logging
logging.basicConfig(level=logging.DEBUG)

# In .env
DEBUG=true
LOG_LEVEL=DEBUG
```

### Add Breakpoint

```python
# Add to code (Python 3.7+)
breakpoint()

# Or older style
import pdb; pdb.set_trace()
```

### Inspect Database State

```bash
# Connect to database
psql account_db

# Common queries
SELECT * FROM accounts;
SELECT * FROM accounts WHERE username = 'test_user';
SELECT COUNT(*) FROM accounts;
```

### Monitor Application

```bash
# Watch logs in real-time
tail -f app.log

# Monitor system resources
htop

# Check active connections
ps aux | grep uvicorn
```

## Git Workflows

### Create Feature Branch

```bash
git checkout -b feature/add-new-endpoint
# Make changes, commit
git push origin feature/add-new-endpoint
# Create pull request
```

### Keep Branch Up to Date

```bash
git fetch origin
git rebase origin/main
# Or merge if prefer: git merge origin/main
```

### Clean Up Local Branches

```bash
# List local branches
git branch

# Delete branch
git branch -d feature/name

# Delete remote branch
git push origin --delete feature/name
```

## Performance Profiling

### Profile Database Queries

```bash
# Enable query logging
export DATABASE_ECHO=true

# Run application to see queries
python -m uvicorn app.main:app --reload
```

### Profile Code Execution

```bash
# Using cProfile
python -m cProfile -s cumulative app/main.py

# Using py-spy (live profiling)
py-spy record -o profile.svg -- python -m uvicorn app.main:app
```

---

*Last updated: 2025-11-15*
