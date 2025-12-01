# Sidebar Navigation with Modern AI-Aesthetic

## Overview

The app now uses a **sidebar navigation** instead of bottom tabs, featuring the same modern AI-aesthetic design (soft shadows, subtle glassmorphism) that's consistent across the entire app.

## Features

✅ **AI-Aesthetic Design** - Soft shadows, subtle highlights, and glassmorphism effects
✅ **Cross-Platform** - Works on web, iOS, and Android
✅ **Responsive** - Always visible on web, toggleable on mobile
✅ **Expo Router Compatible** - Uses file-based routing
✅ **Theme-Aware** - Adapts to light/dark mode
✅ **Animated** - Smooth transitions and interactions

## Architecture

### Components

**Sidebar Component** (`app/ui/components/Sidebar.tsx`)
- Renders navigation items vertically
- Uses existing design tokens (shadows, colors, spacing)
- Active items show subtle background, accent border, and soft shadow
- Handles navigation with Expo Router

**Layout** (`app/app/(tabs)/_layout.tsx`)
- Uses `Stack` navigator instead of `Tabs`
- Renders sidebar on the left (web) or as overlay (mobile)
- Includes hamburger menu for mobile

## Usage

### Desktop/Web
- Sidebar is always visible on the left
- Click any item to navigate
- Active item shows subtle background with accent border and soft shadow

### Mobile
- Tap hamburger icon (☰) in header to open sidebar
- Sidebar slides in from left with overlay
- Tap outside or select item to close

## Navigation Items

Current navigation structure:
- **Play** → Live Chess
- **Puzzle** → Daily Puzzle
- **Learn** → Lessons & Tactics
- **Watch** → Watch & Streams
- **Social** → Friends & Clubs
- **Settings** → Settings

## Design System Integration

The sidebar uses the existing AI-aesthetic design tokens:

### Active Item Styling

Active navigation items show:
- **Subtle background** - Semi-transparent overlay (5% white in dark mode, 3% black in light mode)
- **Accent border** - 3px left border using `colors.accent.primary`
- **Soft shadow** - Using `shadowTokens.sm` for subtle elevation
- **Accent color** - Icon and text use `colors.accent.primary`

```typescript
// Active item uses existing design tokens
<Box
  shadow="sm"
  style={{
    backgroundColor: mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
  }}
/>
```

## Theme Integration

The sidebar uses the design token system:
- **Colors** - From `colors.background` and `colors.accent`
- **Spacing** - From `spacingTokens`
- **Radius** - From `radiusTokens`
- **Shadows** - Neumorphic system

## Adding New Navigation Items

Edit `app/app/(tabs)/_layout.tsx`:

```typescript
const sidebarItems: SidebarItem[] = [
  // ... existing items
  {
    id: 'my-feature',
    title: 'My Feature',
    icon: 'star.fill', // SF Symbol name
    route: '/my-feature',
    headerTitle: 'My Feature Title',
  },
];
```

Then add the screen to the Stack:

```typescript
<Stack.Screen 
  name="my-feature" 
  options={{ title: 'My Feature Title' }} 
/>
```

## Benefits Over Bottom Tabs

1. **More screen space** - No bottom bar taking up vertical space
2. **Scalability** - Can fit more navigation items
3. **Professional look** - Common pattern for desktop apps
4. **Better UX on web** - Natural navigation pattern
5. **Neumorphic design** - Modern, tactile visual feedback

## Migration Notes

- All existing routes remain the same
- No changes to screen components needed
- `Tabs` replaced with `Stack` navigator
- Bottom tab bar removed
- Sidebar added with overlay on mobile

## File Changes

**New Files:**
- `app/ui/components/Sidebar.tsx` - Sidebar component with AI-aesthetic styling

**Modified Files:**
- `app/app/(tabs)/_layout.tsx` - Changed from Tabs to Stack + Sidebar
- `app/ui/index.ts` - Added Sidebar exports

## Browser Compatibility

- ✅ Chrome/Edge (Web) - Full support with CSS box-shadow
- ✅ Safari (Web) - Full support
- ✅ iOS (Native) - Approximated with native shadows
- ✅ Android (Native) - Approximated with elevation

## Performance

- Animations use `react-native-reanimated` (GPU-accelerated)
- Styles calculated once per theme change
- No re-renders on navigation
- Efficient shadow rendering using existing `shadowTokens`
