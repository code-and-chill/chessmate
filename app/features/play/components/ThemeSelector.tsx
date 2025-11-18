'use client';

/**
 * ThemeSelector Component
 * app/components/play/ThemeSelector.tsx
 * 
 * Allows users to switch between different board themes and modes
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Box, Card } from '@/ui';
import type { BoardTheme, ThemeMode } from '@/features/board/config/themeConfig';

export interface ThemeSelectorProps {
  currentTheme: BoardTheme;
  currentMode: ThemeMode;
  onThemeChange: (theme: BoardTheme) => void;
  onModeChange: (mode: ThemeMode) => void;
}

const BOARD_THEMES: { value: BoardTheme; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'brown', label: 'Brown' },
  { value: 'blue', label: 'Blue' },
  { value: 'marble', label: 'Marble' },
  { value: 'green', label: 'Green' },
  { value: 'gray', label: 'Gray' },
  { value: 'purple', label: 'Purple' },
];

const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  currentMode,
  onThemeChange,
  onModeChange,
}) => {
  return (
    <Card padding={3} style={styles.container}>
      <Box gap={3}>
        {/* Board Theme Selection */}
        <Box>
          <Text style={styles.sectionTitle}>Board Theme</Text>
          <Box flexDirection="row" gap={2} style={styles.optionsContainer}>
            {BOARD_THEMES.map((theme) => (
              <Pressable
                key={theme.value}
                onPress={() => onThemeChange(theme.value)}
                style={[
                  styles.themeButton,
                  currentTheme === theme.value && styles.themeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    currentTheme === theme.value && styles.themeButtonTextActive,
                  ]}
                >
                  {theme.label}
                </Text>
              </Pressable>
            ))}
          </Box>
        </Box>

        {/* Mode Selection */}
        <Box>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Box flexDirection="row" gap={2}>
            {THEME_MODES.map((mode) => (
              <Pressable
                key={mode.value}
                onPress={() => onModeChange(mode.value)}
                style={[
                  styles.modeButton,
                  currentMode === mode.value && styles.modeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    currentMode === mode.value && styles.modeButtonTextActive,
                  ]}
                >
                  {mode.label}
                </Text>
              </Pressable>
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  optionsContainer: {
    flexWrap: 'wrap',
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonActive: {
    backgroundColor: '#769656',
    borderColor: '#5a7542',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#2a2a2a',
    borderColor: '#1a1a1a',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
});
