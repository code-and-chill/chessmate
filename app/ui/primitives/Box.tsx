/**
 * Box Primitive Component
 * app/ui/primitives/Box.tsx
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { spacingTokens } from '../tokens/spacing';
import { radiusTokens } from '../tokens/radii';
import { shadowTokens } from '../tokens/shadows';

type BoxProps = {
  children?: React.ReactNode;
  padding?: number | keyof typeof spacingTokens;
  margin?: number | keyof typeof spacingTokens;
  gap?: number;
  radius?: keyof typeof radiusTokens;
  shadow?: keyof typeof shadowTokens;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  flex?: number;
  style?: ViewStyle;
} & React.ComponentProps<typeof View>;

export const Box = React.forwardRef<View, BoxProps>(
  (
    {
      children,
      padding,
      margin,
      gap,
      radius,
      shadow,
      borderColor,
      borderWidth,
      backgroundColor,
      flexDirection = 'column',
      justifyContent,
      alignItems,
      flex,
      style,
      ...rest
    },
    ref
  ) => {
    const getPaddingValue = (p: typeof padding): number | undefined => {
      if (p === undefined) return undefined;
      if (typeof p === 'number') return spacingTokens[p as keyof typeof spacingTokens] || p;
      return spacingTokens[p];
    };

    // Build style object, filtering out undefined values
    const boxStyle: ViewStyle = Object.fromEntries(
      Object.entries({
        flexDirection,
        justifyContent,
        alignItems,
        gap,
        padding: getPaddingValue(padding),
        margin: getPaddingValue(margin),
        borderRadius: radius ? radiusTokens[radius] : undefined,
        borderColor,
        borderWidth,
        backgroundColor,
        flex,
        ...(shadow ? shadowTokens[shadow] : {}),
      }).filter(([_, value]) => value !== undefined)
    ) as ViewStyle;

    // Normalize style to prevent invalid values in arrays
  const normalize = (s: any) => {
    if (!s) return {};
    if (Array.isArray(s)) return Object.assign({}, ...s.filter(Boolean));
    return s;
  };

  return (
    <>
      <View ref={ref} style={[boxStyle, normalize(style)]} {...rest}>
        {children}
      </View>
    </>
  );
  }
);

Box.displayName = 'Box';
