import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../tokens';
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
    backgroundColor?: keyof typeof colors;
    borderColor?: keyof typeof colors;
    borderWidth?: number;
    borderRadius?: number;
    style?: ViewStyle | ViewStyle[];
}
export declare const Box: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<View>>;
//# sourceMappingURL=Box.d.ts.map