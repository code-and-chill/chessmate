---
title: Chess Knowledge – Operations
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: operations
---

Environment Variables:
- `OPENING_BOOK_PATH`: Path to opening book data
- `TABLEBASE_PATH`: Path to Syzygy tablebase files

Ports:
- HTTP: 9002

Health:
- `GET /health`

Performance: Queries should be < 50ms for cached/indexed lookups. Book and tablebase files should be on fast storage (SSD).
