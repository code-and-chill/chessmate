---
title: Navigation Consolidation - Drawer Only
date: 2025-01-XX
status: completed
---

# Navigation Refactoring Summary

## Problem Statement
The app had inconsistent navigation with both bottom tabs `(tabs)` and permanent sidebar `(drawer)` showing simultaneously. This created UX confusion and didn't align with the shadcn + AI theme aesthetic.

## Solution
Consolidated to single drawer-based navigation with custom styled sidebar matching the design system.

## Changes Made

### 1. Root Layout (`app/_layout.tsx`)
**Changed anchor from `(tabs)` to `(drawer)`:**
- Set `unstable_settings.anchor = '(drawer)'`
- Removed `(tabs)` route from Stack navigation
- Made drawer the primary and only navigation pattern

### 2. Drawer Layout (`app/(drawer)/_layout.tsx`)
**Styled with design system tokens:**
- Integrated `useTheme()` for theme-aware colors
- Applied `colorTokens` from design system
- Configured responsive behavior:
  - Desktop (≥1024px): Permanent sidebar
  - Tablet (≥768px): Permanent sidebar
  - Mobile (<768px): Front drawer (swipe)
- Removed default header (`headerShown: false`) for custom implementation
- Enhanced drawer styling:
  - Background: `colorTokens.neutral[100]`
  - Border: `colorTokens.neutral[200]`
  - Active tint: `colorTokens.blue[600]`
  - Inactive tint: `colorTokens.neutral[600]`
  - Custom item styles with border radius and padding

### 3. Custom Drawer Content (`app/(drawer)/_components/DrawerContent.tsx`)
**Created branded sidebar with header actions:**
- **Header Section:**
  - ChessMate branding (Text with h3 variant)
  - Search button (routes to `/search`)
  - Theme toggle button (light/dark mode via `useThemeTokens`)
- **Navigation Items:**
  - DrawerItemList with custom styling
- **Footer:**
  - Version number (v1.0.0)
- **Theme Integration:**
  - Uses `useThemeTokens()` for light/dark mode
  - Applies design tokens for colors, spacing, borders
  - Dynamic icon switching (moon/sun for theme toggle)

### 4. Tab Layout Deprecation (`app/(tabs)/_layout.tsx`)
**Deprecated and redirected:**
- Added deprecation notice in comments
- Replaced entire implementation with `<Redirect href="/(drawer)/play" />`
- Kept file for backward compatibility
- May be removed in future release

## Design System Integration

### Colors
All colors use `colorTokens` with `getColor()` helper for light/dark support:
- Background: `neutral[50]` (scene), `neutral[100]` (drawer)
- Borders: `neutral[200]`
- Text: `neutral[900]` (primary), `neutral[600]` (secondary)
- Accent: `blue[600]` (active state)

### Spacing
Consistent spacing using `spacingTokens`:
- Header/footer padding: `spacingTokens[4]`
- Icon button padding: `spacingTokens[2]`
- Header actions gap: `spacingTokens[2]`
- Drawer item margins: 8px horizontal, 12px padding

### Typography
Uses design system Text component with variants:
- Header: `variant="h3"`
- Footer: `variant="caption"`

## Navigation Structure

### Routes (6 screens)
All accessible via drawer with themed icons:
1. **Play** - `gamecontroller.fill` - Live Chess
2. **Puzzle** - `brain.head.profile` - Daily Puzzle
3. **Learn** - `book.fill` - Lessons & Tactics
4. **Watch** - `play.rectangle.fill` - Watch & Streams
5. **Social** - `person.2.fill` - Friends & Clubs
6. **Settings** - `gearshape.fill` - Settings

### Modal Routes
Accessible from anywhere:
- `/search` - Search modal
- `/modal` - Generic modal

## Responsive Behavior

### Desktop & Tablet
- Permanent sidebar always visible
- Width: 280px (desktop), 240px (tablet)
- No menu toggle needed
- Sidebar acts as primary navigation

### Mobile
- Front drawer (overlay)
- Swipe from left to open
- Tap outside to close
- Preserves screen real estate

## Testing Checklist

- [ ] Run with cache cleared: `pnpm start --clear`
- [ ] Verify drawer shows on app launch
- [ ] Test all 6 navigation items
- [ ] Confirm search button works
- [ ] Test theme toggle (light/dark)
- [ ] Verify responsive behavior (desktop/tablet/mobile)
- [ ] Check color consistency with theme
- [ ] Ensure no bottom navbar appears
- [ ] Test that (tabs) routes redirect to (drawer)

## Benefits

### UX Improvements
- Single, consistent navigation pattern
- No competing navigation systems
- Clear hierarchy and structure
- Better use of screen space on desktop/tablet

### Design System Compliance
- Full integration with design tokens
- Theme-aware colors throughout
- Consistent spacing and typography
- Matches shadcn + AI aesthetic

### Maintainability
- Custom drawer content easy to extend
- Centralized navigation logic
- Clear deprecation path for tabs
- Follows feature-based architecture

## Future Considerations

1. **Remove (tabs) folder entirely** after migration period
2. **Add user profile section** to drawer header
3. **Implement nested navigation** for complex features
4. **Add keyboard shortcuts** for desktop navigation
5. **Enhance drawer customization** (width, animation)
6. **Add drawer sections** (e.g., "Play", "Learn", "Social")

## Files Modified

```
app/app/_layout.tsx                          # Changed anchor to (drawer)
app/app/(drawer)/_layout.tsx                 # Added design system styling
app/app/(drawer)/_components/DrawerContent.tsx  # Created custom drawer
app/app/(tabs)/_layout.tsx                   # Deprecated with redirect
```

## Design Tokens Used

```typescript
// Colors
colorTokens.neutral[50]   // Scene background
colorTokens.neutral[100]  // Drawer background
colorTokens.neutral[200]  // Borders
colorTokens.neutral[600]  // Secondary text
colorTokens.neutral[900]  // Primary text
colorTokens.blue[600]     // Accent/active state

// Spacing
spacingTokens[2]  // Icon button padding, gap
spacingTokens[4]  // Header/footer padding

// Typography
Text variant="h3"      // Header branding
Text variant="caption"  // Footer version
```

## Migration Notes

### For Users
- Navigation now appears as sidebar (desktop/tablet)
- Swipe from left edge (mobile)
- No bottom navigation bar

### For Developers
- Use `/(drawer)/[screen]` routes instead of `/(tabs)/[screen]`
- All features implemented as standalone modules under `features/`
- Routes remain thin wrappers (~10 lines)
- New screens should be added to drawer layout

## Related Documentation
- [AGENTS.md](../../AGENTS.md) - Repository conventions
- [app/docs/overview.md](../docs/overview.md) - App architecture
- [app/docs/folder-structure-convention.md](../docs/folder-structure-convention.md) - File placement rules
- [REFACTORING_SUMMARY.md](../../REFACTORING_SUMMARY.md) - Feature extraction summary
