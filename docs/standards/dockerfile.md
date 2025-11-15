---
title: Standardized Dockerfile Guidelines
service: global
status: active
last_reviewed: 2025-11-15
type: standard
---

# Standardized Dockerfile Guidelines

This document defines the standard approach for creating production-ready Dockerfiles across all ChessMate services. All services **MUST** follow these guidelines.

## Table of Contents

- [Core Principles](#core-principles)
- [Python Services (FastAPI)](#python-services-fastapi)
- [Node.js Services (TypeScript/React)](#nodejs-services-typescriptreact)
- [Multi-Stage Builds](#multi-stage-builds)
- [Security Practices](#security-practices)
- [Health Checks](#health-checks)
- [Environment Variables](#environment-variables)
- [Building and Running](#building-and-running)

---

## Core Principles

All Dockerfiles must adhere to these principles:

1. **Multi-Stage Builds**: Separate build and runtime stages to minimize image size
2. **Non-Root User**: Run containers as unprivileged users (uid 1000)
3. **Security**: No package managers in runtime, minimal attack surface
4. **Health Checks**: All containers must include health check endpoints
5. **Signal Handling**: Proper entrypoint handling for graceful shutdowns
6. **Optimization**: Layer caching, dependency isolation, minimal layers

---

## Python Services (FastAPI)

All Python services use Python 3.11-slim base image with multi-stage builds.

### Template Structure

```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements/prod.txt .

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir -r prod.txt

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only (no gcc, build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser migrations ./migrations

# Set environment
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER appuser

# Expose port (use service-specific port)
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Service-Specific Ports

| Service | Port | Description |
|---------|------|-------------|
| `account-api` | 8001 | User account management |
| `live-game-api` | 8002 | Real-time game state |
| `matchmaking-api` | 8003 | Matchmaking and ratings |

### Key Points

- **Virtual Environment**: Must use `/opt/venv` for proper layer isolation
- **--no-install-recommends**: Minimizes image size
- **Environment Variables**: Set `PYTHONUNBUFFERED=1` and `PYTHONDONTWRITEBYTECODE=1`
- **Build Dependencies**: Only included in builder stage (gcc, build tools)
- **Runtime Dependencies**: Only required packages in runtime (postgresql-client when needed)
- **User ID**: Always use uid 1000 for consistency with orchestration platforms

---

## Node.js Services (TypeScript/React)

Node.js services use node:18-alpine with pnpm for dependency management.

### Template Structure

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Copy node modules and built app from builder
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/package.json ./

# Set environment
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256"

USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run application
CMD ["npm", "start"]
```

### Key Points

- **Alpine Base**: Minimal footprint, ~5MB vs 300MB+ for full Node
- **pnpm**: Faster, more efficient than npm; requires `pnpm-lock.yaml`
- **frozen-lockfile**: Ensures reproducible builds
- **dumb-init**: Properly forwards signals (SIGTERM) for graceful shutdown
- **Memory Limits**: `NODE_OPTIONS` sets memory ceiling for containerized environments
- **Production Mode**: Always set `NODE_ENV=production`

---

## Multi-Stage Builds

All Dockerfiles must use multi-stage builds for the following reasons:

### Benefits

| Benefit | Impact |
|---------|--------|
| **Smaller Images** | 50-70% size reduction by excluding build tools |
| **Security** | Build tools (gcc, build-essential) not in runtime |
| **Performance** | Faster container startup times |
| **Cleaner Layers** | Intermediate artifacts not included |

### Pattern

```dockerfile
# Stage 1: Build
FROM base:version as builder
# ... install build dependencies ...
# ... build application ...

# Stage 2: Runtime
FROM base:version
# ... copy only runtime artifacts from builder ...
# ... minimal dependencies ...
```

### Layer Caching

Order matters for build efficiency:

1. **Stable Dependencies First**: Base image, system packages
2. **Application Dependencies**: pip/npm requirements (less frequently changed)
3. **Application Code**: Source code (changes frequently)

---

## Security Practices

### 1. Non-Root User

Always run containers as unprivileged user (uid 1000):

```dockerfile
# Python
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Node.js
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser
USER appuser
```

**Why**: Limits blast radius if container is compromised.

### 2. Minimal Base Images

- **Python**: Use `python:3.11-slim` (120MB) not `python:3.11` (1GB+)
- **Node.js**: Use `node:18-alpine` (180MB) not `node:18` (900MB+)

**Why**: Smaller attack surface, fewer vulnerabilities, faster pulls.

### 3. Package Manager Cleanup

Always clean package manager cache:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    package-name \
    && rm -rf /var/lib/apt/lists/*
```

**Why**: Reduces image size, removes potential security issues in cached packages.

### 4. Immutable Dependencies

Use locked/pinned dependency versions:

- **Python**: `requirements/prod.txt` with pinned versions
- **Node.js**: `pnpm-lock.yaml` with `--frozen-lockfile`

**Why**: Ensures reproducible builds, prevents unexpected dependency changes.

---

## Health Checks

All containers must include health checks for orchestration platforms (Kubernetes, Docker Compose).

### Python Services

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')" || exit 1
```

**Implementation in FastAPI**:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Node.js Services

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
```

**Implementation in Express/Fastify**:

```typescript
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});
```

### Health Check Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `--interval` | 30s | Check every 30 seconds |
| `--timeout` | 10s | Wait max 10s for response |
| `--start-period` | 5s | Wait 5s before first check |
| `--retries` | 3 | Mark unhealthy after 3 failures |

---

## Environment Variables

### Python Services

```dockerfile
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
```

- `PYTHONUNBUFFERED=1`: Real-time log output to stdout
- `PYTHONDONTWRITEBYTECODE=1`: Prevents .pyc file generation

### Node.js Services

```dockerfile
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256"
```

- `NODE_ENV=production`: Enables production optimizations
- `NODE_OPTIONS`: Sets memory limits for containerized environments

### Runtime Configuration

Use Docker environment flags for runtime configuration:

```bash
docker run -e LOG_LEVEL=DEBUG -e DATABASE_URL=postgres://... service:latest
```

---

## Building and Running

### Build a Service Image

```bash
# Build a single service
docker build -t chessmate/account-api:latest ./account-api

# Build with tag
docker build -t chessmate/account-api:v1.0.0 ./account-api

# Build without cache (force rebuild)
docker build --no-cache -t chessmate/account-api:latest ./account-api
```

### Run a Service Container

```bash
# Run with default settings
docker run -p 8001:8001 chessmate/account-api:latest

# Run with environment variables
docker run \
  -e LOG_LEVEL=DEBUG \
  -e DATABASE_URL=postgresql://user:pass@db:5432/chess \
  -p 8001:8001 \
  chessmate/account-api:latest

# Run in background
docker run -d --name account-api -p 8001:8001 chessmate/account-api:latest

# View logs
docker logs account-api

# Stop container
docker stop account-api

# Remove container
docker rm account-api
```

### Docker Compose Example

```yaml
version: "3.8"

services:
  account-api:
    build: ./account-api
    ports:
      - "8001:8001"
    environment:
      - LOG_LEVEL=INFO
      - DATABASE_URL=postgresql://user:pass@postgres:5432/chess
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=chess
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

### Image Size Optimization

Monitor and optimize image sizes:

```bash
# Check image size
docker images chessmate/account-api

# Inspect layers (requires buildx)
docker buildx build --progress=plain ./account-api

# Expected sizes:
# - Python services: 250-400MB
# - Node.js services: 200-350MB
```

---

## Troubleshooting

### Container Exits Immediately

**Issue**: Container starts but exits right away

**Solutions**:
- Check logs: `docker logs <container-id>`
- Check health check: Does it have correct port/endpoint?
- Check working directory: Is `WORKDIR` correct?
- Check user permissions: Can appuser read files?

### Health Check Failing

**Issue**: Container marked as unhealthy

**Solutions**:
- Service not listening on configured port
- Health endpoint not implemented
- Service taking longer than `start-period` to start
- Firewall/network issues preventing health check

### Image Size Too Large

**Issue**: Built image is larger than expected

**Solutions**:
- Verify multi-stage build is working (check `docker history <image>`)
- Remove unnecessary files in .dockerignore
- Use `--no-install-recommends` for apt
- Verify package manager cache is cleaned

### Permissions Denied Errors

**Issue**: Application can't write to files

**Solutions**:
- Verify `--chown` flags in COPY commands
- Check file ownership in built image: `docker run --rm <image> ls -la /app`
- Ensure appuser owns all application directories

---

## Compliance Checklist

All Dockerfiles must satisfy:

- [ ] Multi-stage build (separate build and runtime stages)
- [ ] Non-root user (uid 1000)
- [ ] Minimal base image (slim/alpine)
- [ ] Health check configured
- [ ] Environment variables set
- [ ] Virtual environment (Python only)
- [ ] Proper signal handling (dumb-init for Node.js)
- [ ] `.dockerignore` file present in service root
- [ ] Service port correctly exposed
- [ ] README includes docker build/run instructions

---

## Related Documents

- [Service Catalog](../architecture/service-catalog.md) - Service ports and descriptions
- [Python Architecture Guide](../standards/architecture-python.md) - FastAPI structure
- [Node.js Architecture Guide](../standards/architecture-node.md) - Node.js patterns
- [Security Standards](../standards/security.md) - Container security practices

---

*Last updated: November 15, 2025*
