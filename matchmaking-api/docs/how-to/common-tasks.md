---
title: Common Tasks
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Common Development Tasks

Frequent operations.

## Testing

```bash
pytest
pytest --cov=app
pytest tests/unit/domain/ -vv
```

## Database Management

```bash
# Fresh start
dropdb matchmaking_db
createdb matchmaking_db
alembic upgrade head

# Backup
pg_dump matchmaking_db > backup.sql
```

## Code Quality

```bash
black app tests && isort app tests
flake8 app tests
mypy app
```

---

*Last updated: 2025-11-15*
