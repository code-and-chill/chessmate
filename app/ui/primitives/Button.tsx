/**
 * Button Primitive Component
 * app/ui/primitives/Button.tsx
 */

import React from 'react';
import { Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import { Text } from './Text';
import { radiusTokens } from '../tokens/radii';
import { spacingTokens } from '../tokens/spacing';

type ButtonVariant = 'solid' | 'outline' | 'subtle' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonStyle = { bg: string; text: string; border: string };

type ButtonProps = PressableProps & {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  color?: string;
};

const buttonStyles: Record<ButtonVariant, ButtonStyle> = {
  solid: { bg: '#3B82F6', text: '#FFFFFF', border: 'none' },
  outline: { bg: 'transparent', text: '#3B82F6', border: '#3B82F6' },
  subtle: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'none' },
  ghost: { bg: 'transparent', text: '#3B82F6', border: 'none' },
};

const sizeStyles = {
  sm: { height: 32, paddingH: 3, fontSize: 'sm' as const },
  md: { height: 44, paddingH: 4, fontSize: 'base' as const },
  lg: { height: 56, paddingH: 6, fontSize: 'lg' as const },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  icon,
  isLoading,
  disabled,
  color,
  style,
  ...rest
}) => {
  const styles = buttonStyles[variant];
  const sizeConfig = sizeStyles[size];

  return (
    <Pressable
      disabled={disabled || isLoading}
      style={[
        {
          height: sizeConfig.height,
          paddingHorizontal: spacingTokens[sizeConfig.paddingH as keyof typeof spacingTokens],
          borderRadius: radiusTokens.md,
          backgroundColor: color || styles.bg,
          borderWidth: styles.border !== 'none' ? 1 : 0,
          borderColor: styles.border !== 'none' ? styles.border : undefined,
          opacity: disabled ? 0.5 : 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: spacingTokens[2],
        },
        typeof style === 'function' ? {} : style,
      ]}
      {...rest}
    >
        {icon}
        {typeof children === 'string' ? (
          <Text
            size={sizeConfig.fontSize}
            weight="semibold"
            color={color ? '#FFFFFF' : styles.text}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
};

Button.displayName = 'Button';
