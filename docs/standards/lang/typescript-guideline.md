---
title: TypeScript Coding Guidelines
service: global
status: active
last_reviewed: 2025-11-17
type: standard
---

# TypeScript Coding Guidelines

This document outlines the coding standards and best practices for TypeScript development within the Chessmate repository. These guidelines ensure consistency, readability, and maintainability across all TypeScript projects.

## General Principles
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/tree/master/react) for React and JavaScript conventions.
- Use TypeScript-specific rules and best practices as outlined below.

## TypeScript-Specific Guidelines

### 1. Strict Typing
- Always enable `strict` mode in `tsconfig.json`.
- Avoid using `any`. Use specific types or `unknown` when necessary.

### 2. Interfaces and Types
- Prefer `interface` over `type` for object shapes.
- Use `type` for unions, intersections, and other advanced types.

### 3. Naming Conventions
- Use `PascalCase` for type and interface names.
- Use `camelCase` for variables, functions, and properties.
- Prefix interfaces with `I` only when necessary to avoid conflicts.

### 4. Modules and Imports
- Use ES6 module syntax (`import`/`export`).
- Group imports logically: external libraries, internal modules, styles.

### 5. Functions
- Use arrow functions for anonymous functions.
- Explicitly type function parameters and return values.

### 6. React Components
- Use functional components with hooks.
- Define `PropTypes` using TypeScript interfaces.
- Use `React.FC` for component typing.

### 7. Error Handling
- Use `try-catch` blocks for async/await.
- Define custom error types when needed.

### 8. Testing
- Write unit tests for all components and utilities.
- Use `jest` and `@testing-library/react` for testing.

### 9. Documentation
- Add JSDoc comments for all functions, classes, and complex types.
- Document edge cases and assumptions.

### 10. Linting and Formatting
- Use `eslint` with TypeScript plugins.
- Enforce consistent formatting with `prettier`.

## Tools and Configurations
- **Compiler Options**: Ensure `tsconfig.json` includes the following:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "moduleResolution": "node",
      "esModuleInterop": true
    }
  }
  ```
- **Linting**: Use the following `eslint` configuration:
  ```json
  {
    "extends": ["airbnb", "airbnb-typescript"],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "rules": {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn"
    }
  }
  ```

## References
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Effective TypeScript](https://effectivetypescript.com/)

---

This document is a living standard and should be updated as new patterns and practices emerge.