/**
 * React Integration Layer
 * Configuration context and hooks for React components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import type { RuntimeConfig, ConfigChangeEvent, ConfigChangeListener } from './types';
import { getConfigStore, initializeConfigStore } from './store';
import { getConfigForEnvironment } from './environments';
import { detectEnvironment } from './init';
import { validateConfig } from './validator';
import { fonts } from './fonts-constants';

/**
 * Configuration Context
 */
export const ConfigContext = createContext<RuntimeConfig | null>(null);

interface ConfigProviderProps {
  children: React.ReactNode;
}

/**
 * Initialize config store if not already initialized
 * This is a fallback in case initializeConfiguration wasn't called at module load
 */
function ensureConfigInitialized(): RuntimeConfig {
  try {
    return getConfigStore().getConfig();
  } catch (error) {
    // Config store not initialized - initialize it now with default config
    if (__DEV__) {
      console.warn('[Config] ConfigStore not initialized, initializing with default config');
    }
    
    const environment = detectEnvironment();
    const defaultConfig = getConfigForEnvironment(environment);
    
    if (!defaultConfig) {
      throw new Error(`[Config] No configuration found for environment: ${environment}`);
    }
    
    // Validate configuration
    const validation = validateConfig(defaultConfig);
    if (!validation.valid) {
      throw new Error(
        `[Config] Configuration validation failed: ${validation.errors.join('; ')}`
      );
    }
    
    // Initialize store
    initializeConfigStore(defaultConfig);
    return defaultConfig;
  }
}

/**
 * Configuration Provider Component
 * Wraps app to provide configuration to all components
 * Must be placed high in component tree (typically in App component)
 * 
 * Note: This will auto-initialize the config if initializeConfiguration() wasn't called
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<RuntimeConfig>(() => {
    return ensureConfigInitialized();
  });

  useEffect(() => {
    const store = getConfigStore();

    // Subscribe to configuration changes
    const unsubscribe = store.subscribe((_event: ConfigChangeEvent) => {
      // Update state on any configuration change
      setConfig(store.getConfig());
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to get full runtime configuration
 * Throws error if used outside ConfigProvider
 */
export const useConfig = (): RuntimeConfig => {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return config;
};

/**
 * Hook to get API configuration
 */
export const useApiConfig = () => {
  const config = useConfig();
  return config.api;
};

/**
 * Hook to get specific feature flag
 * Provides type safety and memoization
 */
export const useFeatureFlag = (flag: keyof RuntimeConfig['features']): boolean => {
  const config = useConfig();
  return config.features[flag] as boolean;
};

/**
 * Hook to check if mocking API
 */
export const useMockApi = (): boolean => {
  const config = useConfig();
  return config.features.mockApi;
};

/**
 * Hook to check if in development mode
 */
export const useDevelopmentMode = (): boolean => {
  const config = useConfig();
  return config.debug;
};

/**
 * Hook to get current environment
 */
export const useEnvironment = () => {
  const config = useConfig();
  return config.environment;
};

/**
 * Hook to get monitoring configuration
 */
export const useMonitoring = () => {
  const config = useConfig();
  return config.monitoring;
};

/**
 * Hook to get security configuration
 */
export const useSecurity = () => {
  const config = useConfig();
  return config.security;
};

/**
 * Hook to subscribe to specific configuration changes
 * Calls callback whenever configuration updates
 */
export const useConfigChanges = (callback: ConfigChangeListener): void => {
  useEffect(() => {
    const store = getConfigStore();
    const unsubscribe = store.subscribe(callback);
    return () => unsubscribe();
  }, [callback]);
};

/**
 * Hook to watch specific configuration value
 * Re-renders only when that value changes
 */
export const useConfigValue = <K extends keyof RuntimeConfig>(
  key: K
): RuntimeConfig[K] => {
  const config = useConfig();
  const [value, setValue] = useState<RuntimeConfig[K]>(() => config[key]);

  useConfigChanges((event) => {
    if (event.key === key) {
      setValue(event.newValue as RuntimeConfig[K]);
    }
  });

  return value;
};

/**
 * Hook for conditional rendering based on feature flags
 * Returns boolean for use in if statements
 */
export const useFeatureEnabled = (flag: keyof RuntimeConfig['features']): boolean => {
  return useFeatureFlag(flag);
};

/**
 * Hook to get base API URL
 */
export const useApiUrl = (): string => {
  const apiConfig = useApiConfig();
  return apiConfig.baseUrl;
};

/**
 * Hook to get API timeout
 */
export const useApiTimeout = (): number => {
  const apiConfig = useApiConfig();
  return apiConfig.timeout;
};

/**
 * Hook to get log level
 */
export const useLogLevel = () => {
  const config = useConfig();
  return config.logLevel;
};

/**
 * Component to conditionally render based on feature flag
 */
interface FeatureFlagProps {
  flag: keyof RuntimeConfig['features'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  children,
  fallback = null,
}) => {
  const enabled = useFeatureFlag(flag);
  return <>{enabled ? children : fallback}</>;
};

/**
 * Component to conditionally render based on environment
 */
interface EnvironmentProps {
  env: RuntimeConfig['environment'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const EnvironmentGate: React.FC<EnvironmentProps> = ({
  env,
  children,
  fallback = null,
}) => {
  const currentEnv = useEnvironment();
  return <>{currentEnv === env ? children : fallback}</>;
};

/**
 * Component to conditionally render in development
 */
interface DevOnlyProps {
  children: React.ReactNode;
}

export const DevOnly: React.FC<DevOnlyProps> = ({ children }) => {
  return <FeatureFlag flag="verboseLogging">{children}</FeatureFlag>;
};

/**
 * Debug component to display current configuration (dev only)
 */
interface ConfigDebugProps {
  showMetadata?: boolean;
  showHistory?: boolean;
}

export const ConfigDebug: React.FC<ConfigDebugProps> = ({
  showMetadata = false,
  showHistory = false,
}) => {
  const config = useConfig();

  if (!config.debug) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: '#1a1a1a',
        padding: 12,
        marginTop: 8,
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          color: '#00ff00',
          fontSize: 10,
          fontFamily: fonts.mono,
          marginBottom: 8,
        }}
      >
        {`Environment: ${config.environment}`}
      </Text>
      <Text
        style={{
          color: '#00ff00',
          fontSize: 10,
          fontFamily: fonts.mono,
          marginBottom: 4,
        }}
      >
        {`Debug: ${config.debug}`}
      </Text>
      <Text
        style={{
          color: '#00ff00',
          fontSize: 10,
          fontFamily: fonts.mono,
          marginBottom: 4,
        }}
      >
        {`Log Level: ${config.logLevel}`}
      </Text>
      <Text
        style={{
          color: '#00ff00',
          fontSize: 10,
          fontFamily: fonts.mono,
        }}
      >
        {`Mock API: ${config.features.mockApi}`}
      </Text>
      {showMetadata && (
        <>
          <Text
            style={{
              color: '#ffff00',
              fontSize: 10,
              fontFamily: fonts.mono,
              marginTop: 8,
            }}
          >
            {`Version: ${config.version}`}
          </Text>
          <Text
            style={{
              color: '#ffff00',
              fontSize: 10,
              fontFamily: fonts.mono,
            }}
          >
            {`Base URL: ${config.api.baseUrl}`}
          </Text>
        </>
      )}
    </View>
  );
};
