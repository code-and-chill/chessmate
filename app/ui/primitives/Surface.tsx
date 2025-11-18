/**
 * Surface Primitive Component (Gradient backdrop for AI aesthetic)
 * app/ui/primitives/Surface.tsx
 */

import type { ViewStyle } from 'react-native';
import { Box } from './Box';

type SurfaceVariant = 'default' | 'accent' | 'subtle';

type SurfaceProps = {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  style?: ViewStyle;
};

const variantGradients: Record<SurfaceVariant, string> = {
  default: '#FAFAFA',
  accent: 'rgba(59, 130, 246, 0.05)',
  subtle: 'rgba(255, 255, 255, 0.4)',
};

export const Surface: React.FC<SurfaceProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  return (
    <Box
      backgroundColor={variantGradients[variant]}
      padding={6}
      radius="lg"
      style={style}
    >
      {children}
    </Box>
  );
};

Surface.displayName = 'Surface';
