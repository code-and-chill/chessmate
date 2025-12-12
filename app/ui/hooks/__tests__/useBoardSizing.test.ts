/**
 * useBoardSizing Hook Tests
 */

import { renderHook } from '@testing-library/react-native';
import { useBoardSizing } from '../useBoardSizing';

// Mock LayoutStrategyFactory
jest.mock('@/ui/layouts/strategies/LayoutStrategyFactory', () => ({
  LayoutStrategyFactory: {
    getStrategy: jest.fn((layoutType) => {
      const strategies = {
        mobile: {
          layoutType: 'mobile',
          calculateBoardSize: () => ({ boardSize: 300, squareSize: 37.5 }),
          getBoardColumnFlex: () => 1,
          getMovesColumnFlex: () => 0,
          isHorizontalLayout: () => false,
        },
        tablet: {
          layoutType: 'tablet',
          calculateBoardSize: () => ({ boardSize: 400, squareSize: 50 }),
          getBoardColumnFlex: () => 0.65,
          getMovesColumnFlex: () => 0.35,
          isHorizontalLayout: () => true,
        },
        desktop: {
          layoutType: 'desktop',
          calculateBoardSize: () => ({ boardSize: 500, squareSize: 62.5 }),
          getBoardColumnFlex: () => 0.70,
          getMovesColumnFlex: () => 0.30,
          isHorizontalLayout: () => true,
        },
      };
      return strategies[layoutType as keyof typeof strategies] || strategies.mobile;
    }),
  },
}));

// Mock getLayoutType
jest.mock('@/ui/tokens/breakpoints', () => ({
  getLayoutType: jest.fn((width) => {
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  }),
}));

describe('useBoardSizing', () => {
  it('should calculate board size for mobile', () => {
    const { result } = renderHook(() =>
      useBoardSizing({ width: 400, height: 600 })
    );

    expect(result.current.layoutType).toBe('mobile');
    expect(result.current.boardSize).toBe(300);
    expect(result.current.squareSize).toBe(37.5);
    expect(result.current.isHorizontalLayout).toBe(false);
    expect(result.current.boardColumnFlex).toBe(1);
    expect(result.current.movesColumnFlex).toBe(0);
  });

  it('should calculate board size for tablet', () => {
    const { result } = renderHook(() =>
      useBoardSizing({ width: 900, height: 600 })
    );

    expect(result.current.layoutType).toBe('tablet');
    expect(result.current.boardSize).toBe(400);
    expect(result.current.squareSize).toBe(50);
    expect(result.current.isHorizontalLayout).toBe(true);
    expect(result.current.boardColumnFlex).toBe(0.65);
    expect(result.current.movesColumnFlex).toBe(0.35);
  });

  it('should calculate board size for desktop', () => {
    const { result } = renderHook(() =>
      useBoardSizing({ width: 1200, height: 800 })
    );

    expect(result.current.layoutType).toBe('desktop');
    expect(result.current.boardSize).toBe(500);
    expect(result.current.squareSize).toBe(62.5);
    expect(result.current.isHorizontalLayout).toBe(true);
    expect(result.current.isDesktopLayout).toBe(true);
    expect(result.current.boardColumnFlex).toBe(0.70);
    expect(result.current.movesColumnFlex).toBe(0.30);
  });

  it('should accept provided layout type', () => {
    const { result } = renderHook(() =>
      useBoardSizing({ width: 400, height: 600, layoutType: 'desktop' })
    );

    expect(result.current.layoutType).toBe('desktop');
  });

  it('should memoize calculations', () => {
    const { result, rerender } = renderHook(
      ({ width, height }) => useBoardSizing({ width, height }),
      { initialProps: { width: 800, height: 600 } }
    );

    const firstBoardSize = result.current.boardSize;

    // Rerender with same dimensions
    rerender({ width: 800, height: 600 });

    expect(result.current.boardSize).toBe(firstBoardSize);
  });
});
