/**
 * Input Primitive Component - DLS-first implementation
 * app/ui/primitives/Input.tsx
 * 
 * Theme-aware text input with focus/disabled states.
 * Uses DLS tokens and Box component for consistent styling.
 */

import React from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Box } from './Box';
import { Text } from './Text';
import { useColors } from '../hooks/useThemeTokens';
import { motionTokens } from '../tokens/motion';

type InputVariant = 'default' | 'glass';

type InputProps = TextInputProps & {
  label?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  error?: string;
  variant?: InputVariant;
};

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      leftAccessory,
      rightAccessory,
      error,
      variant = 'default',
      editable = true,
      style,
      ...rest
    },
    ref
  ) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = React.useState(false);
    const disabled = editable === false;

    // Animated border color
    const borderColor = useSharedValue(
      error ? colors.error : colors.border || colors.foreground.muted
    );

    React.useEffect(() => {
      if (error) {
        borderColor.value = colors.error;
      } else if (isFocused) {
        borderColor.value = withTiming(colors.accent.primary, {
          duration: motionTokens.duration.normal,
        });
      } else {
        borderColor.value = withTiming(
          variant === 'glass' ? colors.border : colors.foreground.muted,
          { duration: motionTokens.duration.normal }
        );
      }
    }, [isFocused, error, variant, colors]);

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderColor: borderColor.value,
    }));

    const getBackgroundColor = () => {
      if (variant === 'glass') return colors.translucent.medium;
      return 'transparent';
    };

    return (
      <Box gap={2}>
        {label && (
          <Text variant="label" color={colors.foreground.secondary}>
            {label}
          </Text>
        )}
        <Animated.View style={animatedBorderStyle}>
          <Box
            flexDirection="row"
            alignItems="center"
            padding={3}
            radius="md"
            borderWidth={1}
            backgroundColor={getBackgroundColor()}
            gap={2}
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            {leftAccessory}
            <TextInput
              ref={ref}
              style={[
                {
                  flex: 1,
                  fontSize: 16,
                  color: colors.foreground.primary,
                },
                style,
              ]}
              placeholderTextColor={colors.foreground.muted}
              editable={editable}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...rest}
            />
            {rightAccessory}
          </Box>
        </Animated.View>
        {error && (
          <Text variant="caption" color={colors.error}>
            {error}
          </Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';
