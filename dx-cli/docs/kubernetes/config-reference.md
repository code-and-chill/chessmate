---
title: Kubernetes Configuration Reference
service: dx-cli
status: active
last_reviewed: 2025-11-15
type: reference
---

# .dx/config.yaml Reference

Complete reference for the Kubernetes environment configuration file at `.dx/config.yaml`.

## File Structure

```yaml
version: "1.0"
kind: "k8s-environments"
description: "Optional description"

environments:
  <env-name>:
    # Environment configuration
    ...

resourceProfiles:
  local: { ... }
  dev: { ... }
  prod: { ... }

namespaceStrategies:
  # Informational; actual logic is built-in
  fixed: { ... }
  per-user: { ... }
  per-team: { ... }

imageRegistry:
  name: string

ingress:
  local: { ... }
  dev: { ... }
  prod: { ... }

storage:
  local: { ... }
  dev: { ... }
  prod: { ... }

state:
  backend: "file" | "env"
  filePath: string

features:
  portForwarding: boolean
  ingressURLGeneration: boolean
  autoNamespaceCreation: boolean
  helmDeployment: boolean
```

## Top-Level Fields

### `version`

Configuration schema version.

**Type**: string  
**Required**: yes  
**Example**: `"1.0"`

### `kind`

Configuration type. Must be `k8s-environments`.

**Type**: string (enum)  
**Required**: yes  
**Example**: `"k8s-environments"`

### `description`

Human-readable description of this configuration.

**Type**: string  
**Required**: no  
**Example**: `"Kubernetes environments for ChessMate"`

## Environments

Each environment under `environments.<name>` defines a Kubernetes cluster and deployment strategy.

### Environment Configuration

```yaml
environments:
  local:
    kind: kubernetes
    kubeContext: kind-monocto-dev
    namespaceStrategy: per-user
    defaultNamespace: dev
    domain: monocto.local
    resourcesProfile: local
    description: "Local development cluster"
    kindCluster:
      name: monocto-dev
      config: kind-config.yaml
```

#### `kind` (required)

Environment type. Currently only `kubernetes` is supported.

**Type**: string (enum: `kubernetes`)  
**Example**: `kubernetes`

#### `kubeContext` (required)

Name of the kubectl context to use for this environment.

**Type**: string  
**Example**: `kind-monocto-dev` or `gke_monocto-dev_asia-southeast1`  
**Must match**: Output of `kubectl config get-contexts`

#### `namespaceStrategy` (required)

Strategy for deriving namespace names.

**Type**: string (enum: `fixed`, `per-user`, `per-team`)

- `fixed`: Use `defaultNamespace` as-is
- `per-user`: Derive from OS user (format: `dev-<username>`)
- `per-team`: Currently falls back to `defaultNamespace`

**Example**: `per-user`

#### `defaultNamespace` (optional)

Default namespace name used when:
- `namespaceStrategy: fixed` (always used)
- `namespaceStrategy: per-user` (used as prefix, e.g., `dev-alice`)
- `namespaceStrategy: per-team` (fallback if team not found)

**Type**: string  
**Example**: `dev` or `monocto-prod`  
**Kubernetes rules**:
- 3-63 characters
- Lowercase alphanumeric + hyphens
- Start/end with alphanumeric

#### `domain` (optional)

Base domain for ingress URLs. Used by `dx open` to generate service URLs.

**Type**: string  
**Example**: `monocto.local` or `dev.monocto.com`

**URL Format**:
- Simple: `http://<service>.<domain>`
- With namespace: `http://<service>.<namespace>.<domain>`

#### `resourcesProfile` (required)

Reference to a resource profile (cpu, memory, replicas, HPA settings).

**Type**: string  
**Example**: `local`, `dev`, `prod`

**Must reference**: A profile defined in `resourceProfiles` section

#### `description` (optional)

Human-readable description of the environment.

**Type**: string  
**Example**: `"Local development cluster using kind"`

#### `kindCluster` (optional, local only)

Kind-specific configuration for local clusters.

**Type**: object  
**Required for**: Local environments using `dx k8s init-local`

```yaml
kindCluster:
  name: monocto-dev              # Kind cluster name
  config: kind-config.yaml       # Path relative to .dx/
```

**Fields**:
- `name` (string): Kind cluster name (used in `kind get clusters`)
- `config` (string, optional): Path to kind config file relative to `.dx/`

## Resource Profiles

Define resource requests, limits, and scaling for different environments.

### Profile Structure

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

### Profile Fields

#### `cpu`

CPU request and limit for containers.

**Type**: string (Kubernetes quantity)  
**Examples**: `100m`, `250m`, `500m`, `1`, `2`  
**Format**: Millicores (m) or cores (number)

#### `memory`

Memory request and limit for containers.

**Type**: string (Kubernetes quantity)  
**Examples**: `128Mi`, `256Mi`, `512Mi`, `1Gi`, `2Gi`  
**Format**: Bytes, with unit suffix (M, Mi, G, Gi, etc.)

#### `replicas`

Default number of pod replicas.

**Type**: integer  
**Examples**: `1`, `2`, `3`

#### `hpa`

Horizontal Pod Autoscaler configuration.

**Type**: object

```yaml
hpa:
  enabled: boolean
  minReplicas: integer (optional)
  maxReplicas: integer (optional)
  targetCPUUtilization: number (optional, 0-100)
```

**Fields**:
- `enabled`: Enable/disable HPA for this profile
- `minReplicas`: Minimum replicas when scaling down (default: 1)
- `maxReplicas`: Maximum replicas when scaling up (default: 10)
- `targetCPUUtilization`: Target CPU utilization percentage (default: 70)

## Image Registry

Docker image registry configuration.

```yaml
imageRegistry:
  name: monocto
```

### Fields

#### `name` (required)

Registry name or organization name.

**Type**: string  
**Example**: `monocto` (for Docker Hub), `gcr.io/my-project` (for GCR)

**Image Format**:
- Docker Hub: `monocto/<service>:<tag>`
- GCR: `gcr.io/my-project/<service>:<tag>`

## Ingress Configuration

Ingress settings for different environments.

```yaml
ingress:
  local:
    enabled: false

  dev:
    enabled: true
    className: "nginx"
    annotations:
      cert-manager.io/cluster-issuer: "letsencrypt-staging"

  prod:
    enabled: true
    className: "nginx"
    annotations:
      cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

### Fields

#### `enabled` (required)

Enable/disable ingress for this environment.

**Type**: boolean

#### `className` (optional)

Kubernetes ingress class name.

**Type**: string  
**Common values**: `nginx`, `gce`, `alb`, `istio`  
**Default**: `nginx`

#### `annotations` (optional)

Additional Kubernetes annotations for ingress resources.

**Type**: object (string keys and values)

**Common annotations**:
```yaml
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
  nginx.ingress.kubernetes.io/rate-limit: "100"
  nginx.ingress.kubernetes.io/ssl-redirect: "true"
```

## Storage Configuration

Storage provisioner settings for different environments.

```yaml
storage:
  local:
    provisioner: "rancher.io/local-path"
    class: "local-path"

  dev:
    provisioner: "kubernetes.io/gce-pd"
    class: "standard"

  prod:
    provisioner: "kubernetes.io/gce-pd"
    class: "premium-rwo"
```

### Fields

#### `provisioner` (required)

Storage provisioner plugin.

**Type**: string  
**Common values**:
- `rancher.io/local-path` (local, kind)
- `kubernetes.io/gce-pd` (GKE)
- `ebs.csi.aws.com` (EKS)

#### `class` (required)

Storage class name.

**Type**: string  
**Examples**: `local-path`, `standard`, `premium-rwo`, `fast`

## State Management

Configuration for persisting the active environment selection.

```yaml
state:
  backend: file
  filePath: ".dx/.state"
```

### Fields

#### `backend` (required)

State storage backend.

**Type**: string (enum: `file`, `env`)

- `file`: Store active environment in a file
- `env`: Read from `DX_ENV` environment variable

#### `filePath` (optional, file backend only)

Path to state file, relative to monorepo root.

**Type**: string  
**Default**: `.dx/.state`

**Example**: `.dx/.state`

## Features

Feature flags for optional functionality.

```yaml
features:
  portForwarding: true              # Enable dx open port-forward
  ingressURLGeneration: true        # Generate ingress URLs
  autoNamespaceCreation: true       # Auto-create namespaces
  helmDeployment: false             # Helm-based deployments (future)
```

### Fields

All fields are boolean. Set to `true` to enable, `false` to disable.

**Supported features**:

- `portForwarding`: Allow `dx open` to setup port-forwards
- `ingressURLGeneration`: Generate ingress-based URLs
- `autoNamespaceCreation`: Automatically create namespaces on deploy
- `helmDeployment`: Use Helm for deployments (not yet implemented)

## Complete Example

```yaml
---
version: "1.0"
kind: "k8s-environments"
description: "ChessMate Kubernetes deployment configuration"

environments:
  local:
    kind: kubernetes
    kubeContext: kind-monocto-dev
    namespaceStrategy: per-user
    defaultNamespace: dev
    domain: monocto.local
    resourcesProfile: local
    description: "Local development using kind"
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
    description: "GKE development environment"

  prod:
    kind: kubernetes
    kubeContext: gke_monocto-prod_asia-southeast1
    namespaceStrategy: fixed
    defaultNamespace: monocto-prod
    domain: monocto.com
    resourcesProfile: prod
    description: "GKE production environment"

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

imageRegistry:
  name: monocto

ingress:
  local:
    enabled: false

  dev:
    enabled: true
    className: "nginx"
    annotations:
      cert-manager.io/cluster-issuer: "letsencrypt-staging"

  prod:
    enabled: true
    className: "nginx"
    annotations:
      cert-manager.io/cluster-issuer: "letsencrypt-prod"

storage:
  local:
    provisioner: "rancher.io/local-path"
    class: "local-path"

  dev:
    provisioner: "kubernetes.io/gce-pd"
    class: "standard"

  prod:
    provisioner: "kubernetes.io/gce-pd"
    class: "premium-rwo"

state:
  backend: file
  filePath: ".dx/.state"

features:
  portForwarding: true
  ingressURLGeneration: true
  autoNamespaceCreation: true
  helmDeployment: false
```

## Validation

The configuration is validated against the schema when `dx` commands load it. Validation errors include:

- Missing required fields
- Invalid enum values
- Type mismatches
- Invalid Kubernetes identifiers

**Example error**:

```
Failed to load K8s configuration: Invalid environment 'prod': 
  namespaceStrategy must be one of: fixed, per-user, per-team
```

## Best Practices

1. **Always include descriptions**: Help team members understand each environment
2. **Use meaningful context names**: Include region/cluster info (e.g., `gke_monocto-prod_us-central1`)
3. **Match profiles to cluster capacity**: Ensure profiles don't exceed node resources
4. **Use fixed namespaces for production**: Avoid per-user strategy in prod
5. **Document custom annotations**: Explain any special ingress/storage configs
6. **Version your config**: Track changes in git
7. **Test new configurations**: Verify with `dx env list` before deploying
