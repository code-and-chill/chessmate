---
title: Engine Cluster API Service Scorecard
service: engine-cluster-api
status: draft
last_reviewed: 2025-12-06
type: audit
---

# Service Scorecard: engine-cluster-api

**Service**: engine-cluster-api  
**Status**: 🟨 **PARTIAL**  
**Overall Readiness**: 50%

## Summary

**Strengths**:
- Stateless service design
- Clear purpose: chess engine evaluation
- No domain state ownership (good)

**Critical Gaps**:
- No engine registry/version routing
- No SLA tiers
- No fallback behavior
- No strict contracts documented

## Key Findings

### Engine Registry/Version Routing: ❌ Fail
- No engine registry found
- No version routing
- Single engine instance assumed

### SLA Tiers: ❌ Fail
- No SLA tiers defined
- No time budgets
- No priority queues

### Fallback Behavior: ❌ Fail
- No fallback if engine unavailable
- Mock evaluation mentioned but not implemented

### Strict Contracts: 🟨 Partial
- API contracts exist (Bruno collections)
- No versioning strategy
- No breaking change policy

### No Domain State Creep: ✅ Pass
- Stateless service
- No game state ownership
- Clear boundaries

## Top 3 Risks

1. **No Fallback Behavior** (P1) - If engine fails, all evaluations fail
2. **No SLA Tiers** (P1) - Cannot prioritize critical requests
3. **No Engine Registry** (P2) - Cannot scale or version engines

## P0 Remediation Items

### AUD-013: Add Fallback Behavior
**Owner**: engine-cluster-api  
**Problem**: No fallback if engine unavailable  
**Fix**: Implement mock evaluation fallback  
**Acceptance Criteria**: Fallback returns valid move if engine fails

### AUD-014: Add SLA Tiers
**Owner**: engine-cluster-api  
**Problem**: No SLA tiers, cannot prioritize  
**Fix**: Define SLA tiers (critical, normal, low) with time budgets  
**Acceptance Criteria**: Requests prioritized by tier, time budgets enforced

