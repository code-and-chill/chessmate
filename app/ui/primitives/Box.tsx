/**
 * Box Primitive Component
 * app/ui/primitives/Box.tsx
 * 
 * Supports both DLS props (padding, margin, etc.) and Tailwind className.
 * DLS props take precedence over Tailwind classes for design values.
 * Tailwind classes are useful for layout utilities (flex-1, items-center, etc.).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { spacingTokens } from '../tokens/spacing';
import { radiusTokens } from '../tokens/radii';
import { shadowTokens } from '../tokens/shadows';
import { cn } from '../utils/cn';

type BoxProps = {
  children?: React.ReactNode;
  padding?: number | keyof typeof spacingTokens;
  margin?: number | keyof typeof spacingTokens;
  gap?: number;
  radius?: number | keyof typeof radiusTokens;
  shadow?: keyof typeof shadowTokens;
  borderColor?: string;
  borderWidth?: number;
  backgroundColor?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  flex?: number;
  className?: string;
  style?: ViewStyle;
} & Omit<React.ComponentProps<typeof View>, 'style'>;

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
      className,
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

    // Build style object from DLS props, filtering out undefined values
    // DLS props take precedence over Tailwind classes
    const boxStyle: ViewStyle = Object.fromEntries(
      Object.entries({
        flexDirection,
        justifyContent,
        alignItems,
        gap,
        padding: getPaddingValue(padding),
        margin: getPaddingValue(margin),
        borderRadius: typeof radius === 'number' ? radius : (radius ? radiusTokens[radius] : undefined),
        borderColor,
        borderWidth,
        backgroundColor,
        flex,
        ...(shadow ? shadowTokens[shadow] : {}),
      }).filter(([_, value]) => value !== undefined)
    ) as ViewStyle;

    // Normalize style to prevent invalid values in arrays
    const normalize = (s: any): ViewStyle => {
      if (!s) return {} as ViewStyle;
      if (Array.isArray(s)) return Object.assign({}, ...s.filter(Boolean)) as ViewStyle;
      return s as ViewStyle;
    };

    return (
      <View 
        ref={ref} 
        className={cn(className)}
        style={[boxStyle, normalize(style)]} 
        {...rest}
      >
        {children}
      </View>
    );
  }
);

Box.displayName = 'Box';
