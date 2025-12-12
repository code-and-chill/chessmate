/**
 * useLayoutMeasurement Hook
 * 
 * Extracted layout measurement concern following SOLID Single Responsibility Principle.
 * Handles dimension tracking and measurement callbacks for responsive layouts.
 * 
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

export interface LayoutDimensions {
  width: number;
  height: number;
}

export interface UseLayoutMeasurementOptions {
  /** Threshold for dimension changes (default: 1px) */
  changeThreshold?: number;
  /** Initial dimensions (optional) */
  initialDimensions?: LayoutDimensions | null;
}

export interface UseLayoutMeasurementReturn {
  /** Current effective width (measured or window width) */
  effectiveWidth: number;
  /** Current effective height (measured or window height) */
  effectiveHeight: number;
  /** Measured content dimensions (null if not yet measured) */
  contentDimensions: LayoutDimensions | null;
  /** Layout change handler for onLayout prop */
  handleLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Hook for measuring and tracking layout dimensions
 * 
 * Provides measured content dimensions with fallback to window dimensions.
 * Only updates when dimensions change significantly (threshold-based).
 * 
 * @param options - Configuration options
 * @returns Layout measurement state and handlers
 * 
 * @example
 * ```tsx
 * const { effectiveWidth, effectiveHeight, handleLayout } = useLayoutMeasurement();
 * 
 * return (
 *   <View onLayout={handleLayout}>
 *     <Text>Width: {effectiveWidth}</Text>
 *   </View>
 * );
 * ```
 */
export function useLayoutMeasurement(
  options: UseLayoutMeasurementOptions = {}
): UseLayoutMeasurementReturn {
  const { changeThreshold = 1, initialDimensions = null } = options;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const [contentDimensions, setContentDimensions] = useState<LayoutDimensions | null>(
    initialDimensions
  );

  // Handle layout measurement to get actual content area dimensions
  // Memoized to prevent unnecessary re-renders
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
      
      // Only update if dimensions changed significantly (avoid unnecessary re-renders)
      setContentDimensions((prev) => {
        if (
          prev &&
          Math.abs(measuredWidth - prev.width) <= changeThreshold &&
          Math.abs(measuredHeight - prev.height) <= changeThreshold
        ) {
          return prev; // No significant change, return previous value
        }
        return { width: measuredWidth, height: measuredHeight };
      });
    },
    [changeThreshold]
  );

  // Use measured content dimensions, fall back to window dimensions on first render
  // Memoized to prevent recalculation when unrelated state changes
  const effectiveWidth = useMemo(
    () => contentDimensions?.width ?? windowWidth,
    [contentDimensions?.width, windowWidth]
  );
  
  const effectiveHeight = useMemo(
    () => contentDimensions?.height ?? windowHeight,
    [contentDimensions?.height, windowHeight]
  );

  return {
    effectiveWidth,
    effectiveHeight,
    contentDimensions,
    handleLayout,
  };
}
