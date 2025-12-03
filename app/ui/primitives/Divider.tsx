/**
 * Divider Primitive Component
 * 
 * A simple line separator with theme-aware styling.
 * 
 * @example
 * ```tsx
 * <Divider />
 * <Divider variant="strong" />
 * <Divider marginVertical={6} />
 * ```
 */

import { View } from 'react-native';
import { spacingTokens } from '../tokens/spacing';
import { useColors } from '../theme/ThemeProvider';

type DividerVariant = 'subtle' | 'default' | 'strong';

type DividerProps = {
  /** Visual weight of the divider */
  variant?: DividerVariant;
  /** Custom color (overrides variant) */
  color?: string;
  /** Thickness in pixels */
  thickness?: number;
  /** Vertical margin (token index) */
  marginVertical?: number;
  /** Horizontal margin (token index) */
  marginHorizontal?: number;
};

export const Divider: React.FC<DividerProps> = ({
  variant = 'default',
  color,
  thickness = 1,
  marginVertical = 4,
  marginHorizontal = 0,
}) => {
  const colors = useColors();

  // Variant color mapping (theme-aware)
  const variantColors: Record<DividerVariant, string> = {
    subtle: colors.border.light,
    default: colors.border.default,
    strong: colors.border.strong,
  };

  const dividerColor = color || variantColors[variant];

  return (
    <View
      style={{
        height: thickness,
        backgroundColor: dividerColor,
        marginVertical: spacingTokens[marginVertical as keyof typeof spacingTokens],
        marginHorizontal: spacingTokens[marginHorizontal as keyof typeof spacingTokens],
      }}
    />
  );
};

Divider.displayName = 'Divider';
