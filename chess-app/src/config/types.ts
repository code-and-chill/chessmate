/**
 * Runtime Configuration Type Definitions
 * Defines the contract for all environment configurations
 */

/**
 * Application environments
 */
export type Environment = 'local' | 'development' | 'staging' | 'production';

/**
 * Logging levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * API endpoint configuration
 */
export interface ApiConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** API timeout in milliseconds */
  timeout: number;
  /** Number of retries for failed requests */
  retries: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
}

/**
 * Feature flags for conditional feature enablement
 */
export interface FeatureFlags {
  /** Enable experimental features */
  experimentalFeatures: boolean;
  /** Enable mock APIs */
  mockApi: boolean;
  /** Enable analytics */
  analyticsEnabled: boolean;
  /** Enable error tracking */
  errorTrackingEnabled: boolean;
  /** Enable offline-first mode */
  offlineMode: boolean;
  /** Enable detailed logging */
  verboseLogging: boolean;
}

/**
 * Analytics and monitoring configuration
 */
export interface MonitoringConfig {
  /** Enable analytics tracking */
  enabled: boolean;
  /** Analytics endpoint */
  endpoint?: string;
  /** Sampling rate (0-1) */
  samplingRate: number;
}

/**
 * Security and authentication configuration
 */
export interface SecurityConfig {
  /** Enable HTTPS/SSL enforcement */
  enforceHttps: boolean;
  /** Token refresh strategy */
  tokenRefreshStrategy: 'automatic' | 'manual';
  /** Token expiration buffer in seconds */
  tokenExpirationBuffer: number;
  /** Enable certificate pinning */
  certificatePinning: boolean;
}

/**
 * Complete runtime configuration
 */
export interface RuntimeConfig {
  /** Current environment */
  environment: Environment;
  /** Application version */
  version: string;
  /** Debug mode enabled */
  debug: boolean;
  /** Logging level */
  logLevel: LogLevel;
  /** API configuration */
  api: ApiConfig;
  /** Feature flags */
  features: FeatureFlags;
  /** Monitoring configuration */
  monitoring: MonitoringConfig;
  /** Security configuration */
  security: SecurityConfig;
  /** Environment-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  /** Changed property key */
  key: keyof RuntimeConfig;
  /** Previous value */
  previousValue: unknown;
  /** New value */
  newValue: unknown;
  /** Timestamp of change */
  timestamp: number;
}

/**
 * Configuration validator function
 */
export type ConfigValidator = (config: RuntimeConfig) => ValidationResult;

/**
 * Validation result
 */
export interface ValidationResult {
  /** Is configuration valid */
  valid: boolean;
  /** Error messages if invalid */
  errors: string[];
  /** Warning messages */
  warnings: string[];
}
