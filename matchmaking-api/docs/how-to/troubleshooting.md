---
title: Troubleshooting Guide
service: matchmaking-api
status: draft
last_reviewed: 2025-11-15
type: how-to
---

# Troubleshooting Guide

Common issues and solutions.

## Queue Issues

### Players Not Matching

**Cause**: Matching algorithm or rating range issue

**Solution**:
1. Check player ratings in database
2. Verify rating range configuration
3. Check queue service is running
4. Monitor matching logs

### Database Connection

**Error**: `could not connect to server`

**Solution**:
- Verify DATABASE_URL in .env
- Check PostgreSQL running: `psql --version`
- Test connection: `psql $DATABASE_URL`

---

*Last updated: 2025-11-15*
