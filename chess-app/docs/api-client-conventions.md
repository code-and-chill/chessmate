---
title: API Client Conventions
service: chess-app
status: active
last_reviewed: 2025-11-17
type: standard
---

# API Client Conventions

This document outlines the conventions for implementing API clients in the `chess-app` repository. Following these guidelines ensures consistency, maintainability, and clarity across the codebase.

## General Guidelines
- **Class-Based Clients**: All API clients should use a class-based approach.
- **Encapsulation**: Group related API methods within a single class.
- **Singleton Pattern**: Export a single instance of the client for global use.
- **Error Handling**: Implement centralized error handling within the client.

## Example Structure

### Class Definition
```typescript
class ExampleApiClient {
  async fetchResource(resourceId: string) {
    const response = await axios.get(`/api/v1/resources/${resourceId}`);
    return response.data;
  }

  async createResource(data: any) {
    const response = await axios.post(`/api/v1/resources`, data);
    return response.data;
  }
}

const exampleApiClient = new ExampleApiClient();
export default exampleApiClient;
```

### Usage
```typescript
import exampleApiClient from '../core/api/exampleApiClient';

const resource = await exampleApiClient.fetchResource('123');
```

## Benefits of Class-Based Clients
- **Consistency**: Aligns with existing patterns (e.g., `liveGameClient`).
- **Encapsulation**: Groups related methods and state.
- **Extensibility**: Easier to extend or modify.

## References
- [LiveGameClient Implementation](../core/api/liveGameClient.ts)
- [PuzzleApi Implementation](../core/api/puzzleApi.ts)

---

This document is a living standard and should be updated as new patterns and practices emerge.