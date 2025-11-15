---
title: Documentation Standards
status: draft
last_reviewed: 2025-11-15
type: standard
---

# Documentation Standards

How we write and organize documentation across the platform.

## Documentation Philosophy

- **Living Documents**: Kept up-to-date with code
- **Audience-Focused**: Clear about who the documentation is for
- **Actionable**: Include concrete examples and instructions
- **Structured**: Follow established templates and hierarchy

## Documentation Hierarchy

```
/                                    # Root
├── AGENTS.md                        # Engineering guide
├── ARCHITECTURE.md                  # System architecture overview
├── SYSTEM_GUIDE.md                  # Service index & quick links
│
├── docs/                            # Cross-service documentation
│   ├── standards/                   # Platform standards (this section)
│   ├── architecture/                # System architecture
│   ├── operations/                  # Operational guides
│   ├── business/                    # Business context
│   └── decisions/                   # Architectural Decision Records (ADRs)
│
└── <service-name>/                  # Per-service
    ├── README.md                    # Quick start
    └── docs/
        ├── overview.md              # Service overview
        ├── architecture.md          # Service architecture
        ├── api.md                   # API documentation
        ├── domain.md                # Domain model documentation
        ├── operations.md            # Operational procedures
        ├── how-to/                  # How-to guides
        │   ├── local-dev.md         # Development environment
        │   ├── troubleshooting.md   # Common issues and solutions
        │   └── common-tasks.md      # Frequent tasks
        └── decisions/               # Service-specific ADRs
            ├── README.md            # ADR index
            └── ADR-0001-...md       # Individual decisions
```

## Document Front Matter

Every documentation file should start with front matter:

```yaml
---
title: Document Title
service: service-name (if service-specific, omit if cross-service)
status: draft | review | published
last_reviewed: YYYY-MM-DD
type: overview | architecture | api | domain | operations | how-to | decision | standard
---
```

## Service Documentation Requirements

Every service **MUST** have:

1. **README.md** - Service quick start (in service root)
   - Brief description
   - Quick start instructions
   - Links to detailed docs

2. **docs/overview.md** - Service overview and capabilities
   - What the service does
   - Key responsibilities
   - Upstream/downstream dependencies
   - Main API endpoints or features

3. **docs/architecture.md** - Technical design
   - Architecture diagrams
   - Component descriptions
   - Data flow
   - Design patterns used

4. **docs/api.md** - API reference
   - Endpoints/operations
   - Request/response examples
   - Error codes and handling
   - Rate limiting and quotas

5. **docs/domain.md** - Domain model
   - Bounded contexts and aggregates
   - Domain entities and value objects
   - Ubiquitous language glossary
   - Business rules

6. **docs/operations.md** - Operational procedures
   - Deployment procedures
   - Configuration options
   - Monitoring and alerting
   - Incident response procedures
   - Performance tuning

7. **docs/how-to/** - How-to guides
   - `local-dev.md` - Development environment setup
   - `troubleshooting.md` - Common issues and solutions
   - `common-tasks.md` - Frequent operations

8. **docs/decisions/** - Architectural decisions
   - `README.md` - ADR index and process
   - `ADR-0001-...md` - Individual decisions

## Architectural Decision Records (ADRs)

ADRs capture significant technical decisions:

**Format**: `ADR-{NUMBER}-{TITLE}.md`

**Example**: `ADR-0001-use-postgresql-for-persistence.md`

**Structure**:
1. **Context** - Problem and constraints
2. **Decision** - What decision was made
3. **Rationale** - Why this decision (alternatives considered)
4. **Consequences** - Results and trade-offs
5. **Status** - Proposed, accepted, superseded
6. **Date** - When the decision was made

## Writing Guidelines

### Headings
- Use H1 (#) for main title only
- Use H2 (##) for top-level sections
- Use H3 (###) for subsections
- Consistent heading hierarchy

### Links
- Use relative links within documentation
- Example: `./docs/overview.md` from service README
- Use absolute paths to docs: `/docs/standards/` from service

### Code Examples
- Use language-specific code fences
- Include output when helpful
- Keep examples concise and runnable

### Placeholders
Use this format for incomplete sections:

```
**Fill:** [Description of what should go here]

- Item 1
- Item 2
```

## Maintenance

- Review documentation quarterly
- Update front matter `last_reviewed` date
- Mark documents as `draft`, `review`, or `published`
- Keep examples and command outputs current
- Remove or archive outdated documents

---

*Last updated: 2025-11-15*
