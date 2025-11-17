import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '../../ui/theme/ThemeContext';
import { typography, type TypographySizeKey } from '../../ui/tokens/typography';
import { type ThemeColors } from '../../ui/tokens/themes';

export type TextVariant = 'body' | 'heading' | 'label' | 'caption';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'danger';

const variantStyles: Record<TextVariant, TextStyle> = {
  body: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  heading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },
};

const colorMap: Record<TextColor, keyof ThemeColors> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  muted: 'textMuted',
  danger: 'danger',
};

export interface TextProps extends React.ComponentProps<typeof RNText> {
  variant?: TextVariant;
  color?: TextColor;
  children?: React.ReactNode;
}

export const Text = React.forwardRef<React.ComponentRef<typeof RNText>, TextProps>(
  ({ variant = 'body', color = 'primary', style, children, ...props }, ref) => {
    const { colors } = useTheme();
    const variantStyle = variantStyles[variant];
    const textColor = colors[colorMap[color]];

    return (
      <RNText
        ref={ref}
        style={[variantStyle, { color: textColor }, style]}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
