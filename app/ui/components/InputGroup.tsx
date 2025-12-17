/**
 * InputGroup Component - DLS-first implementation
 * 
 * Input group with seamless addon support, built on DLS tokens.
 * 
 * @see https://ui.shadcn.com/docs/components/input-group
 */

import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { InteractivePressable } from '../primitives/InteractivePressable';
import { useColors } from '../hooks/useThemeTokens';
import { motionTokens } from '../tokens/motion';

type InputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end';

export interface InputGroupAddonProps {
  children: React.ReactNode;
  align?: InputGroupAddonAlign;
}

export interface InputGroupProps {
  children: React.ReactNode;
  style?: any;
}

export interface InputGroupInputProps extends TextInputProps {
  style?: any;
}

export interface InputGroupTextProps {
  children: React.ReactNode;
  style?: any;
}

/**
 * Main InputGroup container
 */
export const InputGroup: React.FC<InputGroupProps> = ({ children, style }) => {
  return (
    <Box flexDirection="row" alignItems="stretch" style={style}>
      {children}
    </Box>
  );
};

/**
 * Input component for InputGroup
 */
export const InputGroupInput = React.forwardRef<TextInput, InputGroupInputProps>(
  ({ style, ...props }, ref) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = React.useState(false);
    const borderColor = useSharedValue(colors.border || colors.foreground.muted);

    React.useEffect(() => {
      borderColor.value = withTiming(
        isFocused ? colors.accent.primary : colors.border || colors.foreground.muted,
        { duration: motionTokens.duration.normal }
      );
    }, [isFocused, colors]);

    const animatedBorderStyle = useAnimatedStyle(() => ({
      borderColor: borderColor.value,
    }));

    return (
      <Animated.View style={animatedBorderStyle}>
        <Box
          flex={1}
          padding={3}
          radius="md"
          borderWidth={1}
          backgroundColor="transparent"
        >
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </Box>
      </Animated.View>
    );
  }
);

InputGroupInput.displayName = 'InputGroupInput';

/**
 * Addon component for icons, text, or buttons
 */
export const InputGroupAddon: React.FC<InputGroupAddonProps> = ({
  children,
  align = 'inline-start',
}) => {
  const colors = useColors();
  const isInline = align === 'inline-start' || align === 'inline-end';
  const isStart = align === 'inline-start' || align === 'block-start';

  return (
    <Box
      flexDirection={isInline ? 'row' : 'column'}
      alignItems="center"
      justifyContent="center"
      padding={isInline ? 2 : 3}
      radius="md"
      borderWidth={1}
      borderColor={colors.border || colors.foreground.muted}
      backgroundColor={colors.background.secondary}
      style={{
        borderLeftWidth: isStart ? 1 : 0,
        borderRightWidth: !isStart ? 1 : 0,
        borderTopLeftRadius: isStart ? undefined : 0,
        borderBottomLeftRadius: isStart ? undefined : 0,
        borderTopRightRadius: !isStart ? undefined : 0,
        borderBottomRightRadius: !isStart ? undefined : 0,
      }}
    >
      {children}
    </Box>
  );
};

/**
 * Text component for addons
 */
export const InputGroupText: React.FC<InputGroupTextProps> = ({
  children,
  style,
}) => {
  const colors = useColors();
  return (
    <Text variant="body" color={colors.foreground.secondary} style={style}>
      {children}
    </Text>
  );
};

/**
 * Button component for addons
 */
export interface InputGroupButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'icon-xs' | 'icon-sm';
  style?: any;
}

export const InputGroupButton: React.FC<InputGroupButtonProps> = ({
  children,
  onPress,
  variant = 'ghost',
  size = 'icon-xs',
  style,
}) => {
  const colors = useColors();
  const isIcon = size.startsWith('icon-');

  const buttonProps = {
    padding: isIcon ? 0 : 2,
    radius: 'sm' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor:
      variant === 'default'
        ? colors.accent.primary
        : variant === 'outline'
          ? 'transparent'
          : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? colors.border || colors.foreground.muted : undefined,
    style: {
      minWidth: isIcon ? 20 : undefined,
      minHeight: isIcon ? 20 : undefined,
      ...style,
    },
  };

  const content =
    typeof children === 'string' ? (
      <Text
        variant="caption"
        color={variant === 'default' ? colors.foreground.onAccent : colors.foreground.secondary}
        size={size === 'xs' ? 'xs' : 'sm'}
      >
        {children}
      </Text>
    ) : (
      children
    );

  if (onPress) {
    return (
      <InteractivePressable onPress={onPress} scaleOnPress pressScale={0.95}>
        <Box {...buttonProps}>{content}</Box>
      </InteractivePressable>
    );
  }

  return <Box {...buttonProps}>{content}</Box>;
};
