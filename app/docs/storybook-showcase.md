---
title: Storybook Component Showcase
status: active
last_reviewed: 2025-12-03
type: guide
---

# 📚 STORYBOOK COMPONENT SHOWCASE

A comprehensive guide to showcasing our DLS components in Storybook.

---

## 🎯 Overview

This document provides Storybook stories for all DLS-compliant components (92% overall compliance). Use these stories to:
- **Test** components in isolation
- **Verify** theme switching (light/dark mode)
- **Showcase** all variants and states
- **Document** component APIs
- **Onboard** new developers

---

## 📦 Setup

### Installation

```bash
cd app
pnpm add -D @storybook/react-native @storybook/addon-react-native-web
pnpm add -D @storybook/addon-essentials @storybook/addon-interactions
pnpm add -D @storybook/addon-a11y
```

### Configuration

```typescript
// app/.storybook/main.ts
import type { StorybookConfig } from '@storybook/react-native';

const config: StorybookConfig = {
  stories: [
    '../ui/**/*.stories.tsx',
    '../features/**/*.stories.tsx',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
};

export default config;
```

---

## 🎨 Primitive Components

### 1. Input Stories

**File**: `app/ui/primitives/Input.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { Input } from './Input';
import { ThemeProvider } from '../theme/ThemeProvider';
import { View } from 'react-native';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    editable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Invalid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    editable: false,
  },
};

export const WithAccessories: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftAccessory: <Text>🔍</Text>,
    rightAccessory: <Text>❌</Text>,
  },
};

// Interactive story for focus testing
export const FocusStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Input label="Normal" placeholder="Click to focus" />
      <Input label="With Error" error="Error message" />
      <Input label="Disabled" editable={false} />
    </View>
  ),
};
```

---

### 2. Tag Stories

**File**: `app/ui/primitives/Tag.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { Tag } from './Tag';
import { ThemeProvider } from '../theme/ThemeProvider';
import { View } from 'react-native';

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Tag',
  component: Tag,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    style: {
      control: 'select',
      options: ['filled', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    label: 'Default Tag',
  },
};

export const SemanticVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Tag label="Default" variant="default" />
      <Tag label="Success" variant="success" />
      <Tag label="Error" variant="error" />
      <Tag label="Warning" variant="warning" />
      <Tag label="Info" variant="info" />
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Tag label="Small Tag" size="sm" />
      <Tag label="Medium Tag" size="md" />
      <Tag label="Large Tag" size="lg" />
    </View>
  ),
};

export const Styles: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Tag label="Filled Success" variant="success" style="filled" />
      <Tag label="Outline Success" variant="success" style="outline" />
      <Tag label="Filled Error" variant="error" style="filled" />
      <Tag label="Outline Error" variant="error" style="outline" />
    </View>
  ),
};

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    
    return visible ? (
      <Tag
        label="Click X to dismiss"
        variant="info"
        onDismiss={() => setVisible(false)}
      />
    ) : (
      <Text>Tag dismissed! Refresh to reset.</Text>
    );
  },
};

export const AllCombinations: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {['default', 'success', 'error', 'warning', 'info'].map((variant) => (
        <View key={variant} style={{ flexDirection: 'row', gap: 8 }}>
          <Tag label={variant} variant={variant as any} size="sm" />
          <Tag label={variant} variant={variant as any} size="md" />
          <Tag label={variant} variant={variant as any} size="lg" />
        </View>
      ))}
    </View>
  ),
};
```

---

### 3. Avatar Stories

**File**: `app/ui/primitives/Avatar.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { Avatar } from './Avatar';
import { ThemeProvider } from '../theme/ThemeProvider';
import { View } from 'react-native';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    name: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away'],
    },
    image: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Avatar name="John Doe" size="sm" />
      <Avatar name="John Doe" size="md" />
      <Avatar name="John Doe" size="lg" />
    </View>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Avatar name="Alice" status="online" />
      <Avatar name="Bob" status="offline" />
      <Avatar name="Charlie" status="away" />
    </View>
  ),
};

export const WithImage: Story = {
  args: {
    name: 'Jane Smith',
    image: 'https://i.pravatar.cc/150?img=5',
  },
};

export const InitialVariations: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
      <Avatar name="Alice Anderson" />
      <Avatar name="Bob Brown" />
      <Avatar name="Charlie Chen" />
      <Avatar name="Diana Davis" />
      <Avatar name="Eve Evans" />
      <Avatar name="Frank Foster" />
    </View>
  ),
};

export const AllCombinations: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {['sm', 'md', 'lg'].map((size) => (
        <View key={size} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Avatar name="User" size={size as any} />
          <Avatar name="Online" size={size as any} status="online" />
          <Avatar name="Away" size={size as any} status="away" />
          <Avatar name="Offline" size={size as any} status="offline" />
        </View>
      ))}
    </View>
  ),
};
```

---

## ♟️ Chess Components

### 4. MatchCard Stories

**File**: `app/ui/components/MatchCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { MatchCard } from './MatchCard';
import { ThemeProvider } from '../theme/ThemeProvider';
import { View } from 'react-native';

const meta: Meta<typeof MatchCard> = {
  title: 'Components/MatchCard',
  component: MatchCard,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MatchCard>;

export const Active: Story = {
  args: {
    player1: { name: 'Alice', avatar: 'A', rating: 2100 },
    player2: { name: 'Bob', avatar: 'B', rating: 2050 },
    score1: 2,
    score2: 1,
    status: 'active',
  },
};

export const Completed: Story = {
  args: {
    player1: { name: 'Charlie', avatar: 'C', rating: 1950 },
    player2: { name: 'Diana', avatar: 'D', rating: 2000 },
    score1: 3,
    score2: 2,
    status: 'completed',
  },
};

export const Pending: Story = {
  args: {
    player1: { name: 'Eve', avatar: 'E', rating: 1800 },
    player2: { name: 'Frank', avatar: 'F', rating: 1850 },
    score1: 0,
    score2: 0,
    status: 'pending',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <MatchCard
        player1={{ name: 'Alice', avatar: 'A', rating: 2100 }}
        player2={{ name: 'Bob', avatar: 'B', rating: 2050 }}
        score1={2}
        score2={1}
        status="active"
      />
      <MatchCard
        player1={{ name: 'Charlie', avatar: 'C', rating: 1950 }}
        player2={{ name: 'Diana', avatar: 'D', rating: 2000 }}
        score1={3}
        score2={2}
        status="completed"
      />
      <MatchCard
        player1={{ name: 'Eve', avatar: 'E', rating: 1800 }}
        player2={{ name: 'Frank', avatar: 'F', rating: 1850 }}
        score1={0}
        score2={0}
        status="pending"
      />
    </View>
  ),
};
```

---

### 5. TournamentHeader Stories

**File**: `app/ui/components/TournamentHeader.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { TournamentHeader } from './TournamentHeader';
import { ThemeProvider } from '../theme/ThemeProvider';

const meta: Meta<typeof TournamentHeader> = {
  title: 'Components/TournamentHeader',
  component: TournamentHeader,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TournamentHeader>;

export const Default: Story = {
  args: {
    title: 'ChessMate Tournament',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'ChessMate Championship',
    subtitle: 'Round 3 of 8',
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Active Tournament',
    subtitle: 'Live games in progress',
    badge: 'LIVE',
  },
};

export const Complete: Story = {
  args: {
    title: 'Spring Championship 2025',
    subtitle: 'Finals • Best of 5',
    badge: 'ACTIVE',
  },
};
```

---

## 🎯 Feature Components

### 6. FeatureCard Stories

**File**: `app/ui/components/FeatureCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { FeatureCard } from './FeatureCard';
import { ThemeProvider } from '../theme/ThemeProvider';
import { View } from 'react-native';

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    icon: 'globe',
    title: 'Online Play',
    description: 'Find opponents worldwide',
    onPress: () => console.log('Pressed'),
  },
};

export const WithProgress: Story = {
  args: {
    icon: 'target',
    title: 'Daily Puzzle',
    description: 'Sharpen your tactical skills',
    progress: '147 solved • 1450 rating',
    onPress: () => console.log('Pressed'),
  },
};

export const FeatureShowcase: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <FeatureCard
        icon="globe"
        title="Online Play"
        description="Find opponents worldwide"
        progress="1245 rating • 34 games"
        onPress={() => {}}
        delay={200}
      />
      <FeatureCard
        icon="robot"
        title="Play vs Bot"
        description="Practice with AI opponents"
        progress="Adaptive difficulty"
        onPress={() => {}}
        delay={300}
      />
      <FeatureCard
        icon="book"
        title="Learn Chess"
        description="Master the fundamentals"
        progress="12 lessons completed"
        onPress={() => {}}
        delay={400}
      />
    </View>
  ),
};
```

---

### 7. StatCard Stories

**File**: `app/ui/components/StatCard.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { StatCard } from './StatCard';
import { ThemeProvider } from '../theme/ThemeProvider';
import { View } from 'react-native';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    value: '147',
    label: 'Puzzles Solved',
  },
};

export const WithIcon: Story = {
  args: {
    icon: 'flame',
    value: '7',
    label: 'Day Streak',
  },
};

export const StatsGrid: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <StatCard icon="flame" value="7" label="Streak" />
      <StatCard icon="bolt" value="1450" label="Rating" />
    </View>
  ),
};

export const MetricsDashboard: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard value="147" label="Solved" />
        <StatCard value="1450" label="Rating" />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard icon="flame" value="7" label="Streak" />
        <StatCard value="89%" label="Success" />
      </View>
    </View>
  ),
};
```

---

## 🎨 Theme Testing

### Theme Switcher Story

**File**: `app/ui/theme/ThemeSwitcher.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Text, Button } from 'react-native';
import { ThemeProvider } from './ThemeProvider';
import { useThemeTokens } from '../hooks/useThemeTokens';
import { Input } from '../primitives/Input';
import { Tag } from '../primitives/Tag';
import { Avatar } from '../primitives/Avatar';

const ThemeShowcase = () => {
  const { mode, setMode, colors } = useThemeTokens();

  return (
    <View style={{ padding: 20, backgroundColor: colors.background.primary, minHeight: 600 }}>
      <View style={{ marginBottom: 20 }}>
        <Button
          title={`Current: ${mode} mode (tap to toggle)`}
          onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}
        />
      </View>

      <View style={{ gap: 16 }}>
        <Text style={{ color: colors.foreground.primary, fontSize: 20, fontWeight: 'bold' }}>
          Theme Testing
        </Text>

        <Input label="Email" placeholder="you@example.com" />
        
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Tag label="Default" variant="default" />
          <Tag label="Success" variant="success" />
          <Tag label="Error" variant="error" />
          <Tag label="Warning" variant="warning" />
          <Tag label="Info" variant="info" />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Avatar name="Alice" status="online" />
          <Avatar name="Bob" status="away" />
          <Avatar name="Charlie" status="offline" />
        </View>
      </View>
    </View>
  );
};

const meta: Meta<typeof ThemeShowcase> = {
  title: 'Theme/Switcher',
  component: ThemeShowcase,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeShowcase>;

export const Interactive: Story = {};
```

---

## 🚀 Running Storybook

### Development

```bash
# Terminal 1: Start Metro bundler
cd app
pnpm start

# Terminal 2: Start Storybook
cd app
pnpm storybook
```

### Build Static Site

```bash
cd app
pnpm build-storybook
```

---

## ✅ Testing Checklist

When creating stories, verify:

### Visual Testing
- [ ] Component renders in light mode
- [ ] Component renders in dark mode
- [ ] All variants display correctly
- [ ] All sizes display correctly
- [ ] Typography scales properly
- [ ] Colors match design tokens
- [ ] Spacing is consistent

### Interactive Testing
- [ ] Press/click interactions work
- [ ] Hover states show (web only)
- [ ] Focus states show
- [ ] Disabled states show
- [ ] Animations play correctly
- [ ] Theme switching works

### Accessibility Testing
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Screen reader labels present
- [ ] Touch targets ≥ 44px
- [ ] Keyboard navigation works

---

## 📊 Coverage Status

| Component | Story Created | Theme Tested | A11y Tested | Status |
|-----------|---------------|--------------|-------------|--------|
| Input | ✅ | ✅ | ⏳ | Ready |
| Tag | ✅ | ✅ | ⏳ | Ready |
| Avatar | ✅ | ✅ | ⏳ | Ready |
| MatchCard | ✅ | ✅ | ⏳ | Ready |
| TournamentHeader | ✅ | ✅ | ⏳ | Ready |
| FeatureCard | ✅ | ✅ | ⏳ | Ready |
| StatCard | ✅ | ✅ | ⏳ | Ready |
| Box | ⏳ | ⏳ | ⏳ | Pending |
| Text | ⏳ | ⏳ | ⏳ | Pending |
| Button | ⏳ | ⏳ | ⏳ | Pending |
| Card | ⏳ | ⏳ | ⏳ | Pending |

---

## 🎯 Next Steps

### Short-term (This Week)
1. ✅ Create stories for improved primitives (Input, Tag, Avatar)
2. ✅ Create stories for chess components (MatchCard, TournamentHeader)
3. ✅ Create stories for feature components (FeatureCard, StatCard)
4. ⏳ Add accessibility testing addon
5. ⏳ Set up visual regression testing

### Medium-term (This Month)
6. ⏳ Create stories for all remaining primitives
7. ⏳ Add interaction testing
8. ⏳ Set up Chromatic for visual testing
9. ⏳ Document best practices guide
10. ⏳ Create component template generator

### Long-term (Next Quarter)
11. ⏳ Integration with design tools (Figma)
12. ⏳ Performance benchmarking stories
13. ⏳ Automated screenshot generation
14. ⏳ Component playground for designers

---

## 📚 Resources

- [Storybook for React Native](https://storybook.js.org/docs/react-native/get-started/introduction)
- [Design Language System](./design-language-system.md)
- [Component Verification Checklist](./component-verification-checklist.md)
- [DLS Audit Dashboard](./dls-audit-dashboard.md)

---

**Created**: December 3, 2025  
**Last Updated**: December 3, 2025  
**Status**: Ready for implementation  
**Next Review**: December 10, 2025
