---
title: ChessMate Design Language System
service: app
status: active
last_reviewed: 2025-11-15
type: overview
---

# ChessMate Design Language System

A complete, production-ready design system for React Native (Expo) built with AI aesthetic principles—minimal, elegant, type-safe, and mobile-first.

## Overview

This design language system provides:

✨ **26 components** organized in 4 layers (tokens, primitives, chess-specific, theme)
🎨 **Complete token system** (colors, typography, spacing, radius, shadows, motion)
🌓 **Light/dark mode** with automatic system theme detection
📱 **React Native native** – no dependencies beyond React Native + TypeScript
⚡ **Type-safe** – full TypeScript support with zero `any` types
🎯 **Chess-optimized** – 6 purpose-built components for tournament/match screens

## File Structure

```
app/ui/
├── DLS.md                    # Complete implementation guide (700+ lines)
├── INTEGRATION.md            # Integration & usage guide
├── index.ts                  # Main export file
├── design-tokens.ts          # Legacy token file (DEPRECATED — use tokens/ directory)
├── tokens/
│   ├── colors.ts             # 6 color palettes + semantic colors
│   ├── typography.ts         # Font families, sizes, weights, variants
│   ├── spacing.ts            # 0-96px spacing scale
│   ├── radii.ts              # Border radius tokens
│   ├── shadows.ts            # Elevation & shadow styles
│   └── motion.ts             # Duration & easing tokens
├── primitives/               # 10 foundational components
│   ├── Box.tsx               # Flexbox container
│   ├── Text.tsx              # Typography component
│   ├── Button.tsx            # Interactive button (4 variants)
│   ├── Card.tsx              # Elevated container
│   ├── Panel.tsx             # Translucent overlay
│   ├── Input.tsx             # TextInput wrapper
│   ├── Tag.tsx               # Badge/chip
│   ├── Avatar.tsx            # User avatar
│   ├── Divider.tsx           # Line separator
│   └── Surface.tsx           # Gradient backdrop
├── components/               # 6 chess-specific components
│   ├── MatchCard.tsx         # Match display
│   ├── ScoreInput.tsx        # Score adjuster
│   ├── PlayerRow.tsx         # Player info
│   ├── TournamentHeader.tsx  # Tournament title
│   ├── RoundSelector.tsx     # Round picker
│   └── ActionBar.tsx         # Bottom actions
├── theme/
│   └── ThemeProvider.tsx     # Theme context provider
└── hooks/
    └── useThemeTokens.ts     # Theme hooks (useThemeTokens, useColors, useIsDark)
```

## Quick Start

### 1. Setup (1 minute)

Wrap your app with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/ui';

export default function App() {
  return (
    <ThemeProvider defaultMode="auto">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### 2. Use Components (30 seconds)

```tsx
import { Box, Text, Button, useColors } from '@/ui';

export function MyScreen() {
  const colors = useColors();

  return (
    <Box padding={4} backgroundColor={colors.background} flex={1}>
      <Text variant="heading">Welcome</Text>
      <Button onPress={() => {}}>Get Started</Button>
    </Box>
  );
}
```

### 3. Test Theme Switching (1 minute)

```tsx
import { useThemeTokens } from '@/ui';

export function SettingsScreen() {
  const { mode, setMode } = useThemeTokens();

  return (
    <Box padding={4}>
      <Button onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        Toggle: {mode}
      </Button>
    </Box>
  );
}
```

## Token System

### Colors (6 Palettes)

```tsx
import { colorTokens, semanticColors, getColor } from '@/ui';

// All colors are light/dark aware
const colors = semanticColors(isDark); // Returns { background, foreground, card, muted, primary, secondary, success, error, warning, info }

// Direct token access
const blueToken = colorTokens.blue; // { light: '#DBEAFE', dark: '#1E3A8A', ... }

// Helper function
const color = getColor(colorTokens.blue, isDark); // Returns appropriate shade
```

**Palettes:**
- `neutral` – Grays for layout (bg, text, borders)
- `blue` – Primary actions (#3B82F6)
- `purple` – Secondary accents (#7C3AED)
- `green` – Success states
- `red` – Error states
- `amber` – Warning states
- `cyan` – Info states

### Typography (7 Variants)

```tsx
import { typographyTokens, textVariants } from '@/ui';

// Use variants
<Text variant="heading">Main Title</Text>
<Text variant="body">Regular text</Text>
<Text variant="caption">Small text</Text>

// Tokens
const fontSize = typographyTokens.fontSize.lg; // 18
const fontWeight = typographyTokens.fontWeight[600]; // '600'
const variant = textVariants.heading; // { size: '3xl', weight: 700, lineHeight: 1.2 }
```

**Variants:** heading, subheading, title, body, caption, label, hint

### Spacing (Scale 0-96)

```tsx
import { spacingTokens, spacingScale } from '@/ui';

<Box padding={4} margin={2} gap={3}>
  {/* padding: 8px, margin: 4px, gap: 6px */}
</Box>

// Semantic aliases
spacingScale.gutter;      // 16 (card padding)
spacingScale.gap;         // 12 (component gap)
spacingScale.rowHeight;   // 56 (list row height)
spacingScale.buttonHeight; // 44 (button height)
```

**Scale:** 0, 2, 4, 6, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96

### Radius (5 Tiers)

```tsx
import { radiusTokens, radiusScale } from '@/ui';

<Box radius="md" /> {/* 10px */}
<Button radius="lg" /> {/* 16px */}

// Direct values
radiusTokens.sm;   // 6
radiusTokens.md;   // 10
radiusTokens.lg;   // 16
radiusTokens.xl;   // 24
radiusTokens.full; // 9999 (circle)
```

### Shadows (8 Elevations)

```tsx
import { shadowTokens } from '@/ui';

<Box shadow="card" /> {/* elevation 4 */}
<Box shadow="panel" /> {/* elevation 8 */}
<Box shadow="floating" /> {/* elevation 12 */}

// Direct style
const style = shadowTokens.md; // { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }
```

**Shadows:** none, xs, sm, md, lg, xl, card, panel, floating

### Motion (Durations & Easing)

```tsx
import { motionTokens, microInteractions } from '@/ui';

// Durations
motionTokens.duration.fast;   // 100ms
motionTokens.duration.normal; // 200ms
motionTokens.duration.slow;   // 300ms
motionTokens.duration.slower; // 500ms

// Easing functions
motionTokens.easing.linear; // 'linear'
motionTokens.easing.inOut;  // 'cubic-bezier(0.4, 0, 0.2, 1)'

// Micro-interactions
microInteractions.scalePress;     // 0.98 (button press)
microInteractions.scaleHover;     // 1.01 (hover effect)
microInteractions.opacityDisabled; // 0.5 (disabled state)
```

## Primitive Components (10 Total)

### Box – Flexbox Container

```tsx
<Box
  padding={4}
  margin={2}
  gap={3}
  radius="md"
  shadow="card"
  backgroundColor="#fff"
  flexDirection="row"
  justifyContent="space-between"
  alignItems="center"
  flex={1}
>
  {/* Content */}
</Box>
```

**Props:** padding, margin, gap, radius, shadow, backgroundColor, borderColor, borderWidth, flexDirection, justifyContent, alignItems, flex, style

### Text – Typography

```tsx
<Text
  variant="heading"
  color="#000"
  weight={600}
  size="lg"
  numberOfLines={1}
>
  Title
</Text>
```

**Props:** variant, color, weight, size, style, and all TextProps

### Button – Interactive

```tsx
<Button
  variant="solid" // solid | outline | subtle | ghost
  size="md"       // sm | md | lg
  color="blue"    // primary color
  isLoading={false}
  disabled={false}
  icon={<Icon />}
  onPress={() => {}}
>
  Action
</Button>
```

**Props:** variant, size, color, isLoading, disabled, icon, onPress, style

### Card – Elevated Container

```tsx
<Card padding={4} shadow="card" borderColor="#E8E8E8">
  {/* Content */}
</Card>
```

**Props:** padding, shadow, borderColor, borderWidth, style

### Panel – Translucent Overlay

```tsx
<Panel density="light" padding={4}>
  {/* Content */}
</Panel>
```

**Props:** density (light|medium|dark), padding, style

### Input – TextInput Wrapper

```tsx
<Input
  label="Email"
  placeholder="user@example.com"
  leftAccessory={<Icon />}
  rightAccessory={<CheckIcon />}
  error="Invalid email"
  onChangeText={(text) => {}}
/>
```

**Props:** label, leftAccessory, rightAccessory, error, and all TextInputProps

### Tag – Badge/Chip

```tsx
<Tag
  label="Active"
  color="#10B981"
  backgroundColor="rgba(16, 185, 129, 0.1)"
  variant="filled" // filled | outline
/>
```

**Props:** label, color, backgroundColor, variant

### Avatar – User Avatar

```tsx
<Avatar
  name="John Doe"
  size="md"        // sm | md | lg
  backgroundColor="#3B82F6"
  textColor="#fff"
/>
```

**Props:** name, size, backgroundColor, textColor

### Divider – Line Separator

```tsx
<Divider
  color="#E8E8E8"
  thickness={1}
  marginVertical={3}
  marginHorizontal={2}
/>
```

**Props:** color, thickness, marginVertical, marginHorizontal

### Surface – Gradient Backdrop

```tsx
<Surface variant="accent" style={{}}>
  {/* Content */}
</Surface>
```

**Props:** children, variant (default|accent|subtle), style

## Chess Components (6 Total)

### MatchCard – Match Display

```tsx
<MatchCard
  player1={{ name: 'Alice', rating: 1850 }}
  player2={{ name: 'Bob', rating: 1920 }}
  score1={1}
  score2={0}
  status="active" // active | completed | pending
  onPress={() => {}}
/>
```

### ScoreInput – Score Adjuster

```tsx
<ScoreInput
  value={5}
  onChange={(newValue) => {}}
  label="Round Score"
  min={0}
  max={10}
/>
```

### PlayerRow – Player Info

```tsx
<PlayerRow
  name="Alice Chen"
  rating={1850}
  performance="win" // win | loss | draw | undefined
  wins={7}
  losses={2}
  draws={1}
/>
```

### TournamentHeader – Tournament Title

```tsx
<TournamentHeader
  title="2025 Winter Championship"
  subtitle="Round 5 of 8"
  badge="LIVE"
/>
```

### RoundSelector – Round Picker

```tsx
<RoundSelector
  rounds={['Round 1', 'Round 2', 'Round 3', 'Round 4']}
  selected="Round 2"
  onSelect={(round) => {}}
/>
```

### ActionBar – Bottom Actions

```tsx
<ActionBar
  actions={[
    { label: 'Scores', onPress: () => {} },
    { label: 'Results', onPress: () => {} },
    { label: 'Standings', onPress: () => {} },
  ]}
/>
```

## Theme System

### ThemeProvider

```tsx
<ThemeProvider defaultMode="auto"> {/* light | dark | auto */}
  {/* App */}
</ThemeProvider>
```

### useThemeTokens Hook

```tsx
const { mode, isDark, setMode, colors } = useThemeTokens();

// mode: 'light' | 'dark' | 'auto'
// isDark: boolean
// setMode: (mode) => void
// colors: SemanticColors object
```

### useColors Hook

```tsx
const colors = useColors();

// { background, foreground, card, muted, primary, secondary, success, error, warning, info }
```

### useIsDark Hook

```tsx
const isDark = useIsDark();
// boolean – true if dark mode is active
```

## Design Principles

### Minimal & Elegant

- Neutral color palette (slate/zinc base)
- Soft shadows over harsh borders
- Generous whitespace and padding
- AI aesthetic: clean, sophisticated, understated

### Type-Safe

- Full TypeScript coverage
- No `any` types
- Semantic prop names
- Autocomplete support in editors

### Mobile-First

- Touch-friendly sizes (44px minimum for buttons)
- Flex layout optimized for various screen sizes
- Readable typography at mobile scales
- Efficient use of limited screen space

### Scalable

- Token-based system (change one value, update everywhere)
- Composable components (build complex layouts from primitives)
- Extensible (add new tokens or components easily)
- Monorepo-ready

### Accessible

- Semantic color contrasts
- Touch targets meet platform guidelines
- Readable text sizes
- Clear visual hierarchy

### Performant

- No external dependencies (beyond React Native)
- Minimal re-renders with proper memoization
- Efficient style computation
- Optimized for mobile devices

## Integration Checklist

- [ ] Wrap app with `<ThemeProvider>`
- [ ] Import components from `@/ui`
- [ ] Use `useColors()` for semantic colors
- [ ] Replace `View` with `Box`
- [ ] Replace `Text` with `Text` (using variants)
- [ ] Build screens using chess components
- [ ] Test light/dark mode switching
- [ ] Verify colors on different screens
- [ ] Check accessibility on devices

## Common Patterns

### Flex Row with Space-Between

```tsx
<Box flexDirection="row" justifyContent="space-between" padding={4}>
  <Text>Left</Text>
  <Text>Right</Text>
</Box>
```

### Centered Container

```tsx
<Box flex={1} justifyContent="center" alignItems="center">
  <Text>Centered</Text>
</Box>
```

### Vertical Stack with Gap

```tsx
<Box gap={3}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Box>
```

### Card List

```tsx
<Box padding={4} gap={3}>
  {items.map((item) => (
    <Card key={item.id} padding={4}>
      <Text variant="title">{item.title}</Text>
    </Card>
  ))}
</Box>
```

### Chess Match Screen

See `INTEGRATION.md` for a complete TournamentScreen example.

## Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| DLS.md | Implementation guide | 700+ |
| INTEGRATION.md | Integration guide | 300+ |
| index.ts | Main exports | 54 |
| tokens/colors.ts | Color system | 80+ |
| tokens/typography.ts | Typography tokens | 50+ |
| tokens/spacing.ts | Spacing scale | 40+ |
| tokens/radii.ts | Radius tokens | 30+ |
| tokens/shadows.ts | Shadow system | 50+ |
| tokens/motion.ts | Motion tokens | 40+ |
| primitives/Box.tsx | Flexbox container | 44 |
| primitives/Text.tsx | Text component | 47 |
| primitives/Button.tsx | Button component | 85 |
| primitives/Card.tsx | Card container | 40 |
| primitives/Panel.tsx | Panel component | 41 |
| primitives/Input.tsx | Input wrapper | 45 |
| primitives/Tag.tsx | Badge component | 34 |
| primitives/Avatar.tsx | Avatar component | 48 |
| primitives/Divider.tsx | Divider line | 29 |
| primitives/Surface.tsx | Surface component | 33 |
| components/MatchCard.tsx | Match display | 87 |
| components/ScoreInput.tsx | Score adjuster | 61 |
| components/PlayerRow.tsx | Player row | 92 |
| components/TournamentHeader.tsx | Tournament header | 46 |
| components/RoundSelector.tsx | Round picker | 42 |
| components/ActionBar.tsx | Action bar | 43 |
| theme/ThemeProvider.tsx | Theme provider | 41 |
| hooks/useThemeTokens.ts | Theme hooks | 35 |

**Total Implementation:** 26 files, ~2000+ lines of production-ready code

## Next Steps

1. **Read** INTEGRATION.md for usage patterns
2. **Wrap** your app with ThemeProvider
3. **Start building** screens using the components
4. **Test** light/dark mode switching
5. **Customize** tokens as needed for your brand

## Support

- **Complete code?** See DLS.md
- **How to integrate?** See INTEGRATION.md
- **Need an example?** Check component props in this file
- **TypeScript errors?** Verify imports and ThemeProvider wrapping

## License

Part of ChessMate application. Internal use only.
