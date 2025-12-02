---
title: AI Agent Quick Reference - Folder Structure
service: app
status: active
last_reviewed: 2025-12-02
type: how-to
---

# AI Agent Quick Reference: Folder Structure

> **🚨 BEFORE CODING**: Complete the [DLS Compliance Checklist](#-dls-compliance-checklist) for any UI work!

## 🎯 Quick Decision Tree

```
What are you creating?

├─ Route/Screen?
│  └─ /app/{route}.tsx (thin wrapper)
│     Import from /features
│
├─ Feature Component?
│  ├─ Reusable across features?
│  │  └─ /ui/primitives or /ui/components
│  └─ Feature-specific?
│     └─ /features/{feature}/components
│
├─ Business Logic Hook?
│  ├─ Generic (debounce, network)?
│  │  └─ /core/hooks
│  └─ Feature-specific?
│     └─ /features/{feature}/hooks
│
├─ Utility Function?
│  ├─ Generic (date, string, validation)?
│  │  └─ /core/utils
│  └─ Feature-specific?
│     └─ /features/{feature}/utils
│
├─ API Integration?
│  └─ /services/api/{service}.api.ts
│
├─ WebSocket?
│  └─ /services/ws/{Service}WebSocket.ts
│
├─ Type Definition?
│  ├─ Global (used everywhere)?
│  │  └─ /types/{domain}.types.ts
│  └─ Feature-specific?
│     └─ /features/{feature}/types
│
├─ Design Token?
│  └─ /ui/tokens/{category}.ts
│
├─ Security/Monitoring?
│  └─ /platform/{category}
│
└─ Asset (image, font, sound)?
   └─ /assets/{category}/
```

## 🚫 Common Mistakes to Avoid

| ❌ DON'T | ✅ DO |
|---------|-------|
| Put logic in route files | Keep routes thin, logic in features |
| Import Feature A from Feature B | Use shared services or state |
| Hard-code colors/spacing | Use tokens from `/ui/tokens` |
| Put UI components in features | Reusable UI goes to `/ui` |
| Put feature logic in `/core` | Core is domain-agnostic only |
| Skip `index.ts` exports | Always create public API |
| Import from file path | Import from folder (`@/features/board`) |

## 📦 Feature Structure Template

When creating a new feature:

```
features/{feature-name}/
├── index.ts                    # Public API - REQUIRED
├── components/
│   ├── {Feature}Screen.tsx     # Main screen component
│   ├── {Sub}Component.tsx      # Sub-components
│   └── index.ts
├── hooks/
│   ├── use{Feature}State.ts    # State management
│   ├── use{Feature}Actions.ts  # Actions
│   └── index.ts
├── utils/                      # Feature-specific utilities
│   └── {helper}.ts
├── types/
│   └── {feature}.types.ts
└── __tests__/
    └── {feature}.test.tsx
```

## 🎨 DLS Compliance Checklist

**Before creating or modifying any UI component, complete this checklist:**

### ✅ Step 1: Check Existing DLS Components
- [ ] Does [`design-language-system.md`](./design-language-system.md) already define this pattern?
- [ ] Is there a primitive in `/ui/primitives/` I can use? (Button, Text, Box, Card, etc.)
- [ ] Can I compose this from existing primitives instead of creating new?
- [ ] Have I searched for similar components in the codebase?

**Example**: Need a button → Check `ui/primitives/Button.tsx` first → Use existing or extend with new variant

### ✅ Step 2: Verify Design Token Usage
- [ ] All colors come from `colorTokens` or `useColors()` hook
- [ ] All spacing uses `spacingTokens` (e.g., `spacingTokens.md`, `spacingTokens[4]`)
- [ ] All typography uses `textVariants` (e.g., `textVariants.heading`, `textVariants.body`)
- [ ] All shadows use `shadowTokens` (e.g., `shadowTokens.card`, `shadowTokens.md`)
- [ ] All border radii use `radiusTokens` (e.g., `radiusTokens.md`, `radiusTokens.lg`)

**Example**: Need spacing → Use `spacingTokens.md` (16px) instead of hard-coding `padding: 16`

### ✅ Step 3: Ensure Theme Awareness
- [ ] Component works in both light and dark mode
- [ ] Using `useColors()` hook for dynamic colors
- [ ] Using `useIsDark()` if conditional logic needed
- [ ] Tested appearance in both themes

**Example**: Background color → `useColors().background.primary` instead of `#FFFFFF`

### ✅ Step 4: Follow Composition Patterns
- [ ] Component is composed from primitives (not built from scratch)
- [ ] Using `Box` for layout, not raw `View`
- [ ] Using `Text` primitive, not raw `RNText`
- [ ] Props follow DLS naming conventions

**Example**: Card with button → `<Card><Box><Text /><Button /></Box></Card>`

### ✅ Step 5: Document in DLS
- [ ] Added new pattern to `design-language-system.md`
- [ ] Added JSDoc comments with usage examples
- [ ] Exported from `ui/index.ts` or feature `index.ts`
- [ ] Created tests for component

**Example**: New Button variant → Add section to DLS under "Button Component" → "Variants"

### 🚫 Forbidden Patterns (Auto-Fail)
| ❌ NEVER DO THIS | ✅ DO THIS INSTEAD |
|------------------|---------------------|
| `color: '#FFFFFF'` | `color: useColors().foreground.primary` |
| `color: 'rgba(255,255,255,0.5)'` | `color: colorTokens.neutral[50].light` with opacity |
| `padding: 16` | `padding: spacingTokens[6]` or `padding: spacingScale.padding` |
| `fontSize: 14` | `fontSize: typographyTokens.fontSize.sm` |
| `fontWeight: 'bold'` | `fontWeight: typographyTokens.fontWeight.bold` |
| `borderRadius: 8` | `borderRadius: radiusTokens.md` |
| `shadowColor: '#000'` | `...shadowTokens.card` (spread operator) |
| `<View style={{...}}>` | `<Box padding={4} radius="md">` |
| `<RNText style={{...}}>` | `<Text variant="body" color={colors.text}>` |

### 🎯 Quick DLS Reference

**Primitives** (always use these):
- `Box` — Layout container (replaces `View`)
- `Text` — Typography (replaces `RNText`)
- `Button` — Interactive buttons
- `Card` — Content containers
- `Panel` — Translucent panels
- `Input` — Form inputs
- `Tag` — Labels/badges
- `Avatar` — User avatars
- `Divider` — Separators

**Tokens** (import from `/ui/tokens`):
- `colorTokens` — Color palette
- `spacingTokens` — Spacing scale (0-16)
- `typographyTokens` — Font sizes, weights, line heights
- `textVariants` — Pre-configured text styles
- `radiusTokens` — Border radius values
- `shadowTokens` — Shadow presets
- `motionTokens` — Animation durations and easings

**Hooks** (import from `/ui/hooks`):
- `useColors()` — Theme-aware colors
- `useIsDark()` — Check if dark mode
- `useThemeTokens()` — Full theme context

### 📚 DLS Documentation Links
- **Complete Spec**: [`design-language-system.md`](./design-language-system.md) (1850+ lines)
- **Tokens Reference**: `/ui/tokens/` folder
- **Primitives**: `/ui/primitives/` folder
- **Adoption Status**: [`dls-adoption-audit.md`](./dls-adoption-audit.md)

## 🎨 UI Component Checklist (Legacy - Use DLS Checklist Above)

Before creating a component:

1. ✅ Is it reusable across multiple features? → `/ui/primitives` or `/ui/components`
2. ✅ Does it have business logic? → **NO**, extract to hooks in `/features/{feature}/hooks`
3. ✅ Does it use design tokens? → **YES**, import from `/ui/tokens`
4. ✅ Is it themeable? → **YES**, use `useTheme()` hook
5. ✅ Does it have tests? → **YES**, create `{Component}.test.tsx`

## 🔌 API Client Pattern

When adding a new API:

```typescript
// services/api/{service}.api.ts
import { client } from './client';
import type { ServiceRequest, ServiceResponse } from '@/types/api.types';

export const serviceApi = {
  getResource: async (id: string): Promise<ServiceResponse> => {
    const response = await client.get(`/resource/${id}`);
    return response.data;
  },
  
  createResource: async (data: ServiceRequest): Promise<ServiceResponse> => {
    const response = await client.post('/resource', data);
    return response.data;
  },
};
```

## 🪝 Hook Naming Conventions

| Hook Type | Naming | Location | Example |
|-----------|--------|----------|---------|
| State management | `use{Feature}State` | `/features/{feature}/hooks` | `useGameState` |
| Actions | `use{Feature}Actions` | `/features/{feature}/hooks` | `useGameActions` |
| API query | `use{Resource}` | `/features/{feature}/hooks` | `useGame`, `usePuzzles` |
| WebSocket | `use{Feature}WebSocket` | `/features/{feature}/hooks` | `useGameWebSocket` |
| Generic utility | `use{Utility}` | `/core/hooks` | `useDebounce`, `useOnlineStatus` |

## 📝 Import Path Aliases

Use these consistently:

```typescript
// ✅ Correct
import { ChessBoard } from '@/features/board';
import { Button } from '@/ui/primitives';
import { gameApi } from '@/services/api/game.api';
import { formatDate } from '@/core/utils/date';
import type { Game } from '@/types/chess.types';

// ❌ Wrong
import { ChessBoard } from '../../../features/board/components/ChessBoard';
import { Button } from '../../ui/primitives/Button/Button';
```

## 🧪 Testing Locations

| What to Test | Where | Pattern |
|--------------|-------|---------|
| Feature components | `/features/{feature}/__tests__` | `{Component}.test.tsx` |
| UI primitives | `/ui/primitives/{Component}/` | `{Component}.test.tsx` |
| Hooks | Co-located with hook | `{Hook}.test.ts` |
| Utils | Co-located with util | `{util}.test.ts` |
| E2E tests | `/__tests__/e2e/` | `{flow}.e2e.ts` |
| Integration tests | `/__tests__/integration/` | `{integration}.test.ts` |

## 🚀 Adding a New Feature (Step-by-Step)

### 1. Create Feature Structure
```bash
mkdir -p features/{feature-name}/{components,hooks,utils,types,__tests__}
touch features/{feature-name}/index.ts
```

### 2. Create Components
```typescript
// features/{feature-name}/components/{Feature}Screen.tsx
import { View } from 'react-native';
import { Button } from '@/ui/primitives';

export function FeatureScreen() {
  return (
    <View>
      {/* Implementation */}
    </View>
  );
}
```

### 3. Create Hooks
```typescript
// features/{feature-name}/hooks/useFeatureState.ts
import { useState } from 'react';

export function useFeatureState() {
  const [state, setState] = useState(/* ... */);
  return { state, setState };
}
```

### 4. Create Public API
```typescript
// features/{feature-name}/index.ts
export { FeatureScreen } from './components/FeatureScreen';
export { useFeatureState } from './hooks/useFeatureState';
export type { FeatureProps, FeatureState } from './types/feature.types';
```

### 5. Add Route (if needed)
```typescript
// app/{feature-name}.tsx
import { FeatureScreen } from '@/features/{feature-name}';

export default function FeatureRoute() {
  return <FeatureScreen />;
}
```

### 6. Add Tests
```typescript
// features/{feature-name}/__tests__/FeatureScreen.test.tsx
import { render } from '@testing-library/react-native';
import { FeatureScreen } from '../components/FeatureScreen';

describe('FeatureScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<FeatureScreen />);
    expect(getByText('Feature')).toBeTruthy();
  });
});
```

## 🔄 State Management Location

| State Type | Location | Example |
|------------|----------|---------|
| Global auth | `/core/state/authSlice.ts` | User login, JWT |
| Global user | `/core/state/userSlice.ts` | User profile |
| Feature state | `/features/{feature}/state/` | Game state, puzzle state |
| Component state | Inside component | Local UI state |

## 🎨 Design System Usage (DLS Examples)

### ✅ Correct: Using Primitives + Tokens

```typescript
import { Box, Text, Button } from '@/ui/primitives';
import { useColors } from '@/ui/hooks';
import { spacingTokens, radiusTokens } from '@/ui/tokens';

export function MyComponent() {
  const colors = useColors();
  
  return (
    <Box
      padding={6}
      radius="lg"
      backgroundColor={colors.background.primary}
      gap={4}
    >
      <Text variant="heading" color={colors.foreground.primary}>
        Welcome
      </Text>
      <Button variant="solid" size="md">
        Get Started
      </Button>
    </Box>
  );
}
```

### ❌ Incorrect: Hard-Coded Values + Raw Components

```typescript
import { View, Text as RNText, TouchableOpacity } from 'react-native';

export function MyComponent() {
  return (
    <View style={{
      padding: 16,                    // ❌ Hard-coded spacing
      borderRadius: 12,               // ❌ Hard-coded radius
      backgroundColor: '#FFFFFF',     // ❌ Hard-coded color
    }}>
      <RNText style={{
        fontSize: 24,                 // ❌ Hard-coded font size
        fontWeight: 'bold',           // ❌ Hard-coded weight
        color: '#000000',             // ❌ Hard-coded color
      }}>
        Welcome
      </RNText>
      <TouchableOpacity style={{
        padding: 12,                  // ❌ Hard-coded spacing
        backgroundColor: '#007AFF',   // ❌ Hard-coded color
        borderRadius: 8,              // ❌ Hard-coded radius
      }}>
        <RNText style={{ color: '#FFF' }}>Get Started</RNText>
      </TouchableOpacity>
    </View>
  );
}
```

### 🔧 Migration Pattern: From Hard-Coded to DLS

**Before:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
```

**After:**
```typescript
import { useColors } from '@/ui/hooks';
import { spacingTokens, radiusTokens, textVariants } from '@/ui/tokens';

function Component() {
  const colors = useColors();
  
  return (
    <Box
      padding={6}                              // spacingTokens[6] = 16
      radius="lg"                              // radiusTokens.lg = 16
      backgroundColor={colors.background.primary}
    >
      <Text
        variant="body"                         // textVariants.body = 16px, weight 400
        weight="semibold"                      // Override weight to 600
        color={colors.foreground.primary}
      >
        Content
      </Text>
    </Box>
  );
}

## 📚 Documentation Requirements

When creating new code:

- [ ] Add JSDoc comments to public functions
- [ ] Create README in feature folder if complex
- [ ] Update parent folder's index.ts exports
- [ ] Add tests with meaningful assertions
- [ ] Update relevant documentation in `/docs`

## 🆘 When in Doubt

1. Check [folder-structure-convention.md](./folder-structure-convention.md)
2. Look at existing features for patterns
3. Ask: "Is this generic or feature-specific?"
4. Default to more specific location (easier to move up than down)
5. Create public API (`index.ts`) for all folders

## 🎴 Quick Reference Card for AI Agents

```
┌─────────────────────────────────────────────────────────────┐
│  UI WORK CHECKLIST (MANDATORY)                              │
├─────────────────────────────────────────────────────────────┤
│  Before writing ANY UI code:                                │
│                                                              │
│  1. ✅ Read design-language-system.md                       │
│  2. ✅ Check if primitive exists (Button, Text, Box, Card)  │
│  3. ✅ Use design tokens (colorTokens, spacingTokens, etc.) │
│  4. ✅ Ensure theme-aware (useColors(), useIsDark())        │
│  5. ✅ Compose from primitives (don't create from scratch)  │
│  6. ✅ Update DLS docs if adding new pattern                │
│                                                              │
│  NEVER:                                                      │
│  ❌ Hard-code colors (#FFFFFF, rgba())                      │
│  ❌ Hard-code spacing (padding: 16)                         │
│  ❌ Hard-code typography (fontSize: 14)                     │
│  ❌ Use raw View/Text (use Box/Text primitives)            │
├─────────────────────────────────────────────────────────────┤
│  FOLDER PLACEMENT                                           │
├─────────────────────────────────────────────────────────────┤
│  Reusable UI → /ui/primitives or /ui/components            │
│  Feature UI → /features/{feature}/components                │
│  Business logic → /features/{feature}/hooks                 │
│  Generic utils → /core/utils                                │
│  Feature utils → /features/{feature}/utils                  │
│  API clients → /services/api/{service}.api.ts              │
│  Types → /types (global) or /features/{feature}/types      │
│  Assets → /assets/{category}/                              │
├─────────────────────────────────────────────────────────────┤
│  IMPORTS (use aliases)                                      │
├─────────────────────────────────────────────────────────────┤
│  @/features/{feature}      — Feature components/hooks       │
│  @/ui/primitives           — UI primitives                  │
│  @/ui/tokens               — Design tokens                  │
│  @/ui/hooks                — Theme hooks                    │
│  @/services/api            — API clients                    │
│  @/core/utils              — Generic utilities              │
│  @/types                   — Global types                   │
├─────────────────────────────────────────────────────────────┤
│  DOCUMENTATION                                              │
├─────────────────────────────────────────────────────────────┤
│  New UI pattern → Update design-language-system.md          │
│  New feature → Add JSDoc + exports in index.ts              │
│  Complex logic → Add README.md in feature folder            │
│  API changes → Update service docs                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Essential Documentation Links

| Topic | Document | Purpose |
|-------|----------|---------|
| **DLS Complete Spec** | [`design-language-system.md`](./design-language-system.md) | Full DLS with tokens, primitives, components |
| **Folder Structure** | [`folder-structure-convention.md`](./folder-structure-convention.md) | Detailed structure rules |
| **App Overview** | [`overview.md`](./overview.md) | Architecture and patterns |
| **Agent Rules** | [`../../AGENTS.md`](../../AGENTS.md) | Pre-flight checklist and guidelines |
| **DLS Adoption** | [`dls-adoption-audit.md`](./dls-adoption-audit.md) | Current compliance status |

---

**Remember**: This structure exists to make code **predictable, maintainable, and scalable**. When in doubt, choose the location that makes the most sense for future developers (including AI agents) reading the code.

**For UI work**: Always complete the [DLS Compliance Checklist](#-dls-compliance-checklist) first!

---

*Last updated: 2025-12-02*
