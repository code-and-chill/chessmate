# ❌ "npm run storybook" Error - SOLVED

## The Problem

You tried to run:
```bash
npm run storybook
```

And got this error:
```
SB_CORE-COMMON_0001 (MissingFrameworkFieldError): Could not find a 'framework' field in Storybook config.
```

## Why This Happens

**React Native Storybook** and **Web Storybook** are completely different!

| Type | How it runs | Command |
|------|-------------|---------|
| **Web Storybook** | Separate dev server on port 6006 | `npm run storybook` |
| **React Native Storybook** | Inside your Expo app | `pnpm start` + toggle |

Our setup is for **React Native Storybook**, which doesn't need `npm run storybook`.

## ✅ The Solution

### Step 1: Enable Storybook in your app

```typescript
// app/.storybook/config.ts
export const ENABLE_STORYBOOK = __DEV__ && true;
```

### Step 2: Start Expo normally

```bash
cd app
pnpm start
```

### Step 3: Choose your platform

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web

### Step 4: Storybook loads inside the app!

That's it! No separate server needed.

---

## Understanding the Architecture

### Web Storybook (NOT what we have)
```
Terminal 1: npm start        → App runs on port 3000
Terminal 2: npm run storybook → Storybook on port 6006
```

Two separate processes, browse stories in browser.

### React Native Storybook (what we have)
```
Terminal: pnpm start → App runs with Storybook inside
```

One process, toggle between app and Storybook in `config.ts`.

---

## How to Use Storybook

### Enable Storybook Mode

```typescript
// app/.storybook/config.ts
export const ENABLE_STORYBOOK = __DEV__ && true;
```

### Start the app

```bash
pnpm start
```

### The app will show Storybook UI instead of your normal app

- Browse components in sidebar
- Adjust props with on-device controls
- Test light/dark themes
- Explore all 68 stories

### Disable Storybook Mode

```typescript
// app/.storybook/config.ts
export const ENABLE_STORYBOOK = __DEV__ && false;
```

Reload the app (press `r`) to see your normal app again.

---

## Why We Did It This Way

React Native Storybook is designed to run **on-device** because:

1. **Native components** need a native runtime (iOS/Android)
2. **Platform-specific features** (BlurView, haptics) only work on real devices
3. **Accurate rendering** - see exactly how components look in production
4. **Hot reload** - Changes appear instantly via Expo's fast refresh

Web Storybook would only show web renderings, not true mobile behavior.

---

## What About Web Storybook?

If you want a **separate** web-based Storybook for documentation (in addition to the on-device one):

1. Install web dependencies:
   ```bash
   pnpm add -D @storybook/react @storybook/react-webpack5
   ```

2. Create separate config:
   ```bash
   npx storybook init --type react
   ```

3. Update stories to work with both

But this is **optional** and adds complexity. The on-device Storybook is usually sufficient.

---

## Quick Reference

| What you want | Command |
|---------------|---------|
| **View Storybook** | Enable toggle → `pnpm start` → choose platform |
| **View normal app** | Disable toggle → `pnpm start` → choose platform |
| **Add new story** | Create `.stories.tsx` → register in `storybook.requires.ts` |
| **Reload stories** | Press `r` in terminal (or shake device → reload) |

---

## Further Reading

- **How to Use:** `.storybook/HOW_TO_USE.md`
- **Quick Reference:** `.storybook/QUICK_REFERENCE.md`
- **Full Setup Guide:** `.storybook/SETUP_COMPLETE.md`

---

## Summary

❌ **Don't do this:**
```bash
npm run storybook  # This is for web Storybook
```

✅ **Do this instead:**
```bash
# 1. Enable toggle in .storybook/config.ts
# 2. pnpm start
# 3. Choose platform (i/a/w)
```

**Storybook runs inside your app!** 🎉
