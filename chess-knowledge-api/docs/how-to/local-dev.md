---
title: Local Development
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: how-to
---

Setup

```bash
# Using Poetry
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 9002
```

Optional Data Files

```bash
# Download opening books (example)
# wget https://example.com/book.bin -O /data/opening-book.bin

# Download Syzygy tablebases (example)
# wget https://example.com/syzygy-3-4-5.tar.gz
# tar -xzf syzygy-3-4-5.tar.gz -C /data/tablebase/
```

Run Tests

```bash
poetry run pytest -v
```
