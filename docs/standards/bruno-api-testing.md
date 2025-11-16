---
title: Bruno API Testing Standard
service: global
status: active
last_reviewed: 2025-11-16
type: standard
---

# Bruno API Testing Standard

> **Unified API testing and documentation standard using Bruno for all HTTP services**

## Overview

All services in the ChessMate monorepo that expose HTTP APIs must maintain Bruno collections for:
- **API Documentation**: Human-readable examples with request/response payloads
- **Integration Testing**: Automated tests that validate API contracts
- **Developer Experience**: Quick onboarding and exploration of services

Bruno collections serve as the **single source of truth** for API examples, replacing manual curl commands and ad-hoc testing scripts.

---

## Why Bruno?

- ✅ **Git-friendly**: Plain text `.bru` format, easy to diff and review
- ✅ **Offline-first**: No cloud login required, runs entirely locally
- ✅ **Portable**: Works consistently across all team members
- ✅ **Integrated**: Seamlessly integrates with `dx` CLI and CI/CD
- ✅ **Developer-friendly**: Simple syntax, powerful scripting capabilities

---

## Directory Structure

### Standard Layout

Every service with HTTP endpoints **MUST** follow this structure:

```
<service-name>/
  bruno/
    environments/
      local.env              # Local development (localhost)
      staging.env            # Staging environment
      production.env         # Production environment
    collections/
      <service-name>.bru     # Collection metadata
      health.bru             # Health check endpoint
      <resource>.bru         # Individual endpoints
    tests/
      <workflow>.test.bru    # Multi-step workflow tests
    snippets/
      auth.bru               # Reusable authentication (if needed)
```

### File Naming Conventions

- **Collections**: `<http-method>-<resource>.bru` (e.g., `get-account.bru`, `post-game.bru`)
- **Tests**: `<workflow-name>.test.bru` (e.g., `account-creation-flow.test.bru`)
- **Snippets**: Descriptive name (e.g., `auth.bru`, `pagination.bru`)
- Use **kebab-case** for all file names

### Example Structure

```
account-api/
  bruno/
    environments/
      local.env
      staging.env
      production.env
    collections/
      account-api.bru
      health.bru
      get-account.bru
      post-account.bru
      patch-account.bru
      get-account-preferences.bru
      patch-account-preferences.bru
    tests/
      account-creation-flow.test.bru
      account-update-flow.test.bru
    snippets/
      auth.bru
```

---

## Environment Files

### Purpose

Environment files define variables used across requests:
- Base URLs
- Authentication tokens
- Service ports
- Common headers

### Format

```env
# bruno/environments/local.env
baseUrl=http://localhost:8001
authBaseUrl=http://localhost:8000
authToken=
userId=550e8400-e29b-41d4-a716-446655440000
testUsername=testuser
testEmail=test@example.com
```

### Rules

1. **Never commit secrets**: Use placeholder values for sensitive data
2. **Document variables**: Add comments explaining each variable
3. **Consistent naming**: Use `camelCase` for variable names
4. **Default values**: Provide sensible defaults for local development

### Environment-Specific Values

| Environment | Base URL | Purpose |
|-------------|----------|---------|
| `local` | `http://localhost:<port>` | Local development |
| `staging` | `https://staging-api.chessmate.com` | Pre-production testing |
| `production` | `https://api.chessmate.com` | Production (read-only) |

---

## Request Collections

### Basic Request Structure

```
meta {
  name: Get Account
  type: http
  seq: 1
}

request {
  method: GET
  url: ${baseUrl}/v1/accounts/me
}

headers {
  Content-Type: application/json
  Authorization: Bearer ${authToken}
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has account_id", function() {
    expect(res.body.account_id).to.not.be.null;
  });
}
```

### Request with Body

```
meta {
  name: Create Account
  type: http
  seq: 2
}

request {
  method: POST
  url: ${baseUrl}/v1/accounts
}

headers {
  Content-Type: application/json
  Authorization: Bearer ${authToken}
}

body:application/json {
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "display_name": "John Doe"
  }
}

tests {
  test("status is 201", function() {
    expect(res.status).to.equal(201);
  });

  test("response has account_id", function() {
    expect(res.body.account_id).to.not.be.null;
  });

  test("account created with correct username", function() {
    expect(res.body.username).to.equal("johndoe");
  });
}
```

### Request with Path Parameters

```
meta {
  name: Get Game by ID
  type: http
  seq: 3
}

request {
  method: GET
  url: ${baseUrl}/v1/games/{{gameId}}
}

headers {
  Content-Type: application/json
  Authorization: Bearer ${authToken}
}

vars:pre-request {
  gameId: 550e8400-e29b-41d4-a716-446655440000
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("game has expected structure", function() {
    expect(res.body.game_id).to.not.be.null;
    expect(res.body.white_player).to.not.be.null;
    expect(res.body.black_player).to.not.be.null;
  });
}
```

### Request with Query Parameters

```
meta {
  name: List Games with Pagination
  type: http
  seq: 4
}

request {
  method: GET
  url: ${baseUrl}/v1/games?limit=10&offset=0&status=active
}

headers {
  Content-Type: application/json
  Authorization: Bearer ${authToken}
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("returns array of games", function() {
    expect(Array.isArray(res.body.games)).to.be.true;
  });

  test("respects limit parameter", function() {
    expect(res.body.games.length).to.be.at.most(10);
  });
}
```

---

## Authentication

### Snippet-Based Authentication

For services requiring authentication, create a reusable snippet:

```
// bruno/snippets/auth.bru
meta {
  name: Authentication
  type: snippet
}

pre-request {
  // Check if we already have a valid token
  const existingToken = bru.getEnvVar("authToken");
  
  if (!existingToken || isTokenExpired(existingToken)) {
    // Fetch new token
    const authRes = await axios.post(
      `${bru.getEnvVar("authBaseUrl")}/v1/auth/login`,
      {
        username: bru.getEnvVar("testUsername"),
        password: bru.getEnvVar("testPassword")
      }
    );
    
    // Store token in environment
    bru.setEnvVar("authToken", authRes.data.access_token);
  }
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

### Using Authentication in Requests

```
meta {
  name: Get Protected Resource
  type: http
  seq: 1
}

request {
  method: GET
  url: ${baseUrl}/v1/protected-resource
}

headers {
  Content-Type: application/json
  Authorization: Bearer ${authToken}
}

pre-request {
  // Include authentication snippet
  await bru.include("snippets/auth.bru");
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });
}
```

---

## Multi-Step Workflow Tests

### Purpose

Multi-step tests validate end-to-end workflows:
- User registration → login → resource creation
- Game creation → move execution → game completion
- Order placement → payment → fulfillment

### Example: Account Creation Flow

```
// bruno/tests/account-creation-flow.test.bru
meta {
  name: Account Creation and Update Flow
  type: test
}

pre-request {
  // Generate unique test data
  bru.setVar("testUserId", crypto.randomUUID());
  bru.setVar("testUsername", `testuser_${Date.now()}`);
  bru.setVar("testEmail", `test_${Date.now()}@example.com`);
}

request "Create Account" {
  method: POST
  url: ${baseUrl}/v1/accounts
  
  headers {
    Content-Type: application/json
    Authorization: Bearer ${authToken}
  }
  
  body:application/json {
    {
      "user_id": "${testUserId}",
      "username": "${testUsername}",
      "email": "${testEmail}"
    }
  }
  
  tests {
    test("account created successfully", function() {
      expect(res.status).to.equal(201);
      expect(res.body.account_id).to.not.be.null;
      
      // Store account ID for next request
      bru.setVar("accountId", res.body.account_id);
    });
  }
}

request "Get Account by ID" {
  method: GET
  url: ${baseUrl}/v1/accounts/${accountId}
  
  headers {
    Content-Type: application/json
    Authorization: Bearer ${authToken}
  }
  
  tests {
    test("account retrieved successfully", function() {
      expect(res.status).to.equal(200);
      expect(res.body.username).to.equal(bru.getVar("testUsername"));
    });
  }
}

request "Update Account" {
  method: PATCH
  url: ${baseUrl}/v1/accounts/${accountId}
  
  headers {
    Content-Type: application/json
    Authorization: Bearer ${authToken}
  }
  
  body:application/json {
    {
      "display_name": "Updated Name"
    }
  }
  
  tests {
    test("account updated successfully", function() {
      expect(res.status).to.equal(200);
      expect(res.body.display_name).to.equal("Updated Name");
    });
  }
}

request "Delete Account" {
  method: DELETE
  url: ${baseUrl}/v1/accounts/${accountId}
  
  headers {
    Authorization: Bearer ${authToken}
  }
  
  tests {
    test("account deleted successfully", function() {
      expect(res.status).to.equal(204);
    });
  }
}

request "Verify Account Deleted" {
  method: GET
  url: ${baseUrl}/v1/accounts/${accountId}
  
  headers {
    Authorization: Bearer ${authToken}
  }
  
  tests {
    test("account no longer exists", function() {
      expect(res.status).to.equal(404);
    });
  }
}
```

---

## Assertions

### Standard Assertions

Every request **MUST** include at least:

1. **Status code assertion**
2. **Required fields assertion**
3. **Error case handling** (if applicable)

### Status Code Assertions

```javascript
tests {
  // Success cases
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("status is 201 Created", function() {
    expect(res.status).to.equal(201);
  });

  test("status is 204 No Content", function() {
    expect(res.status).to.equal(204);
  });

  // Error cases
  test("status is 400 Bad Request", function() {
    expect(res.status).to.equal(400);
  });

  test("status is 404 Not Found", function() {
    expect(res.status).to.equal(404);
  });

  test("status is 401 Unauthorized", function() {
    expect(res.status).to.equal(401);
  });
}
```

### Field Validation Assertions

```javascript
tests {
  test("response has required fields", function() {
    expect(res.body.id).to.not.be.null;
    expect(res.body.created_at).to.not.be.null;
    expect(res.body.updated_at).to.not.be.null;
  });

  test("field has correct type", function() {
    expect(typeof res.body.id).to.equal("string");
    expect(typeof res.body.count).to.equal("number");
    expect(Array.isArray(res.body.items)).to.be.true;
  });

  test("field matches expected value", function() {
    expect(res.body.status).to.equal("active");
    expect(res.body.username).to.equal("johndoe");
  });
}
```

### Error Assertions

```javascript
tests {
  test("error response has correct structure", function() {
    expect(res.body.error).to.not.be.null;
    expect(res.body.error.code).to.not.be.null;
    expect(res.body.error.message).to.not.be.null;
  });

  test("error message is descriptive", function() {
    expect(res.body.error.message).to.include("not found");
  });
}
```

### Schema Validation

```javascript
tests {
  test("response matches expected schema", function() {
    const schema = {
      id: "string",
      username: "string",
      email: "string",
      created_at: "string",
      preferences: "object"
    };

    Object.keys(schema).forEach(key => {
      expect(res.body).to.have.property(key);
      expect(typeof res.body[key]).to.equal(schema[key]);
    });
  });
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

Add Bruno tests to your CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  bruno-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install poetry
          poetry install
      
      - name: Start service
        run: |
          poetry run uvicorn app.main:app --host 0.0.0.0 --port 8001 &
          sleep 5
      
      - name: Install Bruno CLI
        run: npm install -g @usebruno/cli
      
      - name: Run Bruno tests
        run: bruno run bruno/collections --env local --output bruno-results.json
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: bruno-results
          path: bruno-results.json
```

### Service-Specific CI

Each service should have Bruno tests in its CI workflow:

```yaml
# .github/workflows/account-api-ci.yml
name: Account API CI

on:
  pull_request:
    paths:
      - 'account-api/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Account API Bruno tests
        run: |
          cd account-api
          npm install -g @usebruno/cli
          bruno run bruno/collections --env local
```

---

## DX CLI Integration

### Commands

The `dx` CLI provides Bruno integration:

```bash
# Open Bruno collection for a service
dx bruno <service-name>

# Run Bruno tests for a service
dx bruno <service-name> --test

# Run tests in watch mode
dx bruno <service-name> --watch

# Run specific test
dx bruno <service-name> --test <test-name>
```

### Implementation in service.yaml

```yaml
# <service-name>/service.yaml
name: account-api
kind: api
language: python
runtime: python3.11

commands:
  dev: "poetry run uvicorn app.main:app --reload"
  test: "poetry run pytest tests/"
  bruno: "bruno open bruno/collections"
  bruno-test: "bruno run bruno/collections --env local"
  bruno-watch: "bruno run bruno/collections --env local --watch"
```

---

## Best Practices

### 1. Keep Collections Organized

- ✅ Group related endpoints together
- ✅ Use consistent naming conventions
- ✅ Add descriptive metadata to each request
- ✅ Sequence requests logically (`seq` field)

### 2. Write Meaningful Assertions

- ✅ Test for expected behavior, not implementation details
- ✅ Include both positive and negative test cases
- ✅ Validate data types and structure
- ✅ Check for required fields

### 3. Use Environment Variables

- ✅ Never hardcode URLs or tokens
- ✅ Use `${variableName}` for all dynamic values
- ✅ Document all variables in environment files

### 4. Create Realistic Test Data

- ✅ Use valid UUIDs for IDs
- ✅ Use realistic usernames and emails
- ✅ Include edge cases in test data
- ✅ Generate unique data for each test run

### 5. Document Complex Flows

- ✅ Add comments explaining workflow logic
- ✅ Document expected outcomes
- ✅ Include troubleshooting notes
- ✅ Link to relevant documentation

### 6. Keep Tests Independent

- ✅ Each test should be self-contained
- ✅ Clean up resources after tests
- ✅ Don't rely on execution order
- ✅ Use unique identifiers to avoid collisions

### 7. Version Control

- ✅ Commit all `.bru` files to Git
- ✅ Review changes in PRs
- ✅ Keep environment files up to date
- ✅ Document breaking changes

---

## Validation Checklist

Before committing Bruno collections, ensure:

- [ ] All endpoints have corresponding `.bru` files
- [ ] All requests include assertions
- [ ] Environment files exist for all environments
- [ ] Authentication logic is implemented (if needed)
- [ ] Multi-step workflows test critical paths
- [ ] Collections run successfully locally
- [ ] CI/CD pipeline includes Bruno tests
- [ ] Documentation references Bruno collections
- [ ] `service.yaml` includes Bruno commands
- [ ] All tests pass in CI

---

## Examples

### Service Examples

See working examples in the monorepo:

- **rating-api**: `/workspaces/chessmate/rating-api/bruno/`
- **account-api**: `/workspaces/chessmate/account-api/bruno/`
- **live-game-api**: `/workspaces/chessmate/live-game-api/bruno/`
- **matchmaking-api**: `/workspaces/chessmate/matchmaking-api/bruno/`

### Pattern Library

Common patterns and examples:

- **Pagination**: `/docs/examples/bruno-pagination.md`
- **Authentication**: `/docs/examples/bruno-auth.md`
- **Error Handling**: `/docs/examples/bruno-errors.md`
- **Bulk Operations**: `/docs/examples/bruno-bulk.md`

---

## Migration Guide

### Adding Bruno to Existing Service

1. **Create directory structure**:
   ```bash
   mkdir -p <service>/bruno/{environments,collections,tests,snippets}
   ```

2. **Create environment files**:
   ```bash
   touch <service>/bruno/environments/{local,staging,production}.env
   ```

3. **Generate collection metadata**:
   ```
   meta {
     name: <Service Name> API
     type: collection
   }
   ```

4. **Create `.bru` file for each endpoint**:
   - Review `app/api/routes/` directory
   - Create one file per endpoint
   - Include assertions

5. **Create multi-step tests**:
   - Identify critical workflows
   - Create test files in `tests/`
   - Chain requests with variable extraction

6. **Update `service.yaml`**:
   ```yaml
   commands:
     bruno: "bruno open bruno/collections"
     bruno-test: "bruno run bruno/collections --env local"
   ```

7. **Add to CI/CD**:
   - Update `.github/workflows/` files
   - Ensure tests run on PRs

8. **Document**:
   - Update service README
   - Link to Bruno collections
   - Add troubleshooting notes

---

## Troubleshooting

### Common Issues

**Issue**: Bruno tests fail in CI but pass locally

**Solution**: 
- Ensure service is running in CI
- Check environment variables are set correctly
- Verify database is seeded with test data

**Issue**: Authentication token expires during tests

**Solution**:
- Implement token refresh logic in `snippets/auth.bru`
- Cache tokens in environment variables
- Check token expiration before each request

**Issue**: Tests are flaky due to race conditions

**Solution**:
- Add delays between dependent requests
- Use polling for async operations
- Ensure resources are fully created before accessing

**Issue**: Large response bodies slow down tests

**Solution**:
- Use pagination in requests
- Filter responses to only required fields
- Mock external service calls

---

## Resources

- **Bruno Documentation**: https://docs.usebruno.com/
- **Bruno CLI**: https://www.npmjs.com/package/@usebruno/cli
- **Bruno GitHub**: https://github.com/usebruno/bruno
- **ChessMate Bruno Examples**: `/docs/examples/bruno/`

---

*This standard is mandatory for all HTTP services in the ChessMate monorepo. Compliance is enforced through code review and automated validation.*
