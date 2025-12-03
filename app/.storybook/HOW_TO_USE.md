# 🎨 How to Use React Native Storybook

> **Important:** React Native Storybook runs **inside your app**, not as a separate dev server like web Storybook!

## ✅ Quick Start (3 steps)

### 1. Enable Storybook

```typescript
// app/.storybook/config.ts
export const ENABLE_STORYBOOK = __DEV__ && true;
```

### 2. Start the Expo app

```bash
cd app
pnpm start
```

### 3. Choose platform

- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web

**Storybook will load automatically!**

---

## 🎯 What You'll See

Once the app loads, you'll see the Storybook UI with:
- **Sidebar:** Browse all 12 components and 68 stories
- **Canvas:** View the selected story
- **Controls:** Adjust props in real-time (on-device addon)
- **Actions:** See interaction logs

---

## 🔧 How It Works

### React Native Storybook vs Web Storybook

| Feature | Web Storybook | React Native Storybook |
|---------|---------------|------------------------|
| **Runs as** | Separate dev server (port 6006) | Inside your Expo app |
| **Start with** | `npm run storybook` | `pnpm start` + toggle |
| **UI** | Browser-based | Native mobile UI |
| **Controls** | Browser addons | On-device controls |
| **Hot reload** | Yes | Yes (via Expo) |

### Architecture

```
App.tsx
  ├─ ENABLE_STORYBOOK = false → Your app (normal mode)
  └─ ENABLE_STORYBOOK = true  → Storybook UI (dev mode)
```

When enabled, `App.tsx` renders `StorybookUIRoot` instead of your main app.

---

## 📱 Using Storybook

### Navigate Stories

1. **Tap the menu** (hamburger icon) to open sidebar
2. **Browse categories:**
   - Primitives (Box, Text, Button, Input, Card, Panel, Tag, Avatar)
   - Components (MatchCard, TournamentHeader, FeatureCard, StatCard)
3. **Tap a story** to view it

### Interactive Controls

1. **Tap the controls icon** (sliders) in the toolbar
2. **Adjust props** dynamically:
   - `variant`: solid, outline, subtle, ghost
   - `size`: sm, md, lg
   - `disabled`: toggle on/off
   - `color`: pick from palette
3. **See changes live** in the canvas

### Test Themes

Stories automatically support light/dark mode via `ThemeProvider` decorator:
- Use your device's system theme settings
- Or add a theme toggle in the decorator (optional)

---

## 🔄 Switching Back to Main App

### Temporary (this session only)

```typescript
// app/.storybook/config.ts
export const ENABLE_STORYBOOK = __DEV__ && false;
```

Then press `r` in the terminal to reload.

### Permanent (commit the change)

Keep `ENABLE_STORYBOOK = false` in git so other developers see the main app by default.

---

## ❌ Common Mistakes

### ❌ Don't run `npm run storybook`

This tries to start **web Storybook**, which we didn't set up. 

**React Native Storybook doesn't need a separate command!**

### ✅ Correct approach

1. Enable toggle in `config.ts`
2. Run `pnpm start` (normal Expo start)
3. Choose platform (i/a/w)

---

## 🐛 Troubleshooting

### "Stories not showing"

**Check 1:** Verify `ENABLE_STORYBOOK = true` in `config.ts`

**Check 2:** Make sure you reloaded the app (press `r`)

**Check 3:** Check metro bundler logs for errors

### "Theme not working"

**Check:** `preview.tsx` has `ThemeProvider` decorator:

```typescript
export const decorators = [
  (Story) => (
    <ThemeProvider defaultMode="light">
      <Story />
    </ThemeProvider>
  ),
];
```

### "Controls not interactive"

**Check:** Story has `argTypes` defined:

```typescript
const meta: Meta<typeof Button> = {
  argTypes: {
    variant: { control: 'select', options: ['solid', 'outline'] },
  },
};
```

### "Cannot find module error"

**Check:** All story files are registered in `storybook.requires.ts`:

```typescript
const getStories = () => {
  return [
    require('../ui/primitives/Button.stories'),
    // ... add your story here
  ];
};
```

---

## 📚 Next Steps

### Explore Stories

Browse all 68 stories across 12 components:
- **Primitives:** See all design tokens in action
- **Components:** Real-world chess component examples
- **Combinations:** Matrix views of all variants

### Add New Stories

1. Create `MyComponent.stories.tsx`
2. Add to `storybook.requires.ts`
3. Reload app

See `.storybook/QUICK_REFERENCE.md` for templates.

### Learn More

- **Full Setup Guide:** `.storybook/SETUP_COMPLETE.md`
- **Quick Reference:** `.storybook/QUICK_REFERENCE.md`
- **Implementation Summary:** `docs/storybook-implementation-summary.md`

---

## 🎉 You're Ready!

Storybook is now integrated into your React Native app. Just toggle it on when you want to explore components!

**Enable it now and start exploring! 🚀**
