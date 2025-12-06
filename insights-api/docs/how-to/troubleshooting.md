---
title: Troubleshooting Insights API
service: insights-api
status: active
last_reviewed: 2025-12-07
type: how-to
---

# Troubleshooting

## Common Issues
- **Port already in use**: change `--port` flag or stop conflicting process.
- **Dependency errors**: ensure `pip install -r requirements` succeeded.
- **404 responses**: verify player data exists; prototype ships with `player-123` sample only.

## Logs
Use `dx logs insights-api` or `docker logs insights-api` to inspect runtime errors.
