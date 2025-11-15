---
title: Docker Setup Guide
service: global
status: active
last_reviewed: 2025-11-15
type: standard
---

# ChessMate Docker Setup Guide

This guide covers the standardized Docker configuration for all ChessMate services.

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### Start All Services

```bash
# Start all services with supporting infrastructure
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f account-api
```

### Stop All Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean state)
docker-compose down -v
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chess App (React Native)                 │
│                      Port: 3000                             │
└────────────────┬────────────────┬────────────────┬──────────┘
                 │                │                │
    ┌────────────▼──┐  ┌──────────▼──┐  ┌────────▼────────┐
    │  Account API  │  │ Live Game   │  │ Matchmaking API │
    │  Port: 8001   │  │   API       │  │  Port: 8003     │
    │               │  │  Port: 8002 │  │                 │
    └────────────┬──┘  └──────────┬──┘  └────────┬────────┘
                 │                │               │
    ┌────────────▼────────────────▼───────────────▼──────────┐
    │                      PostgreSQL                        │
    │                      Port: 5432                        │
    └─────────────────────────────────────────────────────────┘
                 │
    ┌────────────▼──────────┐
    │      Redis Cache      │
    │      Port: 6379       │
    └───────────────────────┘
```

## Services Overview

### Python Services (FastAPI)

All Python services follow the same structure:

| Service | Port | Purpose |
|---------|------|---------|
| **account-api** | 8001 | User authentication and profile management |
| **live-game-api** | 8002 | Real-time game state management with WebSocket |
| **matchmaking-api** | 8003 | Player matching and rating calculations |

**Docker Image Base**: `python:3.11-slim`
**Package Manager**: pip with virtual environment
**Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port {PORT}`

### Node.js Service

| Service | Port | Purpose |
|---------|------|---------|
| **chess-app** | 3000 | React Native mobile application |

**Docker Image Base**: `node:18-alpine`
**Package Manager**: pnpm
**Start Command**: `npm start`

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| **postgres** | 5432 | Primary database for all services |
| **redis** | 6379 | In-memory cache and session store |

## Building Images

### Build Single Service

```bash
# Build a service image
docker build -t chessmate/account-api:latest ./account-api

# Build with specific tag
docker build -t chessmate/account-api:v1.0.0 ./account-api

# Build without using cache
docker build --no-cache -t chessmate/account-api:latest ./account-api
```

### Build All Services

```bash
# Build all services defined in docker-compose
docker-compose build

# Force rebuild (ignore cache)
docker-compose build --no-cache

# Build specific service
docker-compose build account-api
```

### View Image Sizes

```bash
# List all ChessMate images with sizes
docker images chessmate/*

# Inspect image layers
docker history chessmate/account-api:latest

# Expected sizes:
# - Python services: 250-400MB
# - Node.js services: 200-350MB
```

## Running Containers

### Run Single Service

```bash
# Run account-api with default settings
docker run -p 8001:8001 chessmate/account-api:latest

# Run with environment variables
docker run \
  -e LOG_LEVEL=DEBUG \
  -e DATABASE_URL=postgresql://user:pass@db:5432/chess \
  -p 8001:8001 \
  chessmate/account-api:latest

# Run in background with name
docker run -d --name account-api \
  -e DATABASE_URL=postgresql://user:pass@db:5432/chess \
  -p 8001:8001 \
  chessmate/account-api:latest
```

### View Container Status

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs account-api

# Follow logs in real-time
docker logs -f account-api

# View last 100 lines
docker logs --tail 100 account-api

# View logs with timestamps
docker logs -t account-api

# Search logs
docker logs account-api 2>&1 | grep ERROR
```

### Container Management

```bash
# Stop a running container
docker stop account-api

# Start a stopped container
docker start account-api

# Restart a container
docker restart account-api

# Remove a container
docker rm account-api

# View container details
docker inspect account-api

# Execute command in running container
docker exec -it account-api bash

# View container resource usage
docker stats account-api
```

## Docker Compose Commands

### Service Lifecycle

```bash
# Start all services in foreground
docker-compose up

# Start all services in background
docker-compose up -d

# Stop all services (keep volumes)
docker-compose stop

# Start stopped services
docker-compose start

# Restart all services
docker-compose restart

# Stop and remove all services
docker-compose down

# Remove volumes too (clean database)
docker-compose down -v

# Remove images too
docker-compose down -v --rmi all
```

### Viewing Status

```bash
# List all services with status
docker-compose ps

# View logs from all services
docker-compose logs

# Follow logs from all services
docker-compose logs -f

# Follow logs from specific service
docker-compose logs -f account-api

# View last 100 lines
docker-compose logs --tail 100

# View timestamps in logs
docker-compose logs -t
```

### Debugging

```bash
# Enter shell in running container
docker-compose exec account-api bash

# Run command in service
docker-compose exec account-api python -c "import sys; print(sys.version)"

# Check health of services
docker-compose ps

# View network details
docker network inspect chessmate_chessmate
```

## Health Checks

Each service includes a health check endpoint:

### Python Services

```bash
# Test health endpoint
curl http://localhost:8001/health

# Expected response:
# {"status": "healthy"}
```

### Node.js Service

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status": "healthy"}
```

### Check Service Health

```bash
# View health status in docker-compose
docker-compose ps

# View detailed health info
docker inspect --format='{{json .State.Health}}' chessmate-account-api

# In running container
docker exec chessmate-account-api python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"
```

## Environment Variables

### Python Services

Default environment in docker-compose.yml:

```env
LOG_LEVEL=INFO
DATABASE_URL=postgresql://chessmate_user:chessmate_pass@postgres:5432/chessmate_db
REDIS_URL=redis://redis:6379
ENVIRONMENT=development
```

### Node.js Service

```env
NODE_ENV=development
REACT_APP_API_URL=http://localhost:8001
REACT_APP_GAME_API_URL=http://localhost:8002
```

### Override Variables

In `docker-compose.yml`:

```yaml
services:
  account-api:
    environment:
      LOG_LEVEL: DEBUG
      ENVIRONMENT: production
```

Or via command line:

```bash
docker run \
  -e LOG_LEVEL=DEBUG \
  -e ENVIRONMENT=production \
  chessmate/account-api:latest
```

## Networking

### Network Details

All services connect via the `chessmate` bridge network:

```bash
# List networks
docker network ls

# Inspect chessmate network
docker network inspect chessmate_chessmate

# Services can reference each other by name:
# - account-api:8001
# - live-game-api:8002
# - matchmaking-api:8003
# - postgres:5432
# - redis:6379
```

### External Access

Services are accessible from host machine:

| Service | Host Access |
|---------|------------|
| account-api | `http://localhost:8001` |
| live-game-api | `http://localhost:8002` |
| matchmaking-api | `http://localhost:8003` |
| chess-app | `http://localhost:3000` |
| postgres | `postgresql://localhost:5432` |
| redis | `redis://localhost:6379` |

## Troubleshooting

### Container Exits Immediately

```bash
# Check logs
docker-compose logs account-api

# Common causes:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port already in use
# 4. Invalid configuration
```

### Health Check Failing

```bash
# Check health endpoint
curl -v http://localhost:8001/health

# Test from container
docker-compose exec account-api curl http://localhost:8001/health

# Increase start-period if service needs more time
# In docker-compose.yml:
# healthcheck:
#   start_period: 10s  # Increase from 5s
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :8001

# Kill the process (if safe)
kill -9 <PID>

# Or change port in docker-compose.yml:
# ports:
#   - "8101:8001"  # Map to 8101 instead
```

### Database Connection Error

```bash
# Verify PostgreSQL is running and healthy
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U chessmate_user -d chessmate_db -c "SELECT 1"

# Check database URL format
# Should be: postgresql://chessmate_user:chessmate_pass@postgres:5432/chessmate_db
```

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Remove unused images
docker image prune

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Clean everything (careful!)
docker system prune -a
```

## Performance Tuning

### Memory Limits

```yaml
# Add to service in docker-compose.yml:
services:
  account-api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Resource Monitoring

```bash
# View real-time resource usage
docker stats

# View specific container
docker stats chessmate-account-api

# Export stats
docker stats --no-stream > stats.txt
```

## Production Deployment

For production deployments, consider:

1. **Image Registry**: Push images to Docker Hub, ECR, or private registry
2. **Multi-stage Builds**: Already implemented for smaller images
3. **Security**: Non-root users, minimal base images, health checks all in place
4. **Logging**: Configure Docker logging driver (default to json-file)
5. **Restart Policy**: Add to services for auto-restart
6. **Resource Limits**: Set memory and CPU limits
7. **Health Checks**: All services have health checks

Example production docker-compose override:

```yaml
services:
  account-api:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

## Related Documentation

- [Dockerfile Standards](./docs/standards/dockerfile.md) - Detailed Dockerfile guidelines
- [Service Catalog](./docs/architecture/service-catalog.md) - Service information
- [Python Architecture](./docs/standards/architecture-python.md) - Python service structure
- [Security Standards](./docs/standards/security.md) - Container security practices

## Support

For issues with Docker setup:

1. Check service logs: `docker-compose logs -f <service>`
2. Verify health: `docker-compose ps`
3. Review [Dockerfile Standards](./docs/standards/dockerfile.md)
4. Check environment variables are set correctly
5. Ensure ports aren't conflicting: `lsof -i -P -n | grep LISTEN`

---

**Last updated**: November 15, 2025
