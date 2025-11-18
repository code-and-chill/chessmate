import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { inputStyles } from '@/styles/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spacing } from '@/constants/layout';

export interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * FormInput Component
 * 
 * Accessible form input with label, error states, and helper text
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  onFocus,
  onBlur,
  ...inputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={inputStyles.container}>
      {label && (
        <Text
          style={[inputStyles.label, { color: colors.text }]}
          accessibilityRole="text"
        >
          {label}
          {required && <Text style={{ color: '#FF3B30' }}> *</Text>}
        </Text>
      )}
      
      <TextInput
        {...inputProps}
        style={[
          inputStyles.input,
          {
            color: colors.text,
            borderColor: error ? '#FF3B30' : isFocused ? colors.tint : colors.icon,
            backgroundColor: colors.background,
          },
          isFocused && inputStyles.inputFocused,
          error && inputStyles.inputError,
        ]}
        placeholderTextColor={colors.icon}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={label}
        accessibilityRequired={required}
        accessibilityInvalid={!!error}
      />
      
      {error && (
        <Text
          style={inputStyles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text style={[inputStyles.helperText, { color: colors.icon }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional custom styles if needed
});
