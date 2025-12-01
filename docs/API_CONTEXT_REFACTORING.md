---
title: API Context Refactoring Summary
status: active
last_reviewed: 2025-01-18
type: architecture
---

# API Context Refactoring Summary

## Overview
Refactored the authentication and API client architecture to centralize mock management in `ApiContext`, keeping `AuthContext` clean and focused solely on authentication state management.

## Problem Statement
Previously, `AuthContext` was directly importing and instantiating mock API clients, which:
- Mixed concerns (auth state + API client selection)
- Made it harder to switch between mock and real backends
- Duplicated the mock/real switching logic across contexts
- Violated separation of concerns

## Solution
Centralized all API client management in `ApiContext` with a consistent pattern:
- Single `USE_MOCK_API` environment flag controls all API clients
- `ApiContext` provides all API clients (auth, account, rating, matchmaking, etc.)
- `AuthContext` consumes `authApi` from `ApiContext` via `useApiClients()` hook
- Clean separation: `ApiContext` handles client creation, `AuthContext` handles auth state

## Changes Made

### 1. Updated `ApiContext.tsx`
**Before:**
```typescript
// Only managed account, rating, matchmaking clients
// Used token from AuthContext
const { token } = useAuth();
const clients = useMemo(() => {
  let accountApi = USE_MOCK_API ? new MockAccountApiClient() : new AccountApiClient(url, token);
  // ... same for rating, matchmaking
}, [token]);
```

**After:**
```typescript
// Now also manages authApi client
// No dependency on AuthContext (removed circular dependency)
const clients = useMemo(() => {
  let authApi = USE_MOCK_API ? new MockAuthApiClient() : new AuthApiClient(url);
  let accountApi = USE_MOCK_API ? new MockAccountApiClient() : new AccountApiClient(url);
  // ... same for rating, matchmaking
  return { authApi, accountApi, ratingApi, matchmakingApi, ... };
}, []);
```

**Key improvements:**
- Added `authApi` client management
- Removed circular dependency on `AuthContext` (no more `useAuth()` call)
- Removed `token` parameter from real API client constructors (they can set it later via `setAuthToken()`)
- Simplified dependency array to `[]` since clients are created once

### 2. Updated `AuthContext.tsx`
**Before:**
```typescript
import { MockAuthApiClient } from '@/services/api';
const authClient = new MockAuthApiClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  // Direct use of mock client
  const response = await authClient.login(email, password);
  // ... auto-login logic using authClient.getMockSession()
}
```

**After:**
```typescript
import { useApiClients } from './ApiContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authApi, useMockApi } = useApiClients();
  
  // Use authApi from context
  const response = await authApi.login(email, password);
  
  // Auto-login only when using mock API
  if (useMockApi) {
    const response = await authApi.login('mockuser@example.com', 'password');
    // ...
  }
}
```

**Key improvements:**
- Removed direct mock client import
- Uses `authApi` from `ApiContext` via `useApiClients()` hook
- Auto-login now conditional on `useMockApi` flag
- No more mock-specific methods like `getMockSession()`
- Clean separation: only manages auth state, not client selection

## Architecture Benefits

### 1. Single Source of Truth
- `USE_MOCK_API` environment variable controls all API client behavior
- One place to change mock/real switching: `ApiContext.tsx`
- No duplicate logic across contexts

### 2. Clean Separation of Concerns
- `ApiContext`: Responsible for API client creation and management
- `AuthContext`: Responsible for authentication state management
- No circular dependencies

### 3. Easy Testing
- Mock all APIs by setting `EXPO_PUBLIC_USE_MOCK_API=true`
- Switch to real backend by setting `EXPO_PUBLIC_USE_MOCK_API=false`
- No code changes required

### 4. Consistent Pattern
All API clients follow the same pattern:
```typescript
const client = USE_MOCK_API 
  ? new MockXxxApiClient() 
  : new XxxApiClient(baseUrl);
```

### 5. Type Safety
- All clients properly typed via interface
- TypeScript ensures correct usage
- No runtime surprises

## Usage Examples

### Switching Between Mock and Real APIs
```bash
# Use mock APIs (default for development)
EXPO_PUBLIC_USE_MOCK_API=true

# Use real backend
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_ACCOUNT_API_URL=http://localhost:8002
EXPO_PUBLIC_RATING_API_URL=http://localhost:8003
# ... etc
```

### Using API Clients in Components
```typescript
import { useApiClients } from '@/contexts/ApiContext';

function MyComponent() {
  const { authApi, accountApi, ratingApi, useMockApi } = useApiClients();
  
  // Use any API client
  const profile = await accountApi.getProfile(userId);
  const rating = await ratingApi.getRating(userId);
  
  // Check if using mocks
  if (useMockApi) {
    console.log('Using mock data');
  }
}
```

### Authentication Flows
```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginScreen() {
  const { login, user, isAuthenticated } = useAuth();
  
  // AuthContext handles all the complexity
  // It uses authApi from ApiContext internally
  await login(email, password);
}
```

## Auto-Login Feature
For development convenience, when using mock APIs:
- If no saved auth state exists, automatically logs in with mock credentials
- Uses `authApi.login('mockuser@example.com', 'password')`
- Only happens when `useMockApi === true`
- Production builds should disable this or check environment

## Testing
Verify the refactoring works:
```bash
# 1. Start with mock APIs (default)
npm start

# 2. App should auto-login with mock user
# 3. Check console for: "🎭 Using MOCK API clients"

# 4. Try login/logout flows
# 5. Check AsyncStorage for saved tokens

# 6. Switch to real backend (if available)
# Set EXPO_PUBLIC_USE_MOCK_API=false and backend URLs
# 7. Check console for: "🌐 Using REAL API clients"
```

## Migration Checklist
- [x] Add `authApi` to `ApiContext` interface
- [x] Import `AuthApiClient` and `MockAuthApiClient` in `ApiContext`
- [x] Instantiate `authApi` in `useMemo` with USE_MOCK_API conditional
- [x] Add `authApi` to return object
- [x] Remove `token` dependency from `ApiContext` (no more circular dependency)
- [x] Update `AuthContext` to import `useApiClients` instead of direct mock import
- [x] Replace `authClient` usage with `authApi` from context
- [x] Update auto-login to use `authApi.login()` instead of `getMockSession()`
- [x] Make auto-login conditional on `useMockApi` flag
- [x] Fix TypeScript errors (LiveGameApiClient and PlayApiClient token parameters)
- [x] Test auto-login functionality
- [x] Test login/logout flows
- [x] Verify no circular dependencies

## Future Enhancements
1. **Token Management**: Update token in API clients when it changes
   - Add `useEffect` to watch for token changes
   - Call `setAuthToken()` on all relevant clients

2. **Additional Mock Clients**: Add mocks for puzzle, liveGame, play APIs
   - Currently these always use real implementations
   - Consider adding mocks for offline development

3. **Error Handling**: Centralized error handling in API clients
   - Add retry logic
   - Add request/response interceptors
   - Add error logging

4. **Request Caching**: Cache responses to reduce API calls
   - Implement in API clients or separate caching layer
   - Consider using React Query for better caching

## Related Files
- `/app/contexts/ApiContext.tsx` - Central API client provider
- `/app/contexts/AuthContext.tsx` - Authentication state management
- `/app/services/api/auth.api.ts` - Real auth API client
- `/app/services/api/mock-clients.ts` - Mock API clients
- `/app/services/api/index.ts` - API client exports

## References
- [AGENTS.md](../AGENTS.md) - Repository guidelines
- [app/docs/overview.md](../app/docs/overview.md) - App architecture
- [app/docs/folder-structure-convention.md](../app/docs/folder-structure-convention.md) - File organization
