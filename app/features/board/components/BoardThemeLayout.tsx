import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { spacingTokens } from '@/ui/tokens/spacing';

export const BoardThemeLayout: React.FC<{ children: React.ReactNode; compactAt?: number }> = ({ children, compactAt = 720 }) => {
  const { width } = useWindowDimensions();
  const isCompact = width <= compactAt;

  return <View style={[styles.root, isCompact ? styles.column : styles.row]}>{children}</View>;
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacingTokens[6],
    alignItems: 'flex-start',
  },
  column: {
    flexDirection: 'column',
    gap: spacingTokens[4],
    alignItems: 'stretch',
  },
});

export default BoardThemeLayout;
