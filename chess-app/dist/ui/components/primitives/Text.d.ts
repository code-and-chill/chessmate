import React from 'react';
import { Text as RNText } from 'react-native';
export type TextVariant = 'body' | 'heading' | 'label' | 'caption';
export type TextColor = 'primary' | 'secondary' | 'muted' | 'danger';
export interface TextProps extends React.ComponentProps<typeof RNText> {
    variant?: TextVariant;
    color?: TextColor;
    children?: React.ReactNode;
}
export declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<RNText>>;
//# sourceMappingURL=Text.d.ts.map