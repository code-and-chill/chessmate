---
title: Primitive Component Improvements
status: active
last_reviewed: 2025-12-03
type: action-items
---

# PRIMITIVE COMPONENT IMPROVEMENTS

Action items for improving primitives based on DLS audit (Dec 3, 2025).

---

## Summary

Three primitives need theme-awareness improvements:
- **Input**: 70% compliant → Target: 90%
- **Tag**: 65% compliant → Target: 85%
- **Avatar**: 75% compliant → Target: 90%

All are functional but use hard-coded colors instead of theme tokens.

---

## 1. Input Component

**File**: `/app/ui/primitives/Input.tsx`  
**Current Score**: 70%  
**Target Score**: 90%

### Issues Found

1. **Hard-coded colors**:
   ```typescript
   backgroundColor="#FAFAFA"           // Should use: colors.background.secondary
   borderColor={error ? '#DC2626' : '#E8E8E8'}  // Should use: colors.error / colors.border
   placeholderTextColor="#A1A1A1"     // Should use: colors.foreground.muted
   ```

2. **Missing states**:
   - No focus state (should show blue border)
   - No disabled state styling (should show muted colors + opacity)

3. **No forward ref** (minor issue)

### Recommended Changes

```typescript
import { useColors } from '../hooks/useThemeTokens';

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, leftAccessory, rightAccessory, error, disabled, style, ...rest }, ref) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <Box gap={2}>
        {label && <Text variant="label" color={colors.foreground.secondary}>{label}</Text>}
        <Box
          flexDirection="row"
          alignItems="center"
          padding={3}
          radius="md"
          backgroundColor={colors.background.secondary}
          borderWidth={1}
          borderColor={
            error 
              ? colors.error 
              : isFocused 
                ? colors.accent.primary 
                : colors.border
          }
          gap={2}
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          {leftAccessory}
          <TextInput
            ref={ref}
            style={[{ flex: 1, fontSize: 16, color: colors.foreground.primary }, style]}
            placeholderTextColor={colors.foreground.muted}
            editable={!disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...rest}
          />
          {rightAccessory}
        </Box>
        {error && <Text variant="caption" color={colors.error}>{error}</Text>}
      </Box>
    );
  }
);
```

### Verification Checklist

After changes:
- [ ] All colors use `useColors()` hook
- [ ] Focus state shows blue border
- [ ] Disabled state has opacity 0.5
- [ ] Forward ref implemented
- [ ] Works in both light and dark mode
- [ ] No hard-coded colors

---

## 2. Tag Component

**File**: `/app/ui/primitives/Tag.tsx`  
**Current Score**: 65%  
**Target Score**: 85%

### Issues Found

1. **Hard-coded colors**:
   ```typescript
   color = '#3B82F6'                          // Should use: semantic colors
   backgroundColor = 'rgba(59, 130, 246, 0.1)' // Should use: theme-aware
   ```

2. **Missing semantic variants**:
   - No success, error, warning, info variants
   - Only filled/outline

3. **Missing size variants**:
   - No sm, md, lg sizes

4. **Missing dismissible option**

### Recommended Changes

```typescript
import { useColors } from '../hooks/useThemeTokens';

type TagVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
type TagSize = 'sm' | 'md' | 'lg';

type TagProps = {
  label: string;
  variant?: TagVariant;
  size?: TagSize;
  style?: 'filled' | 'outline';
  onDismiss?: () => void;
};

const sizeMap = {
  sm: { padding: 1, fontSize: 'xs' as const },
  md: { padding: 2, fontSize: 'sm' as const },
  lg: { padding: 3, fontSize: 'base' as const },
};

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style = 'filled',
  onDismiss,
}) => {
  const colors = useColors();
  const sizeConfig = sizeMap[size];

  const variantColors = {
    default: { color: colors.accent.primary, bg: colors.accent.primary + '20' },
    success: { color: colors.success, bg: colors.success + '20' },
    error: { color: colors.error, bg: colors.error + '20' },
    warning: { color: colors.warning, bg: colors.warning + '20' },
    info: { color: colors.info, bg: colors.info + '20' },
  };

  const { color, bg } = variantColors[variant];

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      padding={sizeConfig.padding}
      radius="sm"
      backgroundColor={style === 'filled' ? bg : 'transparent'}
      borderWidth={style === 'outline' ? 1 : 0}
      borderColor={style === 'outline' ? color : undefined}
      gap={1}
    >
      <Text variant="label" weight="semibold" color={color} size={sizeConfig.fontSize}>
        {label}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={4}>
          <Text color={color}>×</Text>
        </Pressable>
      )}
    </Box>
  );
};
```

### Verification Checklist

After changes:
- [ ] All colors use `useColors()` hook
- [ ] Semantic variants: success, error, warning, info
- [ ] Size variants: sm, md, lg
- [ ] Dismissible with close button
- [ ] Works in both light and dark mode
- [ ] No hard-coded colors

---

## 3. Avatar Component

**File**: `/app/ui/primitives/Avatar.tsx`  
**Current Score**: 75%  
**Target Score**: 90%

### Issues Found

1. **Hard-coded colors**:
   ```typescript
   backgroundColor = '#3B82F6'  // Should use: colors.accent.primary
   textColor = '#FFFFFF'        // Should use: colors.accentForeground.primary
   ```

2. **Size mismatch**:
   - Current: 32/44/56
   - Should align with spacingScale: 32/40/48

3. **Missing features** (nice-to-have):
   - Image support
   - Status indicator dot

### Recommended Changes

```typescript
import { useColors } from '../hooks/useThemeTokens';
import { spacingScale } from '../tokens/spacing';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  image?: string;
  status?: 'online' | 'offline' | 'away';
};

const sizeMap = {
  sm: { size: spacingScale.avatarSm, fontSize: 'xs' as const },   // 32
  md: { size: spacingScale.avatarMd, fontSize: 'sm' as const },   // 40
  lg: { size: spacingScale.avatarLg, fontSize: 'base' as const }, // 48
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  image,
  status,
}) => {
  const colors = useColors();
  const config = sizeMap[size];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const statusColors = {
    online: colors.success,
    offline: colors.foreground.muted,
    away: colors.warning,
  };

  return (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: colors.accent.primary,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text
            variant="label"
            weight="bold"
            color={colors.accentForeground.primary}
            size={config.fontSize}
          >
            {initials}
          </Text>
        )}
      </View>
      {status && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: config.size / 4,
            height: config.size / 4,
            borderRadius: config.size / 8,
            backgroundColor: statusColors[status],
            borderWidth: 2,
            borderColor: colors.background.primary,
          }}
        />
      )}
    </View>
  );
};
```

### Verification Checklist

After changes:
- [ ] All colors use `useColors()` hook
- [ ] Sizes align with spacingScale (32/40/48)
- [ ] Image support added
- [ ] Status indicator dot added
- [ ] Works in both light and dark mode
- [ ] No hard-coded colors

---

## 4. Implementation Priority

### High Priority (This Sprint)
1. **Input** - Used frequently in forms
2. **Tag** - Used for labels and status indicators

### Medium Priority (Next Sprint)
3. **Avatar** - Working well, enhancements are nice-to-have

---

## 5. Testing Checklist

For each component after improvements:

### Visual Testing
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test all variants
- [ ] Test all sizes
- [ ] Test edge cases (long text, no text, etc.)

### Functional Testing
- [ ] All props work as expected
- [ ] Theme switching works
- [ ] Interactive states work (hover, press, focus)
- [ ] Accessibility (screen reader labels)

### Code Quality
- [ ] No hard-coded colors
- [ ] Uses design tokens
- [ ] Theme-aware via hooks
- [ ] TypeScript types complete
- [ ] JSDoc comments added

---

## 6. Updated Component Scores (Post-Implementation)

| Component | Before | After (Target) |
|-----------|--------|----------------|
| Input | 70% | 90% |
| Tag | 65% | 85% |
| Avatar | 75% | 90% |

**Overall Primitive Compliance**: 85% → 95%

---

## 7. Timeline

- **Week 1**: Input improvements (focus + disabled states + theme)
- **Week 2**: Tag improvements (semantic variants + sizes)
- **Week 3**: Avatar improvements (theme + image support)
- **Week 4**: Testing and documentation updates

---

**Created**: December 3, 2025  
**Last Updated**: December 3, 2025  
**Status**: Ready for implementation
