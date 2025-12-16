import React from 'react';
import { Pressable, ActivityIndicator, View } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text, microInteractions, radiusTokens, spacingTokens, colorTokens, shadowTokens, getColor, useThemeTokens, useIsDark } from '@/ui';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'subtle' | 'default' | 'glow' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonStyle = { 
  bg: string; 
  text: string; 
  border: string;
  hoverBg: string;
  activeBg: string;
  shadow?: any;
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

const getButtonStyles = (isDark: boolean, semantic: ReturnType<typeof useThemeTokens>['colors']): Record<ButtonVariant, ButtonStyle> => ({
  primary: { 
    bg: semantic.accent.primary,
    text: semantic.foreground.onAccent ?? '#FFFFFF', 
    border: 'none',
    hoverBg: semantic.interactive.hover,
    activeBg: semantic.interactive.active,
  },
  secondary: { 
    bg: semantic.background.secondary,
    text: semantic.foreground.primary, 
    border: 'none',
    hoverBg: semantic.background.tertiary,
    activeBg: semantic.background.elevated,
  },
  outline: { 
    bg: 'transparent',
    text: semantic.accent.primary, 
    border: semantic.accent.primary,
    hoverBg: semantic.background.accentSubtle,
    activeBg: semantic.background.tertiary,
  },
  ghost: { 
    bg: 'transparent',
    text: semantic.foreground.secondary, 
    border: 'none',
    hoverBg: semantic.background.accentSubtle,
    activeBg: semantic.background.tertiary,
  },
  destructive: {
    bg: semantic.error,
    text: semantic.foreground.onAccent ?? '#FFFFFF',
    border: 'none',
    hoverBg: getColor(colorTokens.red[700], isDark),
    activeBg: getColor(colorTokens.red[800], isDark),
  },
  subtle: {
    bg: semantic.background.accentSubtle,
    text: semantic.accent.primary,
    border: 'none',
    hoverBg: semantic.background.tertiary,
    activeBg: semantic.background.elevated,
  },
  default: {
    bg: semantic.background.secondary,
    text: semantic.foreground.primary,
    border: 'none',
    hoverBg: semantic.background.tertiary,
    activeBg: semantic.background.elevated,
  },
  glow: {
    bg: semantic.accent.primary,
    text: semantic.foreground.onAccent ?? '#FFFFFF',
    border: 'none',
    hoverBg: semantic.interactive.hover,
    activeBg: semantic.interactive.active,
    shadow: shadowTokens.glowMd,
  },
  glass: {
    bg: semantic.translucent.medium,
    text: semantic.foreground.primary,
    border: semantic.border,
    hoverBg: semantic.translucent.light,
    activeBg: semantic.translucent.dark,
  },
});

const sizeStyles = {
  sm: { height: 44, paddingH: spacingTokens[4], fontSize: 'sm' as const, iconSize: 18 },
  md: { height: 48, paddingH: spacingTokens[4], fontSize: 'base' as const, iconSize: 20 },
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
  isDark: isDarkOverride,
  style,
  ...rest
}: ButtonProps) => {
  const scale = useSharedValue(1);
  const { colors: semanticColors } = useThemeTokens();
  const isDark = isDarkOverride ?? useIsDark();
  const buttonStyles = getButtonStyles(isDark, semanticColors);
  const variantStyle = buttonStyles[variant as ButtonVariant] ?? buttonStyles.primary;
  const sizeConfig = sizeStyles[size as ButtonSize];

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
    height: sizeConfig.height,
    minHeight: 44,
    width: iconOnly ? sizeConfig.height : undefined,
    paddingHorizontal: iconOnly ? 0 : sizeConfig.paddingH,
    borderRadius: radiusTokens.md,
    backgroundColor: color ?? variantStyle?.bg ?? semanticColors.interactive.default,
    borderWidth: variantStyle?.border !== 'none' ? 1 : 0,
    borderColor: variantStyle?.border !== 'none' ? variantStyle?.border : undefined,
    opacity: disabled ? microInteractions.opacityDisabled : 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacingTokens[2],
    ...(variantStyle?.shadow || {}),
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
                color={color ? semanticColors.foreground.onAccent ?? '#FFFFFF' : variantStyle?.text ?? '#FFFFFF'}
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
