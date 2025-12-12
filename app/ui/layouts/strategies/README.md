# Layout Strategy Pattern

This directory contains the Layout Strategy Pattern implementation following SOLID principles.

## Overview

The Layout Strategy Pattern enables extensible layout behavior without modifying existing code (Open/Closed Principle). Each layout type (mobile, tablet, desktop) has its own strategy class that encapsulates layout-specific calculations.

## Architecture

```
LayoutStrategy (interface)
  ├── BaseLayoutStrategy (abstract base)
  │   ├── MobileLayoutStrategy
  │   ├── TabletLayoutStrategy
  │   └── DesktopLayoutStrategy
  └── LayoutStrategyFactory (factory)
```

## Usage

```typescript
import { LayoutStrategyFactory } from '@/ui/layouts/strategies/LayoutStrategyFactory';

const strategy = LayoutStrategyFactory.getStrategy('desktop');
const { boardSize, squareSize } = strategy.calculateBoardSize(width, height);
const boardFlex = strategy.getBoardColumnFlex();
```

## Benefits

1. **SOLID Compliance**: Open/Closed Principle - extend without modifying
2. **Testability**: Each strategy can be tested independently
3. **Maintainability**: Layout logic isolated per strategy
4. **Performance**: Strategies are cached (immutable)
5. **Extensibility**: Easy to add new layout types

## Testing

See `__tests__/LayoutStrategy.test.ts` for comprehensive unit tests.
