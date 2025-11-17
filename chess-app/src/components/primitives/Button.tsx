import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../ui/theme/ThemeContext';
import { Text } from './Text';
import { Box } from './Box';
import { spacing, radius } from '../../ui/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonVariantStyle {
  background: string;
  text: string;
}

function getVariantStyles(colors: any): Record<ButtonVariant, ButtonVariantStyle> {
  return {
    primary: {
      background: colors.accentGreen,
      text: colors.surface,
    },
    secondary: {
      background: colors.surfaceMuted,
      text: colors.textPrimary,
    },
    danger: {
      background: colors.danger,
      text: colors.surface,
    },
  };
}

const sizeStyles: Record<ButtonSize, { padding: number; fontSize: number }> = {
  sm: {
    padding: spacing.sm,
    fontSize: 14,
  },
  md: {
    padding: spacing.md,
    fontSize: 16,
  },
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      onPress,
      disabled = false,
      children,
      iconLeft,
      iconRight,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const variantStyles = getVariantStyles(colors);
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          {
            backgroundColor: disabled ? colors.borderSubtle : variantStyle.background,
            borderRadius: radius.md,
            opacity: pressed && !disabled ? 0.8 : 1,
          },
        ]}
      >
        <Box
          padding={size}
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          gap="sm"
        >
          {iconLeft}
          <Text
            variant="label"
            color={variant === 'secondary' ? 'primary' : 'secondary'}
            style={{ color: disabled ? colors.textMuted : variantStyle.text }}
          >
            {children}
          </Text>
          {iconRight}
        </Box>
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
