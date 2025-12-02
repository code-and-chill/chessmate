import { useState, useEffect } from 'react';
import { SafeAreaView, View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ConfigProvider } from './config';
import { I18nProvider } from './i18n/I18nContext';
import { BoardThemeProvider } from './contexts/BoardThemeContext';
import { PlayScreen } from './features/play';
import { MatchesScreen, SettingsScreen, AnimationsScreen, FontTestScreen } from './features/demo';
import { HStack, Button, useColors, ThemeProvider, Text } from './ui';
import { useAppFonts } from './config/fonts';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

type Screen = 'play' | 'matches' | 'settings' | 'animations' | 'fonts';

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
            <Button
              variant={currentScreen === 'fonts' ? 'solid' : 'outline'}
              size="sm"
              color="purple"
              onPress={() => setCurrentScreen('fonts')}
            >
              ✨ Fonts
            </Button>
          </HStack>
        </View>

        {/* Screen Content */}
        <View style={{ flex: 1 }}>
          {currentScreen === 'play' && <PlayScreen gameId={gameId} />}
          {currentScreen === 'matches' && <MatchesScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
          {currentScreen === 'animations' && <AnimationsScreen />}
          {currentScreen === 'fonts' && <FontTestScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading state while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  // Show error state if fonts failed to load (fallback to system fonts)
  if (fontError) {
    console.warn('Font loading error:', fontError);
    // Continue with system fonts as fallback
  }

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
