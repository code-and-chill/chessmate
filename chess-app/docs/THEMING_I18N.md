# Theming & i18n Guide

This guide explains how to use the built-in theming and internationalization (i18n) systems in chess-app.

## Quick Start

### Theme Switching

```tsx
import { useTheme } from '@chess/ui/theme/ThemeContext';

function SettingsScreen() {
  const { mode, setMode, boardTheme, setBoardTheme } = useTheme();

  return (
    <>
      <Button
        onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}
      >
        Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>

      <Button onPress={() => setBoardTheme('blue')}>
        Use Blue Board
      </Button>

      <Button onPress={() => setBoardTheme('purple')}>
        Use Purple Board
      </Button>
    </>
  );
}
```

### Internationalization

```tsx
import { useI18n } from '@chess/core/i18n/I18nContext';

function GameScreen() {
  const { t, locale, setLocale } = useI18n();

  return (
    <>
      <Text>{t('game.status_in_progress')}</Text>
      <Text>{t('actions.resign')}</Text>

      <Button onPress={() => setLocale('es')}>
        Spanish
      </Button>
    </>
  );
}
```

## Architecture

### Theme System

The theme system is built on React Context and supports:

**Components**: ThemeProvider, useTheme hook

**Features**:
- Light/dark mode switching
- 5 built-in board themes
- Custom color overrides
- Real-time theme updates

#### Theme Modes

```typescript
type ThemeMode = 'light' | 'dark';

// Light mode colors (default)
const lightColors = {
  boardLight: '#EEEED2',
  boardDark: '#769656',
  surface: '#FFFFFF',
  textPrimary: '#151515',
  // ... more
};

// Dark mode colors
const darkColors = {
  boardLight: '#4A4A4A',
  boardDark: '#2C2C2C',
  surface: '#1E1E1E',
  textPrimary: '#E4E4E4',
  // ... more
};
```

#### Board Themes

Five pre-built board color schemes:

```typescript
type BoardTheme = 'green' | 'blue' | 'brown' | 'gray' | 'purple';

const boardThemes = {
  green: { light: '#EEEED2', dark: '#769656' },  // Default
  blue: { light: '#D5E6F5', dark: '#5B84C8' },
  brown: { light: '#D2A679', dark: '#6F4E37' },
  gray: { light: '#E8E8E8', dark: '#707070' },
  purple: { light: '#E8D5F2', dark: '#7B5A8C' },
};
```

#### ThemeContext API

```typescript
interface ThemeContextValue {
  // Current theme settings
  mode: ThemeMode;
  boardTheme: BoardTheme;
  colors: ThemeColors;
  customColors?: Partial<ThemeColors>;

  // Change settings
  setMode: (mode: ThemeMode) => void;
  setBoardTheme: (theme: BoardTheme) => void;
  setCustomColors: (colors: Partial<ThemeColors>) => void;
}
```

### i18n System

The i18n system handles all user-facing text.

**Components**: I18nProvider, useI18n hook

**Features**:
- Translation keys with dot notation
- Locale switching
- Variable interpolation
- JSON-based translation files

#### Usage

```typescript
import { useI18n } from '@chess/core/i18n/I18nContext';

function MyComponent() {
  const { t, ti, locale, setLocale } = useI18n();

  // Simple translation
  const label = t('actions.resign');

  // With variables
  const moveNum = ti('moves.move_number', { number: 15 });

  // Change locale
  const handleLocaleChange = () => setLocale('es');

  return (
    <>
      <Text>{label}</Text>
      <Text>{moveNum}</Text>
    </>
  );
}
```

#### Translation Keys

Keys follow dot notation structure: `domain.key`

Available domains:
- `game.` – Game-related strings
- `actions.` – User actions (resign, draw, etc.)
- `results.` – Game end states
- `moves.` – Move display
- `errors.` – Error messages

#### Translation File Structure

File: `src/core/i18n/locales/en.json`

```json
{
  "game": {
    "status_waiting": "Waiting for opponent...",
    "status_in_progress": "Game in progress",
    "you": "You",
    "opponent": "Opponent",
    "white": "White",
    "black": "Black"
  },
  "actions": {
    "resign": "Resign",
    "draw": "Draw"
  },
  "results": {
    "checkmate": "Checkmate",
    "stalemate": "Stalemate"
  },
  "moves": {
    "moves": "Moves",
    "move_number": "{{number}}."
  }
}
```

## Implementation

### Setup

Wrap your app with both providers:

```tsx
import { I18nProvider } from './core/i18n/I18nContext';
import { ThemeProvider } from './ui/theme/ThemeContext';

export default function App() {
  return (
    <I18nProvider defaultLocale="en">
      <ThemeProvider defaultMode="light" defaultBoardTheme="green">
        <YourApp />
      </ThemeProvider>
    </I18nProvider>
  );
}
```

### Consuming Theme

All primitives (Box, Text, Button, Surface) automatically use theme context:

```tsx
function GameComponent() {
  return (
    <Box backgroundColor="surface" padding="lg">
      <Text color="primary">Your game</Text>
      <Button variant="primary">Play</Button>
    </Box>
  );
}
```

When theme changes, all components re-render with new colors automatically.

### Consuming i18n

Use `useI18n()` in any component:

```tsx
function EndGameScreen() {
  const { t, ti } = useI18n();

  return (
    <Box>
      <Text>{t('results.game_over')}</Text>
      <Text>{t('results.checkmate')}</Text>
    </Box>
  );
}
```

## Customization

### Custom Colors

Override specific colors without changing theme:

```tsx
function App() {
  const { setCustomColors } = useTheme();

  React.useEffect(() => {
    setCustomColors({
      accentGreen: '#00FF00',  // Neon green
      danger: '#FF0000',       // Pure red
    });
  }, []);

  return <PlayScreen gameId="game-123" />;
}
```

### Add New Board Theme

Add to `src/ui/tokens/themes.ts`:

```typescript
export const boardThemes: Record<BoardTheme, { light: string; dark: string }> = {
  green: { light: '#EEEED2', dark: '#769656' },
  // ... existing
  custom: { light: '#FFE4B5', dark: '#8B4513' },  // Moccasin
};
```

Update type:

```typescript
export type BoardTheme = 'green' | 'blue' | 'brown' | 'gray' | 'purple' | 'custom';
```

### Add New Locale

1. Create translation file: `src/core/i18n/locales/es.json`

```json
{
  "game": {
    "status_waiting": "Esperando oponente...",
    "you": "Tú",
    "opponent": "Oponente"
  },
  "actions": {
    "resign": "Rendirse"
  }
}
```

2. Update exports in `src/core/i18n/index.ts`:

```typescript
import en from './locales/en.json';
import es from './locales/es.json';

export const translations: Record<Locale, TranslationDict> = {
  en,
  es,
  // ... other locales
};
```

3. Update type:

```typescript
export type Locale = 'en' | 'es' | 'fr' | 'de';
```

## Best Practices

### 1. Use Theme Colors in Custom Components

Always reference theme colors instead of hardcoding:

```tsx
// ✅ Good
const { colors } = useTheme();
<Box backgroundColor={colors.surface} />;

// ❌ Bad
<Box style={{ backgroundColor: '#FFFFFF' }} />
```

### 2. Organize Translation Keys

Group by feature/domain:

```json
{
  "player_panel": {
    "you": "You",
    "opponent": "Opponent",
    "account": "Account"
  },
  "chess_board": {
    "square": "Square",
    "piece": "Piece"
  }
}
```

### 3. Use Interpolation for Dynamic Text

```tsx
// ✅ Good
const text = ti('moves.move_number', { number: moveNum });

// ❌ Bad (string concatenation breaks i18n)
const text = `Move ${moveNum}.`;
```

### 4. Test Theme Changes

```tsx
function DebugPanel() {
  const { mode, setMode, boardTheme, setBoardTheme } = useTheme();
  const { locale, setLocale } = useI18n();

  return (
    <Box gap="md">
      <Button onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Mode: {mode}
      </Button>
      <Button onPress={() => setBoardTheme(nextTheme())}>
        Board: {boardTheme}
      </Button>
      <Button onPress={() => setLocale(nextLocale())}>
        Locale: {locale}
      </Button>
    </Box>
  );
}
```

## Performance

### Optimization Strategies

1. **Memoize theme consumers** if rendering expensive components:

```tsx
const GameBoard = React.memo(() => {
  const { colors } = useTheme();
  return <ChessBoard colors={colors} />;
});
```

2. **Selective i18n updates**:

```tsx
// Only re-render when locale changes, not theme
function LocalizedText({ textKey }) {
  const { t } = useI18n();
  return <Text>{t(textKey)}</Text>;
}
```

3. **Batch color changes**:

```tsx
const { setCustomColors } = useTheme();

// Instead of calling setCustomColors multiple times:
setCustomColors({
  boardLight: '#...',
  boardDark: '#...',
  accentGreen: '#...',
  // ... all at once
});
```

## Architecture Details

### File Structure

```
src/
├── core/i18n/
│   ├── index.ts              # Translation helpers
│   ├── I18nContext.tsx       # React context & hook
│   └── locales/
│       ├── en.json           # English translations
│       ├── es.json           # Spanish (add new locales here)
│       └── ...
│
└── ui/
    ├── tokens/
    │   └── themes.ts         # Theme definitions
    └── theme/
        └── ThemeContext.tsx  # React context & hook
```

### Data Flow

```
ThemeProvider
  ├─ mode (light/dark)
  ├─ boardTheme (green/blue/etc)
  ├─ colors (merged & interpolated)
  └─ customColors (overrides)
       ↓
   useTheme() in components
       ↓
   Box, Text, Button, Surface
       ↓
   Render with current theme

I18nProvider
  ├─ locale (en/es/fr/etc)
  └─ translations (JSON files)
       ↓
   useI18n() in components
       ↓
   t() and ti() functions
       ↓
   Display translated text
```

## Troubleshooting

### Theme not updating

Ensure components are wrapped with ThemeProvider:

```tsx
// ✅ Correct
<ThemeProvider>
  <MyComponent />  {/* Can use useTheme() */}
</ThemeProvider>

// ❌ Wrong
<MyComponent />  {/* useTheme() will error */}
<ThemeProvider>
  ...
</ThemeProvider>
```

### Translation key not found

Check key spelling and nesting:

```tsx
// ✅ Correct
t('game.status_waiting')  // Matches JSON: { "game": { "status_waiting": "..." } }

// ❌ Wrong
t('game_status_waiting')  // Flat key doesn't match nested structure
```

### Colors not changing

Verify setCustomColors is called before render:

```tsx
// ✅ Correct - set in useEffect
React.useEffect(() => {
  setCustomColors({ ... });
}, []);

// ❌ Wrong - set on every render
setCustomColors({ ... });  // Causes infinite loop
```

## Related Files

- Theme implementation: `src/ui/theme/ThemeContext.tsx`
- Theme definitions: `src/ui/tokens/themes.ts`
- i18n implementation: `src/core/i18n/I18nContext.tsx`
- Translation helpers: `src/core/i18n/index.ts`
- English translations: `src/core/i18n/locales/en.json`
- App setup: `src/App.tsx`

---

**Last updated**: November 13, 2025
