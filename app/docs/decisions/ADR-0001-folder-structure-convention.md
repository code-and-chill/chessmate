---
title: ADR-0001 - Production-Grade Folder Structure Convention
service: app
status: accepted
last_reviewed: 2025-11-18
type: decision
---

# ADR-0001: Production-Grade Folder Structure Convention

## Status
**Accepted** — 2025-11-18

## Context

The ChessMate mobile/web application has grown organically with a shallow folder structure (`/components`, `/screens`, `/hooks`, `/api`, etc.). While functional, this structure presents challenges for:

1. **Multi-team scaling** — No clear domain boundaries
2. **Feature isolation** — Difficult to work on features independently
3. **AI code generation** — Unpredictable file locations
4. **Long-term maintainability** — Cross-contamination between concerns
5. **Onboarding** — New developers struggle to understand where code belongs

As we scale toward a Chess.com-grade product with features like:
- Live games with real-time sync
- Tactical puzzles with adaptive difficulty
- Tournament system
- AI coaching and analysis
- Social features (friends, chat, clubs)

We need a **production-grade folder structure** that supports vertical slicing, horizontal layering, and clean architectural boundaries.

## Decision

We adopt a **hybrid structure** combining:

1. **File-based routing** (`/app`) via Expo Router
2. **Vertical feature slices** (`/features`) for domain isolation
3. **Horizontal layers** (`/ui`, `/services`, `/core`, `/platform`) for shared concerns
4. **Clear dependency flow** (`app → features → layers → platform`)

### Top-Level Structure

```
app/
├── app/           # 🚀 Expo Router (file-based routing)
├── features/      # 🎯 Vertical domain slices (board, game, puzzles)
├── ui/            # 🎨 Design system (primitives, tokens, theme)
├── services/      # 🌐 External integrations (API, WS, storage)
├── core/          # 🛠️ Domain-agnostic utilities (utils, hooks, state)
├── platform/      # ⚙️ Cross-cutting concerns (security, monitoring)
├── assets/        # 📦 Static resources (images, fonts, sounds)
├── types/         # 🔷 Global type definitions
```

### Key Principles

1. **Vertical Slicing (Features)**
   - Each feature is self-contained
   - Features don't import from each other
   - Communication via state management or events

2. **Horizontal Layering**
   - UI layer: Pure presentation
   - Services layer: External communication
   - Core layer: Business-agnostic utilities

3. **Dependency Flow**
   ```
   app → features → ui/services/core → platform
   ```

4. **No Circular Dependencies**
   - ✅ Features → UI
   - ❌ UI → Features
   - ❌ Feature A → Feature B

5. **Public APIs**
   - Each folder exports via `index.ts`
   - Import from folder, not file: `@/features/board` (not `@/features/board/components/ChessBoard`)

## Alternatives Considered

### 1. Keep Current Flat Structure
**Pros**: No migration needed, familiar to current team
**Cons**: Doesn't scale, poor domain boundaries, AI-unfriendly
**Verdict**: ❌ Rejected — Technical debt will compound

### 2. Monolithic Screen-Based Structure
```
/screens/PlayScreen/
  components/
  hooks/
  utils/
```
**Pros**: Co-location by screen
**Cons**: Duplicates shared logic, poor reusability
**Verdict**: ❌ Rejected — Not feature-oriented

### 3. Atomic Design (atoms/molecules/organisms)
```
/atoms
/molecules
/organisms
/templates
```
**Pros**: Well-known pattern
**Cons**: Arbitrary hierarchy, hard to navigate, over-engineered for our use case
**Verdict**: ❌ Rejected — Too rigid

### 4. Domain-Driven Design (DDD) with Bounded Contexts
```
/domains/chess-game
/domains/puzzles
/domains/social
```
**Pros**: Strong domain isolation
**Cons**: Over-abstraction for mobile app, complex for small teams
**Verdict**: ⚠️ Partial adoption — We use vertical slicing (/features) without full DDD

### 5. Feature Slices + Shared Layers (Chosen)
**Pros**: 
- Clear boundaries
- Scalable for multi-team
- AI-compatible
- Flexible for future growth

**Cons**: 
- Requires migration effort
- Learning curve for team

**Verdict**: ✅ **Accepted**

## Consequences

### Positive

1. ✅ **Clear domain boundaries** — Each feature is isolated
2. ✅ **Multi-team scalability** — Teams own features without conflicts
3. ✅ **AI code generation** — Predictable file locations
4. ✅ **Testability** — Features can be tested independently
5. ✅ **Onboarding** — New developers quickly understand structure
6. ✅ **Future-proof** — Easy to add new features (tournaments, AI coach)
7. ✅ **Design system** — Centralized UI components with theming

### Negative

1. ❌ **Migration effort** — Requires refactoring existing code
2. ❌ **Learning curve** — Team needs to understand new conventions
3. ❌ **Stricter rules** — More discipline required (no cross-feature imports)
4. ❌ **Initial overhead** — More folders for small features

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Migration breaks existing features | Incremental migration, feature-by-feature |
| Team resists change | Document benefits, provide training, lead by example |
| Over-engineering for simple features | Allow flexibility, not all features need full structure |
| Cross-feature dependencies | Use shared services, state management, or events |

## Implementation Plan

### Phase 1: Setup (Week 1)
- [ ] Create new folder structure (parallel to existing)
- [ ] Setup path aliases in `tsconfig.json`
- [ ] Document conventions in `FOLDER_STRUCTURE_CONVENTION.md`
- [ ] Create migration guide

### Phase 2: Shared Layers (Week 2)
- [ ] Migrate design tokens → `/ui/tokens`
- [ ] Migrate theme system → `/ui/theme`
- [ ] Migrate API clients → `/services/api`
- [ ] Migrate generic utilities → `/core/utils`

### Phase 3: Feature Migration (Week 3-6)
- [ ] Week 3: Migrate `/features/board` (chess board rendering)
- [ ] Week 4: Migrate `/features/game` (live game orchestration)
- [ ] Week 5: Migrate `/features/puzzles` (tactical puzzles)
- [ ] Week 6: Migrate `/features/matchmaking` (find opponents)

### Phase 4: Routing (Week 7)
- [ ] Migrate to Expo Router (`/app`)
- [ ] Create route layouts (`_layout.tsx`)
- [ ] Update navigation

### Phase 5: Cleanup (Week 8)
- [ ] Remove old structure
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Deploy to staging

## Validation Criteria

Success metrics:
- ✅ Zero circular dependencies (verified by ESLint)
- ✅ All features independently testable
- ✅ New feature can be added in < 1 day
- ✅ Onboarding time reduced by 50%
- ✅ AI code generation works with 90%+ accuracy

## References

- [FOLDER_STRUCTURE_CONVENTION.md](../FOLDER_STRUCTURE_CONVENTION.md) — Full specification
- [AGENTS.md](../../../AGENTS.md) — Monorepo agent guidelines
- [Feature-Sliced Design](https://feature-sliced.design/) — Inspiration
- [React Native Best Practices](https://reactnative.dev/docs/performance) — Performance patterns

## Related ADRs

- ADR-0002: State Management Strategy (TBD)
- ADR-0003: Design System Architecture (TBD)
- ADR-0004: API Client Conventions (TBD)

---

**Decision made by**: Platform Team  
**Date**: 2025-11-18  
**Approved by**: Tech Lead  
**Implementation owner**: Frontend Team  

*Last updated: 2025-11-18*
