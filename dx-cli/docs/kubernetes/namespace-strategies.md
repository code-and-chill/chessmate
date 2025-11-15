---
title: Namespace Strategies Explained
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: reference
---

# Namespace Strategies

The `namespaceStrategy` configuration field in `.dx/config.yaml` determines how Kubernetes namespaces are allocated and managed for different environments.

## Overview

Namespaces provide isolation within a Kubernetes cluster. The strategy determines whether all deployments share a namespace or whether each developer/team gets their own.

## Strategy Types

### 1. Fixed (`fixed`)

**Use case**: Production, staging, or shared environments where everyone uses the same namespace.

**Configuration**:

```yaml
environments:
  prod:
    namespaceStrategy: fixed
    defaultNamespace: monocto-prod
    # Result: All deployments go to "monocto-prod"
```

**Behavior**:
- All developers deploy to the same namespace
- Clean separation of environments (prod, staging, etc.)
- Suitable for CI/CD pipelines

**Pros**:
- Simple to reason about
- Minimal configuration
- Clear environment boundaries

**Cons**:
- Developers can interfere with each other
- Requires strict access control
- Not ideal for local development

### 2. Per-User (`per-user`)

**Use case**: Local development or shared dev clusters where developers work independently.

**Configuration**:

```yaml
environments:
  local:
    namespaceStrategy: per-user
    defaultNamespace: dev
    # Result: Alice → "dev-alice", Bob → "dev-bob"
```

**Username Resolution**:

The system derives the username from (in order):
1. `git config user.name`
2. `$USER` environment variable
3. OS username (from `os.userInfo()`)

**Sanitization**:

Usernames are sanitized to Kubernetes naming rules:
- Lowercase (e.g., "Alice" → "alice")
- Alphanumeric + hyphens only (e.g., "john.doe" → "john-doe")
- Max 248 characters
- Format: `dev-<username>`

**Examples**:

```
git config user.name = "Alice Smith"    → namespace = "dev-alice-smith"
git config user.name = "bob_jones"      → namespace = "dev-bob-jones"
$USER = "john.smith"                    → namespace = "dev-john-smith"
$USER = "dev-user-01"                   → namespace = "dev-dev-user-01"
```

**Behavior**:
- Each developer gets their own isolated namespace
- Automatic namespace creation on first use
- Automatic cleanup (via RBAC) when developer leaves

**Pros**:
- Complete isolation between developers
- No conflicts or interference
- Scales well for teams
- Great for local development

**Cons**:
- Requires namespace creation permissions
- More complex to troubleshoot (multiple namespaces)
- Each dev environment uses separate resources

### 3. Per-Team (`per-team`)

**Use case**: Shared dev environments where team members collaborate.

**Configuration**:

```yaml
environments:
  dev:
    namespaceStrategy: per-team
    defaultNamespace: monocto-dev
    # Result: Currently fallback to "monocto-dev"
    # Future: Team lookup from git org, LDAP, etc.
```

**Current Behavior**:

Per-team strategy is currently stubbed. It falls back to `defaultNamespace` if provided. Future versions will support:

- Git organization detection
- LDAP/AD team membership
- Environment-based team configuration
- Dynamic namespace routing

**Future Example**:

```yaml
environments:
  dev:
    namespaceStrategy: per-team
    teamMapping:
      backend: monocto-backend-dev
      frontend: monocto-frontend-dev
      platform: monocto-platform-dev
```

**Pros**:
- Team-level isolation
- Shared team resources
- Clear responsibility boundaries
- Scales to large organizations

**Cons**:
- Requires team metadata management
- More complex configuration
- Not yet fully implemented

## Usage Examples

### Local Development with Per-User Namespaces

```bash
# Initialize local cluster
dx k8s init-local

# Set environment
dx env use local

# Deploy to your personal namespace (dev-alice)
dx deploy local account-api

# View your namespace
dx env current
# Output:
#   Namespace: dev-alice
#   Namespace Strategy: per-user

# Check your resources
kubectl get pods -n dev-alice --context kind-monocto-dev

# Your colleague Bob is unaffected
# His pods are in dev-bob
```

### Production with Fixed Namespace

```bash
# Set to production environment
dx env use prod

# Deploy to shared production namespace
dx deploy prod account-api

# Verify environment
dx env current
# Output:
#   Namespace: monocto-prod
#   Namespace Strategy: fixed

# All team members deploy here
kubectl get pods -n monocto-prod --context gke_monocto-prod_asia-southeast1
```

### Mixed Strategies

You can use different strategies for different environments:

```yaml
environments:
  local:
    namespaceStrategy: per-user      # Each dev has own namespace
    defaultNamespace: dev

  dev:
    namespaceStrategy: per-team      # Teams share dev namespace
    defaultNamespace: monocto-dev

  staging:
    namespaceStrategy: fixed         # Shared staging
    defaultNamespace: monocto-staging

  prod:
    namespaceStrategy: fixed         # Strict prod
    defaultNamespace: monocto-prod
```

## Namespace Creation and Cleanup

### Automatic Creation

When deploying to an environment with a namespace that doesn't exist:

```bash
dx deploy local account-api
# Automatically creates "dev-alice" if it doesn't exist
```

### Manual Creation

You can also create namespaces manually:

```bash
# Create a specific namespace
kubectl create namespace dev-alice --context kind-monocto-dev

# Label for organization
kubectl label namespace dev-alice owner=alice --context kind-monocto-dev
```

### Cleanup

To delete your namespace (useful for cleanup):

```bash
# Delete your entire namespace
kubectl delete namespace dev-alice --context kind-monocto-dev

# Or delete specific deployments
kubectl delete deploy account-api -n dev-alice --context kind-monocto-dev
```

## Best Practices

### 1. Use Per-User for Local Development

```yaml
environments:
  local:
    namespaceStrategy: per-user
    defaultNamespace: dev
```

Benefits:
- Each developer works independently
- No conflicts
- Easy cleanup (delete namespace)

### 2. Use Fixed for Production

```yaml
environments:
  prod:
    namespaceStrategy: fixed
    defaultNamespace: monocto-prod
```

Benefits:
- Single source of truth
- Strict access control
- Clear environment boundaries

### 3. Consider Per-User for Shared Dev

If you have a shared dev cluster:

```yaml
environments:
  dev:
    namespaceStrategy: per-user
    defaultNamespace: dev
```

Benefits:
- Developers don't interfere with each other
- Still in shared cluster (shared infrastructure)
- Easy to manage and scale

### 4. Avoid Mixing Namespaces

Don't deploy to multiple namespaces from a single environment:

```yaml
# ❌ Don't do this
environments:
  dev:
    namespaceStrategy: fixed
    defaultNamespace: monocto-dev
    # But sometimes deploy to monocto-backend-dev
```

Keep strategy consistent within an environment.

## Troubleshooting

### "Permission denied" when creating namespace

```
Error: namespaces is forbidden: User ... cannot create resource
```

**Solution**: Ensure your kubeconfig has appropriate RBAC permissions.

```bash
# Check your cluster role
kubectl describe clusterrolebinding <role-name>
```

### Namespace still exists after deletion

```bash
# List all namespaces
kubectl get namespaces

# Check namespace status
kubectl describe namespace dev-alice

# Force delete if stuck
kubectl delete namespace dev-alice --ignore-not-found=true
```

### Unclear which namespace I'm targeting

Always verify before deploying:

```bash
dx env current
# Shows namespace, context, strategy
```

## Migration Between Strategies

If you need to change strategies:

```yaml
# Before: per-user
environments:
  local:
    namespaceStrategy: per-user
    defaultNamespace: dev

# After: fixed
environments:
  local:
    namespaceStrategy: fixed
    defaultNamespace: dev-all
```

Steps:

1. Create new namespace with new strategy
2. Deploy to new namespace
3. Verify everything works
4. Delete old namespaces
5. Update config

```bash
# Manual migration
kubectl create namespace dev-all
dx deploy local account-api  # Now goes to dev-all
kubectl delete namespace dev-alice
```
