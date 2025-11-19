import { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { ConfigProvider } from './config';
import { I18nProvider } from './i18n/I18nContext';
import { BoardThemeProvider } from './contexts/BoardThemeContext';
import { PlayScreen } from './features/play';
import { MatchesScreen, SettingsScreen, AnimationsScreen } from './features/demo';
import { HStack, Button, useColors, ThemeProvider } from './ui';

type Screen = 'play' | 'matches' | 'settings' | 'animations';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('play');
  const colors = useColors();
  const gameId = 'default-game-id';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Tab Navigation */}
        <View style={{ backgroundColor: colors.background.secondary, padding: 8 }}>
          <HStack gap={2} justifyContent="space-around">
            <Button
              variant={currentScreen === 'play' ? 'solid' : 'outline'}
              size="sm"
              color="blue"
              onPress={() => setCurrentScreen('play')}
            >
              Chess
            </Button>
            <Button
              variant={currentScreen === 'matches' ? 'solid' : 'outline'}
              size="sm"
              color="purple"
              onPress={() => setCurrentScreen('matches')}
            >
              Matches
            </Button>
            <Button
              variant={currentScreen === 'settings' ? 'solid' : 'outline'}
              size="sm"
              color="green"
              onPress={() => setCurrentScreen('settings')}
            >
              Settings
            </Button>
            <Button
              variant={currentScreen === 'animations' ? 'solid' : 'outline'}
              size="sm"
              color="amber"
              onPress={() => setCurrentScreen('animations')}
            >
              Animations
            </Button>
          </HStack>
        </View>

        {/* Screen Content */}
        <View style={{ flex: 1 }}>
          {currentScreen === 'play' && <PlayScreen gameId={gameId} />}
          {currentScreen === 'matches' && <MatchesScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
          {currentScreen === 'animations' && <AnimationsScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <I18nProvider defaultLocale="en">
        <ThemeProvider defaultMode="light">
          <BoardThemeProvider>
            <AppContent />
          </BoardThemeProvider>
        </ThemeProvider>
      </I18nProvider>
    </ConfigProvider>
  );
}
