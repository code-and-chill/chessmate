---
title: Chess Knowledge Overview
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: overview
---

The chess-knowledge-api provides opening book moves and endgame tablebase lookups for chess positions.

- Entrypoints: `POST /v1/opening/book-moves`, `POST /v1/endgame/tablebase`
- Data: Opening books and Syzygy tablebases (configurable paths)
- Fallback: Mock data for dev/testing
