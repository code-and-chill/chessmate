/**
 * Configuration Testing Utilities
 * Helpers for testing components that use configuration system
 */

import type { RuntimeConfig, Environment } from './types';
import { LOCAL_CONFIG, DEV_CONFIG, STAGING_CONFIG, PRODUCTION_CONFIG } from './environments';
import { ConfigStore, initializeConfigStore } from './store';

/**
 * Factory for creating test configurations
 */
export class ConfigFactory {
  /**
   * Create config for specific environment
   */
  static forEnvironment(environment: Environment): RuntimeConfig {
    switch (environment) {
      case 'local':
        return structuredClone(LOCAL_CONFIG);
      case 'development':
        return structuredClone(DEV_CONFIG);
      case 'staging':
        return structuredClone(STAGING_CONFIG);
      case 'production':
        return structuredClone(PRODUCTION_CONFIG);
      default:
        throw new Error(`Unknown environment: ${environment}`);
    }
  }

  /**
   * Create minimal valid configuration
   */
  static minimal(): RuntimeConfig {
    return {
      environment: 'local',
      version: '1.0.0',
      debug: true,
      logLevel: 'debug',
      api: {
        baseUrl: 'http://localhost:8000',
        timeout: 5000,
        retries: 3,
        retryDelay: 1000,
      },
      features: {
        experimentalFeatures: false,
        mockApi: true,
        analyticsEnabled: false,
        errorTrackingEnabled: false,
        offlineMode: false,
        verboseLogging: false,
      },
      monitoring: {
        enabled: false,
        endpoint: '',
        samplingRate: 0,
      },
      security: {
        enforceHttps: false,
        tokenRefreshStrategy: 'automatic',
        tokenExpirationBuffer: 300,
        certificatePinning: false,
      },
      metadata: {
        buildTime: new Date().toISOString(),
        buildNumber: 'test',
        commitHash: 'test',
      },
    };
  }

  /**
   * Create configuration with overrides
   */
  static with(overrides: Partial<RuntimeConfig>): RuntimeConfig {
    return {
      ...ConfigFactory.minimal(),
      ...overrides,
    };
  }

  /**
   * Create mock configuration with all features enabled
   */
  static withAllFeaturesEnabled(): RuntimeConfig {
    const config = ConfigFactory.minimal();
    return {
      ...config,
      features: {
        experimentalFeatures: true,
        mockApi: true,
        analyticsEnabled: true,
        errorTrackingEnabled: true,
        offlineMode: true,
        verboseLogging: true,
      },
    };
  }

  /**
   * Create mock configuration with all features disabled
   */
  static withAllFeaturesDisabled(): RuntimeConfig {
    const config = ConfigFactory.minimal();
    return {
      ...config,
      features: {
        experimentalFeatures: false,
        mockApi: false,
        analyticsEnabled: false,
        errorTrackingEnabled: false,
        offlineMode: false,
        verboseLogging: false,
      },
    };
  }

  /**
   * Create configuration for production-like testing
   */
  static production(): RuntimeConfig {
    return ConfigFactory.forEnvironment('production');
  }

  /**
   * Create configuration for staging-like testing
   */
  static staging(): RuntimeConfig {
    return ConfigFactory.forEnvironment('staging');
  }

  /**
   * Create configuration for development testing
   */
  static development(): RuntimeConfig {
    return ConfigFactory.forEnvironment('development');
  }

  /**
   * Create configuration for local testing
   */
  static local(): RuntimeConfig {
    return ConfigFactory.forEnvironment('local');
  }
}

/**
 * Test wrapper for ConfigStore
 */
export class MockConfigStore extends ConfigStore {
  /**
   * Create mock store with test configuration
   */
  static create(config?: RuntimeConfig): MockConfigStore {
    const testConfig = config || ConfigFactory.minimal();
    return new MockConfigStore(testConfig);
  }

  /**
   * Get listener count (for testing)
   */
  getListenerCount(): number {
    return (this as any).listeners.size;
  }

  /**
   * Get change history length
   */
  getHistoryLength(): number {
    return this.getChangeHistory().length;
  }

  /**
   * Reset to initial state
   */
  reset(config?: RuntimeConfig): void {
    const testConfig = config || ConfigFactory.minimal();
    (this as any).currentConfig = structuredClone(testConfig);
    this.clearHistory();
  }
}

/**
 * Test utilities for configuration
 */
export const configTestUtils = {
  /**
   * Create and initialize config store for testing
   */
  initializeTestStore(config?: RuntimeConfig): ConfigStore {
    const testConfig = config || ConfigFactory.minimal();
    return initializeConfigStore(testConfig);
  },

  /**
   * Create snapshot of current configuration
   */
  snapshotConfig(config: RuntimeConfig): string {
    return JSON.stringify(config, null, 2);
  },

  /**
   * Compare two configurations
   */
  compareConfigs(
    config1: RuntimeConfig,
    config2: RuntimeConfig
  ): { same: boolean; differences: string[] } {
    const differences: string[] = [];

    // Compare all keys
    const allKeys = new Set([
      ...Object.keys(config1),
      ...Object.keys(config2),
    ]);

    allKeys.forEach((key) => {
      if (JSON.stringify(config1[key as keyof RuntimeConfig]) !==
          JSON.stringify(config2[key as keyof RuntimeConfig])) {
        differences.push(`${key}: ${JSON.stringify(config1[key as keyof RuntimeConfig])} != ${JSON.stringify(config2[key as keyof RuntimeConfig])}`);
      }
    });

    return {
      same: differences.length === 0,
      differences,
    };
  },

  /**
   * Verify configuration meets requirements
   */
  verifyProduction(config: RuntimeConfig): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (config.debug) {
      issues.push('Debug mode enabled in production');
    }

    if (config.features.mockApi) {
      issues.push('Mock API enabled in production');
    }

    if (config.features.experimentalFeatures) {
      issues.push('Experimental features enabled in production');
    }

    if (!config.security.enforceHttps) {
      issues.push('HTTPS not enforced in production');
    }

    if (!config.security.certificatePinning) {
      issues.push('Certificate pinning not enabled in production');
    }

    if (!config.features.errorTrackingEnabled) {
      issues.push('Error tracking disabled in production');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },

  /**
   * Get feature flag status across environments
   */
  getFeatureFlagMatrix(
    flag: keyof typeof DEV_CONFIG.features
  ): Record<Environment, boolean> {
    return {
      local: LOCAL_CONFIG.features[flag] as boolean,
      development: DEV_CONFIG.features[flag] as boolean,
      staging: STAGING_CONFIG.features[flag] as boolean,
      production: PRODUCTION_CONFIG.features[flag] as boolean,
    };
  },

  /**
   * Get API URL for environment
   */
  getApiUrlByEnvironment(environment: Environment): string {
    const config = ConfigFactory.forEnvironment(environment);
    return config.api.baseUrl;
  },

  /**
   * Check if feature is available in environment
   */
  isFeatureAvailable(
    environment: Environment,
    flag: keyof typeof DEV_CONFIG.features
  ): boolean {
    const config = ConfigFactory.forEnvironment(environment);
    return config.features[flag] as boolean;
  },

  /**
   * Generate configuration report
   */
  generateReport(config: RuntimeConfig): string {
    return `
Configuration Report
====================

Environment: ${config.environment}
Version: ${config.version}
Debug: ${config.debug}
Log Level: ${config.logLevel}

API Configuration:
  - Base URL: ${config.api.baseUrl}
  - Timeout: ${config.api.timeout}ms
  - Retries: ${config.api.retries}
  - Retry Delay: ${config.api.retryDelay}ms

Features:
  - Mock API: ${config.features.mockApi}
  - Experimental: ${config.features.experimentalFeatures}
  - Analytics: ${config.features.analyticsEnabled}
  - Error Tracking: ${config.features.errorTrackingEnabled}
  - Offline Mode: ${config.features.offlineMode}
  - Verbose Logging: ${config.features.verboseLogging}

Monitoring:
  - Enabled: ${config.monitoring.enabled}
  - Sampling: ${config.monitoring.samplingRate}

Security:
  - HTTPS Enforced: ${config.security.enforceHttps}
  - Token Strategy: ${config.security.tokenRefreshStrategy}
  - Certificate Pinning: ${config.security.certificatePinning}

Metadata:
  - Build Time: ${config.metadata.buildTime}
  - Build Number: ${config.metadata.buildNumber}
  - Commit: ${config.metadata.commitHash}
    `;
  },
};

/**
 * Jest/Testing Library helpers for React components
 */
export const configTestHelpers = {
  /**
   * Create mock ConfigProvider for testing
   */
  createMockProvider(config?: RuntimeConfig) {
    const testConfig = config || ConfigFactory.minimal();
    const store = new MockConfigStore(testConfig);

    return {
      config: testConfig,
      store,
      Provider: ({ children }: { children: React.ReactNode }) => (
        <ConfigContext.Provider value={testConfig}>
          {children}
        </ConfigContext.Provider>
      ),
    };
  },

  /**
   * Assert configuration has expected values
   */
  assertConfigEquals(actual: RuntimeConfig, expected: RuntimeConfig, message?: string) {
    const comparison = configTestUtils.compareConfigs(actual, expected);

    if (!comparison.same) {
      const msg = message ? `${message}\n` : '';
      throw new Error(`${msg}Configuration mismatch:\n${comparison.differences.join('\n')}`);
    }
  },

  /**
   * Create scenario: local development
   */
  scenarioLocalDevelopment() {
    return {
      config: ConfigFactory.local(),
      describe: 'Running locally with mocks',
      expectations: {
        mockApiEnabled: true,
        debugMode: true,
        httpsRequired: false,
      },
    };
  },

  /**
   * Create scenario: staging environment
   */
  scenarioStaging() {
    return {
      config: ConfigFactory.staging(),
      describe: 'Running on staging server',
      expectations: {
        mockApiEnabled: false,
        debugMode: false,
        httpsRequired: true,
        certPinningEnabled: true,
      },
    };
  },

  /**
   * Create scenario: production environment
   */
  scenarioProduction() {
    return {
      config: ConfigFactory.production(),
      describe: 'Running in production',
      expectations: {
        mockApiEnabled: false,
        debugMode: false,
        httpsRequired: true,
        certPinningEnabled: true,
        errorTrackingEnabled: true,
      },
    };
  },
};

export default {
  ConfigFactory,
  MockConfigStore,
  configTestUtils,
  configTestHelpers,
};
