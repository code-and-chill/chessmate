---
title: AI Agent Quick Reference - Folder Structure
service: app
status: active
last_reviewed: 2025-11-18
type: how-to
---

# AI Agent Quick Reference: Folder Structure

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

## 🎨 UI Component Checklist

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

## 🎨 Design System Usage

```typescript
// ✅ Use design tokens
import { colors, spacing, typography } from '@/ui/tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,           // Use token
    backgroundColor: colors.bg,    // Use token
    fontSize: typography.body,     // Use token
  },
});

// ❌ Don't hard-code
const styles = StyleSheet.create({
  container: {
    padding: 16,                   // Hard-coded
    backgroundColor: '#ffffff',    // Hard-coded
    fontSize: 14,                  // Hard-coded
  },
});
```

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

---

**Remember**: This structure exists to make code **predictable, maintainable, and scalable**. When in doubt, choose the location that makes the most sense for future developers (including AI agents) reading the code.

---

*Last updated: 2025-11-18*
