/**
 * Responsive Breakpoints
 * app/ui/tokens/breakpoints.ts
 * 
 * Defines screen size breakpoints for responsive layouts
 */

import {Dimensions, Platform} from 'react-native';

/**
 * Standard breakpoint values (in pixels)
 */
export const breakpointValues = {
    xs: 0,       // Tiny devices (phones)
  sm: 576,     // Small devices (large phones, small tablets)
  md: 768,     // Medium devices (tablets)
  lg: 1024,    // Large devices (desktops, large tablets landscape)
  xl: 1280,    // Extra large devices (large desktops)
  xxl: 1920,   // Ultra wide screens
} as const;

export type Breakpoint = keyof typeof breakpointValues;

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Get current breakpoint based on screen width
 */
export const getCurrentBreakpoint = (): Breakpoint => {
  const { width } = getScreenDimensions();
  
  if (width >= breakpointValues.xxl) return 'xxl';
  if (width >= breakpointValues.xl) return 'xl';
  if (width >= breakpointValues.lg) return 'lg';
  if (width >= breakpointValues.md) return 'md';
  if (width >= breakpointValues.sm) return 'sm';
  return 'xs';
};

/**
 * Check if the screen is at least a certain size
 */
export const isBreakpoint = {
  xs: () => getScreenDimensions().width >= breakpointValues.xs,
  sm: () => getScreenDimensions().width >= breakpointValues.sm,
  md: () => getScreenDimensions().width >= breakpointValues.md,
  lg: () => getScreenDimensions().width >= breakpointValues.lg,
  xl: () => getScreenDimensions().width >= breakpointValues.xl,
  xxl: () => getScreenDimensions().width >= breakpointValues.xxl,
};

/**
 * Device type helpers
 */
export const deviceType = {
  isMobile: () => {
    const { width } = getScreenDimensions();
    return width < breakpointValues.md;
  },
  isTablet: () => {
    const { width } = getScreenDimensions();
    return width >= breakpointValues.md && width < breakpointValues.lg;
  },
  isDesktop: () => {
    const { width } = getScreenDimensions();
    return width >= breakpointValues.lg;
  },
  isWeb: () => Platform.OS === 'web',
};

/**
 * Responsive value selector
 * Returns different values based on current breakpoint
 * 
 * @example
 * const fontSize = responsive({
 *   xs: 14,
 *   md: 16,
 *   lg: 18,
 * });
 */
export const responsive = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const currentBreakpoint = getCurrentBreakpoint();
  const breakpoints: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

    // Start from the current breakpoint and look for nearest defined value
  const startIndex = breakpoints.indexOf(currentBreakpoint);
  for (let i = startIndex; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

/**
 * Grid column calculator
 * Calculate column count based on screen size
 */
export const gridColumns = {
  xs: 1,
  sm: 2,
  md: 2,
  lg: 3,
  xl: 4,
  xxl: 5,
};

export const getGridColumns = (): number => {
  const bp = getCurrentBreakpoint();
  return gridColumns[bp];
};

/**
 * Container max widths for different breakpoints
 */
export const containerMaxWidth = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320,
};

export const getContainerMaxWidth = (): number | undefined => {
  const bp = getCurrentBreakpoint();
  if (bp === 'xs') return undefined; // Full width on mobile
  return containerMaxWidth[bp];
};

/**
 * Responsive spacing scale multipliers
 */
export const spacingMultipliers = {
  xs: 1,    // Mobile: standard spacing
  sm: 1,    // Large phone: standard spacing
  md: 1.25, // Tablet: 25% more spacing
  lg: 1.5,  // Desktop: 50% more spacing
  xl: 1.5,  // Large desktop: 50% more spacing
  xxl: 2,   // Ultra wide: double spacing
};

export const getSpacingMultiplier = (): number => {
  const bp = getCurrentBreakpoint();
  return spacingMultipliers[bp];
};

/**
 * Layout type mapping (simplified breakpoint system)
 * Maps breakpoints to layout types: mobile, tablet, desktop
 * 
 * This provides a unified interface for layout decisions across the app.
 * Replaces the legacy LayoutBreakpoints system in core/constants/layout.ts
 */
export type LayoutType = 'mobile' | 'tablet' | 'desktop';

/**
 * Get layout type based on screen width
 * 
 * @param width - Screen width in pixels (optional, uses current screen if not provided)
 * @returns Layout type: 'mobile' | 'tablet' | 'desktop'
 */
export const getLayoutType = (width?: number): LayoutType => {
  const screenWidth = width ?? getScreenDimensions().width;
  
  if (screenWidth >= breakpointValues.lg) {
    return 'desktop';
  }
  if (screenWidth >= breakpointValues.md) {
    return 'tablet';
  }
  return 'mobile';
};

/**
 * Check if the sidebar should be shown (desktop only)
 */
export const shouldShowSidebar = (width?: number): boolean => {
  return getLayoutType(width) === 'desktop';
};

/**
 * Check if a move list should be shown side-by-side (tablet and desktop)
 */
export const shouldShowMoveListSideBySide = (width?: number): boolean => {
  const layout = getLayoutType(width);
  return layout === 'desktop' || layout === 'tablet';
};
