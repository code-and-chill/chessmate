/**
 * LayoutGrid - Atomic Layout Component
 * 
 * Responsive grid component following atomic design principles.
 * Provides consistent grid layouts across breakpoints.
 * 
 * @packageDocumentation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useGridColumns } from '@/ui/hooks/useResponsive';
import { spacingTokens } from '@/ui/tokens/spacing';

export interface LayoutGridProps {
  /** Child components */
  children?: React.ReactNode;
  /** Gap between grid items */
  gap?: number | keyof typeof spacingTokens;
  /** Custom style */
  style?: ViewStyle;
  /** Number of columns (overrides responsive calculation) */
  columns?: number;
  /** Test ID */
  testID?: string;
}

/**
 * LayoutGrid Component
 * 
 * Atomic grid component that provides responsive column layouts.
 * Automatically calculates column count based on breakpoint.
 * 
 * @example
 * ```tsx
 * <LayoutGrid gap={3}>
 *   <Item />
 *   <Item />
 *   <Item />
 * </LayoutGrid>
 * ```
 */
export const LayoutGrid: React.FC<LayoutGridProps> = ({
  children,
  gap,
  style,
  columns,
  testID,
}) => {
  const responsiveColumns = useGridColumns();
  const gridColumns = columns ?? responsiveColumns;
  
  const getGapValue = (g: typeof gap): number | undefined => {
    if (g === undefined) return spacingTokens[3]; // Default gap
    if (typeof g === 'number') return spacingTokens[g as keyof typeof spacingTokens] || g;
    return spacingTokens[g];
  };

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getGapValue(gap),
    ...style,
  };

  // Calculate item width based on columns
  const itemWidth = `${100 / gridColumns}%`;

  return (
    <View style={gridStyle} testID={testID}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child as React.ReactElement<any>, {
          style: [
            { width: itemWidth },
            (child.props as any)?.style,
          ],
          key: child.key ?? index,
        });
      })}
    </View>
  );
};

LayoutGrid.displayName = 'LayoutGrid';
