# Puzzle API

Puzzle API powers the tactics puzzles and Daily Puzzle feature for the Chessmate platform. It provides endpoints for serving puzzles, tracking user attempts, managing user stats, and administering puzzles.

## Quick Start

### Build and Run
```bash
# Local development
pip install -r requirements/dev.txt
uvicorn app.main:app --reload

# Docker
docker build -t puzzle-api:latest .
docker run -p 8000:8000 puzzle-api:latest
```

### Test
```bash
pytest
pytest --cov=app
```

## Quick Links
- [Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Domain Model](docs/domain.md)
- [Operations Guide](docs/operations.md)
- [Getting Started](docs/how-to/GETTING_STARTED.md)
- [Runbook](docs/RUNBOOK.md)

## Key Features

### Daily Puzzle
- One puzzle per UTC day (configurable)
- Tracks user attempts and streaks
- Provides puzzle metadata and initial FEN

### Puzzle Solving
- Step-by-step move validation
- Records time-to-solve, hints used, and retry behavior
- Supports success/failed/abandoned states

### User Puzzle Stats
- Tactics rating (Elo-based)
- Global stats: solved count, success rate, streaks
- Persistent user statistics

### Admin Capabilities
- Bulk puzzle import
- Tag puzzles by theme and difficulty
- Configure daily puzzle selection

## API Endpoints

### Public
- `GET /api/v1/puzzles/daily` - Get today's daily puzzle
- `GET /api/v1/puzzles/{puzzle_id}` - Get puzzle details
- `POST /api/v1/puzzles/{puzzle_id}/attempt` - Submit puzzle attempt
- `GET /api/v1/puzzles/user/stats` - Get user puzzle statistics
- `GET /api/v1/puzzles/user/history` - Get user attempt history

### Admin
- `POST /api/v1/admin/puzzles/import` - Import puzzles in bulk
- `PUT /api/v1/admin/daily-puzzles/{date}` - Set daily puzzle for a date
- `POST /api/v1/admin/puzzles/{puzzle_id}/tags` - Update puzzle metadata

## Architecture

### Core Components
- **Puzzle Management**: CRUD operations and querying
- **Daily Puzzle**: Configuration and selection logic
- **User Stats**: Tracking and aggregation
- **Rating Calculator**: Elo-based rating adjustments

### Database Schema
- `puzzles` - Puzzle definitions and metadata
- `daily_puzzles` - Daily puzzle mappings
- `puzzle_attempts` - User attempt history
- `user_puzzle_stats` - Aggregated user statistics

### Integrations
- **Account API**: User authentication and profiles
- **Engine Cluster API**: Puzzle validation (future)
- **Chess Knowledge API**: Educational metadata (future)

## Development

### Prerequisites
- Python 3.11+
- PostgreSQL or SQLite
- Git

### Setup
See [Getting Started Guide](docs/how-to/GETTING_STARTED.md)

### Testing
```bash
# All tests
pytest

# With coverage
pytest --cov=app

# Specific test
pytest tests/test_puzzles.py::test_get_daily_puzzle_not_found
```

## Performance

### SLOs
- `GET /puzzles/daily` p95 < 100ms
- `POST /puzzles/{id}/attempt` p95 < 150ms

### Optimization Strategies
- Cache daily puzzles in Redis
- Index on date_utc, user_id
- Materialized view for user stats

## Observability

### Metrics
- Request count by endpoint
- Response latencies (p50, p95, p99)
- Error rates
- Daily puzzle cache hit rate
- Rating distribution

### Logs
- Puzzle served events
- Attempt created events
- Error events with context

### Tracing
- Correlation IDs for cross-service calls
- Integration with live-game-api for puzzle sourcing