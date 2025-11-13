import React from 'react';
export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md';
export interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    onPress: () => void | Promise<void>;
    disabled?: boolean;
    children: React.ReactNode;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<import("react-native").View>>;
//# sourceMappingURL=Button.d.ts.map