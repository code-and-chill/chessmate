import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Pressable } from 'react-native';
import { Text } from './Text';
import { Box } from './Box';
import { colors, spacing, radius } from '../../tokens';
const variantStyles = {
    primary: {
        background: colors.accentGreen,
        text: colors.surface,
    },
    secondary: {
        background: colors.surfaceMuted,
        text: colors.textPrimary,
    },
    danger: {
        background: colors.danger,
        text: colors.surface,
    },
};
const sizeStyles = {
    sm: {
        padding: spacing.sm,
        fontSize: 14,
    },
    md: {
        padding: spacing.md,
        fontSize: 16,
    },
};
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', onPress, disabled = false, children, iconLeft, iconRight, }, ref) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    return (_jsx(Pressable, { ref: ref, onPress: onPress, disabled: disabled, style: ({ pressed }) => [
            {
                backgroundColor: disabled ? colors.borderSubtle : variantStyle.background,
                borderRadius: radius.md,
                opacity: pressed && !disabled ? 0.8 : 1,
            },
        ], children: _jsxs(Box, { padding: size, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "sm", children: [iconLeft, _jsx(Text, { variant: "label", color: variant === 'secondary' ? 'primary' : 'secondary', style: { color: disabled ? colors.textMuted : variantStyle.text }, children: children }), iconRight] }) }));
});
Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map