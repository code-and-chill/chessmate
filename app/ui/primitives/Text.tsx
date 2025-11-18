/**
 * Text Primitive Component
 * app/ui/primitives/Text.tsx
 */

import React from 'react';
import { Text as RNText } from 'react-native';
import type { TextStyle } from 'react-native';
import { typographyTokens, textVariants } from '../tokens/typography';

type TextVariant = keyof typeof textVariants;

type TextProps = {
  children?: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof typographyTokens.fontWeight;
  size?: keyof typeof typographyTokens.fontSize;
  style?: TextStyle;
} & React.ComponentProps<typeof RNText>;

export const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      children,
      variant = 'body',
      color,
      weight,
      size,
      style,
      ...rest
    },
    ref
  ) => {
    const variantStyle = textVariants[variant];
    const textStyle: TextStyle = {
      fontFamily: typographyTokens.fontFamily.primary,
      ...variantStyle,
      ...(weight && { fontWeight: typographyTokens.fontWeight[weight] }),
      ...(size && { fontSize: typographyTokens.fontSize[size] }),
      color: color || '#000',
    };

    return (
      <RNText ref={ref} style={[textStyle, style]} {...rest}>
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
