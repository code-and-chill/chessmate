---
title: Local Development
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

Setup

```bash
# Using Poetry
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 9000
```

Install Stockfish

```bash
# Ubuntu/Debian
sudo apt-get install stockfish

# macOS
brew install stockfish
```

Run Tests

```bash
poetry run pytest -v
```
