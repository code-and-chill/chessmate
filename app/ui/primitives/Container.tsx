/**
 * Responsive Container Component
 * app/ui/primitives/Container.tsx
 * 
 * Responsive container with max-width constraints and adaptive padding
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { spacingScale } from '../tokens/spacing';
import { useContainerMaxWidth, useSpacingMultiplier } from '../hooks/useResponsive';

type ContainerProps = {
  children: React.ReactNode;
  /** Apply max-width constraint based on breakpoint */
  constrained?: boolean;
  /** Center content horizontally */
  centered?: boolean;
  /** Adaptive padding based on screen size */
  adaptivePadding?: boolean;
  /** Custom padding override */
  padding?: number;
  style?: ViewStyle;
};

/**
 * Container Component
 * 
 * Responsive container that adapts to screen size
 * 
 * @example
 * ```tsx
 * // Standard constrained container
 * <Container constrained centered>
 *   <Content />
 * </Container>
 * 
 * // Adaptive padding (increases on larger screens)
 * <Container adaptivePadding>
 *   <Content />
 * </Container>
 * 
 * // Full width with custom padding
 * <Container padding={spacingScale.gutter}>
 *   <Content />
 * </Container>
 * ```
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  constrained = false,
  centered = false,
  adaptivePadding = true,
  padding,
  style,
}) => {
  const maxWidth = useContainerMaxWidth();
  const spacingMultiplier = useSpacingMultiplier();

  const containerStyle: ViewStyle = {
    width: '100%',
    ...(constrained && maxWidth && { maxWidth }),
    ...(centered && { marginHorizontal: 'auto', alignSelf: 'center' }),
    ...(adaptivePadding && {
      paddingHorizontal: spacingScale.gutter * spacingMultiplier,
      paddingVertical: spacingScale.section * spacingMultiplier,
    }),
    ...(padding !== undefined && {
      padding,
    }),
  };

  return (
    <View style={[containerStyle, style]} accessibilityRole="main">
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles if needed
});
