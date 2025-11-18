/**
 * DLS Settings Screen
 * app/screens/DLSSettingsScreen.tsx
 *
 * Demonstrates form controls: Checkbox, Radio, Select
 * Showcases theme switching and preferences UI
 */

import { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Checkbox,
  Radio,
  Select,
  useColors,
  useThemeTokens,
} from '@/ui';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface SettingsScreenProps {
  onSave?: (settings: UserSettings) => void;
}

interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  difficulty: Difficulty;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  analyzeGames: boolean;
}

export function SettingsScreen({ onSave = () => {} }: SettingsScreenProps) {
  const colors = useColors();
  const { mode, setMode } = useThemeTokens();

  // Form State
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [analyzeGames, setAnalyzeGames] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [language, setLanguage] = useState('en');

  const handleSave = () => {
    const settings: UserSettings = {
      notifications,
      soundEnabled,
      analyzeGames,
      difficulty,
      theme: mode,
      language,
    };
    onSave(settings);
  };

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
            Settings
          </Text>
          <Text variant="caption" color={colors.accentForeground.secondary}>
            Customize your experience
          </Text>
        </Box>

        {/* Theme Section */}
        <VStack gap={4} padding={4}>
          <Text variant="subheading" color={colors.foreground.primary}>
            🎨 Appearance
          </Text>

          <Box padding={4} backgroundColor={colors.background.secondary} radius="md">
            <HStack justifyContent="space-between" alignItems="center">
              <Text variant="body" color={colors.foreground.primary}>
                Dark Mode
              </Text>
              <HStack gap={2}>
                <Button
                  variant={mode === 'light' ? 'solid' : 'outline'}
                  size="sm"
                  color="blue"
                  onPress={() => setMode('light')}
                >
                  Light
                </Button>
                <Button
                  variant={mode === 'dark' ? 'solid' : 'outline'}
                  size="sm"
                  color="blue"
                  onPress={() => setMode('dark')}
                >
                  Dark
                </Button>
              </HStack>
            </HStack>
          </Box>

          <Box flex={1} />

          {/* Notifications Section */}
          <Text variant="subheading" color={colors.foreground.primary}>
            🔔 Notifications
          </Text>

          <Box padding={4} backgroundColor={colors.background.secondary} radius="md">
            <VStack gap={3}>
              <Checkbox
                checked={notifications}
                onChange={setNotifications}
                label="Enable Notifications"
              />
              <Checkbox 
                checked={soundEnabled} 
                onChange={setSoundEnabled}
                label="Enable Sound" 
              />
              <Checkbox 
                checked={analyzeGames} 
                onChange={setAnalyzeGames}
                label="Analyze Completed Games" 
              />
            </VStack>
          </Box>

          <Box flex={1} />

          {/* Game Settings Section */}
          <Text variant="subheading" color={colors.foreground.primary}>
            ♟️ Game Preferences
          </Text>

          <Box padding={4} backgroundColor={colors.background.secondary} radius="md">
            <VStack gap={4}>
              {/* Difficulty Radio Group */}
              <VStack gap={3}>
                <Text variant="body" weight="600" color={colors.foreground.primary}>
                  Difficulty Level
                </Text>
                <VStack gap={2}>
                  <Radio
                    label="Beginner"
                    selected={difficulty === 'beginner'}
                    onChange={() => setDifficulty('beginner')}
                    color="#22C55E"
                  />
                  <Radio
                    label="Intermediate"
                    selected={difficulty === 'intermediate'}
                    onChange={() => setDifficulty('intermediate')}
                    color="#3B82F6"
                  />
                  <Radio
                    label="Advanced"
                    selected={difficulty === 'advanced'}
                    onChange={() => setDifficulty('advanced')}
                    color="#A855F7"
                  />
                  <Radio
                    label="Expert"
                    selected={difficulty === 'expert'}
                    onChange={() => setDifficulty('expert')}
                    color="#EF4444"
                  />
                </VStack>
              </VStack>

              <Box />

              {/* Language Select */}
              <VStack gap={2}>
                <Text variant="body" weight="600" color={colors.foreground.primary}>
                  Language
                </Text>
                <Select
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Español', value: 'es' },
                    { label: 'Français', value: 'fr' },
                    { label: '中文', value: 'zh' },
                    { label: '日本語', value: 'ja' },
                  ]}
                  placeholder="Select language"
                  color="blue"
                />
              </VStack>
            </VStack>
          </Box>

          <Box flex={1} />

          {/* Action Buttons */}
          <HStack gap={3}>
            <Button
              flex={1}
              variant="solid"
              color="green"
              size="lg"
              onPress={handleSave}
            >
              ✓ Save Settings
            </Button>
            <Button
              variant="outline"
              color="muted"
              size="lg"
              onPress={() => {}}
            >
              ↺ Reset
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

SettingsScreen.displayName = 'SettingsScreen';
