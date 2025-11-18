import { StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing } from '@/core/constants';

/**
 * Consistent Button Styles
 * Provides reusable button styles with variants and states
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleConfig {
  container: ViewStyle;
  text: TextStyle;
}

export const getButtonStyle = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  colorScheme: 'light' | 'dark' = 'light'
): ButtonStyleConfig => {
  const colors = Colors[colorScheme];
  
  const baseContainer: ViewStyle = {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  };

  const baseText: TextStyle = {
    fontWeight: '600',
    textAlign: 'center',
  };

  // Size-specific styles
  const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        minHeight: 32,
      },
      text: {
        fontSize: 14,
      },
    },
    md: {
      container: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        minHeight: 44,
      },
      text: {
        fontSize: 16,
      },
    },
    lg: {
      container: {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        minHeight: 52,
      },
      text: {
        fontSize: 18,
      },
    },
  };

  // Variant-specific styles
  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: colors.tint,
      },
      text: {
        color: '#fff',
      },
    },
    secondary: {
      container: {
        backgroundColor: colors.background === '#fff' ? '#f0f0f0' : '#2a2a2a',
      },
      text: {
        color: colors.text,
      },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.tint,
      },
      text: {
        color: colors.tint,
      },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: {
        color: colors.tint,
      },
    },
    danger: {
      container: {
        backgroundColor: '#FF3B30',
      },
      text: {
        color: '#fff',
      },
    },
  };

  return {
    container: {
      ...baseContainer,
      ...sizeStyles[size].container,
      ...variantStyles[variant].container,
    },
    text: {
      ...baseText,
      ...sizeStyles[size].text,
      ...variantStyles[variant].text,
    },
  };
};

/**
 * Button state styles
 */
export const buttonStates = StyleSheet.create({
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  hovered: {
    ...Platform.select({
      web: {
        transform: [{ scale: 1.02 }],
      },
    }),
  },
  loading: {
    opacity: 0.7,
  },
});

/**
 * Loading spinner styles
 */
export const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  text: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
});

/**
 * Feedback message styles (toast/snackbar)
 */
export const feedbackStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  error: {
    backgroundColor: '#FF3B30',
  },
  warning: {
    backgroundColor: '#FF9500',
  },
  info: {
    backgroundColor: '#007AFF',
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

/**
 * Input field styles
 */
export const inputStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
});
