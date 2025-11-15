---
title: Common Tasks
service: rating-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

## Create a new pool
```bash
curl -X POST localhost:8013/v1/admin/pools \
  -H 'Content-Type: application/json' \
  -d '{"code":"blitz_standard","initial_rating":1500,"glicko_tau":0.5,"glicko_default_rd":350}'
```

## Fetch user ratings
```bash
curl localhost:8013/v1/ratings/u_123
```
