---
title: Coding Style Standards
status: draft
last_reviewed: 2025-11-15
type: standard
---

# Coding Style Standards

Platform-wide coding style guidelines applied across all languages.

## General Principles

- **Readability First**: Code is read far more often than written
- **Consistency**: Follow established patterns within your language/framework
- **Clarity**: Write self-documenting code; minimize comments
- **Maintainability**: Prefer clarity over cleverness

## Language-Specific Guidelines

### Python

For comprehensive Python coding standards, including architecture patterns, SOLID principles, PEP 8 compliance, and best practices, see:

**→ [Python Service Architecture Guidelines](lang/python-guideline.md)**

Key topics covered:
- FastAPI application architecture
- Domain modeling with Pydantic
- Async programming patterns
- ML/AI integration patterns
- SOLID principles in Python
- PEP 8 style guide
- Type hints and validation
- Testing strategies
- Security best practices

### Kotlin

For comprehensive Kotlin coding standards, including Domain-Driven Design, Spring Boot patterns, and best practices, see:

**→ [Kotlin Service Architecture Guidelines](lang/kotlin-guideline.md)**

Key topics covered:
- Domain-Driven Design principles
- Bounded context organization
- Spring Boot application architecture
- Aggregate and value object patterns
- Domain events and event sourcing
- SOLID principles in Kotlin
- Repository and service patterns
- Testing strategies
- Integration patterns

### Go

**Status:** To be defined

Planned topics:
- gofmt compliance
- Naming conventions (exported vs unexported)
- Error handling patterns
- Interface design
- Documentation comments

### TypeScript/JavaScript

**Status:** To be defined

Planned topics:
- ESLint rules
- Naming conventions
- Type annotation requirements
- Module organization
- React/framework-specific patterns

### Rust

**Status:** To be defined

Planned topics:
- rustfmt compliance
- Naming conventions
- Error handling patterns
- Memory safety practices
- Module organization

## Common Patterns

**Fill:** Document shared patterns across services.

- Sections to add:
  - Dependency injection
  - Factory patterns
  - Builder patterns
  - Repository pattern
  - Service layer organization

---

*Last updated: 2025-11-15*
