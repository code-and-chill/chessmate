---
title: Rating API
service: rating-api
status: active
last_reviewed: 2025-11-15
type: overview
---

# Rating API

Single source of truth for player ratings across all pools, variants, and modes. Implements Glicko-2 initially with an extendable engine interface, idempotent game ingestions, and an outbox for rating.updated events.

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Docker (optional)

### Setup

```bash
# Install dependencies
pip install -r requirements/dev.txt

# Create .env file
cp .env.example .env

# Start development server
python -m uvicorn app.main:app --reload --port 8013

# Run tests
pytest
```

### Docker

```bash
# Build image
docker build -t rating-api ./rating-api

# Run container
docker run -p 8013:8013 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/chessmate_db \
  rating-api
```

## Quick Links
- [Overview](docs/overview.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/api.md)
- [Domain](docs/domain.md)
- [Operations](docs/operations.md)
- [Local Development](docs/how-to/local-dev.md)
- [ADR Index](docs/decisions/README.md)
