/**
 * Configuration Validator (Single Responsibility)
 * Validates runtime configurations for correctness and consistency
 */

import type { RuntimeConfig, ValidationResult, ConfigValidator } from './types';

/**
 * Validates API configuration
 */
const validateApiConfig = (api: RuntimeConfig['api']): string[] => {
  const errors: string[] = [];

  if (!api.baseUrl) {
    errors.push('API baseUrl is required');
  } else if (!api.baseUrl.startsWith('http')) {
    errors.push('API baseUrl must be a valid HTTP(S) URL');
  }

  if (api.timeout < 1000) {
    errors.push('API timeout must be at least 1000ms');
  }

  if (api.retries < 0) {
    errors.push('API retries must be non-negative');
  }

  if (api.retryDelay < 0) {
    errors.push('API retryDelay must be non-negative');
  }

  return errors;
};

/**
 * Validates feature flags
 */
const validateFeatureFlags = (features: RuntimeConfig['features']): string[] => {
  const errors: string[] = [];

  if (typeof features.experimentalFeatures !== 'boolean') {
    errors.push('experimentalFeatures must be boolean');
  }
  if (typeof features.mockApi !== 'boolean') {
    errors.push('mockApi must be boolean');
  }
  if (typeof features.analyticsEnabled !== 'boolean') {
    errors.push('analyticsEnabled must be boolean');
  }

  return errors;
};

/**
 * Validates monitoring configuration
 */
const validateMonitoringConfig = (monitoring: RuntimeConfig['monitoring']): string[] => {
  const errors: string[] = [];

  if (typeof monitoring.enabled !== 'boolean') {
    errors.push('monitoring.enabled must be boolean');
  }

  if (monitoring.samplingRate < 0 || monitoring.samplingRate > 1) {
    errors.push('monitoring.samplingRate must be between 0 and 1');
  }

  return errors;
};

/**
 * Validates security configuration
 */
const validateSecurityConfig = (security: RuntimeConfig['security']): string[] => {
  const errors: string[] = [];

  if (typeof security.enforceHttps !== 'boolean') {
    errors.push('security.enforceHttps must be boolean');
  }

  if (!['automatic', 'manual'].includes(security.tokenRefreshStrategy)) {
    errors.push("tokenRefreshStrategy must be 'automatic' or 'manual'");
  }

  if (security.tokenExpirationBuffer < 0) {
    errors.push('tokenExpirationBuffer must be non-negative');
  }

  return errors;
};

/**
 * Validates environment specification
 */
const validateEnvironment = (environment: string): string[] => {
  const validEnvironments = ['local', 'development', 'staging', 'production'];
  if (!validEnvironments.includes(environment)) {
    return [`environment must be one of: ${validEnvironments.join(', ')}`];
  }
  return [];
};

/**
 * Main configuration validator
 */
export const validateConfig: ConfigValidator = (config: RuntimeConfig): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate top-level properties
  errors.push(...validateEnvironment(config.environment));

  if (!config.version) {
    errors.push('version is required');
  }

  if (typeof config.debug !== 'boolean') {
    errors.push('debug must be boolean');
  }

  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logLevel)) {
    errors.push(`logLevel must be one of: ${validLogLevels.join(', ')}`);
  }

  // Validate nested configurations
  errors.push(...validateApiConfig(config.api));
  errors.push(...validateFeatureFlags(config.features));
  errors.push(...validateMonitoringConfig(config.monitoring));
  errors.push(...validateSecurityConfig(config.security));

  // Warnings
  if (config.environment === 'production' && config.debug) {
    warnings.push('Debug mode should be disabled in production');
  }

  if (config.environment === 'production' && config.features.experimentalFeatures) {
    warnings.push('Experimental features should be disabled in production');
  }

  if (config.environment === 'production' && !config.security.enforceHttps) {
    warnings.push('HTTPS enforcement should be enabled in production');
  }

  if (config.environment === 'production' && !config.security.certificatePinning) {
    warnings.push('Certificate pinning should be enabled in production');
  }

  if (!config.features.errorTrackingEnabled && config.environment !== 'local') {
    warnings.push('Error tracking should be enabled outside of local development');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Assert configuration is valid
 */
export const assertValidConfig = (config: RuntimeConfig): void => {
  const result = validateConfig(config);
  if (!result.valid) {
    throw new Error(`Invalid configuration: ${result.errors.join(', ')}`);
  }
};
