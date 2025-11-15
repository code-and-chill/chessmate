---
title: Troubleshooting Guide
service: account-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Troubleshooting Guide

Common issues and their solutions.

## Installation & Setup Issues

### Issue: `ModuleNotFoundError: No module named 'app'`

**Cause**: Python path is not correctly set

**Solution**:
```bash
# Ensure you're in the account-api directory
cd /workspaces/chessmate/account-api

# Run from project root or adjust PYTHONPATH
export PYTHONPATH=/workspaces/chessmate/account-api:$PYTHONPATH
```

### Issue: PostgreSQL connection error

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify PostgreSQL is running: `psql --version`
2. Check DATABASE_URL in .env is correct
3. Verify credentials match your PostgreSQL installation
4. If using Docker: `docker ps | grep postgres`

### Issue: Alembic migration fails

**Error**: `sqlalchemy.exc.DatabaseError`

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
dropdb account_db
createdb account_db

# Run migrations fresh
alembic upgrade head
```

## Runtime Issues

### Issue: Port 8000 already in use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
python -m uvicorn app.main:app --reload --port 8001
```

### Issue: JWT secret key not set

**Error**: `ValueError: JWT_SECRET_KEY not configured`

**Solution**:
```bash
# Set in .env
JWT_SECRET_KEY=your-secure-random-key-here

# Generate a secure key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Issue: Circular import errors

**Error**: `ImportError: cannot import name 'X' from partially initialized module`

**Solution**:
1. Check for circular dependencies in imports
2. Use TYPE_CHECKING guard for type hints:
   ```python
   from typing import TYPE_CHECKING
   if TYPE_CHECKING:
       from other_module import SomeType
   ```

## Testing Issues

### Issue: Tests fail with `PermissionError`

**Cause**: Database access permissions or file permissions

**Solution**:
```bash
# Check file permissions
chmod -R 755 tests/

# Or run with sudo (not recommended)
sudo pytest
```

### Issue: Test database not found

**Error**: `FATAL: database "test_account_db" does not exist`

**Solution**:
```bash
# Create test database
createdb test_account_db

# Or let tests create it (if configured)
pytest  # Might auto-create with conftest.py fixture
```

### Issue: Fixture setup fails

**Error**: `fixture 'client' not found` or similar

**Solution**:
1. Verify conftest.py is in tests/ directory
2. Ensure conftest.py has correct fixture definitions
3. Check fixture is marked with `@pytest.fixture`

## Code Quality Issues

### Issue: Black formatting conflicts with existing code

**Solution**:
```bash
# Apply Black formatting
black app tests

# If conflict with other formatter, choose one:
# Either use Black, or configure other tools to align
```

### Issue: Type checking errors with mypy

**Error**: `error: Argument 1 to "function" has incompatible type`

**Solution**:
1. Add type hints to functions
2. Use TYPE_CHECKING for circular type imports
3. Check Python version compatibility

### Issue: Import sorting conflicts

**Error**: isort and Black disagree on import order

**Solution**:
```bash
# Configure isort for Black compatibility
# In pyproject.toml or .isort.cfg:
[tool.isort]
profile = "black"
```

## Performance Issues

### Issue: Slow API response times

**Diagnostics**:
```bash
# Monitor with time command
time curl http://localhost:8000/v1/accounts/me

# Check logs for slow queries
# Look for duration_ms in structured logs
```

**Solutions**:
- Add database indexes
- Optimize queries
- Enable caching
- Check resource usage: `htop` or `top`

### Issue: High memory usage

**Cause**: Possible memory leak or large object handling

**Solution**:
```bash
# Monitor memory usage
ps aux | grep python

# Use memory profiler
pip install memory-profiler
python -m memory_profiler app.main.py
```

## Docker Issues

### Issue: Container exits immediately

**Cause**: Application error or missing environment variable

**Solution**:
```bash
# Check logs
docker logs account-api

# Run with interactive terminal for debugging
docker run -it account-api /bin/bash
```

### Issue: Network connectivity between containers

**Solution**:
```bash
# Ensure containers are on same network
docker network create chessmate-network

# Run with --network flag
docker run --network chessmate-network account-api
```

## Getting Help

1. Check logs: `tail -f app.log` or service logs
2. Check database state: `SELECT * FROM accounts;`
3. Enable DEBUG mode in .env for more verbose logging
4. Add breakpoints and use debugger
5. See [RUNBOOK.md](../RUNBOOK.md) for operational issues

---

*Last updated: 2025-11-15*
