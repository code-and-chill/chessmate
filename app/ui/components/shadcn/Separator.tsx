/**
 * Separator Component - Shadcn-style
 * 
 * A horizontal or vertical divider component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { cn } from '@/ui/utils/cn';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: any;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
  style,
}) => {
  const colors = useColors();

  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        { backgroundColor: colors.border },
        style,
      ]}
      className={cn(orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});

Separator.displayName = 'Separator';
