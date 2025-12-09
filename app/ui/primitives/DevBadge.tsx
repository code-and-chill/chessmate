import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { spacingScale } from '@/ui/tokens/spacing';
import { radiusScale } from '@/ui/tokens/radii';

type DevBadgeProps = {
  children: React.ReactNode;
  style?: object;
};

export const DevBadge: React.FC<DevBadgeProps> = ({ children, style }) => {
  const colors = useColors();

  if (!__DEV__) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.translucent.dark }, style]}>
      <RNText style={[styles.text, { color: colors.accentForeground.primary }]}>{children as any}</RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 9999,
    paddingHorizontal: spacingScale.sm,
    paddingVertical: spacingScale.xs,
    borderRadius: radiusScale.badge,
  },
  text: {
    fontSize: 10,
  },
});

// displayName assignment
(DevBadge as any).displayName = 'DevBadge';
