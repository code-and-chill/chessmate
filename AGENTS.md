---
title: Agent Operating Guide
status: active
last_reviewed: 2025-11-18
type: standard
---

# AGENTS GUIDE

A unified operating contract for all AI agents and automated assistants working inside this monorepo.

Agents **MUST** obey this file before writing code, generating docs, or modifying any folder in this repository.

---

## 0. Trigger Phrase – Mandatory Rule

If any user message contains the exact phrase:

**"please read AGENTS.md"**

Then the agent **MUST**:

1. Open this file and re-read it entirely.
2. Identify which rules apply to the user's request.
3. State (briefly) which rules will govern the action.
4. Apply those rules strictly.

If the request violates these rules, the agent **MUST**:

- Explain the conflict
- Propose the correct, compliant alternative
- Never proceed with the invalid approach

This phrase **overrides all previous instructions** and enforces strict compliance.

---

## 0.1. Quick Service-Specific Rules

**Before modifying any service, check its specific documentation:**

### Working on `app/` (React Native/Web)?
→ **READ FIRST**: [`app/docs/overview.md`](app/docs/overview.md)
→ **Quick Reference**: [`app/docs/ai-agent-quick-reference.md`](app/docs/ai-agent-quick-reference.md)
→ **Structure Rules**: [`app/docs/folder-structure-convention.md`](app/docs/folder-structure-convention.md)

**Critical app/ rules:**
- ✅ Features go in `/features/{feature}/`
- ✅ UI components go in `/ui/primitives/` or `/ui/components/`
- ✅ API clients go in `/services/api/`
- ✅ Use design tokens from `/ui/tokens/`
- ❌ No circular dependencies between features
- ❌ No business logic in route files (`/app`)
- ❌ No hard-coded colors/spacing (use tokens)

### Working on other services?
Check `{service}/docs/overview.md` for service-specific rules.

---

## 1. Documentation Structure

All documentation **MUST** follow the directory rules below.

### 1.1. Root-Level Documentation

Root contains:

```
AGENTS.md             # This file
ARCHITECTURE.md       # Global system view (C4, flows, domains)
SYSTEM_GUIDE.md       # List of services + quick links
```

**Rules**:

- Agents **MUST** update these files when architecture expands or services are added.
- `AGENTS.md` is the source of truth for agent behavior.
- `ARCHITECTURE.md` is the source of truth for system design.
- `SYSTEM_GUIDE.md` is the primary navigation hub.

### 1.2. Cross-Service Documentation (/docs)

Only cross-service, global, or shared content goes here.

```
docs/
  standards/
    coding-style.md
    testing.md
    logging.md
    security.md
    observability.md
    documentation.md          # Global rule for writing docs
    creating-new-service.md   # Lifecycle for new services
  architecture/
    system-context.md
    domain-map.md
    service-catalog.md
    integration-flows.md
  operations/
    sre-playbook.md
    incident-response.md
    oncall-guide.md
  business/
    product-vision.md
    domain-overview.md
    glossary.md
  decisions/
    ADR-0001-...md
    ADR-0002-...md
    ...
```

**Rules**:

- Multi-service standards → `docs/standards/`
- Global architecture → `docs/architecture/`
- Global runbooks → `docs/operations/`
- Global domain docs → `docs/business/`
- Cross-service ADRs → `docs/decisions/`
- Agents **MUST NEVER** place service-specific docs here.

---

## 2. Per-Service Documentation Structure

Every service lives at the repository root:

```
<service-name>/
```

Each **MUST** follow:

```
<service>/
  README.md
  docs/
    overview.md
    architecture.md
    api.md
    domain.md
    operations.md
    how-to/
      local-dev.md
      troubleshooting.md
      common-tasks.md
    decisions/
      README.md
      ADR-0001-initial.md
    migrations/
      README.md
      phase-1.md
  app/
  tests/
  migrations/
  Dockerfile
  service.yaml
```

### 2.1. README.md Requirements

It **MUST**:

- Contain 1–3 sentences describing the service.
- Link to all docs:

```markdown
# <Service Name>

<Brief description>

## Quick Links
- [Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Domain](docs/domain.md)
- [Operations](docs/operations.md)
- [Local Development](docs/how-to/local-dev.md)
- [ADR Index](docs/decisions/README.md)
```

---

## 3. Required Doc Types

Each service **MUST** include:

| File | Purpose |
|------|---------|
| `overview.md` | What does it do? In-scope/out-of-scope? |
| `architecture.md` | Components, flows, storage, diagrams? |
| `api.md` | Routes, schemas, error models, versioning? |
| `domain.md` | Invariants, glossary, rules, edge cases? |
| `operations.md` | Deployment, configs, observability, SLO? |
| `how-to/local-dev.md` | How to run locally? |
| `how-to/troubleshooting.md` | Common issues and fixes? |
| `how-to/common-tasks.md` | Frequent operations? |
| `decisions/README.md` | Index of ADRs? |

**No exceptions.**

---

## 4. Mandatory Front-Matter For All Docs

Every `.md` file under `/docs` or `/*/docs` **MUST** start with:

```yaml
---
title: <Readable title>
service: <service-name or "global">
status: active | draft | deprecated
last_reviewed: YYYY-MM-DD
type: overview | architecture | api | domain | operations | how-to | decision | standard | business
---
```

**Rules**:

- `service` = `"global"` for cross-service docs.
- Update `last_reviewed` when editing.
- Use the `type` that best fits the purpose.
- Agents **MUST NOT** create docs without front-matter.

---

## Service Ecosystem

### Service Types

| Type | Purpose | Examples | Naming Pattern |
|------|---------|----------|----------------|
| **`*-api`** | External HTTP interfaces (BFFs, partner APIs) | `search-api`, `booking-api`, `iam-auth-api` | Externally consumed |
| **`*-service`** | Internal synchronous services | `ranking-service`, `feature-service` | Backend-to-backend |
| **`*-worker`** | Asynchronous/background processing | `search-indexer-worker`, `review-agg-worker` | Event processing |
| **`*-engine`** | Specialized compute layers | `pricing-engine`, `recommendation-engine` | Complex algorithms |

### Technology Stack by Domain

| Domain | Primary Language | Framework | Database | Key Patterns |
|--------|------------------|-----------|----------|--------------|
| **Identity & Auth** | Kotlin | Spring Boot | PostgreSQL | RBAC, OAuth2, SAML |
| **Search & Discovery** | Go | Chi/Fiber | OpenSearch | Full-text search, faceting |
| **Booking & Payments** | Kotlin | Spring Boot | PostgreSQL | Saga pattern, event sourcing |
| **Content & Reviews** | Python | FastAPI | PostgreSQL | NLP, content moderation |
| **Real-time Features** | Rust | Actix Web | Redis | WebSocket, caching |
| **Client Applications** | TypeScript | React/React Native | - | BFF pattern, offline-first |

### Service Dependencies

```mermaid
graph TD
    A[Mobile App] --> B[app-gateway]
    C[Web Dashboard] --> B
    B --> D[iam-auth-api]
    B --> E[search-api]
    B --> F[booking-api]
    E --> G[ranking-service]
    E --> H[feature-service]
    F --> I[pricing-engine]
    F --> J[payment-service]
    
    K[search-indexer-worker] --> L[OpenSearch]
    M[review-agg-worker] --> N[Redis]
```

---

## Repository-Level Dependencies

### When to Add a Tool

**Repository-level tools** are installed once via `dx setup` and used by multiple services. Add to the system-check if:
- Used by **2+ services** in the monorepo
- Required for **all developers** to function
- **Language or build-system level** (not application-specific)

Examples of repository-level tools:
- **Poetry** - Used by all Python services
- **Node.js/pnpm** - Used by all TypeScript services
- **Git** - Used by all developers
- **Python 3** - Used by multiple Python services

### When NOT to Add

**Service-level dependencies** are installed per-service and should NOT be in system-check. Examples:
- FastAPI (application framework, specific to account-api)
- pytest (testing framework, specific to a service)
- SQLAlchemy (ORM, specific to service)

Install service-level dependencies with: `dx install [service]`

### Adding a New Repository-Level Tool

1. **Update system-check.ts** in `dx-cli/src/core/system-check.ts`:
   ```typescript
   const SYSTEM_REQUIREMENTS = [
     // ... existing tools
     {
       name: "YourTool",
       command: "yourtool",
       versionArg: "--version",
       minVersion: "1.0.0",
       required: true,  // or false for optional
       install: "brew install yourtool",  // or pip, curl, etc.
     },
   ];
   ```

2. **Update install-deps.sh** in `dx-cli/src/core/system-check.ts`:
   - Add tool to SYSTEM_REQUIREMENTS array
   - Implement installation logic for macOS and Linux in getInstallationInstructions()
   - Test on both platforms
   - Verify `which yourtool` finds the executable
   - **Note**: System dependencies are installed automatically by `dx setup`

3. **Update setup.ts**:
   - No changes needed if tool is in SYSTEM_REQUIREMENTS
   - It will be automatically checked and reported

4. **Test the changes**:
   ```bash
   dx setup                    # Verify tool is checked
   dx doctor --verbose        # Verify tool is listed
   ```

5. **Document in README.md**:
   - Add to "Quick Start" section
   - Explain why it's required

### Testing New Dependencies

Always test on:
- Fresh environment (simulate new developer)
- Both macOS and Linux (if applicable)
- With `dx setup --skip-deps` (skips automatic installation, useful for testing)

---

## Development Workflow

### Initial Setup

```bash
# Clone and initialize the monorepo
git clone <repository-url>
cd chessmate
make init                    # Install dependencies and generate SDKs
```

### Daily Development

```bash
# Start backing services (databases, caches, etc.)
make dev-up

# Start all application services
make dev

# Run affected tests
pnpm nx affected -t test

# Build affected projects
pnpm nx affected -t build

# Clean up
make dev-down
```

### Service Development Lifecycle

1. **Design Phase**
   - Define OpenAPI contract in `/contracts/openapi/`
   - Update service glossary in `docs/service-spec.md`
   - Create ADR if architectural decision required

2. **Implementation Phase**
   - Generate SDKs: `pnpm gen`
   - Implement service following language-specific architecture guide
   - Write comprehensive tests (unit, integration, contract)

3. **Integration Phase**
   - Update affected services to use new contracts
   - Run full test suite: `make test`
   - Verify local deployment: `make dev`

4. **Documentation Phase**
   - Update service README with build/run/test instructions
   - Document domain concepts and ubiquitous language
   - Add operational runbook if needed

### Git Workflow

```bash
# Feature development
git checkout -b feature/service-name-capability
# ... make changes ...
git commit -m "feat(service-name): add capability description"

# Update service glossary if new service
# Update contracts if API changes
# Ensure all tests pass

git push origin feature/service-name-capability
# Create pull request
```

---

## Programming Language Guides

### Kotlin Services
**Architecture**: Domain-Driven Design with Spring Boot
**Guide**: [`docs/README.md`](docs/README.md)
**Key Patterns**: Aggregate roots, domain events, repository pattern
**Testing**: JUnit 5, Testcontainers, architecture tests

### Go Services  
**Architecture**: Clean architecture with Chi/Fiber
**Guide**: [`docs/README.md`](docs/README.md)
**Key Patterns**: Dependency injection, middleware, structured logging
**Testing**: Table-driven tests, Testcontainers integration

### Python Services
**Architecture**: FastAPI with Pydantic models
**Guide**: [`docs/README.md`](docs/README.md)
**Key Patterns**: Async/await, dependency injection, type hints
**Testing**: pytest, async test patterns, ML model testing

### Rust Services
**Architecture**: Actix Web with strong typing
**Guide**: [`docs/README.md`](docs/README.md)
**Key Patterns**: Error handling, async streams, zero-copy serialization
**Testing**: Unit tests, integration tests, benchmarks

### TypeScript Services
**Architecture**: Node.js with GraphQL/REST
**Guide**: [`docs/README.md`](docs/README.md)
**Key Patterns**: BFF pattern, schema-first GraphQL, middleware
**Testing**: Vitest, supertest, contract testing

### React Native/Web App (`app/`)
**Architecture**: Cross-platform mobile/web client with vertical feature slices
**Guide**: [`app/docs/README.md`](app/docs/README.md)
**Essential Reading**:
- [`app/docs/overview.md`](app/docs/overview.md) — Comprehensive app overview (READ THIS FIRST)
- [`app/docs/folder-structure-convention.md`](app/docs/folder-structure-convention.md) — Production-grade structure
- [`app/docs/ai-agent-quick-reference.md`](app/docs/ai-agent-quick-reference.md) — Quick reference for AI agents

**Key Patterns**:
- Vertical slicing (features as self-contained modules)
- Horizontal layering (ui, services, core, platform)
- Design system with tokens and themes
- Expo Router (file-based routing)
- React Query for server state

**Testing**: Jest, React Testing Library, E2E with Detox

**Critical Rules for AI Agents**:
1. **ALWAYS** read [`app/docs/overview.md`](app/docs/overview.md) before making changes
2. **ALWAYS** check [`app/docs/ai-agent-quick-reference.md`](app/docs/ai-agent-quick-reference.md) for file placement decisions
3. **NEVER** create circular dependencies (feature A → feature B)
4. **NEVER** put business logic in UI components or route files
5. **ALWAYS** use design tokens from `ui/tokens/` (no hard-coded colors/spacing)
6. **ALWAYS** follow the folder structure decision tree for new files
7. **ALWAYS** create public APIs via `index.ts` exports
8. **ALWAYS** use lowercase kebab-case for markdown files

---

## Quality Standards

### Code Quality

**Test Coverage**
- Minimum 80% line coverage for business logic
- 100% coverage for critical paths (auth, payments)
- Integration tests for all external interfaces
- Contract tests between services

**Code Review**
- All changes require peer review
- Architecture changes require senior review
- Security-sensitive changes require security review
- Performance-critical changes require performance review

**Static Analysis**
- Language-specific linters (ESLint, ktlint, golangci-lint)
- Security scanning (Trivy, CodeQL)
- Dependency vulnerability scanning
- License compliance checking

### Performance Standards

**Response Times**
- API endpoints: p95 < 200ms
- Search queries: p95 < 500ms
- Background jobs: process within SLA
- Database queries: < 100ms for simple operations

**Scalability**
- Services must be stateless
- Horizontal scaling capability
- Proper connection pooling
- Efficient caching strategies

### Security Standards

**Authentication & Authorization**
- JWT-based authentication via `iam-auth-api`
- Role-based access control (RBAC)
- Principle of least privilege
- Regular token rotation

**Data Protection**
- Encryption at rest and in transit
- PII data minimization
- Audit logging for sensitive operations
- GDPR compliance for user data

---

## Documentation Standards

### Documentation Structure and Placement

**CRITICAL**: Before creating or modifying documentation, follow the 4-level hierarchy and decision tree below. Documentation in the wrong location creates confusion and maintenance burden.

See [`docs/README.md`](docs/README.md) for comprehensive documentation guidelines and examples.

### Documentation Hierarchy

```
/
├── AGENTS.md                           # This file - root engineering guide
├── README.md                           # Repository overview
│
├── docs/                               # Level 1: Platform-wide documentation
│   ├── README.md                       # Documentation structure guide (read this first!)
│   │
│   ├── architecture-{lang}.md          # Language-specific architecture guides
│   ├── service-spec.md                 # Service catalog and conventions
│   ├── pcm-contracts.md                # API contracts
│   ├── certificate-management.md       # Platform standards
│   │
│   ├── {domain}/                       # Level 2: Domain/cross-service docs
│   │   ├── README.md                   # Domain overview
│   │   ├── architecture.md             # Domain architecture
│   │   ├── developer-guide.md          # Development guide
│   │   └── integration-guide.md        # Integration patterns
│   │
│   └── integrations/                   # Level 3: Platform-wide integrations
│       ├── README.md                   # Integration guidelines
│       └── versions/                   # Versioned integration snapshots
│           └── {integration}-{type}-v{ver}-{date}.md
│
├── {service-name}/                     # Level 4: Service-specific (REQUIRED STRUCTURE)
│   ├── README.md                       # Build, run, test instructions (required)
│   └── docs/                           # Service documentation (required)
│       ├── README.md                   # Service overview (required)
│       ├── GETTING_STARTED.md          # Dev setup guide (required)
│       ├── overview.md                 # API/feature specification
│       ├── ARCHITECTURE.md             # Technical design
│       ├── RUNBOOK.md                  # Operational procedures
│       ├── integrations/               # Service-specific integrations
│       │   └── {integration}.md        # Implementation details
│       └── migrations/                 # Iterative development phases
│           ├── README.md               # Phase versioning guide
│           ├── phase-1.md              # MVP/Phase 1 decisions
│           ├── phase-2.md              # Phase 2 enhancements
│           └── phase-{N}.md            # Future phases
│
└── contracts/                          # API contracts
    └── openapi/                        # OpenAPI specifications
```

### Documentation Decision Tree

**Use this before creating any documentation:**

```
What type of documentation are you creating?

├─ Platform-wide standard or architectural guideline?
│  └─ → /docs/{topic}.md
│      Examples: architecture-kotlin.md, service-spec.md, certificate-management.md
│
├─ Specific to a language/technology stack?
│  └─ → /docs/architecture-{language}.md
│      Examples: architecture-kotlin.md, architecture-python.md, architecture-rust.md
│
├─ Spanning multiple services within a domain/bounded context?
│  └─ → /docs/{domain}/{topic}.md
│      Examples: docs/pricing-engine/architecture.md, docs/pricing-engine/developer-guide.md
│
├─ Cross-domain integration affecting multiple services?
│  ├─ High-level overview or versioned snapshot?
│  │  └─ → /docs/integrations/versions/{integration}-{type}-v{version}-{date}.md
│  │      Examples: iam-auth-integration-v1-2025-11-05.md
│  │                experimentation-integration-v1-2025-11-05.md
│  │
│  └─ Service-specific implementation?
│     └─ → /{service-name}/docs/integrations/{integration}.md
│         Examples: pricing-gateway/docs/integrations/iam-authentication.md
│                   pricing-silo/docs/integrations/experimentation.md
│
└─ Service-specific operational or implementation detail?
   └─ → /{service-name}/docs/{topic}.md
       Examples: booking-api/docs/RUNBOOK.md, iam-auth-api/docs/RATE_LIMITING.md
```

### Documentation Placement Rules

**Level 1: Platform-Wide (`/docs/`)**

Use when:
- Applies to all services or multiple domains
- Architectural standards or patterns
- Technology stack guidelines
- Platform-wide tooling or infrastructure

Examples:
- Language architecture guides (how to structure services)
- Service naming and categorization conventions
- Platform-wide security standards

**Level 2: Domain-Specific (`/docs/{domain}/`)**

Use when:
- Applies to multiple services within a bounded context
- Domain architecture and concepts
- Cross-service workflows within the domain
- Shared domain models and ubiquitous language

Examples:
- `/docs/pricing-engine/architecture.md` - Pricing domain architecture
- `/docs/pricing-engine/domain-model.md` - Pricing domain concepts
- `/docs/pricing-engine/experimentation-integration.md` - How experimentation works across pricing

**Level 3: Platform Integrations (`/docs/integrations/`)**

Use when:
- Cross-domain integration affecting multiple services
- Platform-wide infrastructure integration
- Multiple teams/services affected
- Requires versioned historical record

Naming convention: `{integration-name}-{type}-v{version}-{date}.md`
- Types: `integration`, `tests-status`, `test-findings`, `final-summary`
- Example: `experimentation-integration-v1-2025-11-05.md`

Examples:
- IAM authentication rollout across services
- Experimentation framework integration
- Service mesh adoption

**Level 4: Service-Specific (`/{service-name}/docs/`)**

Use when:
- Specific to a single service
- Implementation details
- Service-specific configuration
- Operational procedures

Examples:
- Service overview and capabilities
- How to configure and run the service
- Service-specific integration implementations
- Troubleshooting and runbooks

### Service Documentation Requirements

Every service MUST follow this documentation structure under `/{service-name}/docs/`:

```
{service-name}/
├── README.md                    # Root service README (required)
└── docs/
    ├── README.md               # Service overview (required)
    ├── GETTING_STARTED.md      # Development setup (required)
    ├── overview.md             # API/feature specification
    ├── ARCHITECTURE.md         # Technical design
    ├── RUNBOOK.md              # Operational procedures
    ├── integrations/           # Service-specific integrations
    │   └── {integration}.md    # Implementation details
    └── migrations/             # Iterative development phases
        ├── phase-1.md          # Phase 1 plan and decisions
        ├── phase-2.md          # Phase 2 plan and decisions
        └── README.md           # Versioning guide
```

**Service README.md** (in service root - `/{service-name}/README.md`)
- Quick start: build, run, test commands
- Dependencies and prerequisites
- Environment configuration
- Common troubleshooting
- Links to documentation in `docs/` folder

**Service docs/README.md** (service context - `/{service-name}/docs/README.md`)
- Business domain and capabilities
- Ubiquitous language glossary
- API overview and key endpoints
- Integration patterns
- Service dependencies

**Service docs/GETTING_STARTED.md** (development guide - `/{service-name}/docs/GETTING_STARTED.md`)
- Step-by-step development environment setup
- Database initialization
- Running tests
- Common development tasks
- Troubleshooting development issues

**Service docs/overview.md** (specification - `/{service-name}/docs/overview.md`)
- API endpoints with examples
- Data models and schemas
- Feature specification
- Scope and limitations
- Future enhancements

**Service docs/ARCHITECTURE.md** (technical design - `/{service-name}/docs/ARCHITECTURE.md`)
- System architecture diagram
- Component relationships
- Data flow
- Design patterns used
- Technical decisions and trade-offs

**Service docs/RUNBOOK.md** (operations - `/{service-name}/docs/RUNBOOK.md`)
- Deployment procedures
- Monitoring and alerting setup
- Incident response procedures
- Performance tuning
- Log analysis and debugging

**Service docs/integrations/{integration}.md** (cross-service integration)
- How this service integrates with other services
- APIs consumed and provided
- Event contracts
- Error handling
- Testing integration

**Service docs/migrations/README.md** (phase versioning guide)
- Overview of service development phases
- How to document new phases
- Naming convention: `phase-{number}.md`
- Version history and decisions

**Service docs/migrations/phase-{N}.md** (iterative development)
- Phase objectives and goals
- Scope: what's included/excluded
- Architecture decisions made
- Database schema changes
- API endpoints added/modified
- Breaking changes
- Testing strategy
- Deployment considerations
- Dependencies on other services
- Blockers or risks

### Service Documentation Template Checklist

When creating a new service, ensure:
- [ ] `/{service-name}/README.md` exists with quickstart
- [ ] `/{service-name}/docs/README.md` exists with overview
- [ ] `/{service-name}/docs/GETTING_STARTED.md` exists with setup steps
- [ ] `/{service-name}/docs/overview.md` exists with API spec
- [ ] `/{service-name}/docs/ARCHITECTURE.md` exists with design
- [ ] `/{service-name}/docs/RUNBOOK.md` exists with operations
- [ ] `/{service-name}/docs/migrations/README.md` exists
- [ ] `/{service-name}/docs/migrations/phase-1.md` documents MVP

### Documentation Principles

**Clarity**
- Write for your future self and new team members
- Use clear, concise language
- Provide concrete examples
- Keep documentation close to code

**Completeness**
- Document the "why" not just the "what"
- Include error scenarios and edge cases
- Provide troubleshooting guides
- Maintain up-to-date examples

**Consistency**
- Follow established templates
- Use consistent terminology
- Maintain cross-references
- Regular documentation reviews

**Versioning Documentation**
- Use `docs/migrations/` like git commits for services
- Track decisions and rationale for each phase
- Link phases to git tags/releases
- Never delete old phase documentation
- Use semantic versioning: v{major}.{minor}.{patch}

---

## Getting Help

### Resources

- **Architecture Questions**: Review language-specific guides in `/docs/`
- **Service Information**: Check service glossary in `docs/service-spec.md`
- **API Contracts**: Browse OpenAPI specs in `/contracts/openapi/`
- **Operational Issues**: Consult service runbooks in `{service}/docs/RUNBOOK.md`

### Escalation Path

1. **Self-Service**: Documentation, code examples, existing patterns
2. **Team Discussion**: Architecture decisions, design patterns
3. **Technical Review**: Complex changes, performance concerns
4. **Architecture Review**: Cross-service changes, new patterns

---

## Bruno API Collections Standard

All services exposing HTTP APIs **MUST** maintain Bruno API collections for:
- **Documentation**: Human-readable API examples
- **Testing**: Automated integration tests
- **DX**: Developer experience and onboarding

### Directory Structure (Mandatory)

Every service with HTTP endpoints **MUST** have:

```
<service-name>/
  bruno/
    environments/
      local.env              # Local development environment
      staging.env            # Staging environment
      production.env         # Production environment
    collections/
      <service-name>.bru     # Service collection metadata
      health.bru             # Health check endpoint
      <endpoint-or-flow>.bru # Individual endpoints
    tests/
      <workflow>.test.bru    # Multi-step workflow tests
    snippets/
      auth.bru               # Reusable authentication logic (if applicable)
```

**Rules**:
- Collections are **organized by resource**, not by HTTP method
- File names use **kebab-case**
- Each endpoint has **one `.bru` file** in `collections/`
- Multi-step flows go in `tests/`
- Reusable logic goes in `snippets/`

### Request Coverage (Mandatory)

For **every endpoint** defined in `app/api/routes/`:

1. **Create a Bruno request** under `bruno/collections/`
2. **Include**:
   - HTTP method and URL
   - Request headers (including `Content-Type`)
   - Request body with example payload
   - Path variables and query parameters
   - Environment variable substitution (`${baseUrl}`, `${authToken}`)
3. **Provide curl equivalent** (Bruno auto-generates this)
4. **Add at least one example payload**

**Example**: For `POST /v1/accounts`, create `bruno/collections/post-account.bru`:

```
meta {
  name: Create Account
  type: http
  seq: 1
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
    "username": "testuser",
    "email": "test@example.com"
  }
}

tests {
  test("status is 201", function() {
    expect(res.status).to.equal(201);
  });

  test("response has account_id", function() {
    expect(res.body.account_id).to.not.be.null;
  });
}
```

### Authentication Rules

**If the service requires authentication**:

1. **Create `bruno/snippets/auth.bru`** with reusable auth logic:

```
meta {
  name: Authentication
  type: snippet
}

pre-request {
  // Fetch or refresh token if needed
  if (!bru.getEnvVar("authToken")) {
    const authRes = await axios.post(`${bru.getEnvVar("authBaseUrl")}/login`, {
      username: "testuser",
      password: "testpass"
    });
    bru.setEnvVar("authToken", authRes.data.access_token);
  }
}
```

2. **Use in requests**:

```
headers {
  Authorization: Bearer ${authToken}
}

pre-request {
  // Include authentication snippet
  await bru.include("snippets/auth.bru");
}
```

3. **All authenticated endpoints** must use `${authToken}` variable

### Multi-Step Flow Rules

**For workflows involving multiple endpoints** (e.g., login → create resource → verify):

1. **Create a test flow** under `bruno/tests/`
2. **Chain requests** using response variables
3. **Extract values** from responses for subsequent requests
4. **Assert expected outcomes** at each step

**Example**: `bruno/tests/account-creation-flow.test.bru`:

```
meta {
  name: Account Creation Flow
  type: test
}

pre-request {
  bru.setVar("testUserId", crypto.randomUUID());
}

request "Create Account" {
  method: POST
  url: ${baseUrl}/v1/accounts
  body {
    "user_id": "${testUserId}",
    "username": "testuser_${testUserId}",
    "email": "test_${testUserId}@example.com"
  }
  
  tests {
    test("account created", function() {
      expect(res.status).to.equal(201);
      bru.setVar("accountId", res.body.account_id);
    });
  }
}

request "Get Account" {
  method: GET
  url: ${baseUrl}/v1/accounts/${accountId}
  
  tests {
    test("account retrieved", function() {
      expect(res.status).to.equal(200);
      expect(res.body.user_id).to.equal(bru.getVar("testUserId"));
    });
  }
}

request "Update Account" {
  method: PATCH
  url: ${baseUrl}/v1/accounts/${accountId}
  body {
    "display_name": "Updated Name"
  }
  
  tests {
    test("account updated", function() {
      expect(res.status).to.equal(200);
      expect(res.body.display_name).to.equal("Updated Name");
    });
  }
}
```

### Assertion Rules (Mandatory)

**Every endpoint request MUST include assertions** for:

1. **Response status code**:
   ```javascript
   test("status is 200", function() {
     expect(res.status).to.equal(200);
   });
   ```

2. **Required fields in response**:
   ```javascript
   test("response has required fields", function() {
     expect(res.body.id).to.not.be.null;
     expect(res.body.created_at).to.not.be.null;
   });
   ```

3. **Error cases** (if applicable):
   ```javascript
   test("returns 404 for invalid ID", function() {
     expect(res.status).to.equal(404);
     expect(res.body.error).to.contain("not found");
   });
   ```

**Format**:
```javascript
tests {
  test("description", function() {
    expect(res.status).to.equal(expectedStatus);
    expect(res.body.field).to.not.be.null;
  });
}
```

### CI Integration Rules

**All Bruno tests MUST run in CI/CD pipeline**:

1. **Add to GitHub Actions workflow** (`.github/workflows/ci.yml`):
   ```yaml
   - name: Run Bruno Tests
     run: |
       npm install -g @usebruno/cli
       bruno run bruno/collections/ --env local
   ```

2. **Fail pipeline on assertion failures**:
   - Exit code must be non-zero if any test fails
   - CI must report which tests failed

3. **Run tests on**:
   - Pull request creation
   - Merge to main
   - Before deployment

### DX CLI Integration

**Agents MUST ensure Bruno is integrated with `dx` CLI**:

1. **Add `bruno` command** to `dx-cli/src/commands/`:
   ```typescript
   dx bruno <service>          # Open Bruno collection for service
   dx bruno <service> --test   # Run Bruno tests for service
   dx bruno <service> --watch  # Run tests in watch mode
   ```

2. **Functionality**:
   - Load environment variables from `bruno/environments/local.env`
   - Open the correct collection for the service
   - Run tests with `--test` flag
   - Watch for changes with `--watch` flag

3. **Example implementation** (in `service.yaml`):
   ```yaml
   commands:
     bruno: "bruno open bruno/collections"
     bruno-test: "bruno run bruno/collections --env local"
   ```

### Agent Behavior Requirements

**Whenever an agent**:

1. **Creates a new microservice** → Generate full Bruno structure
2. **Adds a new endpoint** → Create corresponding `.bru` file
3. **Refactors routes** → Update all affected `.bru` files
4. **Changes domain logic affecting payloads** → Update request/response examples

**The agent MUST NEVER**:
- Skip Bruno generation for new endpoints
- Leave Bruno tests in broken state
- Create endpoints without corresponding `.bru` files

**Agents MUST** treat Bruno files with the same importance as:
- Source code
- Tests
- Documentation

### Documentation Requirements

**When updating AGENTS.md**:

1. **Link to Bruno standard**: Reference this section
2. **State expectation**: All services maintain Bruno tests
3. **Require compliance**: All API examples must come from Bruno collections
4. **Enforce for future agents**: All future agents must respect this workflow

### Quality Guarantees

All Bruno collections **MUST**:

1. ✅ **Be readable in Git**
   - Plain text `.bru` format
   - Human-readable structure
   - Clear naming conventions

2. ✅ **Require no cloud login**
   - 100% local execution
   - No external dependencies
   - No authentication with Bruno cloud

3. ✅ **Run offline**
   - No internet required (except for API calls to localhost)
   - All dependencies bundled
   - Environment files committed to repo

4. ✅ **Be portable across machines**
   - No machine-specific configuration
   - Environment variables in `.env` files
   - Consistent across team members

5. ✅ **Be compatible with `dx` workflows**
   - Integrate with `dx` CLI commands
   - Follow monorepo conventions
   - Respect `service.yaml` structure

### Validation

**Agents MUST validate**:

1. ✅ All endpoints have corresponding `.bru` files
2. ✅ All `.bru` files have assertions
3. ✅ Environment files exist for all environments
4. ✅ Multi-step flows test critical workflows
5. ✅ Authentication logic is reusable (if applicable)
6. ✅ CI pipeline includes Bruno tests

**Run validation**:
```bash
dx doctor                     # Check all services
dx doctor <service-name>      # Check specific service
dx bruno <service> --test     # Run Bruno tests
```

### Migration for Existing Services

When adding Bruno to an existing service:

1. Create directory structure under `<service>/bruno/`
2. Generate environment files for local, staging, production
3. Create `.bru` file for each existing endpoint
4. Add assertions to all requests
5. Create test flows for critical workflows
6. Update `service.yaml` with Bruno commands
7. Add to CI pipeline
8. Update service documentation

### Examples

See working examples in the monorepo:
- `rating-api/bruno/` - Complete Bruno structure
- `account-api/bruno/` - Authentication patterns
- `live-game-api/bruno/` - Multi-step flows

---

*This guide is a living document. Update it as the platform evolves and new patterns emerge.*