import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typographyTokens, textVariants } from '../tokens/typography';
import { useColors } from '../hooks/useThemeTokens';

type TextVariant = keyof typeof textVariants | 'heading';

type Props = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  mono?: boolean;
  weight?: keyof typeof typographyTokens.fontWeight;
  size?: keyof typeof typographyTokens.fontSize;
  style?: RNTextProps['style'];
};

export const Text = React.forwardRef<RNText, Props>(
  ({ children, variant = 'body', color, mono, weight, size, style, ...rest }, ref) => {
    const colors = useColors();

    // Defensive check: fallback to 'body' of invalid variant
    const v = (textVariants as any)[variant] ?? textVariants.body;

    const finalFontSize = size
      ? typographyTokens.fontSize[size]
      : v.fontSize;

    // Use font family from variant if available, otherwise fall back to primary
    let fontFamily: string;
    if (mono) {
      fontFamily = typographyTokens.fontFamily.mono;
    } else if ('fontFamily' in v && v.fontFamily) {
      // Use variant's specified font family (Outfit for display/titles, Inter for body)
      fontFamily = v.fontFamily as string;
    } else {
      // Fallback to Inter based on weight
      const finalFontWeight = weight ?? v.fontWeight;
      switch (finalFontWeight) {
        case '400':
          fontFamily = 'Inter_400Regular';
          break;
        case '500':
          fontFamily = 'Inter_500Medium';
          break;
        case '600':
          fontFamily = 'Inter_600SemiBold';
          break;
        case '700':
          fontFamily = 'Inter_700Bold';
          break;
        default:
          fontFamily = 'Inter_400Regular';
      }
    }

    const textStyle = {
      fontFamily,
      fontSize: finalFontSize,
      lineHeight: finalFontSize * v.lineHeight,
      letterSpacing: ('letterSpacing' in v && v.letterSpacing) || typographyTokens.letterSpacing.normal,
      color: color || colors.foreground.primary,
      // Fix alignment for emojis and special characters
      textAlignVertical: 'center' as const,
      includeFontPadding: false, // Android: removes extra padding for better alignment
    };

    return (
      <RNText ref={ref} style={[textStyle, style]} {...rest}>
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
