import { Dimensions, Platform } from 'react-native';

/**
 * Responsive Layout Configuration
 * Defines breakpoints and responsive behavior for the chess app
 */

export const LayoutBreakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  large: 1440,
} as const;

export const getBoardSize = () => {
  const { width, height } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    // Desktop: 480-600px with generous margins
    if (width >= LayoutBreakpoints.desktop) {
      return Math.min(Math.max(480, width * 0.35), 600);
    }
    // Tablet: responsive between mobile and desktop
    if (width >= LayoutBreakpoints.tablet) {
      return Math.min(width * 0.5, 480);
    }
  }
  
  // Mobile: fill width with padding
  const padding = 32; // 16px on each side
  const maxSize = Math.min(width, height) - padding;
  return maxSize;
};

export const getSquareSize = () => {
  return getBoardSize() / 8;
};

export const getLayoutType = (): 'mobile' | 'tablet' | 'desktop' => {
  const { width } = Dimensions.get('window');
  
  if (width >= LayoutBreakpoints.desktop) {
    return 'desktop';
  }
  if (width >= LayoutBreakpoints.tablet) {
    return 'tablet';
  }
  return 'mobile';
};

export const shouldShowSidebar = (): boolean => {
  const layout = getLayoutType();
  return layout === 'desktop';
};

export const shouldShowMoveListSideBySide = (): boolean => {
  const layout = getLayoutType();
  return layout === 'desktop' || layout === 'tablet';
};

/**
 * Spacing constants for consistent margins and paddings
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Z-index layers for proper stacking
 */
export const ZIndex = {
  base: 0,
  elevated: 10,
  modal: 100,
  toast: 1000,
  sidebar: 50,
} as const;
