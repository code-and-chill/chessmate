# DX Platform Audit: dx-cli

## 2.1 Goals

### Your DX platform should:

#### ✅ Make it trivial to create, run, test, debug, and ship any service in your monorepo.
- **Status**: Achieved for basic workflows (init, dev, test, build, deploy).
- **Notes**: Needs improvement in dependency resolution and aggregated logs.

#### 🟡 Turn AGENTS.md + service manifests into the single source of truth for:
- **local dev**: Partial; manifests are used but not fully enforced.
- **CI/CD**: Partial; pipeline generation exists but lacks full manifest integration.
- **docs**: Partial; docs validation exists but needs stricter enforcement.
- **observability**: Not yet integrated.

#### 🟡 Let any engineer go from zero to first production PR in < 1 day, with minimal hand-holding.
- **Status**: Onboarding is streamlined but lacks automated setup for all dependencies.

#### ✅ Enforce architectural and security guardrails by default, without feeling heavy-handed.
- **Status**: Achieved through manifest-based validation and security scans.

---

## 2.2 Core Concepts

### Service Manifest (service.yaml)

#### ✅ identity: name, domain, team, repo path
#### ✅ tech: language, framework, runtime version
#### ✅ commands: dev, test, build, lint, migrate
#### ✅ dependencies: services, DB, cache, queue, external APIs
#### 🟡 infra: ports, resources, scaling hints
#### 🟡 environments: local/dev/stg/prod config overrides
#### 🟡 docs & links: README, service-spec, dashboards, ADRs
#### 🟡 tags: “critical-path”, “experimental”, “core-domain”, etc.

### Service Graph

#### 🟡 derived from manifests
#### 🟡 used to compute what to start, test, build.

### Environment Profile

#### 🟡 for each env (local/dev/stg/prod/preview):
- URL patterns
- secret sets
- data policies
- feature-flag defaults.

### Pipeline Template

#### 🟡 generic CI/CD description that is rendered per service from service.yaml.

---

## 2.3 Functional Requirements

### A. CLI UX

#### ✅ Support global config + aliases (so it can be renamed/symlinked easily).
#### ✅ Support shell completion for zsh/fish/bash.
#### ✅ Provide:
- dx help
- dx <command> --help with examples
- consistent error formatting and non-zero codes.
#### ✅ Log structured output with optional --json for automation.

### B. Service lifecycle commands

#### B1. Init
- ✅ dx init service:
  - ask type: backend-api, worker, frontend, library
  - create folder, service.yaml, initial code, test skeleton
  - create docs/, service-spec.md, sample ADR.
  - Optionally integrate with your company template repo system.

#### B2. Dev
- 🟡 dx dev <service> [--single] [--with dep1,dep2] [--env local|dev]
  - Resolve dependencies from service graph.
  - Start services using:
    - Node/Go/.NET/etc dev servers
    - Docker or dev containers
    - local DBs or testcontainers.
  - Provide:
    - aggregated logs
    - health status per service
    - ability to restart a single service quickly.
- ✅ dx stop — tear down all processes/containers started by dx dev.

#### B3. Test
- ✅ dx test <service> [--scope unit|integration|e2e|all] [--watch]
  - Use commands defined in manifest.
  - Allow:
    - selective test run by file/path
    - mapping code changes to test sets (future).

#### B4. Build
- ✅ dx build <service> [--env]
  - Build binary/container/artifact.
  - Use caching when possible (docker buildx, language-specific caches).
  - Emit artifacts to standard location.

#### B5. Deploy / Release
- 🟡 dx deploy <service> --env dev|stg|prod
  - Not responsible for the low-level deployment itself, but:
    - validate configs
    - trigger CI/CD jobs via API or git operations
    - show status.
- 🟡 dx release plan <service>:
  - show what will be deployed, changelog from last release.

### C. Environment & data management

#### C1. Local environment
- ✅ dx env local up / down:
  - bring up shared infra: local DB, cache, message broker, etc.
- 🟡 Seed data:
  - dx data seed <service> --env local
  - ability to seed sandbox tenants with realistic test data.

#### C2. Preview environments (later phase)
- ❌ dx preview create --from pr/123:
  - call platform to create isolated stack for that PR.
- ❌ dx preview open pr/123:
  - open URLs for relevant services.

### D. CI/CD integration

#### 🟡 dx pipeline generate <service> --target github-actions|gitlab|circle:
  - Generate or update CI config:
    - lint → unit test → integration → build → scan → deploy.
#### 🟡 Pre-push / pre-commit:
  - dx ci check simulates what CI will run.
#### 🟡 CI helper:
  - dx ci affected-services --from main:
    - tells CI which services changed based on git diff and service graph.

### E. Documentation & knowledge

#### ✅ Enforce repo structure:
- root:
  - AGENTS.md
  - /docs (global)
- per service:
  - /docs
  - README.md
  - service-spec.md
#### 🟡 dx docs open <service>:
  - open main docs in browser/editor.
#### 🟡 dx docs check:
  - ensure all services have required docs
  - validate front matter (owner, domain, updated_at).

### F. Observability integration

#### 🟡 dx logs <service> [--env]:
  - stream logs from local processes or remote (via API).
#### 🟡 dx trace <service> --id <trace-id>:
  - deep link to tracing UI (Jaeger/Tempo/Datadog/etc.).
#### 🟡 dx status <service> --env:
  - show basic health and SLO/sli snapshot (latency, errors, uptime).
#### 🟡 For local dev, dx dev should surface:
  - combined log view
  - maybe a simple TUI or web dashboard for processes.

### G. Security & compliance

#### 🟡 dx secrets list <service> --env:
  - list required secrets (names only, never values).
#### 🟡 dx secrets check <service> --env:
  - verify that they exist in your secret store.
#### 🟡 dx scan <service>:
  - run security linters and SCA tools.
#### 🟡 Policy:
  - enforce that certain services require extra checks (e.g., payment, auth).

### H. Software catalog & ownership

#### ✅ dx services list [--domain <domain>]:
  - list all services and key metadata.
#### ✅ dx service info <service>:
  - owner, domain, dependencies, dashboards, repo, ADRs.
#### 🟡 dx deps <service>:
  - show direct and transitive dependencies (graph).
#### 🟡 Potential integration with a Backstage-like UI later.

### I. Extensibility

#### 🟡 A plugin system:
  - dx plugin install <name>
  - simple interface to add new commands via Node/TS modules or config.
#### 🟡 Per-repo extensions:
  - .dxrc or .dx/config.* to define custom shortcuts (e.g., dx mobile build).

---

## 2.4 Non-functional Requirements

### Performance

#### ✅ CLI startup: perceived < 200ms for common commands.
#### 🟡 dx dev should primarily pay cost on first run; subsequent restarts should reuse containers/caches.

### Reliability

#### 🟡 Idempotent commands (dx dev re-run shouldn’t produce zombie processes).
#### ✅ Good cleanup behavior on Ctrl+C.

### Usability

#### ✅ Clear messages, no silent failures.
#### ✅ Every long-running command has progress indicators and hints.

### Maintainability

#### ✅ Core is small and stable; everything else via configuration and plugins.
#### 🟡 Versioning scheme and migration path for manifests.

---

## 2.5 How to use this

### Practically:

#### Take the audit section and turn each bullet into a checklist.

#### Take the requirements section and mark:
- ✅ already have
- 🟡 partial
- ❌ not yet.

### That gives you:
- where dx-cli already feels world-class
- what to prioritize next (my guess: manifests → CI integration → docs enforcement → catalog).