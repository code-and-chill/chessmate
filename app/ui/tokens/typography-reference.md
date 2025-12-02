/**
 * Typography Quick Reference
 * app/ui/tokens/typography-reference.md
 * 
 * Quick lookup for developers using the new font stack
 */

# Typography Quick Reference

## Font Stack at a Glance

```
Display/Titles → Outfit (geometric, modern)
Body/UI → Inter (exceptional readability)
Code/Notation → JetBrains Mono (clear monospace)
```

---

## Usage Patterns

### Headlines & Hero Text
```tsx
<Text variant="display">ChessMate</Text>
// Outfit 700 Bold • 32px
```

### Page Titles
```tsx
<Text variant="displayLarge">New Tournament</Text>
// Outfit 700 Bold • 28px
```

### Section Headers
```tsx
<Text variant="title">Recent Games</Text>
// Outfit 600 SemiBold • 24px
```

### Card Titles
```tsx
<Text variant="titleMedium">Magnus vs. Hikaru</Text>
// Outfit 600 SemiBold • 20px
```

### Sub-Headers
```tsx
<Text variant="titleSmall">Tournament Round 3</Text>
// Outfit 500 Medium • 18px
```

### Body Text
```tsx
<Text variant="body">Choose your game mode to begin playing.</Text>
// Inter 400 Regular • 16px
```

### Secondary Content
```tsx
<Text variant="bodyMedium">Last updated 5 minutes ago</Text>
// Inter 400 Regular • 14px
```

### Metadata
```tsx
<Text variant="caption">Rating: 1450</Text>
// Inter 400 Regular • 13px
```

### Form Labels
```tsx
<Text variant="label">Username</Text>
// Inter 600 SemiBold • 14px
```

### Button Text
```tsx
<Text variant="button">Start Game</Text>
// Outfit 600 SemiBold • 16px
```

### Chess Notation
```tsx
<Text mono>1. e4 e5 2. Nf3 Nc6</Text>
// JetBrains Mono 400 Regular
```

---

## Visual Hierarchy

```
Display (32px)
  ↓
Display Large (28px)
  ↓
Title (24px)
  ↓
Title Medium (20px)
  ↓
Title Small (18px)
  ↓
Body (16px) ← Default
  ↓
Body Medium (14px)
  ↓
Caption (13px)
  ↓
Caption Small (12px)
```

---

## Font Family Override

```tsx
// Use specific font family manually
import { FontFamily } from '@/config/fonts';

<Text style={{ fontFamily: FontFamily.display.bold }}>
  Custom Display
</Text>

<Text style={{ fontFamily: FontFamily.body.semiBold }}>
  Custom Body
</Text>

<Text style={{ fontFamily: FontFamily.mono.regular }}>
  Custom Mono
</Text>
```

---

## Weight Reference

### Outfit Weights
- 400 Regular (light usage)
- 500 Medium (sub-headers)
- 600 SemiBold (titles)
- 700 Bold (display)

### Inter Weights
- 400 Regular (body, captions)
- 500 Medium (emphasis)
- 600 SemiBold (labels)
- 700 Bold (strong emphasis)

### JetBrains Mono Weights
- 400 Regular (notation, code)
- 500 Medium (emphasis)
- 700 Bold (headers in code)

---

## Common Combinations

### Game Card
```tsx
<Text variant="titleMedium">Game #1234</Text>
<Text variant="body">Classical • 90+30</Text>
<Text variant="caption">Started 2h ago</Text>
```

### User Profile
```tsx
<Text variant="title">Magnus Carlsen</Text>
<Text mono style={{ fontSize: 14 }}>Rating: 2830</Text>
<Text variant="bodyMedium">World Champion 2013-2023</Text>
```

### Button Stack
```tsx
<Button>
  <Text variant="button">Play Online</Text>
</Button>
```

### Form Field
```tsx
<Text variant="label">Email Address</Text>
<TextInput />
<Text variant="hint">We'll never share your email</Text>
```

---

## Do's and Don'ts

### ✅ DO
- Use `variant` prop for consistent styling
- Use `display`/`title` variants for headers
- Use `mono` prop for chess notation
- Use `body` for paragraph text
- Use `caption` for metadata

### ❌ DON'T
- Don't use `fontSize` directly (use `variant`)
- Don't mix fonts arbitrarily
- Don't use more than 3 text sizes per screen
- Don't use Outfit for long paragraphs (use Inter)
- Don't use Inter for hero text (use Outfit)

---

## Accessibility Notes

- All fonts meet WCAG AA contrast requirements
- Outfit maintains legibility at large sizes
- Inter optimized for screens at all sizes
- JetBrains Mono has clear character distinction
- Minimum touch target: 44x44px for interactive text

---

## Performance Tips

1. **Preload Critical Fonts**: Display and body fonts load first
2. **Lazy Load Optional**: Monospace font can load after critical content
3. **Use Font Variants Wisely**: Only load weights you actually use
4. **Cache Fonts**: Expo caches fonts after first load

---

## Testing Checklist

- [ ] Display text renders with Outfit
- [ ] Body text renders with Inter
- [ ] Chess notation renders with JetBrains Mono
- [ ] All weights load correctly
- [ ] Text is readable on both light/dark themes
- [ ] No font flash (FOIT/FOUT)
- [ ] Fonts work on iOS
- [ ] Fonts work on Android
- [ ] Fonts work on Web

---

**Last Updated**: December 2, 2025  
**Font Stack Version**: 1.0.0
