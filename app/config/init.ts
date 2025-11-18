/**
 * Runtime Configuration Initialization
 * Detects environment and initializes configuration at app startup
 */

import type { RuntimeConfig, Environment, LogLevel } from './types';
import { getConfigForEnvironment } from './environments';
import { validateConfig, assertValidConfig } from './validator';
import { initializeConfigStore } from './store';

/**
 * Build-time environment variable
 * Set during build via BUILD_ENV environment variable
 */
const BUILD_ENV = process.env.BUILD_ENV as Environment | undefined;

/**
 * Runtime override (for testing/development)
 */
let runtimeEnvironmentOverride: Environment | null = null;

/**
 * Detect current environment
 * Priority: runtime override > BUILD_ENV > default to 'local'
 */
export const detectEnvironment = (): Environment => {
  if (runtimeEnvironmentOverride) {
    return runtimeEnvironmentOverride;
  }

  if (BUILD_ENV && isValidEnvironment(BUILD_ENV)) {
    return BUILD_ENV;
  }

  // Default to local for development
  return 'local';
};

/**
 * Validate environment string
 */
const isValidEnvironment = (env: string): env is Environment => {
  return ['local', 'development', 'staging', 'production'].includes(env);
};

/**
 * Set runtime environment override (for testing)
 */
export const setEnvironmentOverride = (env: Environment | null): void => {
  runtimeEnvironmentOverride = env;
};

/**
 * Initialize configuration system
 * Must be called once at app startup before any other initialization
 *
 * @throws {Error} If environment is invalid or configuration is missing
 */
export const initializeConfiguration = (): RuntimeConfig => {
  const environment = detectEnvironment();

  // Log detected environment
  if (__DEV__) {
    console.log(`[Config] Detected environment: ${environment}`);
  }

  // Get environment configuration
  const config = getConfigForEnvironment(environment);
  if (!config) {
    throw new Error(
      `[Config] No configuration found for environment: ${environment}`
    );
  }

  // Validate configuration
  const validation = validateConfig(config);

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('[Config] Initialization warnings:', validation.warnings);
  }

  // Fail on errors
  if (!validation.valid) {
    throw new Error(
      `[Config] Configuration validation failed: ${validation.errors.join('; ')}`
    );
  }

  // Initialize store
  const store = initializeConfigStore(config);

  if (__DEV__) {
    console.log('[Config] Configuration initialized successfully');
    console.log('[Config] Configuration:', {
      environment: config.environment,
      debug: config.debug,
      logLevel: config.logLevel,
      mockApi: config.features.mockApi,
    });
  }

  return config;
};

/**
 * Get current configuration
 * Requires initializeConfiguration to be called first
 */
export const getConfig = (): RuntimeConfig => {
  const { getConfigStore } = require('./store');
  return getConfigStore().getConfig();
};

/**
 * Get API configuration
 */
export const getApiConfig = () => {
  const { getConfigStore } = require('./store');
  return getConfigStore().get('api');
};

/**
 * Get feature flags
 */
export const getFeatureFlags = () => {
  const { getConfigStore } = require('./store');
  return getConfigStore().get('features');
};

/**
 * Get monitoring configuration
 */
export const getMonitoringConfig = () => {
  const { getConfigStore } = require('./store');
  return getConfigStore().get('monitoring');
};

/**
 * Get security configuration
 */
export const getSecurityConfig = () => {
  const { getConfigStore } = require('./store');
  return getConfigStore().get('security');
};

/**
 * Check if in development mode
 */
export const isDevelopment = (): boolean => {
  const { getConfigStore } = require('./store');
  const config = getConfigStore().getConfig();
  return config.debug === true;
};

/**
 * Check if in production mode
 */
export const isProduction = (): boolean => {
  const { getConfigStore } = require('./store');
  const config = getConfigStore().getConfig();
  return config.environment === 'production';
};

/**
 * Check if using mock API
 */
export const isMockApiEnabled = (): boolean => {
  const { getConfigStore } = require('./store');
  const config = getConfigStore().getConfig();
  return config.features.mockApi === true;
};

/**
 * Get log level
 */
export const getLogLevel = (): LogLevel => {
  const { getConfigStore } = require('./store');
  const config = getConfigStore().getConfig();
  return config.logLevel;
};

/**
 * Should log message at given level
 */
export const shouldLog = (level: LogLevel): boolean => {
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  const currentLevel = levels[getLogLevel()];
  const messageLevel = levels[level];

  return messageLevel >= currentLevel;
};
