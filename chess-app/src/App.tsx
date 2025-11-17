import React from 'react';
import { SafeAreaView } from 'react-native';
import { ConfigProvider } from './config';
import { I18nProvider } from './i18n/I18nContext';
import { ThemeProvider } from './ui/theme/ThemeContext';
import { PlayScreen } from './screens';

export default function App() {
  const gameId = 'default-game-id';

  return (
    <ConfigProvider>
      <I18nProvider defaultLocale="en">
        <ThemeProvider defaultMode="light" defaultBoardTheme="green">
          <SafeAreaView style={{ flex: 1 }}>
            <PlayScreen gameId={gameId} />
          </SafeAreaView>
        </ThemeProvider>
      </I18nProvider>
    </ConfigProvider>
  );
}
