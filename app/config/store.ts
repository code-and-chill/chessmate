/**
 * Configuration Store (Single Responsibility + Observer Pattern)
 * Manages runtime configuration state with change notifications
 */

import type { RuntimeConfig, ConfigChangeEvent, Environment } from './types';
import { validateConfig } from './validator';

/**
 * Configuration change listener type
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void;

/**
 * ConfigStore class - manages configuration state
 * Follows SOLID principles:
 * - Single Responsibility: Only manages config state and listeners
 * - Open/Closed: Extensible via listeners without modification
 * - Liskov Substitution: Can be replaced with other implementations
 * - Interface Segregation: Minimal, focused interface
 * - Dependency Inversion: Depends on abstractions (listeners)
 */
export class ConfigStore {
  private currentConfig: RuntimeConfig;
  private listeners: Set<ConfigChangeListener> = new Set();
  private changeHistory: ConfigChangeEvent[] = [];
  private maxHistorySize: number = 50;

  constructor(initialConfig: RuntimeConfig) {
    this.currentConfig = structuredClone(initialConfig);
  }

  /**
   * Get current configuration (read-only copy)
   */
  getConfig(): Readonly<RuntimeConfig> {
    return Object.freeze(structuredClone(this.currentConfig));
  }

  /**
   * Get specific configuration value
   */
  get<K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K] {
    return structuredClone(this.currentConfig[key]);
  }

  /**
   * Update configuration with new values
   * Validates changes and notifies listeners
   */
  updateConfig(updates: Partial<RuntimeConfig>): void {
    const newConfig = { ...this.currentConfig, ...updates };

    // Validate new configuration
    const validation = validateConfig(newConfig);
    if (!validation.valid) {
      throw new Error(`Configuration update rejected: ${validation.errors.join(', ')}`);
    }

    // Log warnings
    if (validation.warnings.length > 0) {
      console.warn('Configuration warnings:', validation.warnings);
    }

    // Update and notify
    Object.keys(updates).forEach((key) => {
      const typedKey = key as keyof RuntimeConfig;
      const previousValue = this.currentConfig[typedKey];
      const newValue = updates[typedKey];

      if (JSON.stringify(previousValue) !== JSON.stringify(newValue)) {
        this.currentConfig[typedKey] = newValue as never;

        const event: ConfigChangeEvent = {
          key: typedKey,
          previousValue,
          newValue,
          timestamp: Date.now(),
        };

        this.notifyListeners(event);
        this.recordChange(event);
      }
    });
  }

  /**
   * Switch to different environment
   */
  switchEnvironment(environmentConfig: RuntimeConfig): void {
    const validation = validateConfig(environmentConfig);
    if (!validation.valid) {
      throw new Error(`Invalid environment config: ${validation.errors.join(', ')}`);
    }

    const previousEnv = this.currentConfig.environment;
    this.currentConfig = structuredClone(environmentConfig);

    this.notifyListeners({
      key: 'environment',
      previousValue: previousEnv,
      newValue: environmentConfig.environment,
      timestamp: Date.now(),
    });
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get change history
   */
  getChangeHistory(): readonly ConfigChangeEvent[] {
    return Object.freeze([...this.changeHistory]);
  }

  /**
   * Clear change history
   */
  clearHistory(): void {
    this.changeHistory = [];
  }

  /**
   * Notify all listeners of change
   */
  private notifyListeners(event: ConfigChangeEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }

  /**
   * Record change in history
   */
  private recordChange(event: ConfigChangeEvent): void {
    this.changeHistory.push(event);

    // Trim history if it exceeds max size
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(-this.maxHistorySize);
    }
  }
}

/**
 * Singleton instance
 */
let configStoreInstance: ConfigStore | null = null;

/**
 * Initialize configuration store (call once at app startup)
 */
export const initializeConfigStore = (initialConfig: RuntimeConfig): ConfigStore => {
  if (configStoreInstance) {
    console.warn('ConfigStore already initialized');
    return configStoreInstance;
  }
  configStoreInstance = new ConfigStore(initialConfig);
  return configStoreInstance;
};

/**
 * Get configuration store instance
 */
export const getConfigStore = (): ConfigStore => {
  if (!configStoreInstance) {
    throw new Error(
      'ConfigStore not initialized. Call initializeConfigStore at app startup.'
    );
  }
  return configStoreInstance;
};
