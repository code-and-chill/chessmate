/**
 * LayoutSpacer - Atomic Layout Component
 * 
 * Semantic spacing component following atomic design principles.
 * Provides consistent spacing using semantic spacing groups.
 * 
 * @packageDocumentation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { spacingGroups, spacingTokens, type SpacingGroup } from '@/ui/tokens/spacing';

export interface LayoutSpacerProps {
  /** Spacing group (tight, comfortable, spacious, generous) */
  group?: SpacingGroup;
  /** Custom spacing value */
  size?: number | keyof typeof spacingTokens;
  /** Spacing direction */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * LayoutSpacer Component
 * 
 * Atomic spacing component that provides semantic spacing.
 * Uses spacing groups to establish visual relationships (Gestalt proximity).
 * 
 * @example
 * ```tsx
 * <LayoutSpacer group="comfortable" direction="vertical" />
 * ```
 */
export const LayoutSpacer: React.FC<LayoutSpacerProps> = ({
  group,
  size,
  direction = 'vertical',
  style,
  testID,
}) => {
  const getSpacingValue = (): number => {
    if (size !== undefined) {
      if (typeof size === 'number') {
        return spacingTokens[size as keyof typeof spacingTokens] || size;
      }
      return spacingTokens[size];
    }
    
    if (group) {
      return spacingGroups[group].gap;
    }
    
    return spacingTokens[3]; // Default: comfortable spacing
  };

  const spacingValue = getSpacingValue();
  
  const spacerStyle: ViewStyle = {
    ...(direction === 'vertical' || direction === 'both' ? { height: spacingValue } : {}),
    ...(direction === 'horizontal' || direction === 'both' ? { width: spacingValue } : {}),
    ...style,
  };

  return <View style={spacerStyle} testID={testID} />;
};

LayoutSpacer.displayName = 'LayoutSpacer';
