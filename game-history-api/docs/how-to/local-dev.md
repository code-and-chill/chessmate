---
title: Game History API Local Development Setup
service: game-history-api
status: draft
last_reviewed: 2025-12-06
type: how-to
---

# Local Development Setup

## Prerequisites
- Go toolchain (1.21+ recommended) and make.
- Docker/Kubernetes access for local Kafka and Postgres (via dx-cli or docker-compose).
- dx-cli installed and built (`node dx-cli/dist/index.js doctor`).
- Access to Bruno for API testing.

## Setup Steps
1. Clone the repository and install dx-cli dependencies.
2. Provision local dependencies: `node dx-cli/dist/index.js dev game-history-api` (starts Kafka/Postgres profile).
3. Copy `.env.example` to `.env` and fill Postgres, Kafka, and S3 variables.
4. Install Go module dependencies (`go mod download`) after the codebase is scaffolded.

## Running the Service
- Start the API and ingestion workers (future implementation): `go run ./cmd/server` with `.env` loaded.
- Run migrations before ingestion: `make migrate` or `go run ./cmd/migrate`.

## Running Tests
- Unit tests: `go test ./...`
- Bruno tests: `node dx-cli/dist/index.js bruno game-history-api --test` (requires service running locally on port 8080).
