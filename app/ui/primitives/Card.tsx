/**
 * Card Primitive Component
 * app/ui/primitives/Card.tsx
 */

import type { ViewStyle } from 'react-native';
import { Box } from './Box';

type CardProps = {
  children: React.ReactNode;
  padding?: number;
  shadow?: 'card' | 'panel' | 'floating';
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
};

export const Card: React.FC<CardProps> = ({
  children,
  padding = 6,
  shadow = 'card',
  borderColor,
  borderWidth = 0,
  style,
}) => {
  return (
    <Box
      padding={padding}
      radius="lg"
      shadow={shadow}
      borderColor={borderColor}
      borderWidth={borderWidth}
      backgroundColor="#FAFAFA"
      style={style}
    >
      {children}
    </Box>
  );
};

Card.displayName = 'Card';
