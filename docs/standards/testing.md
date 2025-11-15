---
title: Testing Standards
status: draft
last_reviewed: 2025-11-15
type: standard
---

# Testing Standards

Unified testing standards and patterns across the platform.

## Testing Pyramid

```
       /\           E2E Tests (10%)
      /  \
     /    \
    /______\
    /\      \     Integration Tests (30%)
   /  \      \
  /____\      \
  /\    \      \
 /  \    \      \ Unit Tests (60%)
/______\__\______\
```

## Unit Testing

**Fill:** Define unit testing standards.

- Sections to add:
  - What to test in unit tests
  - Mocking and stubbing requirements
  - Test naming conventions
  - Test data and fixtures
  - Coverage requirements (minimum 80%)

## Integration Testing

**Fill:** Define integration testing patterns.

- Sections to add:
  - Database integration tests (Testcontainers)
  - API endpoint testing
  - External service mocking/stubbing
  - Test isolation and cleanup
  - Performance testing patterns

## Contract Testing

**Fill:** Define contract testing approach.

- Sections to add:
  - Service-to-service contracts
  - OpenAPI compliance testing
  - Consumer-driven contract testing (CDCT)
  - Breaking change detection

## Test Organization

**Fill:** Define test file structure.

- Sections to add:
  - Test directory layout
  - Test class/file naming
  - Test grouping (describe blocks, test classes)
  - Setup and teardown patterns
  - Shared test utilities

## Coverage Requirements

- **Business Logic**: Minimum 80% line coverage
- **Critical Paths**: 100% coverage (auth, payments, data integrity)
- **Infrastructure**: 60% coverage (integration points)
- **Controllers/Handlers**: 70% coverage

---

*Last updated: 2025-11-15*
