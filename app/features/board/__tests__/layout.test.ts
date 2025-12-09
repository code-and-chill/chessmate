import { computeBoardLayout } from '../hooks/useBoardLayout';

describe('computeBoardLayout', () => {
  test('returns mobile layout for small width', () => {
    const { layoutType, isHorizontalLayout, isDesktopLayout } = computeBoardLayout(320, 800);
    expect(layoutType).toBe('mobile');
    expect(isHorizontalLayout).toBe(false);
    expect(isDesktopLayout).toBe(false);
  });

  test('returns tablet layout for medium width', () => {
    const { layoutType, isHorizontalLayout, isDesktopLayout } = computeBoardLayout(800, 1024);
    expect(layoutType).toBe('tablet');
    expect(isHorizontalLayout).toBe(true);
    expect(isDesktopLayout).toBe(false);
  });

  test('returns desktop layout for large width', () => {
    const { layoutType, isHorizontalLayout, isDesktopLayout } = computeBoardLayout(1400, 900);
    expect(layoutType).toBe('desktop');
    expect(isHorizontalLayout).toBe(true);
    expect(isDesktopLayout).toBe(true);
  });

  test('board size is within min/max bounds', () => {
    const { boardSize } = computeBoardLayout(2000, 2000);
    expect(boardSize).toBeGreaterThanOrEqual(280);
    expect(boardSize).toBeLessThanOrEqual(800);
  });
});

