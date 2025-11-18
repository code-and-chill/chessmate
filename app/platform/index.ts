/**
 * Platform Layer
 * Production-grade infrastructure for error handling, monitoring, security, and configuration
 */

// Error Boundary
export { ErrorBoundary } from './error-boundary';
export type { ErrorBoundaryProps } from './error-boundary';

// Monitoring
export { monitoring, useScreenTracking, usePerformanceTracking } from './monitoring';
export type { MonitoringConfig } from './monitoring';

// Security
export {
  isValidJWT,
  decodeJWT,
  isJWTExpired,
  sanitizeInput,
  isValidEmail,
  isValidUsername,
  validatePassword,
  STORAGE_KEYS,
  rateLimiter,
} from './security';
export type { PasswordStrength } from './security';

// Environment
export {
  getEnvironment,
  getConfig,
  getFeatureFlags,
  isFeatureEnabled,
} from './environment';
export type { Environment, EnvironmentConfig, FeatureFlags } from './environment';
