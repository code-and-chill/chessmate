---
title: Common Tasks for Insights API
service: insights-api
status: active
last_reviewed: 2025-12-07
type: how-to
---

# Common Tasks

## Refresh a Player
```
curl -X POST "http://localhost:8020/insights/v1/admin/players/player-123/recompute"
```

## Refresh a Time Range
```
curl -X POST "http://localhost:8020/insights/v1/admin/recompute-range?from=2025-11-01T00:00:00Z&to=2025-12-01T00:00:00Z"
```

## Inspect Recent Form
```
curl "http://localhost:8020/insights/v1/players/player-123/recent-form?limit=5"
```
