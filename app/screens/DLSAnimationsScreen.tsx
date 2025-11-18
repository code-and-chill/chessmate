/**
 * DLS Animations Demo Screen
 * app/screens/DLSAnimationsScreen.tsx
 *
 * Demonstrates all 14 animation utilities
 * Interactive showcase of animation presets
 */

import { useState } from 'react';
import { ScrollView, Animated } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Card,
  useColors,
  animations,
} from '@/ui';

interface AnimationDemoProps {
  name: string;
  description: string;
  color: string;
  onAnimate: () => void;
}

function AnimationDemo({ name, description, color, onAnimate }: AnimationDemoProps) {
  const colors = useColors();
  
  return (
    <Card padding={4} backgroundColor={colors.background.secondary}>
      <VStack gap={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap={1}>
            <Text variant="subheading" color={colors.foreground.primary}>
              {name}
            </Text>
            <Text variant="caption" color={colors.foreground.tertiary}>
              {description}
            </Text>
          </VStack>
          <Button
            variant="solid"
            size="sm"
            color={color}
            onPress={onAnimate}
          >
            ▶ Play
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
}

export function AnimationsScreen() {
  const colors = useColors();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [spinAnim] = useState(new Animated.Value(0));

  const animationDemos = [
    {
      name: 'Fade In',
      description: 'Smooth opacity transition',
      color: 'blue',
      onAnimate: () => {
        fadeAnim.setValue(0);
        animations.fadeIn(fadeAnim).start();
      },
      animValue: fadeAnim,
      style: { opacity: fadeAnim },
    },
    {
      name: 'Fade Out',
      description: 'Fade to transparent',
      color: 'purple',
      onAnimate: () => {
        fadeAnim.setValue(1);
        animations.fadeOut(fadeAnim).start();
      },
      animValue: fadeAnim,
      style: { opacity: fadeAnim },
    },
    {
      name: 'Scale Up',
      description: 'Grow from small to normal',
      color: 'green',
      onAnimate: () => {
        scaleAnim.setValue(0);
        animations.scaleUp(scaleAnim).start();
      },
      animValue: scaleAnim,
      style: { transform: [{ scale: scaleAnim }] },
    },
    {
      name: 'Scale Down',
      description: 'Shrink from normal to small',
      color: 'red',
      onAnimate: () => {
        scaleAnim.setValue(1);
        animations.scaleDown(scaleAnim).start();
      },
      animValue: scaleAnim,
      style: { transform: [{ scale: scaleAnim }] },
    },
    {
      name: 'Slide In (Vertical)',
      description: 'Slide from top to position',
      color: 'cyan',
      onAnimate: () => {
        slideAnim.setValue(-100);
        animations.slideInVertical(slideAnim).start();
      },
      animValue: slideAnim,
      style: { transform: [{ translateY: slideAnim }] },
    },
    {
      name: 'Slide In (Horizontal)',
      description: 'Slide from left to position',
      color: 'amber',
      onAnimate: () => {
        slideAnim.setValue(-100);
        animations.slideInHorizontal(slideAnim).start();
      },
      animValue: slideAnim,
      style: { transform: [{ translateX: slideAnim }] },
    },
    {
      name: 'Bounce',
      description: 'Playful bouncing effect',
      color: 'green',
      onAnimate: () => {
        animations.bounce(bounceAnim).start();
      },
      animValue: bounceAnim,
      style: { transform: [{ translateY: bounceAnim }] },
    },
    {
      name: 'Pulse',
      description: 'Rhythmic scale pulsing',
      color: 'purple',
      onAnimate: () => {
        animations.pulse(pulseAnim).start();
      },
      animValue: pulseAnim,
      style: { transform: [{ scale: pulseAnim }] },
    },
    {
      name: 'Shake',
      description: 'Horizontal shake for errors',
      color: 'red',
      onAnimate: () => {
        animations.shake(shakeAnim).start();
      },
      animValue: shakeAnim,
      style: { transform: [{ translateX: shakeAnim }] },
    },
    {
      name: 'Rotate',
      description: 'Smooth 360° rotation',
      color: 'blue',
      onAnimate: () => {
        animations.rotate(rotateAnim).start();
      },
      animValue: rotateAnim,
      style: {
        transform: [
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      },
    },
    {
      name: 'Spin (Continuous)',
      description: 'Infinite spinning animation',
      color: 'cyan',
      onAnimate: () => {
        spinAnim.setValue(0);
        animations.spin(spinAnim).start();
      },
      animValue: spinAnim,
      style: {
        transform: [
          {
            rotate: spinAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      },
    },
  ];

  const combinedAnimations = [
    {
      name: 'Fade In + Scale Up',
      description: 'Combined entrance effect',
      color: 'purple',
      onAnimate: () => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0);
        Animated.parallel([
          animations.fadeIn(fadeAnim),
          animations.scaleUp(scaleAnim),
        ]).start();
      },
    },
    {
      name: 'Slide + Fade In',
      description: 'Smooth slide with fade',
      color: 'green',
      onAnimate: () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(-100);
        Animated.parallel([
          animations.fadeIn(fadeAnim),
          animations.slideInVertical(slideAnim),
        ]).start();
      },
    },
    {
      name: 'Bounce + Pulse',
      description: 'Energetic combined effect',
      color: 'amber',
      onAnimate: () => {
        Animated.parallel([
          animations.bounce(bounceAnim),
          animations.pulse(pulseAnim),
        ]).start();
      },
    },
  ];

  return (
    <Box flex={1} backgroundColor={colors.background.primary}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box padding={4} backgroundColor={colors.accent.primary}>
          <Text variant="heading" color={colors.accentForeground.primary}>
            Animation Showcase
          </Text>
          <Text variant="caption" color={colors.accentForeground.secondary}>
            14 animation utilities ready to use
          </Text>
        </Box>

        {/* Preview Box */}
        <VStack gap={4} padding={4}>
          <Text variant="subheading" color={colors.foreground.primary}>
            🎬 Live Preview
          </Text>
          
          <Box 
            padding={8} 
            backgroundColor={colors.background.secondary}
            radius="md"
            style={{ alignItems: 'center', justifyContent: 'center', minHeight: 150 }}
          >
            <Animated.View
              style={[
                {
                  width: 80,
                  height: 80,
                  backgroundColor: colors.accent.primary,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                { opacity: fadeAnim },
                { transform: [{ scale: scaleAnim }] },
                { transform: [{ translateY: slideAnim }] },
                { transform: [{ translateY: bounceAnim }] },
              ]}
            >
              <Text variant="heading" color={colors.accentForeground.primary}>
                ✨
              </Text>
            </Animated.View>
          </Box>

          <Box flex={1} />

          {/* Basic Animations */}
          <Text variant="subheading" color={colors.foreground.primary}>
            🎨 Basic Animations
          </Text>
          
          <VStack gap={3}>
            {animationDemos.map((demo) => (
              <AnimationDemo key={demo.name} {...demo} />
            ))}
          </VStack>

          <Box flex={1} />

          {/* Combined Animations */}
          <Text variant="subheading" color={colors.foreground.primary}>
            🎭 Combined Animations
          </Text>
          
          <VStack gap={3}>
            {combinedAnimations.map((demo) => (
              <AnimationDemo key={demo.name} {...demo} />
            ))}
          </VStack>

          <Box flex={1} />

          {/* Animation Guide */}
          <Box padding={4} backgroundColor={colors.background.secondary} radius="md">
            <VStack gap={3}>
              <Text variant="subheading" color={colors.foreground.primary}>
                📖 Usage Guide
              </Text>
              <Text variant="body" color={colors.foreground.secondary}>
                All animations are pre-configured with optimal durations and easing curves.
              </Text>
              <Text variant="caption" color={colors.foreground.tertiary}>
                • Entrance: fadeIn, scaleUp, slideIn (300ms)
              </Text>
              <Text variant="caption" color={colors.foreground.tertiary}>
                • Exit: fadeOut, scaleDown (200ms)
              </Text>
              <Text variant="caption" color={colors.foreground.tertiary}>
                • Attention: bounce, pulse, shake (600ms)
              </Text>
              <Text variant="caption" color={colors.foreground.tertiary}>
                • Rotation: rotate, spin (400ms / infinite)
              </Text>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
}

AnimationsScreen.displayName = 'AnimationsScreen';
