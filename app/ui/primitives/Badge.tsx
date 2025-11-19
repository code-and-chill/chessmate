/**
 * Badge Primitive Component
 * app/ui/primitives/Badge.tsx
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Text } from './Text';
import { radiusTokens } from '../tokens/radii';
import { spacingTokens } from '../tokens/spacing';
import { useThemeTokens } from '../hooks/useThemeTokens';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const sizeConfig = {
  sm: { paddingH: spacingTokens[2], paddingV: spacingTokens[1], fontSize: 11 },
  md: { paddingH: spacingTokens[3], paddingV: spacingTokens[2], fontSize: 12 },
  lg: { paddingH: spacingTokens[4], paddingV: spacingTokens[2], fontSize: 14 },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const { colors } = useThemeTokens();
  const config = sizeConfig[size];

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: colors.accent.primary, text: colors.accentForeground.primary },
    secondary: { bg: colors.accent.secondary, text: colors.accentForeground.secondary },
    success: { bg: colors.success, text: colors.background.primary },
    error: { bg: colors.error, text: colors.background.primary },
    warning: { bg: colors.warning, text: colors.foreground.primary },
    info: { bg: colors.info, text: colors.background.primary },
    neutral: { bg: colors.background.tertiary, text: colors.foreground.primary },
  };

  const badgeColors = variantColors[variant];

  return (
    <View
      style={[
        {
          backgroundColor: badgeColors.bg,
          borderRadius: radiusTokens.full,
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
          alignSelf: 'flex-start',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        variant="label"
        color={badgeColors.text}
        weight="semibold"
        style={{ fontSize: config.fontSize, lineHeight: config.fontSize * 1.2 }}
      >
        {children}
      </Text>
    </View>
  );
};

Badge.displayName = 'Badge';
