/**
 * Toast Notification Component
 */

import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { Text } from './Text';
import { HStack } from './Stack';
import { radiusTokens } from '../tokens/radii';
import { shadowTokens } from '../tokens/shadows';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

const getToastColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
    default:
      return '#3B82F6';
  }
};

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '!';
    case 'info':
    default:
      return 'ℹ';
  }
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, fadeAnim, onDismiss]);

  if (!visible) return null;

  const backgroundColor = getToastColor(type);
  const icon = getToastIcon(type);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        marginHorizontal: 16,
        marginVertical: 12,
      }}
    >
      <HStack
        gap={2}
        padding={3}
        style={{
          borderRadius: radiusTokens.md,
          backgroundColor,
          ...shadowTokens.card,
        }}
        alignItems="center"
      >
        <Text
          variant="body"
          color="#fff"
          weight="bold"
          style={{ width: 24, textAlign: 'center' }}
        >
          {icon}
        </Text>
        <HStack flex={1}>
          <Text variant="body" color="#fff">
            {message}
          </Text>
        </HStack>
      </HStack>
    </Animated.View>
  );
};

Toast.displayName = 'Toast';
