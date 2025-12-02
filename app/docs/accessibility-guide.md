/**
 * Accessibility Guide
 * app/docs/accessibility-guide.md
 * 
 * Standards and patterns for accessible UI components
 */

---
title: Accessibility Guide
service: app
status: active
last_reviewed: 2025-12-02
type: standard
---

# ChessMate Accessibility Guide

## Overview

This guide defines accessibility standards for the ChessMate Design Language System (DLS). All components **MUST** follow WCAG 2.1 Level AA standards.

---

## Core Principles

### 1. **Perceivable**
- All UI elements must be perceivable by all senses
- Provide text alternatives for non-text content
- Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)

### 2. **Operable**
- All functionality available via keyboard
- Users can navigate using screen readers
- Interactive elements have clear focus states

### 3. **Understandable**
- Clear, consistent navigation
- Predictable behavior
- Error messages with guidance

### 4. **Robust**
- Compatible with assistive technologies
- Valid semantic HTML/React Native elements

---

## Component Standards

### Button

**Required Attributes**:
```tsx
<Button
  accessibilityRole="button"
  accessibilityLabel="Create new game"
  accessibilityHint="Opens game creation screen"
  accessibilityState={{
    disabled: false,
    busy: isLoading,
  }}
>
  New Game
</Button>
```

**States to Communicate**:
- `disabled`: Button cannot be pressed
- `busy`: Action in progress (loading)
- `selected`: Button is selected (toggle buttons)

---

### Text Input

**Required Attributes**:
```tsx
<Input
  accessibilityLabel="Username"
  accessibilityHint="Enter your chess username"
  accessibilityRole="text"
  accessibilityRequired={true}
  accessibilityInvalid={hasError}
  accessibilityErrorMessage={error}
/>
```

**Labels**:
- Always provide `accessibilityLabel` for inputs
- Use `accessibilityHint` for additional context
- Mark required fields with `accessibilityRequired`

---

### Modal/Dialog

**Required Attributes**:
```tsx
<Modal
  accessibilityRole="dialog"
  accessibilityLabel="Game result"
  accessibilityModal={true} // Traps focus
  accessibilityViewIsModal={true}
>
  <Content />
</Modal>
```

**Focus Management**:
- Focus first interactive element on open
- Trap focus within modal
- Return focus to trigger element on close

---

### List

**Required Attributes**:
```tsx
<List
  accessibilityRole="list"
  accessibilityLabel="Active games"
>
  <ListItem
    accessibilityRole="listitem"
    accessibilityLabel="Game vs. Opponent123"
    accessibilityState={{ selected: isSelected }}
  >
    <GameCard />
  </ListItem>
</List>
```

---

### Chess-Specific Components

#### GameCard

```tsx
<GameCard
  accessibilityRole="button"
  accessibilityLabel="Game against Opponent123, white's turn, 10 minutes remaining"
  accessibilityHint="Tap to view game"
  accessibilityState={{
    selected: isCurrentGame,
  }}
/>
```

#### MoveList

```tsx
<MoveList
  accessibilityRole="list"
  accessibilityLabel="Chess game moves"
>
  {/* Each move */}
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Move Nf3"
    accessibilityState={{ selected: isCurrent }}
  />
</MoveList>
```

#### GameClock

```tsx
<GameClock
  accessibilityRole="timer"
  accessibilityLabel="White player clock: 9 minutes 45 seconds"
  accessibilityState={{
    disabled: !isActive,
  }}
  accessibilityLiveRegion="polite" // Announce time updates
/>
```

#### ChessBoard

```tsx
<ChessBoard
  accessibilityRole="grid"
  accessibilityLabel="Chess board, white on bottom"
>
  {/* Each square */}
  <Square
    accessibilityRole="gridcell"
    accessibilityLabel="e4, white pawn"
    accessibilityState={{
      selected: isSelected,
      disabled: !isMovable,
    }}
  />
</ChessBoard>
```

---

## Color Contrast

### Text Contrast Requirements

| Text Size | Contrast Ratio | Example |
|-----------|---------------|---------|
| Body text (14-16px) | 4.5:1 minimum | `#1A1A1A` on `#FFFFFF` ✅ |
| Large text (20px+) | 3:1 minimum | `#4A4A4A` on `#FFFFFF` ✅ |
| UI components | 3:1 minimum | Button borders, icons |

### Contrast Validation

Use the `colorTokens` to ensure proper contrast:

```tsx
// ✅ GOOD: High contrast
<Text style={{ color: getColor(colorTokens.neutral[900], isDark) }}>
  Body text
</Text>

// ❌ BAD: Insufficient contrast
<Text style={{ color: getColor(colorTokens.neutral[400], isDark) }}>
  Body text
</Text>
```

### Color-Blind Safe Palettes

**DLS Color System**:
- ✅ Use semantic colors (success, error, warning, info)
- ✅ Combine color with icons/text
- ❌ Don't rely solely on color to convey meaning

**Example**:
```tsx
// ✅ GOOD: Color + icon + text
<Badge variant="success" icon={<CheckIcon />}>
  Game won
</Badge>

// ❌ BAD: Color only
<Badge variant="success">
  {/* No text, just color */}
</Badge>
```

---

## Focus Management

### Focus Order

All interactive elements must have logical focus order:

```tsx
<View>
  <Button tabIndex={1}>Primary Action</Button>
  <Button tabIndex={2}>Secondary Action</Button>
  <Button tabIndex={3}>Cancel</Button>
</View>
```

### Focus Indicators

All focusable elements must have visible focus states:

```tsx
const buttonStyle = {
  // Default state
  borderWidth: 2,
  borderColor: 'transparent',
  
  // Focus state
  ...(isFocused && {
    borderColor: getColor(colorTokens.blue[600], isDark),
    outline: `2px solid ${getColor(colorTokens.blue[600], isDark)}`,
  }),
};
```

### Skip Navigation

Provide skip links for screen reader users:

```tsx
<View>
  <Button
    accessibilityRole="link"
    accessibilityLabel="Skip to main content"
    onPress={() => mainContentRef.current?.focus()}
    style={styles.skipLink}
  >
    Skip to main content
  </Button>
  
  <MainContent ref={mainContentRef} />
</View>
```

---

## Screen Reader Support

### Announcement Priority

Use `accessibilityLiveRegion` for dynamic content:

```tsx
// Polite: Wait for user to finish current action
<Text accessibilityLiveRegion="polite">
  {moveCount} moves made
</Text>

// Assertive: Interrupt immediately
<Text accessibilityLiveRegion="assertive">
  Your turn! Time running out.
</Text>

// None: Don't announce changes
<Text accessibilityLiveRegion="none">
  {decorativeContent}
</Text>
```

### Landmark Roles

Define page regions for easy navigation:

```tsx
<View accessibilityRole="navigation">
  <NavigationSidebar />
</View>

<View accessibilityRole="main">
  <MainContent />
</View>

<View accessibilityRole="complementary">
  <MoveList />
</View>
```

---

## Keyboard Navigation

### Required Keyboard Support

| Component | Keys | Action |
|-----------|------|--------|
| Button | Enter, Space | Activate |
| Checkbox | Space | Toggle |
| Radio | Arrow keys | Navigate options |
| Select | Arrow keys, Enter | Navigate, select |
| Modal | Escape | Close |
| Tab | Tab, Shift+Tab | Navigate |

### Example: Keyboard-Accessible List

```tsx
const handleKeyPress = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      focusNextItem();
      break;
    case 'ArrowUp':
      focusPreviousItem();
      break;
    case 'Enter':
    case ' ':
      selectCurrentItem();
      break;
    case 'Escape':
      clearSelection();
      break;
  }
};

<List onKeyDown={handleKeyPress}>
  {items.map((item) => (
    <ListItem key={item.id} tabIndex={0}>
      {item.label}
    </ListItem>
  ))}
</List>
```

---

## Testing Checklist

### Automated Testing

- [ ] Run `eslint-plugin-react-native-a11y` for React Native
- [ ] Verify color contrast with tools (Stark, Contrast Checker)
- [ ] Check focus order with tab navigation

### Manual Testing

- [ ] Navigate entire app with keyboard only
- [ ] Test with VoiceOver (iOS) or TalkBack (Android)
- [ ] Verify all interactive elements have labels
- [ ] Test with screen magnification (200%, 400%)
- [ ] Verify with color blindness simulators

### Screen Reader Testing

**VoiceOver (iOS)**:
1. Enable: Settings → Accessibility → VoiceOver
2. Navigate: Swipe left/right
3. Activate: Double-tap
4. Rotor: Two-finger rotate

**TalkBack (Android)**:
1. Enable: Settings → Accessibility → TalkBack
2. Navigate: Swipe left/right
3. Activate: Double-tap
4. Reading controls: Swipe up/down with two fingers

---

## Common Mistakes

### ❌ Missing Labels

```tsx
// BAD
<Button onPress={handlePress}>
  <Icon name="settings" />
</Button>

// GOOD
<Button
  onPress={handlePress}
  accessibilityLabel="Open settings"
>
  <Icon name="settings" />
</Button>
```

### ❌ Insufficient Contrast

```tsx
// BAD
<Text style={{ color: '#888', backgroundColor: '#fff' }}>
  Low contrast text
</Text>

// GOOD
<Text style={{ color: getColor(colorTokens.neutral[900], isDark) }}>
  High contrast text
</Text>
```

### ❌ No Keyboard Access

```tsx
// BAD
<View onPress={handlePress}>
  <Text>Clickable</Text>
</View>

// GOOD
<Pressable
  onPress={handlePress}
  accessibilityRole="button"
>
  <Text>Clickable</Text>
</Pressable>
```

### ❌ Missing Focus Indicators

```tsx
// BAD
<Button style={{ outline: 'none' }}>
  No focus indicator
</Button>

// GOOD
<Button style={getFocusStyle(isFocused)}>
  Clear focus indicator
</Button>
```

---

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing
- [Stark](https://www.getstark.co/) - Color contrast checker
- [Accessibility Insights](https://accessibilityinsights.io/) - Microsoft's testing tool

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
- [React Native Accessibility](https://reactnative.dev/docs/accessibility) - Official docs
- [iOS VoiceOver](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios) - iOS screen reader guide
- [Android TalkBack](https://support.google.com/accessibility/android/answer/6283677) - Android screen reader guide

---

## Future Enhancements

### Planned Features
- [ ] High contrast mode
- [ ] Reduced motion mode (respects `prefers-reduced-motion`)
- [ ] Dyslexia-friendly font option
- [ ] Voice control support
- [ ] Haptic feedback for key interactions

### In Progress
- [x] Screen reader labels on all components
- [x] Keyboard navigation support
- [ ] Focus trap for modals (partial)
- [ ] Complete ARIA patterns

---

**Accessibility is not optional—it's a requirement for production.**

Every component must pass accessibility testing before deployment.
