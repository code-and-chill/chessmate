import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Box, BoxProps } from './Box';
import { shadow, radius } from '../../tokens';

export interface SurfaceProps extends BoxProps {
  elevated?: boolean;
}

export const Surface = React.forwardRef<any, SurfaceProps>(
  ({ elevated = false, backgroundColor = elevated ? 'surfaceElevated' : 'surface', borderRadius = radius.md, style, ...props }, ref) => {
    const { colors } = useTheme();
    const shadowStyle = elevated ? shadow.card : {};
    let mergedStyle: any;
    if (Array.isArray(style)) mergedStyle = [shadowStyle, ...style];
    else if (style) mergedStyle = [shadowStyle, style];
    else mergedStyle = shadowStyle;

    return (
      <Box
        ref={ref}
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        style={mergedStyle as any}
        {...props}
      />
    );
  }
);

Surface.displayName = 'Surface';
