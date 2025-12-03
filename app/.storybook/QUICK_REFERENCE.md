# 🎨 Storybook Quick Reference Card

> **TL;DR:** Complete Storybook setup with 12 components, 68 stories, interactive controls, and theme testing.

---

## 🚀 **Quick Start (30 seconds)**

> **Important:** React Native Storybook runs **inside your app**, not as a separate server!

1. **Enable Storybook:**
   ```typescript
   // app/.storybook/config.ts
   export const ENABLE_STORYBOOK = __DEV__ && true;
   ```

2. **Start Expo (normal command):**
   ```bash
   cd app && pnpm start
   ```

3. **Choose platform:** `i` (iOS) | `a` (Android) | `w` (Web)

4. **Storybook loads inside the app!** 🎉

**Don't run:** `npm run storybook` ❌ (that's for web Storybook, which we didn't set up)

---

## 📦 **What's Available**

| Category | Components | Stories |
|----------|-----------|---------|
| **Primitives** | Box, Text, Button, Input, Card, Panel, Tag, Avatar | 51 |
| **Components** | MatchCard, TournamentHeader, FeatureCard, StatCard | 17 |
| **Total** | **12 components** | **68 stories** |

---

## 🎯 **Common Tasks**

### View All Components
```typescript
// Already set up! Just enable Storybook and navigate sidebar
```

### Test Light/Dark Mode
```typescript
// Stories automatically support theme switching
// ThemeProvider decorator in .storybook/preview.tsx
```

### Adjust Props Interactively
```typescript
// Use ondevice controls to adjust:
// - variant (solid/outline/subtle/ghost)
// - size (sm/md/lg)
// - disabled (true/false)
// - color (color picker)
```

### Add New Story
```typescript
// 1. Create file: ui/components/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};
export default meta;

export const Default: Story = { args: {} };

// 2. Register in .storybook/storybook.requires.ts
require('../ui/components/MyComponent.stories'),

// 3. Reload app - Done!
```

---

## 🎨 **Story Examples by Use Case**

### **"I want to see all button variants"**
→ `Button.stories.tsx` → "Variants" story  
Shows: solid, outline, subtle, ghost

### **"I want to test card shadows"**
→ `Card.stories.tsx` → "Shadows" story  
Shows: card, panel, floating elevations

### **"I want to see text hierarchy"**
→ `Text.stories.tsx` → "Hierarchy" story  
Shows: heading → body → caption → hint

### **"I want to test responsive spacing"**
→ `Box.stories.tsx` → "Padding" story  
Shows: 8px, 16px, 24px variations

### **"I want to see all tag types"**
→ `Tag.stories.tsx` → "SemanticVariants" story  
Shows: default, success, error, warning, info

### **"I want to test avatar states"**
→ `Avatar.stories.tsx` → "WithStatus" story  
Shows: online, offline, away

### **"I want to build a dashboard"**
→ `StatCard.stories.tsx` → "MetricsDashboard" story  
Shows: complete metrics layout

---

## 📚 **File Locations**

```
app/
├── .storybook/
│   ├── config.ts              ← Toggle here
│   └── SETUP_COMPLETE.md      ← Full guide
│
├── docs/
│   ├── storybook-implementation-summary.md  ← What we built
│   └── storybook-showcase.md                ← Template guide
│
└── ui/
    ├── primitives/*.stories.tsx  ← 8 components
    └── components/*.stories.tsx  ← 4 components
```

---

## 🐛 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| Stories not loading | Check `storybook.requires.ts` has correct paths |
| Theme not working | Verify `ThemeProvider` in `preview.tsx` |
| Controls not showing | Add `argTypes` to story meta |
| Blur not working (web) | Expected - BlurView not supported on web |
| TypeScript errors | Run `pnpm typecheck` to diagnose |

---

## 🎯 **Next Steps**

### **Phase 2: Expand Coverage**
- [ ] Add Divider.stories.tsx
- [ ] Add Modal.stories.tsx
- [ ] Add Toast.stories.tsx
- [ ] Add ScoreInput.stories.tsx
- [ ] Add PlayerRow.stories.tsx
- [ ] Add RoundSelector.stories.tsx
- [ ] Add ActionBar.stories.tsx

Target: **80% coverage (24/30 components)**

### **Phase 3: Advanced Features**
- [ ] Visual regression testing (Chromatic)
- [ ] Accessibility testing (addon-a11y)
- [ ] Interaction testing (addon-interactions)
- [ ] CI/CD integration

---

## 📊 **Current Status**

- ✅ **Storybook installed** and configured
- ✅ **12 components** with stories
- ✅ **68 stories** covering all variants
- ✅ **100% primitive coverage** (8/8)
- ✅ **Theme integration** with light/dark mode
- ✅ **Interactive controls** for props
- ✅ **TypeScript support** with proper types
- ✅ **Documentation** complete

**Overall Progress: 40% coverage (12/30 components)** 🎯

---

## 💡 **Pro Tips**

1. **Use "AllCombinations" stories** to see all variants at once
2. **Check "ContentExamples" stories** for real-world usage
3. **Test light/dark mode** on all components
4. **Use interactive controls** to find edge cases
5. **Take screenshots** for visual regression baseline
6. **Share story links** with designers for QA

---

## 📖 **Full Documentation**

- **Setup Guide:** `.storybook/SETUP_COMPLETE.md` (350+ lines)
- **Implementation Summary:** `docs/storybook-implementation-summary.md` (300+ lines)
- **Template Guide:** `docs/storybook-showcase.md` (500+ lines)
- **DLS Spec:** `docs/design-language-system.md` (2187 lines)

---

## 🎉 **Success!**

You now have a fully operational Storybook with:
- Interactive component development
- Theme-aware testing
- Living documentation
- Visual regression baseline

**Happy component building! 🚀**

---

**Questions?** Check `.storybook/SETUP_COMPLETE.md` for detailed instructions.
