---
title: Troubleshooting Guide
service: live-game-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Troubleshooting Guide

Common issues and solutions for live-game-api.

## Connection Issues

### PostgreSQL Connection Error

**Error**: `could not connect to server`

**Solution**:
1. Verify DATABASE_URL in .env
2. Check PostgreSQL is running
3. Verify port 5432 is accessible

### Account API Connection Error

**Error**: Can't reach account-api service

**Solution**:
```bash
# Ensure account-api is running on the configured port
curl http://localhost:8001/docs

# Check ACCOUNT_API_URL in .env
# For local development, it should be http://localhost:8001
```

## Game State Issues

### Move Validation Fails

**Error**: `Invalid move` when move should be valid

**Solution**:
- Check board state before move
- Verify piece positions are correct
- Check for castling/en passant edge cases

See [troubleshooting.md] for detailed debugging.

---

*Last updated: 2025-11-15*
