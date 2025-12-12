/**
 * useLayoutMeasurement Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useLayoutMeasurement } from '../useLayoutMeasurement';

// Mock useWindowDimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useWindowDimensions: () => ({ width: 1024, height: 768 }),
  };
});

describe('useLayoutMeasurement', () => {
  it('should return window dimensions initially', () => {
    const { result } = renderHook(() => useLayoutMeasurement());
    
    expect(result.current.effectiveWidth).toBe(1024);
    expect(result.current.effectiveHeight).toBe(768);
    expect(result.current.contentDimensions).toBeNull();
  });

  it('should update dimensions when handleLayout is called', () => {
    const { result } = renderHook(() => useLayoutMeasurement());
    
    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 800, height: 600 },
        },
      } as any);
    });

    expect(result.current.effectiveWidth).toBe(800);
    expect(result.current.effectiveHeight).toBe(600);
    expect(result.current.contentDimensions).toEqual({ width: 800, height: 600 });
  });

  it('should not update for insignificant changes', () => {
    const { result } = renderHook(() => useLayoutMeasurement());
    
    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 800, height: 600 },
        },
      } as any);
    });

    const firstDimensions = result.current.contentDimensions;

    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 800.5, height: 600.5 }, // Less than 1px change
        },
      } as any);
    });

    expect(result.current.contentDimensions).toBe(firstDimensions); // Same reference
  });

  it('should update for significant changes', () => {
    const { result } = renderHook(() => useLayoutMeasurement());
    
    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 800, height: 600 },
        },
      } as any);
    });

    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 900, height: 700 }, // More than 1px change
        },
      } as any);
    });

    expect(result.current.effectiveWidth).toBe(900);
    expect(result.current.effectiveHeight).toBe(700);
  });

  it('should accept initial dimensions', () => {
    const { result } = renderHook(() =>
      useLayoutMeasurement({
        initialDimensions: { width: 500, height: 400 },
      })
    );

    expect(result.current.effectiveWidth).toBe(500);
    expect(result.current.effectiveHeight).toBe(400);
    expect(result.current.contentDimensions).toEqual({ width: 500, height: 400 });
  });

  it('should respect custom change threshold', () => {
    const { result } = renderHook(() =>
      useLayoutMeasurement({ changeThreshold: 5 })
    );

    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 800, height: 600 },
        },
      } as any);
    });

    act(() => {
      result.current.handleLayout({
        nativeEvent: {
          layout: { width: 803, height: 602 }, // Less than 5px change
        },
      } as any);
    });

    expect(result.current.effectiveWidth).toBe(800); // Should not update
  });
});
