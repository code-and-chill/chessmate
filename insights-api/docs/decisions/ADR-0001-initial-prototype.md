---
title: Choose FastAPI Prototype for Insights API
service: insights-api
status: active
last_reviewed: 2025-12-07
type: decision
---

# ADR-0001 Choose FastAPI Prototype for Insights API

## Context
The full insights service will ingest Kafka streams and store aggregates in Postgres. For initial development we need a lightweight prototype to validate the HTTP contract and downstream integrations.

## Decision
Implement the first iteration with FastAPI and an in-memory repository that mirrors the documented response shapes. Keep interfaces modular so the repository can be swapped for a Postgres-backed implementation once ingestion is wired.

## Consequences
- Enables rapid iteration and Bruno/pytest coverage without infrastructure.
- Requires follow-up work to persist aggregates and consume Kafka events.
- API contract can stabilize while storage concerns are addressed.
