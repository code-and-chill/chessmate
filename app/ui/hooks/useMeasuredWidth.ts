import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export function useMeasuredWidth() {
  const [width, setWidth] = useState<number | null>(null);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
  }, []);
  return { width, onLayout } as const;
}

