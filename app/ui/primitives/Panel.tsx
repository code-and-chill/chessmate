/**
 * Panel Primitive Component (Translucent/AI-Aesthetic)
 * app/ui/primitives/Panel.tsx
 */

import type { ViewStyle } from 'react-native';
import { Box } from './Box';

type PanelDensity = 'light' | 'medium' | 'dark';

type PanelProps = {
  children: React.ReactNode;
  density?: PanelDensity;
  padding?: number;
  style?: ViewStyle;
};

const densityMap: Record<PanelDensity, string> = {
  light: 'rgba(255, 255, 255, 0.8)',
  medium: 'rgba(255, 255, 255, 0.6)',
  dark: 'rgba(0, 0, 0, 0.05)',
};

export const Panel: React.FC<PanelProps> = ({
  children,
  density = 'medium',
  padding = 6,
  style,
}) => {
  return (
    <Box
      padding={padding}
      radius="lg"
      backgroundColor={densityMap[density]}
      borderColor="rgba(0, 0, 0, 0.08)"
      borderWidth={1}
      style={style}
    >
      {children}
    </Box>
  );
};

Panel.displayName = 'Panel';
