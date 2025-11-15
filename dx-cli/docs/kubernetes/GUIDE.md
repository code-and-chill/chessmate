---
title: Kubernetes Deployment Guide
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: how-to
---

# Kubernetes Deployment with dx-cli

## Overview

`dx-cli` provides environment-aware Kubernetes deployment capabilities, allowing developers to deploy services to local development clusters (kind) or remote clusters (GKE/EKS) with a single command.

## Quick Start

### 1. Initialize Local Kubernetes Cluster

Set up a local kind-based cluster for development:

```bash
dx k8s init-local
```

This command:
- Checks for required tools (kind, kubectl, docker)
- Creates a kind cluster named `monocto-dev` (if not already created)
- Creates the development namespace (`dev-<username>`)
- Installs ingress-nginx controller
- Sets up storage provisioning

### 2. Select Active Environment

```bash
dx env use local
```

Verify the selection:

```bash
dx env current
```

### 3. Deploy a Service

```bash
dx deploy local account-api
```

Or deploy all services:

```bash
dx deploy local
```

### 4. View Logs

```bash
dx logs account-api --follow
```

### 5. Access the Service

```bash
dx open account-api
```

This will:
- For local environments: start a port-forward and open in browser
- For remote environments: generate an ingress URL

### 6. Connect to Pod Shell

```bash
dx shell account-api
```

This opens an interactive shell in the service's pod.

## Commands Reference

### Environment Management

#### `dx env list`

List all configured Kubernetes environments:

```bash
$ dx env list
Available Kubernetes Environments:

→ local        ✓ context: kind-monocto-dev namespace: dev-alice [active]
  dev          ? context: gke_monocto-dev_asia-southeast1 namespace: monocto-dev
  prod         ? context: gke_monocto-prod_asia-southeast1 namespace: monocto-prod

Current environment: local (stored in .dx/.state)
```

#### `dx env use <name>`

Activate an environment:

```bash
dx env use dev
```

This persists your choice in `.dx/.state` so subsequent commands use the same environment.

#### `dx env current`

Display current environment details:

```bash
$ dx env current

Environment: local
  Kind: kubernetes
  Kube Context: kind-monocto-dev
  Namespace: dev-alice
  Namespace Strategy: per-user
  Resources Profile: local
  Domain: monocto.local
  Description: Local development cluster using kind

✓ Cluster is reachable
```

### Kubernetes Management

#### `dx k8s init-local`

Initialize a local kind cluster for development:

```bash
dx k8s init-local
```

This is a one-time setup. Subsequent runs are idempotent - they'll reuse the existing cluster.

### Service Deployment

#### `dx deploy <env> [service]`

Deploy one or all services to a Kubernetes environment:

```bash
# Deploy specific service to local
dx deploy local account-api

# Deploy all services to local
dx deploy local

# Deploy to dev environment
dx deploy dev account-api

# Deploy to production (with caution!)
dx deploy prod account-api
```

The deploy command:
1. Validates the environment exists and context is reachable
2. Ensures the namespace exists
3. Generates Kubernetes manifests for the service
4. Applies manifests using `kubectl apply`
5. Reports deployment status

### Service Logs

#### `dx logs <service> [--follow] [--lines=N]`

Stream logs from a service:

```bash
# Show last 50 lines
dx logs account-api

# Follow logs in real-time
dx logs account-api --follow

# Show last 100 lines
dx logs account-api --lines=100

# Follow with specific service
dx logs account-api -f
```

When an active Kubernetes environment is set, `dx logs` automatically streams from the pod running in the cluster. Otherwise, it falls back to local logs (for development mode).

### Shell Access

#### `dx shell <service> [--cmd]`

Execute an interactive shell in a service pod:

```bash
# Open shell with default /bin/sh
dx shell account-api

# Use bash instead
dx shell account-api --cmd /bin/bash

# Run a specific command
dx shell account-api --cmd "/bin/sh -c 'ls -la'"
```

This is useful for:
- Debugging pod issues
- Inspecting environment variables
- Running manual operations
- Checking logs from inside the pod

### Service Access

#### `dx open <service> [--port] [--no-open] [--port-forward]`

Open a service in your browser or start port-forwarding:

```bash
# For local environment (uses port-forward)
dx open account-api

# Specify custom local port
dx open account-api --port 9000

# Print URL instead of opening browser
dx open account-api --no-open

# Force port-forward instead of ingress URL
dx open account-api --port-forward

# For remote environment with ingress
dx open account-api
# Opens: http://account-api.dev.monocto.com
```

Behavior depends on environment:
- **Local**: Sets up port-forward on localhost (default 8080)
- **Remote with domain**: Generates ingress URL
- **Remote without domain**: Falls back to port-forward

## Configuration

### .dx/config.yaml

The configuration file at `.dx/config.yaml` defines all Kubernetes environments and deployment settings:

```yaml
environments:
  local:
    kind: kubernetes
    kubeContext: kind-monocto-dev
    namespaceStrategy: per-user
    defaultNamespace: dev
    domain: monocto.local
    resourcesProfile: local
    kindCluster:
      name: monocto-dev
      config: kind-config.yaml

  dev:
    kind: kubernetes
    kubeContext: gke_monocto-dev_asia-southeast1
    namespaceStrategy: per-team
    defaultNamespace: monocto-dev
    domain: dev.monocto.com
    resourcesProfile: dev

  prod:
    kind: kubernetes
    kubeContext: gke_monocto-prod_asia-southeast1
    namespaceStrategy: fixed
    defaultNamespace: monocto-prod
    domain: monocto.com
    resourcesProfile: prod
```

### Namespace Strategies

The `namespaceStrategy` field determines how namespaces are derived:

#### `fixed`

Uses a fixed namespace for all deployments:

```yaml
namespaceStrategy: fixed
defaultNamespace: monocto-prod
# Result: namespace = "monocto-prod"
```

#### `per-user`

Creates a namespace per developer:

```yaml
namespaceStrategy: per-user
defaultNamespace: dev
# Result: namespace = "dev-alice" (from $USER or git config)
```

The username comes from:
1. `git config user.name`
2. `$USER` environment variable
3. OS username

Usernames are sanitized to k8s naming rules (lowercase, alphanumeric + hyphens).

#### `per-team`

Creates a namespace per team (future-ready):

```yaml
namespaceStrategy: per-team
defaultNamespace: monocto-dev
# Result: namespace = "monocto-dev" (fallback; team lookup TBD)
```

### Resource Profiles

Resource profiles control CPU/memory/replicas based on environment:

```yaml
resourceProfiles:
  local:
    cpu: "100m"
    memory: "128Mi"
    replicas: 1
    hpa:
      enabled: false

  dev:
    cpu: "250m"
    memory: "256Mi"
    replicas: 2
    hpa:
      enabled: true
      minReplicas: 1
      maxReplicas: 5
      targetCPUUtilization: 70

  prod:
    cpu: "500m"
    memory: "512Mi"
    replicas: 3
    hpa:
      enabled: true
      minReplicas: 2
      maxReplicas: 10
      targetCPUUtilization: 70
```

### Kind Cluster Configuration

The local kind cluster is configured via `.dx/kind-config.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: monocto-dev

nodes:
  - role: control-plane
    image: kindest/node:v1.28.0
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        listenAddress: "127.0.0.1"

networking:
  apiServerAddress: "127.0.0.1"
  podSubnet: "10.244.0.0/16"
  serviceSubnet: "10.96.0.0/12"
```

## Troubleshooting

### Error: Context not found

```
✗ Kubernetes context 'kind-monocto-dev' not found on this system.
```

**Solution**: Initialize the local cluster:

```bash
dx k8s init-local
```

Or verify your kubeconfig:

```bash
kubectl config get-contexts
```

### Error: Cluster not reachable

```
⚠ Cluster context exists but cluster is not reachable.
```

**Solution**: 

For local environments:
```bash
# Check if kind cluster is running
kind get clusters

# Restart the cluster
kind delete cluster --name monocto-dev
dx k8s init-local
```

For remote environments:
```bash
# Verify kubeconfig
kubectl config view

# Test connectivity
kubectl cluster-info
```

### Error: No pods found

```
✗ No pods found for service 'account-api' in namespace 'dev-alice'.
```

**Solution**: Deploy the service first:

```bash
dx deploy local account-api
```

Then check deployment status:

```bash
kubectl get deployments -n dev-alice
kubectl get pods -n dev-alice -l app=account-api
```

### Docker image not found

If deploy fails with image pull errors, ensure the image is built:

```bash
# Build Docker image locally
docker build -t monocto/account-api:latest services/account-api

# Load into kind cluster
kind load docker-image monocto/account-api:latest --name monocto-dev
```

## Advanced Usage

### Custom Port-Forward

```bash
# Forward local port 9000 to service port 8080
dx open account-api --port 9000
```

### Direct kubectl Access

You can always fall back to kubectl for advanced operations:

```bash
# Get all pods in your namespace
kubectl get pods -n dev-alice --context kind-monocto-dev

# Describe a deployment
kubectl describe deploy account-api -n dev-alice --context kind-monocto-dev

# View events
kubectl get events -n dev-alice --context kind-monocto-dev
```

### Environment Variables

Control dx-cli behavior via environment variables:

```bash
# Force specific environment
export DX_ENV=dev

# Set log level
export DX_LOG_LEVEL=debug
```

## Best Practices

1. **Use per-user namespaces for development**: Allows developers to work independently without conflicts

2. **Always verify environment before deployment**:
   ```bash
   dx env current
   ```

3. **Use `--follow` for logs during development**:
   ```bash
   dx logs account-api --follow
   ```

4. **Start with local environment**: Get comfortable with local K8s before deploying to dev/prod

5. **Clean up port-forwards**: Press Ctrl+C to stop `dx open` port-forwards

6. **Use kubectl for complex operations**: dx-cli covers common cases; kubectl is always available for advanced tasks

## Examples

### Full Development Workflow

```bash
# One-time setup
dx k8s init-local

# Start development
dx env use local
dx deploy local account-api

# Monitor service
dx logs account-api --follow

# In another terminal, access the service
dx open account-api

# If needed, debug in the pod
dx shell account-api
```

### Multi-Service Deployment

```bash
# Set active environment
dx env use local

# Deploy everything
dx deploy local

# Check all services
kubectl get pods -n dev-alice --context kind-monocto-dev

# Follow logs for a specific service
dx logs live-game-api --follow
```

### Deploying to Remote Cluster

```bash
# Set environment
dx env use dev

# Verify you're targeting the right cluster
dx env current

# Deploy
dx deploy dev account-api

# Access via ingress
dx open account-api
# Opens: http://account-api.dev.monocto.com
```

## See Also

- [Environment Configuration](./environment-configuration.md)
- [Manifest Rendering](./manifest-rendering.md)
- [Namespace Strategies](./namespace-strategies.md)
