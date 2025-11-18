import React from 'react';
import { Pressable, Text, ActivityIndicator, View, type PressableProps } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getButtonStyle, buttonStates, type ButtonVariant, type ButtonSize } from '@/styles/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
}

/**
 * Button Component
 * 
 * Consistent button with multiple variants, sizes, and states
 * Supports icons, loading states, and accessibility
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  onPress,
  ...pressableProps
}) => {
  const colorScheme = useColorScheme();
  const styles = getButtonStyle(variant, size, colorScheme ?? 'light');
  
  const disabled = isDisabled || isLoading;

  const IconComponent = icon ? (
    <IconSymbol
      name={icon}
      size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
      color={styles.text.color as string}
    />
  ) : null;

  return (
    <Pressable
      {...pressableProps}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        fullWidth && { width: '100%' },
        pressed && !disabled && buttonStates.pressed,
        disabled && buttonStates.disabled,
        isLoading && buttonStates.loading,
      ]}
      accessibilityRole="button"
      accessibilityState={{
        disabled,
        busy: isLoading,
      }}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color={styles.text.color as string} size="small" />
          <Text style={styles.text}>Loading...</Text>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && IconComponent}
          <Text style={styles.text}>{title}</Text>
          {icon && iconPosition === 'right' && IconComponent}
        </>
      )}
    </Pressable>
  );
};

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * LoadingOverlay Component
 * Full-screen loading indicator with optional message
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  const colorScheme = useColorScheme();
  
  if (!visible) return null;

  return (
    <View
      style={[
        {
          ...require('@/styles/ui').loadingStyles.overlay,
          backgroundColor: colorScheme === 'dark'
            ? 'rgba(0, 0, 0, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
        },
      ]}
    >
      <ActivityIndicator size="large" />
      {message && (
        <Text style={require('@/styles/ui').loadingStyles.text}>
          {message}
        </Text>
      )}
    </View>
  );
};

export interface FeedbackToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

/**
 * FeedbackToast Component
 * Temporary feedback message (toast/snackbar)
 */
export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
}) => {
  React.useEffect(() => {
    if (visible && onDismiss) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  const styles = require('@/styles/ui').feedbackStyles;

  return (
    <Pressable
      style={[styles.container, styles[type]]}
      onPress={onDismiss}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <IconSymbol
        name={
          type === 'success' ? 'checkmark.circle.fill' :
          type === 'error' ? 'xmark.circle.fill' :
          type === 'warning' ? 'exclamationmark.triangle.fill' :
          'info.circle.fill'
        }
        size={24}
        color="#fff"
      />
      <Text style={styles.message}>{message}</Text>
    </Pressable>
  );
};
