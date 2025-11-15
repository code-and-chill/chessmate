---
title: Kubernetes Quickstart
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: how-to
---

# Kubernetes Quickstart

Get up and running with local Kubernetes in under 5 minutes.

## Prerequisites

- **Docker** - Must be running
- **kubectl** - Kubernetes CLI
- **kind** - Kubernetes in Docker (auto-installed if missing)

## Quick Setup

### 1. Install kind (if needed)

```bash
# Linux/macOS
mkdir -p "$HOME/.local/bin"
curl -fsSL -o "$HOME/.local/bin/kind" https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
chmod +x "$HOME/.local/bin/kind"
export PATH="$HOME/.local/bin:$PATH"

# Add to shell profile for persistence
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### 2. Initialize Local Cluster

```bash
./dx-cli/bin/dx k8s init-local
```

This will:
- Create a kind cluster named `monocto-dev`
- Install ingress-nginx controller
- Create your personal namespace (`dev-<username>`)
- Set up kubectl context

### 3. Set Active Environment

```bash
./dx-cli/bin/dx env use local
./dx-cli/bin/dx env current
```

## Deploy a Service

### Option A: Quick Test with Placeholder Image

Use a prebuilt nginx image for fast testing:

```bash
# Get current git SHA
SHA=$(git rev-parse --short HEAD)

# Pull and tag a test image
docker pull nginxinc/nginx-unprivileged:stable-alpine
docker tag nginxinc/nginx-unprivileged:stable-alpine monocto/account-api:$SHA

# Load into kind cluster
kind load docker-image monocto/account-api:$SHA --name monocto-dev

# Deploy to Kubernetes
./dx-cli/bin/dx deploy local account-api --image monocto/account-api:$SHA
```

### Option B: Build and Deploy Real Service

Build your service Docker image and deploy it:

```bash
./dx-cli/bin/dx deploy local account-api --build
```

This will:
- Build the Docker image using the service's Dockerfile
- Tag it as `monocto/<service>:<git-sha>`
- Load the image into the kind cluster
- Deploy to your namespace

**Note:** If the build fails (e.g., missing dependencies), use Option A as a fallback.

## Access Your Service

### View Logs

```bash
# Recent logs
./dx-cli/bin/dx logs account-api --lines 50

# Follow logs in real-time
./dx-cli/bin/dx logs account-api -f
```

### Access via Port-Forward

Open the service in your browser or via curl:

```bash
# Start port-forward (blocks, press Ctrl+C to stop)
./dx-cli/bin/dx open account-api

# Or just print URL without opening browser
./dx-cli/bin/dx open account-api --no-open
```

In another terminal:

```bash
curl http://localhost:8080
curl -I http://localhost:8080  # Headers only
```

### Shell into Pod

```bash
./dx-cli/bin/dx shell account-api

# Or specify command
./dx-cli/bin/dx shell account-api --cmd /bin/bash
```

## Common Commands

```bash
# List available environments
./dx-cli/bin/dx env list

# Switch environment
./dx-cli/bin/dx env use dev

# Check current environment
./dx-cli/bin/dx env current

# Deploy all services
./dx-cli/bin/dx deploy local

# Deploy specific service
./dx-cli/bin/dx deploy local account-api

# Override image tag
./dx-cli/bin/dx deploy local account-api --image monocto/account-api:v1.2.3

# Build and deploy
./dx-cli/bin/dx deploy local account-api --build
```

## Troubleshooting

### Port Forward Fails

If port-forward fails, check if the service exists:

```bash
kubectl --context kind-monocto-dev get svc -n dev-<username>
```

### Pod Not Starting

Check pod status and events:

```bash
kubectl --context kind-monocto-dev get pods -n dev-<username>
kubectl --context kind-monocto-dev describe pod <pod-name> -n dev-<username>
```

### Image Not Found

Make sure the image is loaded into kind:

```bash
docker images | grep monocto
kind load docker-image monocto/account-api:<tag> --name monocto-dev
```

### Cluster Not Reachable

Verify cluster status:

```bash
kubectl cluster-info --context kind-monocto-dev
kind get clusters
docker ps | grep monocto-dev
```

## Clean Up

### Delete Deployment

```bash
kubectl --context kind-monocto-dev delete deployment account-api -n dev-<username>
kubectl --context kind-monocto-dev delete svc account-api -n dev-<username>
```

### Delete Cluster

```bash
kind delete cluster --name monocto-dev
```

## Next Steps

- [Architecture Overview](./architecture.md) - Understand the K8s integration design
- [Configuration Reference](./config-reference.md) - Deep dive into `.dx/config.yaml`
- [Namespace Strategies](./namespace-strategies.md) - Learn about namespace isolation
- [Full Guide](./GUIDE.md) - Comprehensive deployment guide

## Video Walkthrough

*(Coming soon - screen recording of local K8s setup and deployment)*

## Related

- [dx-cli README](../../README.md) - CLI installation and setup
- [Service Development](../../../docs/standards/creating-new-service.md) - Creating new services
- [Docker Standards](../../../docs/standards/docker.md) - Docker best practices
