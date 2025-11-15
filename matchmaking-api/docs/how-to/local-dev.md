---
title: Local Development Setup
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Local Development Setup

Guide to set up matchmaking-api for local development.

## Prerequisites

- Python 3.11+
- PostgreSQL 13+
- pip
- Git

## Environment Setup

### 1. Navigate to Service

```bash
cd /workspaces/chessmate/matchmaking-api
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements/dev.txt
```

### 4. Create .env File

```bash
cp .env.example .env
```

Configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/matchmaking_db
JWT_SECRET_KEY=your-dev-secret-key
DEBUG=true
ACCOUNT_API_URL=http://localhost:8001
LIVE_GAME_API_URL=http://localhost:8002
```

### 5. Initialize Database

```bash
alembic upgrade head
```

## Running

```bash
python -m uvicorn app.main:app --reload --port 8003
```

API at `http://localhost:8003/docs`

## Testing

```bash
pytest
pytest --cov=app
```

---

*Last updated: 2025-11-15*
