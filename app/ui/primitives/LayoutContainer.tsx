/**
 * LayoutContainer - Atomic Layout Component
 * 
 * Base container component following atomic design principles.
 * Provides consistent container constraints and responsive behavior.
 * 
 * @packageDocumentation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useContainerMaxWidth } from '@/ui/hooks/useResponsive';
import { spacingTokens } from '@/ui/tokens/spacing';

export interface LayoutContainerProps {
  /** Child components */
  children?: React.ReactNode;
  /** Padding around container */
  padding?: number | keyof typeof spacingTokens;
  /** Custom style */
  style?: ViewStyle;
  /** Whether to apply max-width constraint for ultra-wide screens */
  constrainWidth?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * LayoutContainer Component
 * 
 * Atomic layout component that provides consistent container behavior.
 * Applies max-width constraints for ultra-wide screens (HIG compliance).
 * 
 * @example
 * ```tsx
 * <LayoutContainer padding={4} constrainWidth>
 *   <Content />
 * </LayoutContainer>
 * ```
 */
export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  children,
  padding,
  style,
  constrainWidth = true,
  testID,
}) => {
  const containerMaxWidth = useContainerMaxWidth();
  
  const getPaddingValue = (p: typeof padding): number | undefined => {
    if (p === undefined) return undefined;
    if (typeof p === 'number') return spacingTokens[p as keyof typeof spacingTokens] || p;
    return spacingTokens[p];
  };

  const containerStyle: ViewStyle = {
    padding: getPaddingValue(padding),
    ...(constrainWidth && containerMaxWidth && {
      maxWidth: containerMaxWidth,
      alignSelf: 'center',
      width: '100%',
    }),
    ...style,
  };

  return (
    <View style={containerStyle} testID={testID}>
      {children}
    </View>
  );
};

LayoutContainer.displayName = 'LayoutContainer';
