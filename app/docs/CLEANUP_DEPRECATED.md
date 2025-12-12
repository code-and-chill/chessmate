# Deprecated Code Cleanup Guide

This document tracks deprecated code that can be safely removed after migration.

## Status: Ready for Cleanup

### 1. `app/core/constants/layout.ts` - Deprecated Functions

**Status**: ⚠️ **Partially deprecated** - Some functions still used internally

**Deprecated exports**:
- `LayoutBreakpoints` - Use `breakpointValues` from `@/ui/tokens/breakpoints`
- `getLayoutType()` - Use `getLayoutType()` from `@/ui/tokens/breakpoints`
- `shouldShowSidebar()` - Use `shouldShowSidebar()` from `@/ui/tokens/breakpoints`
- `shouldShowMoveListSideBySide()` - Use `shouldShowMoveListSideBySide()` from `@/ui/tokens/breakpoints`

**Still in use**:
- `getBoardSize()` - Used by legacy code (can be migrated to strategy pattern)
- `getSquareSize()` - Used by legacy code (can be migrated to strategy pattern)
- `Spacing` - Duplicate of `spacingTokens` (can be removed)
- `ZIndex` - Duplicate of `elevationTokens` (can be removed)

**Migration path**:
1. ✅ All new code uses `@/ui/tokens/breakpoints`
2. ⏳ Migrate `getBoardSize()` and `getSquareSize()` to use `LayoutStrategyFactory`
3. ⏳ Remove `Spacing` and `ZIndex` (use tokens instead)
4. ⏳ Remove deprecated wrapper functions

### 2. `app/ui/layouts/ResponsiveGameLayout.tsx` - Deprecated Exports

**Status**: ✅ **Safe to keep** - Backward compatibility wrapper

**Deprecated exports**:
- `getLayoutType(width)` - Wrapper for `@/ui/tokens/breakpoints`
- `calculateBoardSize()` - Wrapper for `LayoutStrategyFactory`

**Action**: Keep as backward compatibility wrappers. They delegate to new implementations.

### 3. `app/ui/hooks/useBoardSizing.ts`

**Status**: ✅ **Migrated** - Now uses `LayoutStrategyFactory` internally

**Action**: No cleanup needed - already using strategy pattern.

## Cleanup Checklist

### Phase 1: Remove Duplicate Constants (Safe) ✅ COMPLETED

- [x] Remove `Spacing` from `app/core/constants/layout.ts`
  - ✅ Removed - Use `spacingTokens` or `spacingScale` from `@/ui/tokens/spacing`
  
- [x] Remove `ZIndex` from `app/core/constants/layout.ts`
  - ✅ Removed - Use `elevationTokens` from `@/ui/tokens/elevation`

### Phase 2: Migrate Legacy Functions ✅ COMPLETED

- [x] Migrate `getBoardSize()` to use `LayoutStrategyFactory`
  - ✅ Removed - Not used in codebase, only in documentation
  - ✅ Documentation updated to use strategy pattern
  
- [x] Migrate `getSquareSize()` to use `LayoutStrategyFactory`
  - ✅ Removed - Not used in codebase, only in documentation
  - ✅ Documentation updated to use strategy pattern

### Phase 3: Remove Deprecated Wrappers ✅ COMPLETED

- [x] Remove deprecated wrapper functions from `app/core/constants/layout.ts`
  - ✅ `getLayoutType()` - Removed
  - ✅ `shouldShowSidebar()` - Removed
  - ✅ `shouldShowMoveListSideBySide()` - Removed
  - ✅ `LayoutBreakpoints` - Removed

## Status: ✅ All Cleanup Complete

All deprecated code has been removed. The file `app/core/constants/layout.ts` is now empty and marked as deprecated. It can be completely removed in a future major version.

## Testing

Before removing deprecated code:

1. ✅ Run unit tests: `npm test`
2. ✅ Run type check: `npm run typecheck`
3. ✅ Test on all platforms (iOS, Android, Web)
4. ✅ Verify no runtime errors

## Notes

- Deprecated code is marked with `@deprecated` JSDoc tags
- Wrapper functions delegate to new implementations (safe)
- Strategy pattern is now the canonical implementation
- All new code should use `LayoutStrategyFactory` or hooks
