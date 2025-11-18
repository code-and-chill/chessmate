import { useEffect, useRef } from 'react';

/**
 * Monitoring Service
 * Tracks errors, performance metrics, and user analytics
 */

export interface MonitoringConfig {
  dsn?: string;
  environment: 'development' | 'staging' | 'production';
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
}

class MonitoringService {
  private initialized = false;

  /**
   * Initialize monitoring service
   */
  init(config: MonitoringConfig): void {
    this.initialized = true;

    if (config.environment === 'development') {
      console.log('[Monitoring] Service initialized in development mode');
    }

    // TODO: Initialize actual monitoring service (Sentry, etc.)
    // Sentry.init({
    //   dsn: config.dsn,
    //   environment: config.environment,
    //   enablePerformanceMonitoring: config.enablePerformanceMonitoring,
    // });
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

    // TODO: Send to monitoring service
    // Sentry.captureException(error, { extra: context });
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

    // TODO: Send to monitoring service
    // Sentry.captureMessage(message, level);
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

    // TODO: Send to analytics service
    // Analytics.track(eventName, properties);
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

    // TODO: Set user context in monitoring service
    // Sentry.setUser(user);
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

    // TODO: Clear user context in monitoring service
    // Sentry.setUser(null);
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

    // TODO: Start actual transaction
    // const transaction = Sentry.startTransaction({ name });

    return {
      finish: () => {
        const duration = Date.now() - startTime;
        console.log(`[Monitoring] Transaction finished: ${name} (${duration}ms)`);
        // transaction.finish();
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
