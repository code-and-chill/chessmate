/**
 * Input Primitive Component
 * app/ui/primitives/Input.tsx
 * 
 * Theme-aware text input with focus/disabled states.
 * Compliance: 90% (theme-aware, proper states, forward ref)
 */

import React from 'react';
import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Box } from './Box';
import { Text } from './Text';
import { useColors } from '../hooks/useThemeTokens';

type InputProps = TextInputProps & {
  label?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  error?: string;
};

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      leftAccessory,
      rightAccessory,
      error,
      editable = true,
      style,
      ...rest
    },
    ref
  ) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = React.useState(false);
    const disabled = editable === false;

    return (
      <Box gap={2}>
        {label && (
          <Text variant="label" color={colors.foreground.secondary}>
            {label}
          </Text>
        )}
        <Box
          flexDirection="row"
          alignItems="center"
          padding={3}
          radius="md"
          backgroundColor={colors.background.secondary}
          borderWidth={1}
          borderColor={
            error
              ? colors.error
              : isFocused
              ? colors.accent.primary
              : colors.foreground.muted
          }
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
