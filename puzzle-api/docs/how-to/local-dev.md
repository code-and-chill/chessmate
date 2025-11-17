---
title: Local Development Guide
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: how-to
---

# Local Development

## Prerequisites
- Python 3.10+
- PostgreSQL
- Redis

## Setup
1. Clone the repository.
2. Navigate to `puzzle-api` directory.
3. Install dependencies:
   ```bash
   pip install -r requirements/dev.txt
   ```
4. Start the database and Redis using Docker Compose:
   ```bash
   docker-compose up -d
   ```
5. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## Testing
Run the test suite:
```bash
pytest
```