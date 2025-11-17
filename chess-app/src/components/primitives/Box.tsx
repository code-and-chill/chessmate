import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../ui/theme/ThemeContext';
import { spacing } from '../../ui/tokens';
import { type ThemeColors } from '../../ui/tokens/themes';

export interface BoxProps {
  children?: React.ReactNode;
  flexDirection?: ViewStyle['flexDirection'];
  flex?: number;
  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  padding?: keyof typeof spacing;
  paddingHorizontal?: keyof typeof spacing;
  paddingVertical?: keyof typeof spacing;
  margin?: keyof typeof spacing;
  marginHorizontal?: keyof typeof spacing;
  marginVertical?: keyof typeof spacing;
  gap?: keyof typeof spacing;
  backgroundColor?: keyof ThemeColors;
  borderColor?: keyof ThemeColors;
  borderWidth?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}


export const Box = React.forwardRef<View, BoxProps>(
  (
    {
      children,
      flexDirection = 'column',
      flex,
      justifyContent,
      alignItems,
      padding,
      paddingHorizontal,
      paddingVertical,
      margin,
      marginHorizontal,
      marginVertical,
      gap,
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius,
      style,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const computedStyle: ViewStyle = {
      flexDirection,
      ...(flex !== undefined && { flex }),
      ...(justifyContent && { justifyContent }),
      ...(alignItems && { alignItems }),
      ...(padding !== undefined && { padding: spacing[padding] }),
      ...(paddingHorizontal !== undefined && { paddingHorizontal: spacing[paddingHorizontal] }),
      ...(paddingVertical !== undefined && { paddingVertical: spacing[paddingVertical] }),
      ...(margin !== undefined && { margin: spacing[margin] }),
      ...(marginHorizontal !== undefined && { marginHorizontal: spacing[marginHorizontal] }),
      ...(marginVertical !== undefined && { marginVertical: spacing[marginVertical] }),
      ...(gap !== undefined && { gap: spacing[gap] }),
      ...(backgroundColor && { backgroundColor: colors[backgroundColor] }),
      ...(borderColor && { borderColor: colors[borderColor] }),
      ...(borderWidth !== undefined && { borderWidth }),
      ...(borderRadius !== undefined && { borderRadius }),
    };

    return (
      <View ref={ref} style={[computedStyle, style]}>
        {children}
      </View>
    );
  }
);

Box.displayName = 'Box';
