---
title: Local Development Setup
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Local Development Setup

Step-by-step guide to set up live-game-api for local development.

## Prerequisites

- Python 3.11+
- PostgreSQL 13+
- pip or poetry
- Git
- Docker (optional, for PostgreSQL)

## Environment Setup

### 1. Navigate to Service

```bash
cd /workspaces/chessmate/live-game-api
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

Edit `.env` with local settings:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/live_game_db
JWT_SECRET_KEY=your-dev-secret-key
DEBUG=true
ENVIRONMENT=development
ACCOUNT_API_URL=http://localhost:8001
```

### 5. Set Up Database

```bash
alembic upgrade head
```

## Running the Application

### Development Server

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

API available at `http://localhost:8002`

### API Documentation

- Swagger UI: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`

## Running Tests

```bash
pytest
pytest --cov=app
pytest tests/unit/domain/test_game.py -vv
```

## Troubleshooting

See [troubleshooting.md](./troubleshooting.md)

---

*Last updated: 2025-11-15*
