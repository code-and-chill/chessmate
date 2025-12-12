/**
 * useLayoutAnimations Hook
 * 
 * Extracted animation concern following SOLID Single Responsibility Principle.
 * Handles animation configuration for layout components.
 * 
 * @packageDocumentation
 */

import { useCallback } from 'react';
import Animated, { FadeInUp, type BaseAnimationBuilder } from 'react-native-reanimated';

export interface UseLayoutAnimationsOptions {
  /** Whether animations are enabled */
  enabled?: boolean;
  /** Animation duration in milliseconds (default: 250) */
  duration?: number;
}

export interface UseLayoutAnimationsReturn {
  /** Creates an entrance animation config with delay */
  createAnimConfig: (delay: number) => BaseAnimationBuilder | undefined;
  /** Creates a fade-in-up animation */
  fadeInUp: (delay?: number) => BaseAnimationBuilder | undefined;
}

/**
 * Hook for managing layout animations
 * 
 * Provides animation configuration functions for layout components.
 * Supports conditional animation enabling and configurable delays.
 * 
 * @param options - Animation configuration options
 * @returns Animation configuration functions
 * 
 * @example
 * ```tsx
 * const { createAnimConfig } = useLayoutAnimations({ enabled: true });
 * 
 * return (
 *   <Animated.View entering={createAnimConfig(0)}>
 *     <Content />
 *   </Animated.View>
 * );
 * ```
 */
export function useLayoutAnimations(
  options: UseLayoutAnimationsOptions = {}
): UseLayoutAnimationsReturn {
  const { enabled = true, duration = 250 } = options;

  // Animation configuration
  // Memoized to prevent recreation on every render
  const createAnimConfig = useCallback(
    (delay: number): BaseAnimationBuilder | undefined => {
      if (!enabled) return undefined;
      return FadeInUp.duration(duration).delay(delay);
    },
    [enabled, duration]
  );

  const fadeInUp = useCallback(
    (delay: number = 0): BaseAnimationBuilder | undefined => {
      return createAnimConfig(delay);
    },
    [createAnimConfig]
  );

  return {
    createAnimConfig,
    fadeInUp,
  };
}
