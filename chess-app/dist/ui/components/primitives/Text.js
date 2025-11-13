import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Text as RNText } from 'react-native';
import { colors, typography } from '../../tokens';
const variantStyles = {
    body: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.regular,
    },
    heading: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
    },
    caption: {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.regular,
    },
};
const colorMap = {
    primary: 'textPrimary',
    secondary: 'textSecondary',
    muted: 'textMuted',
    danger: 'danger',
};
export const Text = React.forwardRef(({ variant = 'body', color = 'primary', style, children, ...props }, ref) => {
    const variantStyle = variantStyles[variant];
    const textColor = colors[colorMap[color]];
    return (_jsx(RNText, { ref: ref, style: [variantStyle, { color: textColor }, style], ...props, children: children }));
});
Text.displayName = 'Text';
//# sourceMappingURL=Text.js.map