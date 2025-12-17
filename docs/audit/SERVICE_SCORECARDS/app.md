---
title: App (React Native) Service Scorecard
service: app
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Service Scorecard: app (React Native)

**Service**: app  
**Status**: 🟨 **PARTIAL**  
**Overall Readiness**: 45%

## Bounded Context Clarity

**Evidence**:
- `app/docs/overview.md` - Clear feature domains (Play, Puzzles, Learn, Social, Settings)
- `app/docs/architecture.md` - Component hierarchy and state management documented
- `app/docs/folder-structure-convention.md` - Vertical slice architecture planned
- `app/service.yaml` - Dependencies clearly defined (account-api, live-game-api, matchmaking-api, engine-cluster-api)

**Gaps**:
- No explicit bounded context statement in docs
- Client trust boundaries not documented (what client can/cannot do)
- No glossary of client-specific domain terms

**Fix**:
- Add bounded context statement to `app/docs/overview.md`: "Client application bounded context - never authoritative for game state, always validates with backend"
- Document client trust boundaries: "Client validates moves locally but server is source of truth"
- Add glossary section to `app/docs/domain.md`

**Status**: 🟨 Partial

---

## API Contracts (Stability/Versioning)

**Evidence**:
- `app/services/api/live-game.api.ts` - TypeScript interfaces for API clients
- `app/services/api/base.api.ts` - Base HTTP client with error handling
- Bruno collections exist for backend services (not for app itself, which is client)

**Gaps**:
- No API versioning strategy for client-server contracts
- No contract testing between client and server
- Client may break if backend API changes

**Fix**:
- Implement API versioning in client (e.g., `/v1/` prefix)
- Add contract tests using Bruno collections
- Document breaking change policy

**Status**: 🟨 Partial

---

## Events (Produce/Consume, Schemas, Idempotency)

**Evidence**:
- `app/platform/environment.ts` - WebSocket URL configured but not used
- `app/docs/architecture.md` - Mentions WebSocket but not implemented
- No event consumption code found

**Gaps**:
- **WebSocket not implemented** - Only configuration exists, no actual WebSocket client
- No event consumption from backend
- No event schema definitions
- Client must poll for updates instead of receiving events

**Fix**:
- Implement WebSocket client: `app/services/ws/GameWebSocket.ts`
- Add reconnection strategy with exponential backoff
- Define event schemas (TypeScript interfaces)
- Replace polling with WebSocket subscriptions

**Status**: ❌ Fail

---

## Scalability Model (20M games/day readiness)

**Evidence**:
- `app/docs/overview.md` - Mentions code splitting and performance optimization
- `app/docs/architecture.md` - Mentions efficient WebSocket usage (but not implemented)
- React Native architecture supports horizontal scaling (multiple app instances)

**Gaps**:
- **No WebSocket implementation** - Clients must poll, creating unnecessary load
- No offline queue for moves (moves lost if network fails)
- No request batching or throttling
- No connection pooling strategy

**Impact at Scale**:
- 200K-2M DAU polling every 2-5 seconds = 40K-400K requests/sec
- Unnecessary database load on live-game-api
- Poor user experience (delayed updates)

**Fix**:
- Implement WebSocket to reduce polling load by 90%+
- Add offline queue for moves with retry logic
- Implement request batching for bulk operations
- Add connection management (single WebSocket per game)

**Status**: ❌ Fail

---

## Reliability (Timeouts, Retries, Fallbacks)

**Evidence**:
- `app/services/api/base.api.ts` - Base HTTP client exists
- `app/features/board/hooks/useGameState.ts` - Local game state management

**Gaps**:
- **No reconnection strategy** - WebSocket not implemented, so no reconnection
- No timeout configuration for API calls
- No retry logic with exponential backoff
- No fallback to polling if WebSocket fails
- No offline handling (moves lost if network fails)

**Fix**:
- Implement WebSocket reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Add timeout configuration (e.g., 30s for move submission)
- Implement retry logic for failed API calls (3 retries with backoff)
- Fallback to polling if WebSocket unavailable
- Add offline queue with local storage persistence

**Status**: ❌ Fail

---

## Storage Ownership + Migrations

**Evidence**:
- Client application - no server-side storage
- `app/features/board/hooks/useGameState.ts` - Local state management
- React Native SecureStore for token storage

**Gaps**:
- No local storage strategy for offline support
- No migration strategy for stored data (tokens, preferences)
- No data versioning

**Fix**:
- Implement local storage for offline game state (AsyncStorage)
- Add data migration strategy for stored preferences
- Version stored data schema

**Status**: 🟨 Partial (N/A for client, but offline storage needed)

---

## Observability (Metrics/Traces/Logs/SLOs)

**Evidence**:
- `app/platform/monitoring.ts` - MonitoringService class exists but implementation unclear
- `app/docs/overview.md` - Mentions Expo Performance Monitor

**Gaps**:
- **No correlation IDs** - Cannot trace requests across services
- No client-side metrics (error rates, latency)
- No telemetry for user actions
- No SLO definitions for client performance
- No crash reporting integration

**Fix**:
- Add correlation ID to all API requests (X-Request-ID header)
- Implement client-side metrics (Sentry, Firebase Analytics, or custom)
- Add error tracking and crash reporting
- Define client SLOs (e.g., move submission < 500ms, WebSocket reconnect < 5s)
- Add performance monitoring (frame rate, render time)

**Status**: ❌ Fail

---

## Security/Abuse

**Evidence**:
- `app/services/api/base.api.ts` - JWT token in Authorization header
- React Native SecureStore for token storage
- `app/docs/overview.md` - Mentions HTTPS and WSS

**Gaps**:
- **No replay protection** - Client can resubmit same move multiple times
- No request signing or nonce generation
- No client-side rate limiting (relies on server)
- No input validation before sending to server

**Fix**:
- Add move idempotency keys (client-generated UUID per move attempt)
- Implement request signing for critical operations (optional)
- Add client-side rate limiting (e.g., max 1 move per second)
- Validate moves locally before sending (using chess.js)

**Status**: 🟨 Partial

---

## Top 3 Risks

### 1. No WebSocket Implementation (P0 - BLOCKING)
**Risk**: Clients must poll for updates, creating massive load at scale (200K-2M DAU polling every few seconds).

**Impact**: 
- 40K-400K requests/sec just for polling
- Unnecessary database load
- Poor UX (delayed updates)

**Fix**: Implement WebSocket client with reconnection strategy.

---

### 2. No Offline Handling (P1 - HIGH RISK)
**Risk**: Moves lost if network fails during submission. No queue for retry.

**Impact**:
- User frustration (moves not saved)
- Game state desync
- Support tickets

**Fix**: Implement offline queue with local storage and retry logic.

---

### 3. No Client Telemetry (P1 - HIGH RISK)
**Risk**: Cannot debug production issues, no visibility into client performance.

**Impact**:
- Cannot diagnose user-reported issues
- No performance monitoring
- No error tracking

**Fix**: Add correlation IDs, error tracking, and performance monitoring.

---

## P0 Remediation Items

### AUD-001: Implement WebSocket Client
**Owner**: app  
**Problem**: No WebSocket implementation, clients must poll  
**Evidence**: 
- `app/platform/environment.ts` has WebSocket URL but no client code
- `app/docs/architecture.md` mentions WebSocket but not implemented
- `app/services/api/live-game.api.ts` only has HTTP methods

**Fix**:
1. Create `app/services/ws/GameWebSocket.ts` with:
   - WebSocket connection management
   - Reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
   - Event subscription/unsubscription
   - Heartbeat/ping to keep connection alive
2. Create `app/features/game/hooks/useGameWebSocket.ts` hook
3. Replace polling in `app/features/board/screens/PlayScreen.tsx` with WebSocket
4. Add fallback to polling if WebSocket unavailable

**Acceptance Criteria**:
- WebSocket connects successfully
- Reconnects automatically on disconnect
- Receives game state updates in real-time
- Fallback to polling if WebSocket fails
- Reduces polling load by 90%+

**Risks**: WebSocket connection management complexity, sticky session requirements

---

### AUD-002: Add Client Correlation IDs
**Owner**: app  
**Problem**: Cannot trace requests across services  
**Evidence**: No correlation ID in `app/services/api/base.api.ts`

**Fix**:
1. Generate correlation ID (UUID) per request in `app/services/api/base.api.ts`
2. Add `X-Request-ID` header to all API calls
3. Include correlation ID in error logs

**Acceptance Criteria**:
- All API requests include X-Request-ID header
- Correlation ID logged with errors
- Can trace request flow across services

**Risks**: None

---

### AUD-003: Implement Offline Queue
**Owner**: app  
**Problem**: Moves lost if network fails  
**Evidence**: No offline handling in `app/features/board/hooks/useGameState.ts`

**Fix**:
1. Add offline queue using AsyncStorage
2. Queue moves when network unavailable
3. Retry queued moves when network restored
4. Show user notification when moves queued

**Acceptance Criteria**:
- Moves saved to queue if network fails
- Moves retried when network restored
- User notified of queued moves
- Queue persisted across app restarts

**Risks**: Queue can grow large, need cleanup strategy

