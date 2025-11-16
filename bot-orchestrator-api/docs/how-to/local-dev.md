---
title: Local Development
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

Setup

```bash
# Using Poetry
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8005
```

Optional Environment

```bash
export ENGINE_CLUSTER_URL=http://localhost:9000
export BOT_CONFIG_URL=http://localhost:9001
export CHESS_KNOWLEDGE_URL=http://localhost:9002
```

Run Tests

```bash
poetry run pytest -q
```
