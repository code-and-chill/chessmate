---
title: Kubernetes Integration Architecture
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: architecture
---

# Kubernetes Integration Architecture

## Overview

The `dx-cli` Kubernetes integration provides environment-aware deployment and cluster management. This document describes the architecture, design decisions, and extension points.

## Design Goals

1. **Environment-First**: Environments (local/dev/prod) are first-class citizens
2. **Simple DX**: Single commands for common operations (deploy, logs, shell, open)
3. **Extensible**: Support multiple K8s distros (kind, GKE, EKS, etc.)
4. **Safe**: Clear feedback on cluster state before operations
5. **Gradual**: Works alongside existing local development workflows

## Architecture

### Module Organization

```
src/k8s/
├── types.ts          # Type definitions and schemas
├── environment.ts    # Environment loading and resolution
├── state.ts          # Active environment persistence
└── utils.ts          # Low-level kubectl operations

src/commands/
├── env.ts            # dx env list/use/current
├── k8s.ts            # dx k8s init-local
├── deploy.ts         # dx deploy (K8s + legacy)
├── logs.ts           # dx logs (K8s + local)
├── shell.ts          # dx shell
└── open.ts           # dx open
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│ User Command (dx deploy local account-api)          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ Command Handler   │
         │ (src/commands/)   │
         └────────┬──────────┘
                  │
         ┌────────▼──────────┐
         │ getActiveEnv()    │
         └────────┬──────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌───────────┐  ┌──────────┐
│ .dx/   │  │  State    │  │ K8s      │
│config. │  │  File     │  │ Utils    │
│yaml    │  │(.dx/.     │  │(kubectl) │
│        │  │state)     │  │          │
└───┬────┘  └──┬────────┘  └──┬───────┘
    │         │               │
    └─────────┴───────────────┘
            │
            ▼
    ┌───────────────────┐
    │ K8sEnvironment    │
    │ (resolved object) │
    └─────────┬─────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Execute Operation   │
    │ (deploy/logs/shell) │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │ kubectl/API calls   │
    └─────────┬───────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Kubernetes Cluster  │
    └─────────────────────┘
```

## Core Concepts

### 1. Environments

An **environment** represents a Kubernetes cluster and deployment strategy.

```typescript
interface K8sEnvironment {
  name: string;                      // e.g., "local"
  kind: "kubernetes";                // environment type
  kubeContext: string;               // kubectl context
  namespaceStrategy: NamespaceStrategy;
  namespace: string;                 // resolved at runtime
  domain?: string;                   // base domain for ingress
  resourcesProfile: ResourceProfile;
  isLocal: boolean;                  // true if local dev cluster
}
```

**Key insight**: Namespace derivation is lazy - computed when needed based on strategy.

### 2. Namespace Strategies

Determines how namespaces are allocated:

- **fixed**: Use a single namespace for everyone (e.g., `monocto-prod`)
- **per-user**: Each developer gets their own (e.g., `dev-alice`, `dev-bob`)
- **per-team**: Team-based isolation (future, currently falls back to fixed)

**Implementation**:

```typescript
function deriveNamespace(
  strategy: NamespaceStrategy,
  defaultNamespace?: string
): string {
  switch (strategy) {
    case "fixed":
      return defaultNamespace || throw ...
    case "per-user":
      return `dev-${getUserName()}`
    case "per-team":
      return defaultNamespace || throw ...
  }
}
```

### 3. Resource Profiles

Define CPU/memory/replicas for different environments:

```yaml
resourceProfiles:
  local:
    cpu: "100m"
    memory: "128Mi"
    replicas: 1
  dev:
    cpu: "250m"
    memory: "256Mi"
    replicas: 2
  prod:
    cpu: "500m"
    memory: "512Mi"
    replicas: 3
```

**Used by**: Manifest generation, HPA configuration

### 4. State Management

Persists the currently active environment:

- **Backend**: File (`.dx/.state`) or environment variable (`DX_ENV`)
- **Lookup order**:
  1. Environment variable: `DX_ENV`
  2. State file: `.dx/.state`
  3. None (user must run `dx env use`)

## Command Flow Examples

### `dx deploy local account-api`

```
1. Parse arguments: env="local", service="account-api"
2. Load .dx/config.yaml
3. Validate "local" environment exists
4. Resolve K8sEnvironment:
   - namespace = deriveNamespace("per-user", "dev") = "dev-alice"
   - kubeContext = "kind-monocto-dev"
   - resourcesProfile = "local"
5. Validate kubectl context exists
6. Ensure namespace "dev-alice" exists
7. Generate Kubernetes manifest:
   - Image: monocto/account-api:${git-sha}
   - Resources: cpu=100m, memory=128Mi, replicas=1
   - Service: port 80 → 8080
8. Apply manifest: kubectl apply -f manifest.yaml
9. Print success message
```

### `dx logs account-api --follow`

```
1. Check if active environment is set
2. If yes (K8s mode):
   a. Resolve environment from state
   b. Find pod: kubectl get pods -l app=account-api -n dev-alice
   c. Stream logs: kubectl logs pod/account-api-xxx -f
3. If no (local mode):
   a. Fall back to service.yaml logs command
   b. Execute locally (e.g., docker logs)
```

### `dx open account-api`

```
1. Resolve active environment
2. If local environment or no domain:
   a. Get service info (ports)
   b. Setup port-forward: kubectl port-forward svc/account-api 8080:80
   c. Open browser: http://localhost:8080
3. If remote with domain:
   a. Generate URL: http://account-api.dev.monocto.com
   b. Open browser
```

## Extension Points

### 1. Adding New Environments

Edit `.dx/config.yaml`:

```yaml
environments:
  staging:
    kind: kubernetes
    kubeContext: gke_monocto-staging_us-central1
    namespaceStrategy: fixed
    defaultNamespace: monocto-staging
    domain: staging.monocto.com
    resourcesProfile: dev
```

### 2. Custom Resource Profiles

Extend `resourceProfiles` in `.dx/config.yaml`:

```yaml
resourceProfiles:
  gpu:
    cpu: "1000m"
    memory: "4Gi"
    replicas: 1
    gpuLimit: 1  # Custom field (not yet used)
```

### 3. Custom Manifest Generation

Currently, basic manifests are generated. Future enhancement:

```typescript
// Instead of generating strings, use:
// - Helm charts
// - Kustomize overlays
// - Template files (Jinja, Handlebars)
// - Custom logic per service
```

### 4. Namespace Strategy Implementation

To add a new strategy, modify `deriveNamespace()`:

```typescript
export function deriveNamespace(...): string {
  switch (strategy) {
    case "per-project":
      // Implement project-based namespace allocation
      return `${getProjectName()}-dev`
  }
}
```

### 5. Additional Commands

Commands are registered in `src/index.ts`:

```typescript
program.addCommand(envCommand);
program.addCommand(k8sCommand);
program.addCommand(shellCommand);
program.addCommand(openCommand);
// Add new commands here
```

## Design Decisions

### 1. Lazy Namespace Resolution

**Decision**: Compute namespace from strategy when needed, not during config load.

**Rationale**:
- Username might not be available until runtime
- Allows per-user strategy without global configuration
- Namespace is function of user + strategy, not pre-computed

**Alternative**: Pre-compute and store in config
- Would require listing all users
- Wouldn't work for dynamic teams
- Coupling between config and users

### 2. File-Based State Over Global CLI State

**Decision**: Store active environment in `.dx/.state` (can be gitignored)

**Rationale**:
- Each developer can have different active environment
- Doesn't pollute monorepo git state
- Can be team-specific if needed
- Supports multiple dev machines (don't share state file)

**Alternative**: Store in global `~/.dx/state`
- Would enforce single active environment globally
- Less flexible for team scenarios

### 3. Namespace Auto-Creation

**Decision**: `dx deploy` creates namespace if it doesn't exist

**Rationale**:
- Lower friction for developers
- Safer than requiring manual `kubectl create ns`
- Logged clearly so user sees what happened

**Alternative**: Require manual namespace creation
- More explicit
- Forces developers to learn kubectl

### 4. kubectl Wrapping vs. K8s Client Library

**Decision**: Shell out to `kubectl` commands

**Rationale**:
- Dependency management (kubectl is commonly already installed)
- Transparent (users can inspect generated commands)
- Easy to debug (log the exact command)
- No need for Node.js K8s client library

**Alternative**: Use `@kubernetes/client-node`
- Cleaner API
- Direct binary interaction
- Harder to debug
- Additional dependency

### 5. Manifest Generation in CLI vs. External Charts

**Decision**: Generate simple manifests in CLI for now

**Rationale**:
- No dependency on separate chart files
- Clear and simple for MVP
- Easy to debug (print manifests)

**Future**: Support Helm/Kustomize
- Real production use cases need sophisticated templating
- Can add later without breaking changes

## Error Handling

### Validation Layers

```
Input Validation
  ↓
Environment Lookup & Validation
  ↓
Kubernetes Context Validation
  ↓
Namespace Creation/Validation
  ↓
Operation Execution
```

### Common Errors and Mitigation

| Error | Cause | Mitigation |
|-------|-------|-----------|
| Context not found | kubectl not configured | `dx env list` shows available, hint to `dx k8s init-local` |
| Cluster unreachable | Network/firewall issue | Clear error msg + troubleshooting steps |
| No active environment | User hasn't run `dx env use` | Helpful error: "Run: dx env use local" |
| Permission denied | RBAC/auth issue | Show namespace and context, suggest RBAC policy |
| Pod not found | Service not deployed | Suggest: "Run: dx deploy <service>" |

## Performance Considerations

### 1. Config Caching

Config is loaded once and cached:

```typescript
let cachedK8sConfig: K8sConfig | null = null;

export function loadK8sConfig(): K8sConfig {
  if (cachedK8sConfig) return cachedK8sConfig;
  // Load from disk
  cachedK8sConfig = ...
  return cachedK8sConfig;
}
```

**Benefit**: Multiple commands don't re-parse YAML

### 2. kubectl Call Optimization

Each operation should minimize kubectl calls:

```
❌ Inefficient:
- Check if namespace exists
- Create namespace
- Deploy

✅ Efficient:
- Deploy (includes namespace creation)
```

### 3. Parallel Operations

For `dx deploy` without service name:

```typescript
// Could parallelize:
for (const svc of services) {
  // await deployService(svc)  // Sequential
  // OR
  // Promise.all(services.map(deployService))  // Parallel
}
```

Currently sequential; can optimize later.

## Testing Strategy

### Unit Tests

- Namespace derivation logic
- Config parsing and validation
- Path resolution

### Integration Tests (TODO)

- Full deployment flow
- Kind cluster setup
- kubectl interaction

### E2E Tests (TODO)

- Real K8s cluster deployment
- Multiple environments
- Error scenarios

## Future Enhancements

1. **Helm Integration**: Use Helm charts for deployments
2. **Kustomize Support**: Environment-specific overlays
3. **Multi-Cluster Management**: Manage multiple clusters simultaneously
4. **GitOps Integration**: ArgoCD or Flux support
5. **Service Mesh**: Istio/Linkerd support
6. **Advanced Scheduling**: Pod affinity, node selectors
7. **Policy Enforcement**: Network policies, PSP, OPA
8. **Observability Hooks**: Automatic logging/metrics setup
9. **Rollout Strategies**: Canary, blue-green deployments
10. **Secret Management**: K8s secrets integration

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kind Documentation](https://kind.sigs.k8s.io/)
- [kubectl Reference](https://kubernetes.io/docs/reference/kubectl/overview/)
