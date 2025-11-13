# Theming & i18n Examples

Real-world examples of theming and i18n usage in chess-app.

## Example 1: Settings Screen with Theme Switcher

```tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../../core/i18n/I18nContext';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { Surface } from '../components/primitives/Surface';
import { spacing } from '../tokens';

export function SettingsScreen() {
  const { mode, setMode, boardTheme, setBoardTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
      <Surface padding="md" gap="md">
        {/* Theme Mode */}
        <Text variant="heading">{t('settings.theme')}</Text>
        <Box gap="sm">
          <Button
            variant={mode === 'light' ? 'primary' : 'secondary'}
            onPress={() => setMode('light')}
          >
            {t('settings.light_mode')}
          </Button>
          <Button
            variant={mode === 'dark' ? 'primary' : 'secondary'}
            onPress={() => setMode('dark')}
          >
            {t('settings.dark_mode')}
          </Button>
        </Box>

        {/* Board Theme */}
        <Text variant="heading">{t('settings.board_theme')}</Text>
        <Box gap="sm">
          {(['green', 'blue', 'brown', 'gray', 'purple'] as const).map((theme) => (
            <Button
              key={theme}
              variant={boardTheme === theme ? 'primary' : 'secondary'}
              onPress={() => setBoardTheme(theme)}
            >
              {t(`settings.board_${theme}`)}
            </Button>
          ))}
        </Box>

        {/* Language */}
        <Text variant="heading">{t('settings.language')}</Text>
        <Box gap="sm">
          {(['en', 'es', 'fr', 'de'] as const).map((lang) => (
            <Button
              key={lang}
              variant={locale === lang ? 'primary' : 'secondary'}
              onPress={() => setLocale(lang)}
            >
              {t(`settings.lang_${lang}`)}
            </Button>
          ))}
        </Box>
      </Surface>
    </ScrollView>
  );
}
```

## Example 2: Localized Game Status with Theme Colors

```tsx
import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { GameStatus } from '../../core/models/game';
import { Box } from './Box';
import { Text } from './Text';

interface GameStatusDisplayProps {
  status: GameStatus;
  result?: string | null;
}

export function GameStatusDisplay({ status, result }: GameStatusDisplayProps) {
  const { t } = useI18n();
  const { colors } = useTheme();

  const getStatusKey = (s: GameStatus): string => {
    switch (s) {
      case 'waiting_for_opponent':
        return 'game.status_waiting';
      case 'in_progress':
        return 'game.status_in_progress';
      case 'ended':
        return 'game.status_ended';
    }
  };

  const statusBgColor = status === 'ended' ? colors.danger : colors.accentGreen;

  return (
    <Box
      padding="md"
      borderRadius={8}
      style={{ backgroundColor: statusBgColor }}
    >
      <Text variant="label" color="primary">
        {t(getStatusKey(status))}
      </Text>
      {result && (
        <Text variant="caption" color="secondary">
          {t(`results.${result}`)}
        </Text>
      )}
    </Box>
  );
}
```

## Example 3: Multi-Language Move List

```tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { useI18n } from '../../core/i18n/I18nContext';
import { Move } from '../../core/models/game';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { Surface } from '../components/primitives/Surface';
import { spacing } from '../tokens';

interface MoveListProps {
  moves: Move[];
}

export function LocalizedMoveList({ moves }: MoveListProps) {
  const { t, ti } = useI18n();

  const moveGroups: Array<{ number: number; white?: Move; black?: Move }> = [];

  for (const move of moves) {
    const moveNumber = move.moveNumber;
    let group = moveGroups.find((g) => g.number === moveNumber);

    if (!group) {
      group = { number: moveNumber };
      moveGroups.push(group);
    }

    if (move.color === 'w') {
      group.white = move;
    } else {
      group.black = move;
    }
  }

  return (
    <Surface padding="md">
      <Text variant="label" color="primary">
        {/* Uses i18n with interpolation */}
        {ti('moves.moves_count', { count: moves.length })}
      </Text>

      <ScrollView>
        {moveGroups.length === 0 ? (
          <Text variant="caption" color="muted">
            {t('moves.no_moves')}
          </Text>
        ) : (
          moveGroups.map((group) => (
            <Box key={group.number} flexDirection="row" gap="md" marginVertical="xs">
              {/* Move number with interpolation */}
              <Text variant="caption" color="secondary">
                {ti('moves.move_number', { number: group.number })}
              </Text>

              {group.white && (
                <Text variant="caption" color="primary">
                  {group.white.san}
                </Text>
              )}

              {group.black && (
                <Text variant="caption" color="primary">
                  {group.black.san}
                </Text>
              )}
            </Box>
          ))
        )}
      </ScrollView>
    </Surface>
  );
}
```

## Example 4: Dark Mode with Custom Board Theme

```tsx
import React, { useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { PlayScreen } from './PlayScreen';

export function DarkModePlayScreen() {
  const { setMode, setBoardTheme, setCustomColors } = useTheme();

  useEffect(() => {
    // Set dark mode
    setMode('dark');

    // Use blue board
    setBoardTheme('blue');

    // Optionally customize specific colors
    setCustomColors({
      accentGreen: '#00FF88',  // Brighter green for dark mode
      borderSubtle: 'rgba(255,255,255,0.12)',  // More subtle in dark
    });
  }, []);

  return <PlayScreen gameId="game-123" />;
}
```

## Example 5: Adaptive UI Based on Theme

```tsx
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Box } from './Box';
import { Text } from './Text';
import { Button } from './Button';

export function AdaptiveGamePanel() {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Box
      padding="lg"
      backgroundColor="surface"
      borderRadius={12}
      style={{
        // Subtle shadow in light mode, stronger in dark
        shadowColor: colors.textPrimary,
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: isDark ? 8 : 3,
      }}
    >
      <Text
        variant="heading"
        style={{
          // Text size adapts based on theme
          marginBottom: isDark ? 16 : 12,
        }}
      >
        Your Game
      </Text>

      <Button
        variant={isDark ? 'secondary' : 'primary'}
        onPress={() => {}}
      >
        Start Playing
      </Button>
    </Box>
  );
}
```

## Example 6: Localization with Variables

```tsx
import React from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { Text } from '../components/primitives/Text';

interface PlayerClockProps {
  playerName: string;
  remainingSeconds: number;
  isActive: boolean;
}

export function PlayerClock({ playerName, remainingSeconds, isActive }: PlayerClockProps) {
  const { t, ti } = useI18n();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <>
      <Text variant="label">
        {/* Shows "You" or "Opponent" based on i18n */}
        {playerName === 'self' ? t('game.you') : t('game.opponent')}
      </Text>

      <Text
        variant="heading"
        color={isActive ? 'primary' : 'muted'}
      >
        {/* Formatted time */}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      <Text variant="caption" color="secondary">
        {/* Dynamic status with interpolation */}
        {ti('game.time_remaining_seconds', { seconds: remainingSeconds })}
      </Text>
    </>
  );
}
```

## Example 7: Testing Theme Variations

```tsx
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../../core/i18n/I18nContext';
import { Box } from './Box';
import { Text } from './Text';
import { Button } from './Button';
import { spacing } from '../tokens';

const BOARD_THEMES = ['green', 'blue', 'brown', 'gray', 'purple'] as const;
const MODES = ['light', 'dark'] as const;
const LOCALES = ['en', 'es', 'fr', 'de'] as const;

export function ThemeShowcase() {
  const { mode, setMode, boardTheme, setBoardTheme, colors } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [showAll, setShowAll] = useState(false);

  if (showAll) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {MODES.map((m) => (
          <Box key={m} marginBottom="lg" gap="md">
            <Text variant="heading">{t('settings.mode')}: {m}</Text>

            {BOARD_THEMES.map((theme) => (
              <Box
                key={`${m}-${theme}`}
                padding="md"
                borderRadius={8}
                backgroundColor="surface"
                borderColor="borderSubtle"
                borderWidth={1}
              >
                <Text variant="label">{theme}</Text>
                <Box
                  style={{
                    height: 60,
                    marginTop: spacing.md,
                    borderRadius: 4,
                    backgroundColor: colors.boardLight,
                  }}
                />
              </Box>
            ))}
          </Box>
        ))}
      </ScrollView>
    );
  }

  return (
    <Box padding="lg" gap="md">
      <Text variant="heading">Theme Showcase</Text>

      <Text variant="body">
        {t('settings.current_theme')}: {mode} / {boardTheme}
      </Text>

      <Button onPress={() => setShowAll(true)}>
        {t('settings.show_all_themes')}
      </Button>

      <Button onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Toggle Mode
      </Button>

      <Box gap="sm">
        {BOARD_THEMES.map((theme) => (
          <Button
            key={theme}
            variant={boardTheme === theme ? 'primary' : 'secondary'}
            onPress={() => setBoardTheme(theme)}
          >
            {theme}
          </Button>
        ))}
      </Box>

      <Box gap="sm">
        {LOCALES.map((lang) => (
          <Button
            key={lang}
            variant={locale === lang ? 'primary' : 'secondary'}
            onPress={() => setLocale(lang)}
          >
            {lang}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
```

## Translation File Additions

Add these to `src/core/i18n/locales/en.json` for full i18n support:

```json
{
  "settings": {
    "theme": "Theme",
    "light_mode": "Light Mode",
    "dark_mode": "Dark Mode",
    "board_theme": "Board Theme",
    "board_green": "Green Board",
    "board_blue": "Blue Board",
    "board_brown": "Brown Board",
    "board_gray": "Gray Board",
    "board_purple": "Purple Board",
    "language": "Language",
    "lang_en": "English",
    "lang_es": "Spanish",
    "lang_fr": "French",
    "lang_de": "German",
    "current_theme": "Current Theme",
    "show_all_themes": "Show All Themes",
    "mode": "Mode"
  },
  "game": {
    "time_remaining_seconds": "{{seconds}} seconds remaining"
  },
  "moves": {
    "moves_count": "Moves ({{count}})"
  }
}
```

---

**Last updated**: November 13, 2025
