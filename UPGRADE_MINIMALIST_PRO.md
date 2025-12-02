# Minimalist Pro UI Upgrade - Installation Guide

## ✨ What Was Upgraded

The following screens have been upgraded to the **Minimalist Pro** design system:

### 1. **Puzzle Screen** (`app/puzzle/index.tsx`)
- Glassmorphic stats panel with backdrop blur
- Elegant daily puzzle hero card
- iOS-style segmented control for difficulty
- Horizontal scrollable theme tags with icons
- Premium typography and spacing
- Smooth staggered animations

### 2. **Play Screen** (`app/(tabs)/index.tsx`)
- Glassmorphic stats panel showing rating, streak, games, win rate
- Three elegant mode cards (Online, Bot, Friend)
- Consistent layout with centered content (max 600px)
- Soft shadows and premium spacing
- Smooth animations

### 3. **Explore Screen** (`app/(tabs)/explore.tsx`)
- Unified feature discovery hub
- Five glassmorphic feature cards
- Progress indicators for each feature
- Consistent Minimalist Pro aesthetic

## 🎨 New Components Created

### 1. Enhanced Panel Component (`ui/primitives/Panel.tsx`)
Glassmorphic panel with backdrop blur effect
- **Variants**: `glass`, `solid`, `translucent`
- **Platform-aware**: Uses `BlurView` on iOS/Android, fallback for web
- **Theme-aware**: Adapts to light/dark mode

### 2. SegmentedControl Component (`ui/components/SegmentedControl.tsx`)
iOS-style segmented control for filters
- Smooth spring animations
- Type-safe generic implementation
- Theme-aware colors

## 📦 Required Installation

You need to install `expo-blur` for the glassmorphic effect:

```bash
cd app
npm install expo-blur
```

Or if using pnpm/yarn:
```bash
cd app
pnpm add expo-blur
# or
yarn add expo-blur
```

## 🚀 Running the App

After installation:

```bash
cd app
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

## 🎯 Design Principles Applied

1. ✅ **Glassmorphism**: Translucent panels with backdrop blur
2. ✅ **Elegant Typography**: Proper font weights, letter-spacing (-0.3 to -0.5)
3. ✅ **Soft Shadows**: Subtle elevation (0.08 opacity)
4. ✅ **Smooth Animations**: 400ms duration with staggered delays (100ms increments)
5. ✅ **Premium Spacing**: 24px content padding, max-width 600px
6. ✅ **Theme Awareness**: Adapts to light/dark mode seamlessly
7. ✅ **Subtle Interactions**: Proper press states and feedback

## 📐 Layout Specifications

### Content Container
- **Max Width**: 600px (centered)
- **Horizontal Padding**: 24px
- **Vertical Padding**: 24px top, 40px bottom (scroll)

### Typography Scale
- **Title**: 36px, Weight 800, Letter-spacing -0.5
- **Subtitle**: 17px, Weight 500, Line-height 24
- **Section Title**: 18px, Weight 600, Letter-spacing -0.3
- **Card Title**: 20px, Weight 700, Letter-spacing -0.4
- **Description**: 15px, Weight 500, Line-height 20
- **Progress**: 13px, Weight 600

### Colors (from theme)
- **Primary Accent**: `colors.accent.primary` (#667EEA in light mode)
- **Background**: `colors.background.primary`
- **Text Primary**: `colors.foreground.primary`
- **Text Secondary**: `colors.foreground.secondary`

### Shadows
- **Glassmorphic Cards**:
  - Color: #667EEA
  - Offset: 0, 4
  - Opacity: 0.08
  - Radius: 12
  - Elevation: 4

### Animations
- **Header**: FadeInUp, 400ms, delay 100ms
- **Stats Panel**: FadeInDown, 400ms, delay 200ms
- **Cards**: FadeInDown, 400ms, delay incrementing by 100ms (300, 400, 500...)

## 📚 Documentation

Full documentation added to:
- `app/docs/design-language-system.md` - Section "Minimalist Pro Components"

## 🔄 Next Steps

The Minimalist Pro design is now your foundation. You can apply it to:
- Settings screen
- Profile screen
- Leaderboard screen
- Game history screen
- Learning modules

All future screens should follow these patterns for consistency.

## ✅ Verification Checklist

After installation, verify:
- [ ] `expo-blur` installed successfully
- [ ] App builds without errors
- [ ] Glassmorphic panels render correctly
- [ ] Segmented control animates smoothly
- [ ] Stats cards display properly
- [ ] All animations are smooth
- [ ] Theme switching works (light/dark)
- [ ] Layout is centered on wide screens (max 600px)

## 🐛 Troubleshooting

### Issue: BlurView not working on web
**Solution**: This is expected. The glassmorphic effect uses a fallback on web (semi-transparent background without blur).

### Issue: Animations feel slow
**Solution**: Check device performance. Animations are optimized at 400ms. You can adjust in component styles if needed.

### Issue: Layout looks off on small screens
**Solution**: The 600px max-width is for tablets/desktop. Mobile screens use full width with 24px padding.

---

**Design System**: Minimalist Pro
**Updated**: December 2, 2025
**Status**: ✅ Ready for Production
