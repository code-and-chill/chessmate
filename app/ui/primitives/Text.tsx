import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { typographyTokens, textVariants } from '../tokens/typography';

type TextVariant = keyof typeof textVariants;

type Props = {
  children?: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  mono?: boolean;
  weight?: keyof typeof typographyTokens.fontWeight;
  size?: keyof typeof typographyTokens.fontSize;
  style?: TextStyle;
} & React.ComponentProps<typeof RNText>;

const interFontMap = {
  '100': 'Inter-Thin',
  '200': 'Inter-ExtraLight',
  '300': 'Inter-Light',
  '400': 'Inter-Regular',
  '500': 'Inter-Medium',
  '600': 'Inter-SemiBold',
  '700': 'Inter-Bold',
  '800': 'Inter-ExtraBold',
  '900': 'Inter-Black',
};

export const Text = React.forwardRef<RNText, Props>(
  ({ children, variant = 'body', color, mono, weight, size, style, ...rest }, ref) => {
    const v = textVariants[variant];

    const finalFontSize = size
      ? typographyTokens.fontSize[size]
      : v.fontSize;

    const finalFontWeight = weight ?? (v.fontWeight as keyof typeof interFontMap);
    const fontFamily = mono
      ? typographyTokens.fontFamily.mono
      : interFontMap[finalFontWeight];

    const textStyle: TextStyle = {
      fontFamily,
      fontSize: finalFontSize,
      fontWeight: finalFontWeight,
      lineHeight: finalFontSize * v.lineHeight,  // FIXED
      letterSpacing: typographyTokens.letterSpacing.normal,
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
