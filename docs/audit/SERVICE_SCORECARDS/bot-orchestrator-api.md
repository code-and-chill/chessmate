---
title: Bot Orchestrator API Service Scorecard
service: bot-orchestrator-api
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Service Scorecard: bot-orchestrator-api

**Service**: bot-orchestrator-api  
**Status**: 🟨 **PARTIAL**  
**Overall Readiness**: 50%

## Bounded Context Clarity

**Evidence**:
- `bot-orchestrator-api/docs/overview.md` - Clear purpose: "Orchestrate bot move selection"
- `bot-orchestrator-api/app/domain/` - Domain models (BotSpec, Candidate, etc.)
- Non-goals clearly stated: "Rule validation (handled by live-game-api)"

**Gaps**:
- No explicit bounded context statement
- Integration boundaries not clearly documented

**Fix**:
- Add bounded context statement: "Bot Orchestration bounded context - orchestrates bot moves using engine and knowledge, does not own game state"

**Status**: 🟨 Partial

---

## API Contracts (Stability/Versioning)

**Evidence**:
- `bot-orchestrator-api/bruno/collections/` - Bruno collections exist
- `bot-orchestrator-api/app/api/routes/v1/bots.py` - API routes

**Gaps**:
- No API versioning strategy
- No OpenAPI spec found

**Fix**:
- Add versioning to routes
- Generate OpenAPI spec

**Status**: 🟨 Partial

---

## Events (Produce/Consume, Schemas, Idempotency)

**Evidence**:
- No event production found
- No event consumption found

**Gaps**:
- No event-driven integration
- Synchronous HTTP calls only

**Fix**:
- Consider event-driven integration for bot move requests (optional, not critical)

**Status**: 🟨 Partial (Not critical for this service)

---

## Scalability Model (20M games/day readiness)

**Evidence**:
- `bot-orchestrator-api/service.yaml` - No database required
- Stateless service design

**Gaps**:
- No timeout budgets documented
- No concurrency limits
- No rate limiting

**Impact at Scale**:
- Bot games may be 10-20% of total games = 2-4M bot games/day
- Need to handle concurrent bot move requests

**Fix**:
- Add timeout budgets (e.g., 30s max for bot move)
- Add concurrency limits (max 100 concurrent bot moves)
- Add rate limiting per bot difficulty

**Status**: 🟨 Partial

---

## Reliability (Timeouts, Retries, Fallbacks)

**Evidence**:
- `bot-orchestrator-api/app/clients/engine.py` - Engine client
- `bot-orchestrator-api/app/clients/knowledge.py` - Knowledge client

**Gaps**:
- **No timeout budgets** - Bot moves can hang indefinitely
- No retry logic
- No fallback behavior if engine fails
- No circuit breakers

**Fix**:
- Add timeout budgets:
  - Engine query: 20s max
  - Knowledge query: 5s max
  - Total bot move: 30s max
- Add retry logic with exponential backoff
- Add fallback: return random legal move if engine fails
- Add circuit breakers for engine and knowledge clients

**Status**: ❌ Fail

---

## Storage Ownership + Migrations

**Evidence**:
- `bot-orchestrator-api/service.yaml` - No database required
- Stateless service

**Gaps**:
- No storage needed (stateless)

**Status**: ✅ Pass (N/A)

---

## Observability (Metrics/Traces/Logs/SLOs)

**Evidence**:
- Python logging used

**Gaps**:
- No Prometheus metrics
- No distributed tracing
- No SLO definitions

**Fix**:
- Add metrics: bot move latency, engine query latency, failure rates
- Add OpenTelemetry tracing
- Define SLOs: p95 bot move < 30s, p99 < 60s

**Status**: ❌ Fail

---

## Security/Abuse

**Evidence**:
- Internal service (called by live-game-api)

**Gaps**:
- No authentication (relies on network isolation)
- No rate limiting

**Fix**:
- Add internal bearer token authentication
- Add rate limiting per caller

**Status**: 🟨 Partial

---

## Budgeting & Timeouts

**Evidence**:
- No timeout configuration found

**Gaps**:
- **No timeout budgets** - Critical gap

**Fix**:
- Document timeout budgets:
  - Engine query: 20s
  - Knowledge query: 5s
  - Total bot move: 30s
- Enforce timeouts in code

**Status**: ❌ Fail

---

## Profiles/Difficulty Mapping

**Evidence**:
- `bot-orchestrator-api/app/domain/bot_spec_model.py` - BotSpec models
- Difficulty levels: beginner (400), easy (800), medium (1200), hard (1600), expert (2000), master (2400)

**Gaps**:
- Difficulty mapping not documented
- No validation of difficulty levels

**Fix**:
- Document difficulty mapping in `bot-orchestrator-api/docs/domain.md`
- Add validation for difficulty levels

**Status**: 🟨 Partial

---

## Failure Mode (No Bot Move Returned)

**Evidence**:
- `bot-orchestrator-api/app/logic/orchestrator.py` - Orchestration logic

**Gaps**:
- **No fallback behavior** - If engine fails, no move returned
- No error handling strategy

**Fix**:
- Add fallback: return random legal move if engine fails
- Add error handling: log error, return fallback move
- Document failure modes in `bot-orchestrator-api/docs/operations.md`

**Status**: ❌ Fail

---

## Move Submission Pipeline

**Evidence**:
- `bot-orchestrator-api/app/api/routes/v1/bots.py` - POST endpoint for bot moves
- Returns move to caller (live-game-api)

**Gaps**:
- No idempotency for bot move requests
- No move validation before return

**Fix**:
- Add idempotency keys for bot move requests
- Validate move format before return

**Status**: 🟨 Partial

---

## Top 3 Risks

### 1. No Timeout Budgets (P1 - HIGH RISK)
**Risk**: Bot moves can hang indefinitely, blocking game progress.

**Impact**: 
- Games stuck waiting for bot moves
- Poor user experience
- Resource exhaustion

**Fix**: Add timeout budgets and enforce them.

---

### 2. No Fallback Behavior (P1 - HIGH RISK)
**Risk**: If engine fails, no move returned, game stuck.

**Impact**:
- Games cannot progress
- User frustration

**Fix**: Add fallback to random legal move.

---

### 3. No Circuit Breakers (P1 - HIGH RISK)
**Risk**: If engine-cluster is down, all bot moves fail.

**Impact**:
- All bot games fail
- Service unavailable

**Fix**: Add circuit breakers and fallback behavior.

---

## P0 Remediation Items

### AUD-010: Add Timeout Budgets
**Owner**: bot-orchestrator-api  
**Problem**: No timeout budgets, bot moves can hang  
**Evidence**: No timeout configuration found

**Fix**:
1. Add timeout configuration:
   - Engine query: 20s max
   - Knowledge query: 5s max
   - Total bot move: 30s max
2. Enforce timeouts in code
3. Add timeout metrics

**Acceptance Criteria**:
- Timeouts enforced
- Bot moves complete within 30s
- Timeout metrics exposed

**Risks**: Timeouts too aggressive may cause failures

---

### AUD-011: Add Fallback Behavior
**Owner**: bot-orchestrator-api  
**Problem**: No fallback if engine fails  
**Evidence**: No fallback logic found

**Fix**:
1. Add fallback: return random legal move if engine fails
2. Add error handling: log error, return fallback move
3. Document failure modes

**Acceptance Criteria**:
- Fallback move returned if engine fails
- Errors logged
- Games can progress even if engine fails

**Risks**: Fallback moves may be poor quality

---

### AUD-012: Add Circuit Breakers
**Owner**: bot-orchestrator-api  
**Problem**: No circuit breakers for external dependencies  
**Evidence**: Direct HTTP calls to engine and knowledge clients

**Fix**:
1. Add circuit breaker for engine-cluster-api
2. Add circuit breaker for chess-knowledge-api
3. Add fallback behavior when circuit open

**Acceptance Criteria**:
- Circuit breakers open after failures
- Fallback behavior when circuit open
- Circuit breaker metrics exposed

**Risks**: Circuit breaker complexity

