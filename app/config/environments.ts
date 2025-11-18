/**
 * Environment-specific Configuration Definitions
 * Define concrete configurations for each environment
 */

import type { RuntimeConfig } from './types';

/**
 * Local development configuration
 * For local machine development with mocks
 */
export const LOCAL_CONFIG: RuntimeConfig = {
  environment: 'local',
  version: '0.1.0-dev',
  debug: true,
  logLevel: 'debug',
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  features: {
    experimentalFeatures: true,
    mockApi: true,
    analyticsEnabled: false,
    errorTrackingEnabled: false,
    offlineMode: true,
    verboseLogging: true,
  },
  monitoring: {
    enabled: false,
    samplingRate: 1,
  },
  security: {
    enforceHttps: false,
    tokenRefreshStrategy: 'manual',
    tokenExpirationBuffer: 300,
    certificatePinning: false,
  },
  metadata: {
    name: 'Local Development',
    description: 'Local machine with mock APIs',
  },
};

/**
 * Development environment configuration
 * For shared dev environment with real backend
 */
export const DEV_CONFIG: RuntimeConfig = {
  environment: 'development',
  version: '0.1.0-dev',
  debug: true,
  logLevel: 'info',
  api: {
    baseUrl: 'https://api-dev.chessmate.local',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  features: {
    experimentalFeatures: true,
    mockApi: false,
    analyticsEnabled: true,
    errorTrackingEnabled: true,
    offlineMode: true,
    verboseLogging: false,
  },
  monitoring: {
    enabled: true,
    endpoint: 'https://monitoring-dev.chessmate.local',
    samplingRate: 1,
  },
  security: {
    enforceHttps: true,
    tokenRefreshStrategy: 'automatic',
    tokenExpirationBuffer: 300,
    certificatePinning: false,
  },
  metadata: {
    name: 'Development',
    description: 'Shared development environment',
  },
};

/**
 * Staging environment configuration
 * For pre-production testing
 */
export const STAGING_CONFIG: RuntimeConfig = {
  environment: 'staging',
  version: '0.1.0',
  debug: false,
  logLevel: 'info',
  api: {
    baseUrl: 'https://api-staging.chessmate.io',
    timeout: 20000,
    retries: 2,
    retryDelay: 500,
  },
  features: {
    experimentalFeatures: false,
    mockApi: false,
    analyticsEnabled: true,
    errorTrackingEnabled: true,
    offlineMode: true,
    verboseLogging: false,
  },
  monitoring: {
    enabled: true,
    endpoint: 'https://monitoring.chessmate.io',
    samplingRate: 0.5,
  },
  security: {
    enforceHttps: true,
    tokenRefreshStrategy: 'automatic',
    tokenExpirationBuffer: 600,
    certificatePinning: true,
  },
  metadata: {
    name: 'Staging',
    description: 'Pre-production environment',
  },
};

/**
 * Production environment configuration
 * For live users
 */
export const PRODUCTION_CONFIG: RuntimeConfig = {
  environment: 'production',
  version: '0.1.0',
  debug: false,
  logLevel: 'warn',
  api: {
    baseUrl: 'https://api.chessmate.io',
    timeout: 15000,
    retries: 1,
    retryDelay: 500,
  },
  features: {
    experimentalFeatures: false,
    mockApi: false,
    analyticsEnabled: true,
    errorTrackingEnabled: true,
    offlineMode: true,
    verboseLogging: false,
  },
  monitoring: {
    enabled: true,
    endpoint: 'https://monitoring.chessmate.io',
    samplingRate: 0.1,
  },
  security: {
    enforceHttps: true,
    tokenRefreshStrategy: 'automatic',
    tokenExpirationBuffer: 900,
    certificatePinning: true,
  },
  metadata: {
    name: 'Production',
    description: 'Live production environment',
    isProduction: true,
  },
};

/**
 * Configuration registry
 * Maps environment to configuration
 */
export const CONFIG_REGISTRY: Record<string, RuntimeConfig> = {
  local: LOCAL_CONFIG,
  development: DEV_CONFIG,
  staging: STAGING_CONFIG,
  production: PRODUCTION_CONFIG,
};

/**
 * Get configuration for environment
 */
export const getConfigForEnvironment = (environment: string): RuntimeConfig | null => {
  return CONFIG_REGISTRY[environment] || null;
};
