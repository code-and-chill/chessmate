---
title: Common Tasks
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Common Development Tasks

Frequent operations and workflows.

## Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app

# Specific test
pytest tests/unit/domain/test_game.py::test_move_validation
```

## Database

```bash
# Fresh database
dropdb live_game_db
createdb live_game_db
alembic upgrade head

# Backup
pg_dump live_game_db > backup.sql
```

## Code Quality

```bash
black app tests && isort app tests
flake8 app tests
mypy app
```

---

*Last updated: 2025-11-15*
