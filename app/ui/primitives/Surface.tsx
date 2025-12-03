/**
 * Surface Primitive Component
 * 
 * Gradient backdrop for AI aesthetic with theme-aware styling.
 * Use for elevated content sections, hero areas, or feature showcases.
 * 
 * @example
 * ```tsx
 * <Surface variant="default">
 *   <Text>Main content</Text>
 * </Surface>
 * 
 * <Surface variant="accent">
 *   <Text>Highlighted section</Text>
 * </Surface>
 * ```
 */

import type { ViewStyle } from 'react-native';
import { Box } from './Box';
import { useColors } from '../hooks/useThemeTokens';

type SurfaceVariant = 'default' | 'accent' | 'subtle' | 'elevated';

type SurfaceProps = {
  /** Content to render inside the surface */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: SurfaceVariant;
  /** Padding size (token index) */
  padding?: number;
  /** Border radius size */
  radius?: number;
  /** Additional styles */
  style?: ViewStyle;
};

export const Surface: React.FC<SurfaceProps> = ({
  children,
  variant = 'default',
  padding = 6,
  radius = 12,
  style,
}) => {
  const colors = useColors();

  // Theme-aware variant backgrounds
  const variantBackgrounds: Record<SurfaceVariant, string> = {
    default: colors.background.secondary,
    accent: colors.background.accentSubtle,
    subtle: colors.background.tertiary,
    elevated: colors.background.elevated,
  };

  return (
    <Box
      backgroundColor={variantBackgrounds[variant]}
      padding={padding}
      radius={radius}
      shadow="card"
      style={style}
    >
      {children}
    </Box>
  );
};

Surface.displayName = 'Surface';
