import React from 'react';
import type { ViewStyle, View } from 'react-native';
import { Box } from '@/ui';

export interface StackProps {
  children: React.ReactNode;
  gap?: number;
  padding?: number;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  flex?: number;
  fullWidth?: boolean;
  fullHeight?: boolean;
  style?: ViewStyle;
}

// Normalize style to prevent invalid values in arrays
const normalizeStyle = (s: ViewStyle | ViewStyle[] | undefined): ViewStyle => {
  if (!s) return {};
  if (Array.isArray(s)) return Object.assign({}, ...s.filter(Boolean));
  return s;
};

/**
 * VStack – Vertical Stack
 * 
 * Usage:
 *   <VStack gap={3} padding={4}>
 *     <Text>Item 1</Text>
 *     <Text>Item 2</Text>
 *     <Text>Item 3</Text>
 *   </VStack>
 */
export const VStack = React.forwardRef<View, StackProps>(
  (
    {
      children,
      gap = 0,
      padding = 0,
      justifyContent = 'flex-start',
      alignItems = 'stretch',
      flex,
      fullWidth = false,
      fullHeight = false,
      style,
    },
    ref
  ) => {
    const containerStyle: ViewStyle = normalizeStyle(style);
    if (fullWidth) containerStyle.width = '100%';
    if (fullHeight) containerStyle.height = '100%';

    return (
      <Box
        ref={ref}
        flexDirection="column"
        gap={gap}
        padding={padding}
        justifyContent={justifyContent}
        alignItems={alignItems}
        flex={flex}
        style={containerStyle}
      >
        {children}
      </Box>
    );
  }
);

VStack.displayName = 'VStack';

/**
 * HStack – Horizontal Stack
 * 
 * Usage:
 *   <HStack gap={3} padding={4} justifyContent="space-between">
 *     <Text>Left</Text>
 *     <Text>Right</Text>
 *   </HStack>
 */
export const HStack = React.forwardRef<View, StackProps>(
  (
    {
      children,
      gap = 0,
      padding = 0,
      justifyContent = 'flex-start',
      alignItems = 'center',
      flex,
      fullWidth = false,
      fullHeight = false,
      style,
    },
    ref
  ) => {
    const containerStyle: ViewStyle = normalizeStyle(style);
    if (fullWidth) containerStyle.width = '100%';
    if (fullHeight) containerStyle.height = '100%';

    return (
      <Box
        ref={ref}
        flexDirection="row"
        gap={gap}
        padding={padding}
        justifyContent={justifyContent}
        alignItems={alignItems}
        flex={flex}
        style={containerStyle}
      >
        {children}
      </Box>
    );
  }
);

HStack.displayName = 'HStack';

/**
 * Spacer – Flexible spacer that takes up remaining space
 * 
 * Usage:
 *   <HStack>
 *     <Text>Left</Text>
 *     <Spacer />
 *     <Text>Right</Text>
 *   </HStack>
 */
export const Spacer: React.FC = () => <Box flex={1} />;
Spacer.displayName = 'Spacer';
