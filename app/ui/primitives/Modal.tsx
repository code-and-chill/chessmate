/**
 * Modal Primitive Component
 * app/ui/primitives/Modal.tsx
 * 
 * Production-grade modal with animations, backdrop, and proper states
 */

import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from './Text';
import { Button } from './Button';
import { spacingTokens, spacingScale } from '../tokens/spacing';
import { radiusTokens } from '../tokens/radii';
import { shadowTokens } from '../tokens/shadows';
import { motionTokens } from '../tokens/motion';
import { colorTokens, getColor } from '../tokens/colors';
import { useColors } from '../theme/ThemeProvider';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';
export type ModalPlacement = 'center' | 'bottom' | 'top';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: ModalSize;
  placement?: ModalPlacement;
  showCloseButton?: boolean;
  scrollable?: boolean;
  isDark?: boolean;
  footer?: React.ReactNode;
  backdropOpacity?: number;
  animationDuration?: number;
};

const sizeStyles = {
  sm: { maxWidth: 400, maxHeight: '60%' },
  md: { maxWidth: 600, maxHeight: '70%' },
  lg: { maxWidth: 800, maxHeight: '80%' },
  full: { maxWidth: '95%', maxHeight: '90%' },
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  size = 'md',
  placement = 'center',
  showCloseButton = true,
  scrollable = true,
  isDark = false,
  footer,
  backdropOpacity = 0.5,
  animationDuration = motionTokens.duration.moderate,
}) => {
  const colors = useColors();
  const backdropOpacityValue = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalTranslateY = useSharedValue(placement === 'bottom' ? 100 : 0);

  useEffect(() => {
    if (visible) {
      backdropOpacityValue.value = withTiming(backdropOpacity, {
        duration: animationDuration,
      });
      modalScale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
      modalTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    } else {
      backdropOpacityValue.value = withTiming(0, {
        duration: animationDuration,
      });
      modalScale.value = withTiming(0.9, {
        duration: animationDuration,
      });
      modalTranslateY.value = withTiming(
        placement === 'bottom' ? 100 : 0,
        { duration: animationDuration }
      );
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacityValue.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
  }));

  const sizeConfig = sizeStyles[size];
  const backgroundColor = getColor(colorTokens.neutral[50], isDark);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor,
              maxWidth: sizeConfig.maxWidth,
              maxHeight: sizeConfig.maxHeight,
              ...shadowTokens.modal,
            },
            placement === 'center' && styles.placementCenter,
            placement === 'bottom' && styles.placementBottom,
            placement === 'top' && styles.placementTop,
            modalStyle,
          ]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
              {title && (
                <Text size="xl" weight="semibold">
                  {title}
                </Text>
              )}
              
              {showCloseButton && (
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <Text size="2xl" color={getColor(colorTokens.neutral[600], isDark)}>
                    ×
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Body */}
          {scrollable ? (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.body}>{children}</View>
          )}

          {/* Footer */}
          {footer && <View style={[styles.footer, { borderTopColor: colors.border.default }]}>{footer}</View>}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

Modal.displayName = 'Modal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', // Backdrop is always black for overlay effect
  },
  modal: {
    width: '90%',
    borderRadius: radiusTokens.lg,
    overflow: 'hidden',
  },
  placementCenter: {
    alignSelf: 'center',
  },
  placementBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  placementTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacingScale.lg,
    borderBottomWidth: 1,
    // borderBottomColor applied dynamically via colors.border.default
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    maxHeight: '100%',
  },
  bodyContent: {
    padding: spacingScale.lg,
  },
  footer: {
    padding: spacingScale.lg,
    borderTopWidth: 1,
    // borderTopColor applied dynamically via colors.border.default
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacingTokens[3],
  },
});
