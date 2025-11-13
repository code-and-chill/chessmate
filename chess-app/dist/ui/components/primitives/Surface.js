import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Box } from './Box';
import { shadow, radius } from '../../tokens';
export const Surface = React.forwardRef(({ elevated = false, backgroundColor = elevated ? 'surfaceElevated' : 'surface', borderRadius = radius.md, style, ...props }, ref) => {
    const shadowStyle = elevated ? shadow.card : {};
    let mergedStyle;
    if (Array.isArray(style))
        mergedStyle = [shadowStyle, ...style];
    else if (style)
        mergedStyle = [shadowStyle, style];
    else
        mergedStyle = shadowStyle;
    return (_jsx(Box, { ref: ref, backgroundColor: backgroundColor, borderRadius: borderRadius, style: mergedStyle, ...props }));
});
Surface.displayName = 'Surface';
//# sourceMappingURL=Surface.js.map