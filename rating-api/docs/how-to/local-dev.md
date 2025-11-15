---
title: Local Development
service: rating-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

## Setup
```bash
pip install -r requirements/dev.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --port 8013
```

## Database
- Uses `DATABASE_URL` (asyncpg). Default points to local Postgres.

## Testing
```bash
pytest -q
```
