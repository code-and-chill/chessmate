import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { View } from 'react-native';
import { colors, spacing } from '../../tokens';
export const Box = React.forwardRef(({ children, flexDirection = 'column', flex, justifyContent, alignItems, padding, paddingHorizontal, paddingVertical, margin, marginHorizontal, marginVertical, gap, backgroundColor, borderColor, borderWidth, borderRadius, style, }, ref) => {
    const computedStyle = {
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
    return (_jsx(View, { ref: ref, style: [computedStyle, style], children: children }));
});
Box.displayName = 'Box';
//# sourceMappingURL=Box.js.map