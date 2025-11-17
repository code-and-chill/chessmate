# Service Manifest Schema

The `service.yaml` file is a typed, versioned contract that defines the metadata, infrastructure, and operational details of a service. Below is the explanation of each field in the schema.

## Schema Fields

### `schemaVersion`
- **Type**: Integer
- **Description**: The version of the manifest schema. Required for validation and future migrations.

### `name`
- **Type**: String
- **Description**: The name of the service (e.g., `booking-api`).

### `domain`
- **Type**: String
- **Description**: The domain or bounded context the service belongs to (e.g., `booking`).

### `team`
- **Type**: String
- **Description**: The owning team (e.g., `bookings-core`).

### `path`
- **Type**: String
- **Description**: The relative path to the service in the repository (e.g., `services/booking-api`).

### `tech`
- **Type**: Object
- **Fields**:
  - `language`: The programming language (e.g., `kotlin`).
  - `framework`: The framework used (e.g., `spring-boot`).
  - `runtime`: The runtime version (e.g., `21`).

### `commands`
- **Type**: Object
- **Fields**:
  - `dev`: Command to start the service in development mode.
  - `test`: Command to run tests.
  - `build`: Command to build the service.
  - `lint`: Command to run linters.
  - `migrate`: Command to run database migrations.

### `infra`
- **Type**: Object
- **Fields**:
  - `port`: The port the service listens on.
  - `resources`: Resource allocation hints.
    - `cpu`: CPU allocation (e.g., `500m`).
    - `memory`: Memory allocation (e.g., `512Mi`).

### `dependencies`
- **Type**: Object
- **Fields**:
  - `services`: List of dependent services.
  - `databases`: List of required databases.
  - `caches`: List of required caches.

### `env`
- **Type**: Object
- **Fields**:
  - `local`: Local environment configuration.
    - `configFiles`: List of configuration files.
  - `dev`: Development environment configuration.
    - `baseUrl`: Base URL for the environment.
  - `stg`: Staging environment configuration.
    - `baseUrl`: Base URL for the environment.
  - `prod`: Production environment configuration.
    - `baseUrl`: Base URL for the environment.

### `docs`
- **Type**: Object
- **Fields**:
  - `overview`: Path to the service overview documentation.
  - `spec`: Path to the service specification.
  - `adrDir`: Path to the ADR directory.
  - `dashboards`: List of dashboard links.

### `tags`
- **Type**: Array of Strings
- **Description**: Tags to categorize the service (e.g., `critical-path`, `core-domain`).