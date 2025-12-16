/**
 * Badge Component - Shadcn-style
 * 
 * A small status indicator component with variants
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/ui/primitives/Text';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { radiusTokens } from '@/ui/tokens/radii';
import { spacingTokens } from '@/ui/tokens/spacing';
import { typographyTokens } from '@/ui/tokens/typography';
import { cn } from '@/ui/utils/cn';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: any;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  style,
}) => {
  const colors = useColors();

  const variantStyles = {
    default: {
      backgroundColor: colors.accent.primary,
      color: colors.foreground.onAccent,
    },
    secondary: {
      backgroundColor: colors.background.secondary,
      color: colors.foreground.primary,
    },
    destructive: {
      backgroundColor: colors.error,
      color: colors.foreground.onAccent,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderWidth: 1,
      color: colors.foreground.primary,
    },
    success: {
      backgroundColor: colors.success,
      color: colors.foreground.onAccent,
    },
  };

  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth || 0,
        },
        style,
      ]}
      className={cn('px-2 py-1 rounded-md', className)}
    >
      {typeof children === 'string' ? (
        <Text
          variant="caption"
          weight="semibold"
          style={{ color: variantStyle.color }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacingTokens[2],
    paddingVertical: spacingTokens[1],
    borderRadius: radiusTokens.sm,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Badge.displayName = 'Badge';
