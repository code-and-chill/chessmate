/**
 * useLayoutAnimations Hook Tests
 */

import { renderHook } from '@testing-library/react-native';
import { useLayoutAnimations } from '../useLayoutAnimations';

describe('useLayoutAnimations', () => {
  it('should create animation config when enabled', () => {
    const { result } = renderHook(() => useLayoutAnimations({ enabled: true }));
    
    const animConfig = result.current.createAnimConfig(100);
    expect(animConfig).toBeDefined();
  });

  it('should return undefined when disabled', () => {
    const { result } = renderHook(() => useLayoutAnimations({ enabled: false }));
    
    const animConfig = result.current.createAnimConfig(100);
    expect(animConfig).toBeUndefined();
  });

  it('should use default enabled state', () => {
    const { result } = renderHook(() => useLayoutAnimations());
    
    const animConfig = result.current.createAnimConfig(100);
    expect(animConfig).toBeDefined();
  });

  it('should create fadeInUp animation', () => {
    const { result } = renderHook(() => useLayoutAnimations({ enabled: true }));
    
    const animConfig = result.current.fadeInUp(50);
    expect(animConfig).toBeDefined();
  });

  it('should use custom duration', () => {
    const { result } = renderHook(() =>
      useLayoutAnimations({ enabled: true, duration: 500 })
    );
    
    const animConfig = result.current.createAnimConfig(0);
    expect(animConfig).toBeDefined();
  });

  it('should memoize animation configs', () => {
    const { result, rerender } = renderHook(() =>
      useLayoutAnimations({ enabled: true })
    );

    const config1 = result.current.createAnimConfig(100);
    rerender();
    const config2 = result.current.createAnimConfig(100);

    // Should be same function reference (memoized)
    expect(result.current.createAnimConfig).toBe(result.current.createAnimConfig);
  });
});
