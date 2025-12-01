/**
 * Background Layer Component
 * app/features/theme/components/BackgroundLayer.tsx
 * 
 * Renders the global background behind all content
 * Supports solid, gradient, glass, texture, and image backgrounds
 */

import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../stores/useThemeStore';
import type { BackgroundTheme } from '../domain/models';

export interface BackgroundLayerProps {
  children: React.ReactNode;
}

/**
 * Render solid background
 */
const SolidBackground: React.FC<{ theme: BackgroundTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.solid?.color || '#F7FAFC' }]}>
      {children}
    </View>
  );
};

/**
 * Render gradient background
 */
const GradientBackground: React.FC<{ theme: BackgroundTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const { colors, angle = 0, stops } = theme.gradient || {};
  
  if (!colors || colors.length === 0) {
    return <SolidBackground theme={{ ...theme, solid: { color: '#F7FAFC' } }}>{children}</SolidBackground>;
  }

  // Convert angle to start/end points for LinearGradient
  const angleRad = (angle * Math.PI) / 180;
  const start = { x: 0.5 - Math.cos(angleRad) / 2, y: 0.5 - Math.sin(angleRad) / 2 };
  const end = { x: 0.5 + Math.cos(angleRad) / 2, y: 0.5 + Math.sin(angleRad) / 2 };

  return (
    <LinearGradient colors={colors} start={start} end={end} locations={stops} style={styles.container}>
      {children}
    </LinearGradient>
  );
};

/**
 * Render glass morphism background
 */
const GlassBackground: React.FC<{ theme: BackgroundTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const { backgroundColor, opacity = 0.9 } = theme.glass || {};
  
  return (
    <View style={[styles.container, { backgroundColor: backgroundColor || 'rgba(255,255,255,0.1)' }]}>
      <View style={{ flex: 1, opacity }}>{children}</View>
    </View>
  );
};

/**
 * Render texture background
 */
const TextureBackground: React.FC<{ theme: BackgroundTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const { color, opacity = 0.05 } = theme.texture || {};
  
  // Simple texture implementation (can be enhanced with actual texture images)
  return (
    <View style={[styles.container, { backgroundColor: color || '#2D3748' }]}>
      <View style={{ flex: 1, opacity }}>{children}</View>
    </View>
  );
};

/**
 * Render image background
 */
const ImageBackgroundLayer: React.FC<{ theme: BackgroundTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const { uri, opacity = 1, blur = 0 } = theme.image || {};
  
  if (!uri) {
    return <SolidBackground theme={{ ...theme, solid: { color: '#F7FAFC' } }}>{children}</SolidBackground>;
  }

  return (
    <ImageBackground
      source={{ uri }}
      style={styles.container}
      blurRadius={blur}
      imageStyle={{ opacity }}
    >
      {children}
    </ImageBackground>
  );
};

/**
 * Background Layer
 * 
 * Main component that renders the appropriate background based on theme type
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ children }) => {
  const { theme } = useTheme();
  const backgroundTheme = theme.background;

  switch (backgroundTheme.type) {
    case 'solid':
      return <SolidBackground theme={backgroundTheme}>{children}</SolidBackground>;
    
    case 'gradient':
      return <GradientBackground theme={backgroundTheme}>{children}</GradientBackground>;
    
    case 'glass':
      return <GlassBackground theme={backgroundTheme}>{children}</GlassBackground>;
    
    case 'texture':
      return <TextureBackground theme={backgroundTheme}>{children}</TextureBackground>;
    
    case 'image':
      return <ImageBackgroundLayer theme={backgroundTheme}>{children}</ImageBackgroundLayer>;
    
    default:
      return <SolidBackground theme={{ ...backgroundTheme, solid: { color: '#F7FAFC' } }}>{children}</SolidBackground>;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

BackgroundLayer.displayName = 'BackgroundLayer';
