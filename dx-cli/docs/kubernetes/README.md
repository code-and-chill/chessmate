---
title: Kubernetes Deployment Documentation Index
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: overview
---

# Kubernetes Integration Documentation

Complete documentation for deploying services to Kubernetes using `dx-cli`.

## Quick Start

New to `dx-cli` Kubernetes features? Start here:

1. **[Kubernetes Deployment Guide](./GUIDE.md)** - Complete user guide with examples
   - Quick start (5 minutes)
   - Command reference
   - Troubleshooting
   - Advanced usage

2. **First-time setup**:
   ```bash
   dx k8s init-local
   dx env use local
   dx deploy local account-api
   dx open account-api
   ```

## Documentation Structure

### User Guides

- **[GUIDE.md](./GUIDE.md)** - Complete deployment guide
  - Command reference (env, k8s, deploy, logs, shell, open)
  - Configuration basics
  - Troubleshooting
  - Examples and workflows

### Reference Documentation

- **[config-reference.md](./config-reference.md)** - `.dx/config.yaml` complete reference
  - Every configuration option explained
  - Type specifications
  - Examples and best practices

- **[namespace-strategies.md](./namespace-strategies.md)** - Namespace allocation strategies
  - fixed: Single namespace for everyone
  - per-user: Each developer gets their own
  - per-team: Team-based isolation (future)
  - Migration between strategies

### Architecture Documentation

- **[architecture.md](./architecture.md)** - Design and architecture
  - System architecture
  - Module organization
  - Design decisions with rationale
  - Extension points

## Command Overview

| Command | Purpose | Environment |
|---------|---------|-------------|
| `dx env list` | Show all environments | All |
| `dx env use <name>` | Set active environment | All |
| `dx env current` | Show current environment | All |
| `dx k8s init-local` | Bootstrap local kind cluster | Local |
| `dx deploy <env> [service]` | Deploy to Kubernetes | Kubernetes |
| `dx logs <service>` | Stream service logs | Kubernetes or local |
| `dx shell <service>` | Execute interactive shell in pod | Kubernetes |
| `dx open <service>` | Open service URL or port-forward | Kubernetes |

## Configuration Files

### `.dx/config.yaml` (Environments)

Defines Kubernetes environments and deployment settings:

```yaml
environments:
  local:
    kind: kubernetes
    kubeContext: kind-monocto-dev
    namespaceStrategy: per-user
    resourcesProfile: local

  dev:
    kind: kubernetes
    kubeContext: gke_monocto-dev_...
    namespaceStrategy: per-team
    resourcesProfile: dev

  prod:
    kind: kubernetes
    kubeContext: gke_monocto-prod_...
    namespaceStrategy: fixed
    resourcesProfile: prod
```

See: [config-reference.md](./config-reference.md)

### `.dx/kind-config.yaml` (Local Cluster)

Configures kind cluster for local development:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: monocto-dev
nodes:
  - role: control-plane
```

### `.dx/.state` (Active Environment)

Stores currently active environment:

```
local
```

Or set via environment variable:

```bash
export DX_ENV=local
```

## Workflows

### Local Development

```bash
# One-time setup
dx k8s init-local

# Set active environment
dx env use local

# Deploy service
dx deploy local account-api

# View logs
dx logs account-api --follow

# Access service
dx open account-api
```

### Multi-Environment Deployment

```bash
# List environments
dx env list

# Deploy to dev
dx env use dev
dx deploy dev account-api

# Deploy to prod
dx env use prod
dx deploy prod account-api

# Check where you are
dx env current
```

## Common Tasks

### Deploy a Service

```bash
dx deploy local account-api
```

### View Service Logs

```bash
# Last 50 lines
dx logs account-api

# Follow in real-time
dx logs account-api --follow
```

### Debug in Pod Shell

```bash
dx shell account-api
```

### Access Service in Browser

```bash
# Local: port-forward
# Remote: open ingress URL
dx open account-api
```

### Switch Environment

```bash
dx env use dev
dx env current  # verify
```

## Troubleshooting

### Kubernetes Context Not Found

```
✗ Kubernetes context 'kind-monocto-dev' not found on this system.
```

**Solution**: Initialize local cluster

```bash
dx k8s init-local
```

### Cluster Not Reachable

```
⚠ Cluster context exists but cluster is not reachable.
```

**Solution**: Restart the cluster

```bash
kind delete cluster --name monocto-dev
dx k8s init-local
```

### No Pods Found

```
✗ No pods found for service 'account-api' in namespace 'dev-alice'.
```

**Solution**: Deploy the service

```bash
dx deploy local account-api
```

### See More

Full troubleshooting guide: [GUIDE.md - Troubleshooting](./GUIDE.md#troubleshooting)

## Advanced Topics

### Namespace Strategies

- **fixed**: Single namespace (production)
- **per-user**: Developer isolation (development)
- **per-team**: Team-based (future)

See: [namespace-strategies.md](./namespace-strategies.md)

### Resource Profiles

Different resource settings for local/dev/prod:

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

See: [config-reference.md](./config-reference.md#resource-profiles)

### Architecture Deep Dive

Learn about:
- Module organization
- Data flow
- Design decisions
- Extension points
- Error handling
- Testing strategy

See: [architecture.md](./architecture.md)

## Getting Help

### Check Documentation

- **"How do I...?"** → [GUIDE.md](./GUIDE.md)
- **"What's this config option?"** → [config-reference.md](./config-reference.md)
- **"How do namespaces work?"** → [namespace-strategies.md](./namespace-strategies.md)
- **"How is this designed?"** → [architecture.md](./architecture.md)

### Command Help

```bash
dx env --help
dx k8s --help
dx deploy --help
dx logs --help
dx shell --help
dx open --help
```

### Verify Setup

```bash
# Check environments
dx env list

# Check current environment
dx env current

# Check cluster connectivity
kubectl cluster-info --context kind-monocto-dev
```

## Contributing

Found an issue or want to improve these docs? 

- Check [AGENTS.md](../../AGENTS.md) for contribution guidelines
- Update relevant documentation files
- Test commands end-to-end
- Update examples if behavior changes

## Future Enhancements

Planned features:

- [ ] Helm chart support for deployments
- [ ] Kustomize overlay support
- [ ] Multiple environment updates in one command
- [ ] Service mesh integration (Istio/Linkerd)
- [ ] Advanced scheduling (node affinity, taints)
- [ ] Canary/blue-green deployments
- [ ] Secret management integration

See: [architecture.md - Future Enhancements](./architecture.md#future-enhancements)

## References

- [Kubernetes Concepts](https://kubernetes.io/docs/concepts/)
- [kind Documentation](https://kind.sigs.k8s.io/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [ChessMate AGENTS.md](../../AGENTS.md)
