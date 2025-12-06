---
title: Run Insights API Locally
service: insights-api
status: active
last_reviewed: 2025-12-07
type: how-to
---

# Local Development

## Prerequisites
- Python 3.11
- `pip install -r requirements`

## Run
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8020
```

## Test
```bash
pytest -q
```

## Bruno
```bash
bruno open bruno/collections
bruno run bruno/collections --env local
```
