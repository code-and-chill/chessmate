/**
 * Divider Primitive Component
 * app/ui/primitives/Divider.tsx
 */

import { View } from 'react-native';
import { spacingTokens } from '../tokens/spacing';

type DividerProps = {
  color?: string;
  thickness?: number;
  marginVertical?: number;
  marginHorizontal?: number;
};

export const Divider: React.FC<DividerProps> = ({
  color = '#E8E8E8',
  thickness = 1,
  marginVertical = 4,
  marginHorizontal = 0,
}) => {
  return (
    <View
      style={{
        height: thickness,
        backgroundColor: color,
        marginVertical: spacingTokens[marginVertical as keyof typeof spacingTokens],
        marginHorizontal: spacingTokens[marginHorizontal as keyof typeof spacingTokens],
      }}
    />
  );
};

Divider.displayName = 'Divider';
