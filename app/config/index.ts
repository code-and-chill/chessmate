/**
 * Configuration System - Public API
 * Export all configuration utilities, hooks, and types
 *
 * Usage:
 * 1. Initialize at app startup:
 *    import { initializeConfiguration } from '@config'
 *    initializeConfiguration()
 *
 * 2. Wrap app with provider:
 *    import { ConfigProvider } from '@config'
 *    <ConfigProvider><App /></ConfigProvider>
 *
 * 3. Use hooks in components:
 *    import { useConfig, useFeatureFlag } from '@config'
 *    const config = useConfig()
 *    const mockApiEnabled = useFeatureFlag('mockApi')
 */

// Types
export type {
  Environment,
  LogLevel,
  ApiConfig,
  FeatureFlags,
  MonitoringConfig,
  SecurityConfig,
  RuntimeConfig,
  ConfigChangeEvent,
  ConfigValidator,
  ValidationResult,
} from './types';

// Environments
export { getConfigForEnvironment } from './environments';

// Store
export { ConfigStore, initializeConfigStore, getConfigStore } from './store';
export type { ConfigChangeListener } from './store';

// Initialization
export {
  initializeConfiguration,
  detectEnvironment,
  setEnvironmentOverride,
  getConfig,
  getApiConfig,
  getFeatureFlags,
  getMonitoringConfig,
  getSecurityConfig,
  isDevelopment,
  isProduction,
  isMockApiEnabled,
  getLogLevel,
  shouldLog,
} from './init';

// Validation
export { validateConfig, assertValidConfig } from './validator';

// React Integration
export {
  ConfigProvider,
  useConfig,
  useApiConfig,
  useFeatureFlag,
  useMockApi,
  useDevelopmentMode,
  useEnvironment,
  useMonitoring,
  useSecurity,
  useConfigChanges,
  useConfigValue,
  useFeatureEnabled,
  useApiUrl,
  useApiTimeout,
  useLogLevel,
  FeatureFlag,
  EnvironmentGate,
  DevOnly,
  ConfigDebug,
} from './hooks';

/**
 * Configuration system ready for use
 * Call initializeConfiguration() at app startup
 */
