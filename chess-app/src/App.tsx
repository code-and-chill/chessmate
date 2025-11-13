import React from 'react';
import { SafeAreaView } from 'react-native';
import { I18nProvider } from './core/i18n/I18nContext';
import { ThemeProvider } from './ui/theme/ThemeContext';
import { PlayScreen } from './ui/screens';

export default function App() {
  const gameId = 'default-game-id';

  return (
    <I18nProvider defaultLocale="en">
      <ThemeProvider defaultMode="light" defaultBoardTheme="green">
        <SafeAreaView style={{ flex: 1 }}>
          <PlayScreen gameId={gameId} />
        </SafeAreaView>
      </ThemeProvider>
    </I18nProvider>
  );
}
