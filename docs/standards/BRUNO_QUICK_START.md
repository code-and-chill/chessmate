# Bruno API Collections - Quick Start Guide

> **Unified API testing and documentation using Bruno**

## 📋 What is Bruno?

Bruno is an offline-first API client that stores collections in plain text (`.bru` files). All ChessMate services with HTTP APIs use Bruno for:
- **API Documentation**: Human-readable request/response examples
- **Integration Testing**: Automated tests with assertions
- **Developer Experience**: Quick onboarding and API exploration

## 🚀 Quick Start

### Install Bruno CLI

```bash
npm install -g @usebruno/cli
```

### Run Tests for a Service

```bash
# Using DX CLI (recommended)
dx bruno account-api --test

# Using Bruno CLI directly
cd account-api
bruno run bruno/collections --env local

# Using service.yaml command
cd account-api && make bruno-test
```

### Open Bruno Collection

```bash
# Using DX CLI
dx bruno account-api

# Using Bruno CLI
cd account-api
bruno open bruno/collections
```

## 📁 Standard Structure

Every service with HTTP APIs has:

```
<service-name>/
  bruno/
    environments/
      local.env              # localhost:PORT
      staging.env            # staging URLs
      production.env         # production URLs
    collections/
      <service-name>.bru     # Collection metadata
      health.bru             # Health check
      *.bru                  # Individual endpoints
    tests/
      *.test.bru             # Multi-step workflows
    snippets/
      auth.bru               # Reusable auth (if needed)
```

## 🎯 Services with Bruno Collections

| Service | Collections | Port | Status |
|---------|-------------|------|--------|
| account-api | 10 | 8001 | ✅ |
| live-game-api | 6 | 8002 | ✅ |
| matchmaking-api | 3 | 8003 | ✅ |
| rating-api | 4 | 8013 | ✅ |
| bot-orchestrator-api | 3 | 8005 | ✅ |
| chess-knowledge-api | 4 | 9002 | ✅ |
| engine-cluster-api | 3 | 9000 | ✅ |

## 📝 Example Request

```bruno
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

  test("response has account", function() {
    expect(res.body.account).to.not.be.null;
  });
}
```

## 🔧 Environment Variables

Edit `bruno/environments/local.env` for each service:

```env
baseUrl=http://localhost:8001
authToken=
testUserId=550e8400-e29b-41d4-a716-446655440000
```

## ✅ Validation

Check if all services comply with Bruno standard:

```bash
./scripts/validate-bruno-standard.sh
```

Expected output:
```
Total checks:  80
Passed:        80
Failed:        0
Success rate:  100%
✅ All Bruno API Collections validation checks passed!
```

## 📚 Documentation

- **Standard Guide**: [`docs/standards/bruno-api-testing.md`](./bruno-api-testing.md)
- **AGENTS.md**: Section "Bruno API Collections Standard"
- **Implementation Summary**: [`docs/standards/BRUNO_IMPLEMENTATION_SUMMARY.md`](./BRUNO_IMPLEMENTATION_SUMMARY.md)

## 🤖 For AI Agents

When creating or modifying HTTP services:

1. ✅ **Always create** `.bru` files for new endpoints
2. ✅ **Update existing** `.bru` files when endpoints change
3. ✅ **Include assertions** in every request
4. ✅ **Add to service.yaml**: `bruno` and `bruno-test` commands
5. ✅ **Never skip** Bruno generation

See `AGENTS.md` for complete rules.

## 🎓 Common Workflows

### Test a Single Endpoint

```bash
cd account-api
bruno run bruno/collections/health.bru --env local
```

### Test All Endpoints

```bash
cd account-api
bruno run bruno/collections --env local
```

### Test Multi-Step Workflow

```bash
cd account-api
bruno run bruno/tests/account-lifecycle-flow.test.bru --env local
```

### Watch Mode (Re-run on Changes)

```bash
cd account-api
bruno run bruno/collections --env local --watch
```

## 🐛 Troubleshooting

**Issue**: Tests fail with "Connection refused"

**Solution**: Start the service first
```bash
dx dev account-api
# Then in another terminal:
dx bruno account-api --test
```

**Issue**: Authentication errors

**Solution**: Set `authToken` in `bruno/environments/local.env`

**Issue**: Bruno CLI not found

**Solution**: Install globally
```bash
npm install -g @usebruno/cli
```

## 🔗 Resources

- **Bruno Docs**: https://docs.usebruno.com/
- **Bruno CLI**: https://www.npmjs.com/package/@usebruno/cli
- **Bruno GitHub**: https://github.com/usebruno/bruno

## 📊 Status

**Implementation**: ✅ Complete (Nov 16, 2025)  
**Validation**: ✅ 100% (80/80 checks passed)  
**Services Covered**: ✅ 7/7 HTTP services  
**Documentation**: ✅ Comprehensive
