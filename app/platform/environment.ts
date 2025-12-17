/**
 * Environment Configuration
 * Manages environment-specific settings and feature flags
 */

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  apiBaseUrl: string;
  websocketUrl: string;
  enableDevTools: boolean;
  enableLogging: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  apiTimeout: number;
  maxRetries: number;
}

/**
 * Get current environment
 */
export function getEnvironment(): Environment {
  // In a real app, this would check process.env or expo constants
  return __DEV__ ? 'development' : 'production';
}

/**
 * Environment configurations
 */
const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    environment: 'development',
    apiBaseUrl: 'http://localhost:8000',
    websocketUrl: 'ws://localhost:8002/api/v1/ws',  // live-game-api WebSocket endpoint
    enableDevTools: true,
    enableLogging: true,
    enableAnalytics: false,
    enableErrorReporting: false,
    apiTimeout: 30000,
    maxRetries: 3,
  },
  staging: {
    environment: 'staging',
    apiBaseUrl: 'https://staging-api.chessmate.com',
    websocketUrl: 'wss://staging-api.chessmate.com/api/v1/ws',  // live-game-api WebSocket endpoint
    enableDevTools: true,
    enableLogging: true,
    enableAnalytics: true,
    enableErrorReporting: true,
    apiTimeout: 15000,
    maxRetries: 3,
  },
  production: {
    environment: 'production',
    apiBaseUrl: 'https://api.chessmate.com',
    websocketUrl: 'wss://api.chessmate.com/api/v1/ws',  // live-game-api WebSocket endpoint
    enableDevTools: false,
    enableLogging: false,
    enableAnalytics: true,
    enableErrorReporting: true,
    apiTimeout: 10000,
    maxRetries: 2,
  },
};

/**
 * Get environment configuration
 */
export function getConfig(): EnvironmentConfig {
  return configs[getEnvironment()];
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  enableNewGameUI: boolean;
  enablePuzzleRush: boolean;
  enableTournaments: boolean;
  enableVoiceChat: boolean;
  enableAdvancedAnalysis: boolean;
}

/**
 * Get feature flags for current environment
 */
export function getFeatureFlags(): FeatureFlags {
  const env = getEnvironment();

  // In production, disable experimental features
  if (env === 'production') {
    return {
      enableNewGameUI: true,
      enablePuzzleRush: true,
      enableTournaments: false,
      enableVoiceChat: false,
      enableAdvancedAnalysis: false,
    };
  }

  // In development/staging, enable all features
  return {
    enableNewGameUI: true,
    enablePuzzleRush: true,
    enableTournaments: true,
    enableVoiceChat: true,
    enableAdvancedAnalysis: true,
  };
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}
