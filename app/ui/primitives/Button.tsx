import React from 'react';
import { Pressable, ActivityIndicator, View } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text, microInteractions, radiusTokens, spacingTokens, colorTokens, getColor } from '@/ui';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'subtle' | 'default';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonStyle = { 
  bg: string; 
  text: string; 
  border: string;
  hoverBg: string;
  activeBg: string;
};

type ButtonProps = PressableProps & {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  color?: string;
  animated?: boolean;
  isDark?: boolean;
};

const getButtonStyles = (isDark: boolean): Record<ButtonVariant, ButtonStyle> => ({
  primary: { 
    bg: getColor(colorTokens.blue[600], isDark),
    text: '#FFFFFF', 
    border: 'none',
    hoverBg: getColor(colorTokens.blue[700], isDark),
    activeBg: getColor(colorTokens.blue[800], isDark),
  },
  secondary: { 
    bg: getColor(colorTokens.neutral[200], isDark),
    text: getColor(colorTokens.neutral[900], isDark), 
    border: 'none',
    hoverBg: getColor(colorTokens.neutral[300], isDark),
    activeBg: getColor(colorTokens.neutral[400], isDark),
  },
  outline: { 
    bg: 'transparent',
    text: getColor(colorTokens.blue[600], isDark), 
    border: getColor(colorTokens.blue[600], isDark),
    hoverBg: getColor(colorTokens.blue[50], isDark),
    activeBg: getColor(colorTokens.blue[100], isDark),
  },
  ghost: { 
    bg: 'transparent',
    text: getColor(colorTokens.neutral[700], isDark), 
    border: 'none',
    hoverBg: getColor(colorTokens.neutral[100], isDark),
    activeBg: getColor(colorTokens.neutral[200], isDark),
  },
  destructive: {
    bg: getColor(colorTokens.red[600], isDark),
    text: '#FFFFFF',
    border: 'none',
    hoverBg: getColor(colorTokens.red[700], isDark),
    activeBg: getColor(colorTokens.red[800], isDark),
  },
  subtle: {
    bg: 'transparent',
    text: getColor(colorTokens.neutral[700], isDark),
    border: 'none',
    hoverBg: getColor(colorTokens.neutral[50], isDark),
    activeBg: getColor(colorTokens.neutral[100], isDark),
  },
  default: {
    bg: getColor(colorTokens.neutral[100], isDark),
    text: getColor(colorTokens.neutral[900], isDark),
    border: 'none',
    hoverBg: getColor(colorTokens.neutral[200], isDark),
    activeBg: getColor(colorTokens.neutral[300], isDark),
  },
});

const sizeStyles = {
  sm: { height: 32, paddingH: spacingTokens[3], fontSize: 'sm' as const, iconSize: 16 },
  md: { height: 44, paddingH: spacingTokens[4], fontSize: 'base' as const, iconSize: 20 },
  lg: { height: 56, paddingH: spacingTokens[5], fontSize: 'lg' as const, iconSize: 24 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  iconOnly = false,
  isLoading,
  disabled,
  color,
  animated = true,
  isDark = false,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const buttonStyles = getButtonStyles(isDark);
  const variantStyle = buttonStyles[variant] ?? buttonStyles.primary;
  const sizeConfig = sizeStyles[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }), []);

  const handlePressIn = () => {
    if (animated && !disabled && !isLoading) {
      scale.value = withSpring(microInteractions.scalePress, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const handlePressOut = () => {
    if (animated) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const buttonStyle: ViewStyle = {
    height: iconOnly ? sizeConfig.height : sizeConfig.height,
    width: iconOnly ? sizeConfig.height : undefined,
    paddingHorizontal: iconOnly ? 0 : sizeConfig.paddingH,
    borderRadius: radiusTokens.md,
    backgroundColor: color ?? variantStyle?.bg ?? getColor(colorTokens.blue[600], isDark),
    borderWidth: variantStyle?.border !== 'none' ? 1 : 0,
    borderColor: variantStyle?.border !== 'none' ? variantStyle?.border : undefined,
    opacity: disabled ? microInteractions.opacityDisabled : 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacingTokens[2],
  };

  return (
    <AnimatedPressable
      disabled={disabled || isLoading}
      style={[buttonStyle, animated && animatedStyle, typeof style === 'function' ? {} : style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || isLoading,
        busy: isLoading,
      }}
      accessibilityLabel={
        typeof children === 'string'
          ? children
          : rest.accessibilityLabel || 'Button'
      }
      accessibilityHint={rest.accessibilityHint}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle?.text ?? '#FFFFFF'}
          accessibilityLabel="Loading"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>
              {icon}
            </View>
          )}
          
          {!iconOnly && (
            typeof children === 'string' ? (
              <Text
                size={sizeConfig.fontSize}
                weight="semibold"
                color={color ? '#FFFFFF' : variantStyle?.text ?? '#FFFFFF'}
              >
                {children}
              </Text>
            ) : (
              children
            )
          )}
          
          {icon && iconPosition === 'right' && (
            <View style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>
              {icon}
            </View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
};

Button.displayName = 'Button';
