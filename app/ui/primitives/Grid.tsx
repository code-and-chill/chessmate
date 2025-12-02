/**
 * Responsive Grid Component
 * app/ui/primitives/Grid.tsx
 * 
 * Responsive grid layout with automatic column count
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { spacingTokens } from '../tokens/spacing';
import { useGridColumns } from '../hooks/useResponsive';

type GridProps = {
  children: React.ReactNode;
  /** Gap between grid items */
  gap?: number;
  /** Minimum item width (overrides automatic columns) */
  minItemWidth?: number;
  /** Custom column count (overrides responsive default) */
  columns?: number;
  style?: ViewStyle;
};

/**
 * Grid Component
 * 
 * Responsive grid that adapts column count based on screen size
 * 
 * @example
 * ```tsx
 * // Auto columns (1 on mobile, 2 on tablet, 3+ on desktop)
 * <Grid gap={spacingTokens[4]}>
 *   {items.map(item => <GridItem key={item.id}>{item}</GridItem>)}
 * </Grid>
 * 
 * // Minimum item width (auto-fit)
 * <Grid minItemWidth={300} gap={spacingTokens[3]}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 * </Grid>
 * 
 * // Fixed column count
 * <Grid columns={3}>
 *   <Card>Item 1</Card>
 * </Grid>
 * ```
 */
export const Grid: React.FC<GridProps> = ({
  children,
  gap = spacingTokens[3],
  minItemWidth,
  columns: columnsProp,
  style,
}) => {
  const responsiveColumns = useGridColumns();
  const columns = columnsProp ?? responsiveColumns;

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gap / 2,
    marginVertical: -gap / 2,
  };

  const childArray = React.Children.toArray(children);

  return (
    <View style={[gridStyle, style]} accessibilityRole="list">
      {childArray.map((child, index) => {
        const itemStyle: ViewStyle = {
          width: minItemWidth
            ? `${100 / Math.floor(100 / (minItemWidth + gap))}%`
            : `${100 / columns}%`,
          paddingHorizontal: gap / 2,
          paddingVertical: gap / 2,
        };

        return (
          <View
            key={index}
            style={itemStyle}
            accessibilityRole="listitem"
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles if needed
});
