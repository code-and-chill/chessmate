import { useEffect, useRef } from 'react';

/**
 * Monitoring Service
 * Tracks errors, performance metrics, and user analytics
 * 
 * Uses Sentry for error tracking and performance monitoring when available.
 * Falls back to console logging in development or when Sentry is not configured.
 */

// Try to import Sentry, but don't fail if it's not installed
let Sentry: any = null;
try {
  // For Expo apps, use @sentry/react-native or @sentry/expo
  // For bare React Native, use @sentry/react-native
  Sentry = require('@sentry/react-native');
} catch (e) {
  // Sentry not installed, will use console fallback
  console.log('[Monitoring] Sentry not available, using console fallback');
}

export interface MonitoringConfig {
  dsn?: string;
  environment: 'development' | 'staging' | 'production';
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
}

class MonitoringService {
  private initialized = false;
  private config: MonitoringConfig | null = null;

  /**
   * Initialize monitoring service
   */
  init(config: MonitoringConfig): void {
    this.initialized = true;
    this.config = config;

    if (config.environment === 'development') {
      console.log('[Monitoring] Service initialized in development mode');
    }

    // Initialize Sentry if available and DSN is provided
    if (Sentry && config.dsn) {
      try {
        Sentry.init({
          dsn: config.dsn,
          environment: config.environment,
          enableAutoSessionTracking: true,
          enableNativeCrashHandling: true,
          tracesSampleRate: config.enablePerformanceMonitoring ? 1.0 : 0.0,
          beforeSend(event) {
            // Don't send events in development unless explicitly enabled
            if (config.environment === 'development' && !config.enableErrorTracking) {
              return null;
            }
            return event;
          },
        });
        console.log('[Monitoring] Sentry initialized successfully');
      } catch (error) {
        console.error('[Monitoring] Failed to initialize Sentry:', error);
      }
    } else if (!config.dsn) {
      console.log('[Monitoring] Sentry DSN not provided, using console fallback');
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (!this.initialized) {
      console.warn('[Monitoring] Service not initialized');
      return;
    }

    console.error('[Monitoring] Exception:', error, context);

    // Send to Sentry if available
    if (Sentry) {
      try {
        Sentry.captureException(error, { extra: context });
      } catch (e) {
        console.error('[Monitoring] Failed to send exception to Sentry:', e);
      }
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized) {
      console.warn('[Monitoring] Service not initialized');
      return;
    }

    console.log(`[Monitoring] ${level.toUpperCase()}:`, message);

    // Send to Sentry if available
    if (Sentry) {
      try {
        Sentry.captureMessage(message, level);
      } catch (e) {
        console.error('[Monitoring] Failed to send message to Sentry:', e);
      }
    }
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.initialized) {
      console.warn('[Monitoring] Service not initialized');
      return;
    }

    console.log('[Monitoring] Event:', eventName, properties);

    // Send to Sentry as a breadcrumb for context
    if (Sentry) {
      try {
        Sentry.addBreadcrumb({
          category: 'user',
          message: eventName,
          level: 'info',
          data: properties,
        });
      } catch (e) {
        console.error('[Monitoring] Failed to add breadcrumb to Sentry:', e);
      }
    }
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; username?: string; email?: string }): void {
    if (!this.initialized) {
      console.warn('[Monitoring] Service not initialized');
      return;
    }

    console.log('[Monitoring] User context set:', user);

    // Set user context in Sentry if available
    if (Sentry) {
      try {
        Sentry.setUser(user);
      } catch (e) {
        console.error('[Monitoring] Failed to set user in Sentry:', e);
      }
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.initialized) {
      console.warn('[Monitoring] Service not initialized');
      return;
    }

    console.log('[Monitoring] User context cleared');

    // Clear user context in Sentry if available
    if (Sentry) {
      try {
        Sentry.setUser(null);
      } catch (e) {
        console.error('[Monitoring] Failed to clear user in Sentry:', e);
      }
    }
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string): { finish: () => void } {
    if (!this.initialized) {
      console.warn('[Monitoring] Service not initialized');
      return { finish: () => {} };
    }

    const startTime = Date.now();
    console.log('[Monitoring] Transaction started:', name);

    // Start Sentry transaction if available and performance monitoring is enabled
    let transaction: any = null;
    if (Sentry && this.config?.enablePerformanceMonitoring) {
      try {
        transaction = Sentry.startTransaction({ name });
      } catch (e) {
        console.error('[Monitoring] Failed to start Sentry transaction:', e);
      }
    }

    return {
      finish: () => {
        const duration = Date.now() - startTime;
        console.log(`[Monitoring] Transaction finished: ${name} (${duration}ms)`);
        
        if (transaction) {
          try {
            transaction.finish();
          } catch (e) {
            console.error('[Monitoring] Failed to finish Sentry transaction:', e);
          }
        }
      },
    };
  }
}

export const monitoring = new MonitoringService();

/**
 * Hook to track screen views
 */
export function useScreenTracking(screenName: string): void {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      monitoring.trackEvent('screen_view', { screen_name: screenName });
      hasTracked.current = true;
    }
  }, [screenName]);
}

/**
 * Hook to track component performance
 */
export function usePerformanceTracking(componentName: string): void {
  const transaction = useRef<{ finish: () => void } | null>(null);

  useEffect(() => {
    transaction.current = monitoring.startTransaction(`${componentName}_render`);

    return () => {
      transaction.current?.finish();
    };
  }, [componentName]);
}
