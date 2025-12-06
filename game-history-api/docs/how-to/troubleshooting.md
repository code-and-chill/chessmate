---
title: Troubleshooting Game History API
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: how-to
---

# Troubleshooting Game History API

## Common Issues

### `422 Unprocessable Entity`
- Payload validation failed. Confirm enum values (`mode`, `result`) and required fields.

### `404 Game not found`
- The requested `gameId` is unknown. Verify you have posted the game or the ID is correct.

### Repository looks stale
- The in-memory repository resets on restart. Ensure a persistent backend is configured for non-dev environments.

### Cannot reach service
- Confirm uvicorn is running on the expected port (default 8014).
- Check local firewall or container networking rules.
