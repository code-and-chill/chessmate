# Configuration System - Documentation

## Overview

The chess-app configuration system provides **SOLID-principles-based**, **scalable**, **type-safe** runtime configuration management for switching between local, development, staging, and production environments.

**Key Features**:
- ✅ Type-safe configuration with TypeScript interfaces
- ✅ Four environment-specific configurations (local, dev, staging, prod)
- ✅ Validation with errors and warnings
- ✅ Observer pattern for configuration changes
- ✅ React hooks for component integration
- ✅ Singleton pattern for configuration state
- ✅ No external dependencies
- ✅ SOLID architecture principles

## Architecture

### Directory Structure

```
src/config/
├── index.ts                # Public API
├── types.ts               # Type definitions
├── environments.ts        # Environment configs
├── validator.ts          # Validation logic
├── store.ts              # Configuration state management
├── init.ts               # Initialization system
├── hooks.tsx             # React integration
├── testing.ts            # Testing utilities
├── INTEGRATION_GUIDE.ts  # Usage examples
└── README.md             # This file
```

### SOLID Architecture

#### Single Responsibility Principle (SRP)
Each module has a single, well-defined responsibility:
- `types.ts` - Define type contracts only
- `environments.ts` - Define environment configurations only
- `validator.ts` - Validate configurations only
- `store.ts` - Manage configuration state only
- `init.ts` - Initialize configuration system only
- `hooks.tsx` - Provide React integration only

#### Open/Closed Principle (OCP)
- New environments can be added to `environments.ts` without modifying other files
- New feature flags can be added to `FeatureFlags` interface
- New validators can be added without changing validation logic
- Configuration registry extensible for new environments

#### Liskov Substitution Principle (LSP)
All environment configurations implement the same `RuntimeConfig` interface, allowing substitution without affecting code.

#### Interface Segregation Principle (ISP)
Separate interfaces for different concerns:
- `ApiConfig` - API-specific settings
- `FeatureFlags` - Feature toggles
- `MonitoringConfig` - Monitoring settings
- `SecurityConfig` - Security settings
- Components import only what they need

#### Dependency Inversion Principle (DIP)
- Components depend on abstractions (React hooks), not implementations
- ConfigProvider abstracts ConfigStore implementation
- Listeners decouple configuration from observers
- No hard dependencies on concrete configuration

## Configuration Types

### Environment

```typescript
type Environment = 'local' | 'development' | 'staging' | 'production';
```

### API Configuration

```typescript
interface ApiConfig {
  baseUrl: string;          // e.g., "http://localhost:8000"
  timeout: number;          // Request timeout in ms
  retries: number;          // Number of retry attempts
  retryDelay: number;       // Delay between retries in ms
}
```

### Feature Flags

```typescript
interface FeatureFlags {
  experimentalFeatures: boolean;   // Enable experimental features
  mockApi: boolean;                // Use mock API instead of real
  analyticsEnabled: boolean;       // Track analytics events
  errorTrackingEnabled: boolean;   // Track errors
  offlineMode: boolean;            // Allow offline functionality
  verboseLogging: boolean;         // Enable verbose logging
}
```

### Monitoring Configuration

```typescript
interface MonitoringConfig {
  enabled: boolean;        // Enable monitoring
  endpoint: string;        // Monitoring service endpoint
  samplingRate: number;    // 0-1, percentage of events to sample
}
```

### Security Configuration

```typescript
interface SecurityConfig {
  enforceHttps: boolean;                    // Require HTTPS connections
  tokenRefreshStrategy: 'automatic' | 'manual'; // Token refresh mode
  tokenExpirationBuffer: number;            // Seconds before token expires
  certificatePinning: boolean;              // Enable certificate pinning
}
```

### Full Runtime Configuration

```typescript
interface RuntimeConfig {
  environment: Environment;
  version: string;
  debug: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  api: ApiConfig;
  features: FeatureFlags;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  metadata: {
    buildTime: string;
    buildNumber: string;
    commitHash: string;
  };
}
```

## Environment Configurations

### Local Development

```typescript
{
  environment: 'local',
  debug: true,
  logLevel: 'debug',
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 5000,
    retries: 3,
    retryDelay: 1000,
  },
  features: {
    mockApi: true,           // Use mocks
    analyticsEnabled: false, // Don't collect analytics
    errorTrackingEnabled: false,
    experimentalFeatures: true,
    offlineMode: true,
    verboseLogging: true,
  },
  security: {
    enforceHttps: false,
    certificatePinning: false,
  },
}
```

### Development

```typescript
{
  environment: 'development',
  debug: true,
  logLevel: 'info',
  api: {
    baseUrl: 'https://api-dev.chessmate.local',
    timeout: 5000,
    retries: 3,
    retryDelay: 1000,
  },
  features: {
    mockApi: false,          // Use real API
    analyticsEnabled: true,
    errorTrackingEnabled: true,
    experimentalFeatures: true,
    offlineMode: true,
    verboseLogging: false,
  },
  security: {
    enforceHttps: true,
    certificatePinning: false,
  },
  monitoring: {
    samplingRate: 1.0,       // Sample 100%
  },
}
```

### Staging

```typescript
{
  environment: 'staging',
  debug: false,
  logLevel: 'info',
  api: {
    baseUrl: 'https://api-staging.chessmate.io',
    timeout: 5000,
    retries: 3,
    retryDelay: 1000,
  },
  features: {
    mockApi: false,
    analyticsEnabled: true,
    errorTrackingEnabled: true,
    experimentalFeatures: false,
    offlineMode: false,
    verboseLogging: false,
  },
  security: {
    enforceHttps: true,
    certificatePinning: true,
  },
  monitoring: {
    samplingRate: 0.5,       // Sample 50%
  },
}
```

### Production

```typescript
{
  environment: 'production',
  debug: false,
  logLevel: 'warn',
  api: {
    baseUrl: 'https://api.chessmate.io',
    timeout: 5000,
    retries: 3,
    retryDelay: 1000,
  },
  features: {
    mockApi: false,
    analyticsEnabled: true,
    errorTrackingEnabled: true,
    experimentalFeatures: false,
    offlineMode: false,
    verboseLogging: false,
  },
  security: {
    enforceHttps: true,
    certificatePinning: true,
    tokenExpirationBuffer: 900, // 15 minutes
  },
  monitoring: {
    samplingRate: 0.1,       // Sample 10%
  },
}
```

## Usage

### 1. Initialization

Initialize configuration at app startup, **before** rendering React:

```typescript
import { initializeConfiguration, ConfigProvider } from '@config';

// Initialize first
const config = initializeConfiguration();

// Then render app with provider
export default function App() {
  return (
    <ConfigProvider>
      <Navigation />
    </ConfigProvider>
  );
}
```

### 2. Using Configuration in Components

#### Get Full Configuration

```typescript
import { useConfig } from '@config';

export const SettingsScreen: React.FC = () => {
  const config = useConfig();
  
  return (
    <>
      <Text>Environment: {config.environment}</Text>
      <Text>Version: {config.version}</Text>
    </>
  );
};
```

#### Use Feature Flags

```typescript
import { useMockApi, useFeatureFlag } from '@config';

export const GameScreen: React.FC = () => {
  const mockApiEnabled = useMockApi();
  const experimentalEnabled = useFeatureFlag('experimentalFeatures');
  
  if (mockApiEnabled) {
    // Use mock API
  } else {
    // Use real API
  }
};
```

#### Conditional Rendering

```typescript
import { FeatureFlag, EnvironmentGate } from '@config';

export const Dashboard: React.FC = () => {
  return (
    <>
      {/* Show feature only if flag enabled */}
      <FeatureFlag flag="experimentalFeatures">
        <ExperimentalFeature />
      </FeatureFlag>
      
      {/* Show content only in specific environment */}
      <EnvironmentGate env="development">
        <DebugPanel />
      </EnvironmentGate>
    </>
  );
};
```

#### Get Specific Configuration

```typescript
import { useApiUrl, useApiConfig, useEnvironment } from '@config';

export const ApiSetup: React.FC = () => {
  const baseUrl = useApiUrl();
  const apiConfig = useApiConfig();
  const environment = useEnvironment();
  
  return (
    <Text>Connecting to {baseUrl} in {environment}</Text>
  );
};
```

### 3. Environment Detection

Environment detection priority:
1. Runtime override (for testing): `setEnvironmentOverride('staging')`
2. Build-time `BUILD_ENV` environment variable
3. Default: `'local'`

```typescript
import { detectEnvironment, setEnvironmentOverride } from '@config';

// Automatic detection
const env = detectEnvironment();

// Manual override (for testing)
setEnvironmentOverride('staging');
```

### 4. Configuration Changes

Listen to configuration changes:

```typescript
import { useConfigChanges, useConfigValue } from '@config';

export const Monitor: React.FC = () => {
  // React on any change
  useConfigChanges((event) => {
    console.log(`${event.key} changed from ${event.previousValue} to ${event.newValue}`);
  });
  
  // Watch specific value
  const logLevel = useConfigValue('logLevel');
  useEffect(() => {
    console.log('Log level changed to:', logLevel);
  }, [logLevel]);
};
```

## Build-Time Configuration

### Set Environment at Build Time

```bash
# Local development
npm run dev                  # defaults to 'local'

# Development environment
BUILD_ENV=development npm run dev

# Staging environment  
BUILD_ENV=staging eas build --platform ios

# Production environment
BUILD_ENV=production eas build --platform ios --profile production
```

### Configure in package.json

```json
{
  "scripts": {
    "dev": "expo start",
    "dev:local": "BUILD_ENV=local expo start",
    "dev:staging": "BUILD_ENV=staging expo start",
    "build:dev": "eas build --platform ios --profile development",
    "build:staging": "BUILD_ENV=staging eas build --platform ios --profile staging",
    "build:prod": "BUILD_ENV=production eas build --platform ios --profile production"
  }
}
```

## Testing

### Create Test Configurations

```typescript
import { ConfigFactory, MockConfigStore } from '@config/testing';

// Use predefined environment
const stagingConfig = ConfigFactory.staging();

// Create minimal config
const minimalConfig = ConfigFactory.minimal();

// Create with all features enabled
const allFeaturesConfig = ConfigFactory.withAllFeaturesEnabled();

// Create with overrides
const customConfig = ConfigFactory.with({
  environment: 'development',
  debug: true,
});
```

### Test Components with Configuration

```typescript
import { render } from '@testing-library/react-native';
import { ConfigProvider } from '@config';
import { ConfigFactory } from '@config/testing';
import { MyComponent } from './MyComponent';

test('MyComponent shows debug info in development', () => {
  const devConfig = ConfigFactory.development();
  
  const { getByText } = render(
    <ConfigProvider initialConfig={devConfig}>
      <MyComponent />
    </ConfigProvider>
  );
  
  expect(getByText('Debug Mode')).toBeTruthy();
});
```

### Validate Configuration

```typescript
import { validateConfig, assertValidConfig } from '@config';

// Soft validation
const validation = validateConfig(myConfig);
if (validation.valid) {
  console.log('Config is valid');
} else {
  console.error('Errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}

// Hard validation (throws)
assertValidConfig(myConfig);
```

### Test Utilities

```typescript
import { configTestUtils, ConfigFactory } from '@config/testing';

// Generate report
const report = configTestUtils.generateReport(ConfigFactory.production());

// Verify production settings
const { valid, issues } = configTestUtils.verifyProduction(myConfig);

// Compare configurations
const { same, differences } = configTestUtils.compareConfigs(config1, config2);

// Get feature flag matrix across environments
const matrix = configTestUtils.getFeatureFlagMatrix('mockApi');
// { local: true, development: false, staging: false, production: false }
```

## Validation

Configuration is validated on initialization and any updates:

### Validation Checks

- **API URL**: Valid format (http/https)
- **Timeout**: ≥ 1000ms
- **Retries**: Non-negative integer
- **Retry Delay**: Non-negative integer
- **Feature Flags**: Boolean values
- **Monitoring**: Sampling rate 0-1
- **Environment**: Valid environment string
- **Token Strategy**: 'automatic' or 'manual'
- **Token Buffer**: Non-negative integer

### Validation Warnings (Production)

- Debug mode enabled
- Experimental features enabled
- HTTPS not enforced
- Certificate pinning not enabled
- Error tracking disabled

## Performance

- **Immutable configuration**: Safely use in React.memo
- **Efficient listeners**: Set-based listener management
- **Limited history**: Default 50 change entries
- **Memoized hooks**: Only re-render on relevant changes
- **No runtime dependencies**: Pure TypeScript

## Security

- **HTTPS enforcement**: Production requires HTTPS
- **Certificate pinning**: Available for production
- **Token management**: Configurable refresh strategy
- **Error tracking**: Controlled opt-in/out
- **Analytics**: Configurable sampling

## Troubleshooting

### Configuration not initialized

```
Error: ConfigStore not initialized. Call initializeConfigStore at app startup.
```

**Solution**: Call `initializeConfiguration()` before rendering app.

### useConfig outside provider

```
Error: useConfig must be used within ConfigProvider
```

**Solution**: Wrap app with `<ConfigProvider>` component.

### Invalid configuration

```
Error: Configuration validation failed: [error list]
```

**Solution**: Check configuration against environment requirements. Use `validateConfig()` for details.

### Environment not detected

```
Default: Falls back to 'local'
```

**Solution**: Set `BUILD_ENV` environment variable or use `setEnvironmentOverride()`.

## Next Steps

1. ✅ Integrate with API client initialization
2. ✅ Connect to analytics system
3. ✅ Set up error tracking
4. ✅ Implement certificate pinning
5. ✅ Add to monitoring dashboard
6. ✅ Create environment-specific build profiles

## References

- [INTEGRATION_GUIDE.ts](./INTEGRATION_GUIDE.ts) - Complete usage examples
- [types.ts](./types.ts) - Type definitions
- [testing.ts](./testing.ts) - Testing utilities
- [AGENTS.md](../../AGENTS.md) - Project guidelines
