import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { getLayoutType, calculateBoardSize } from '@/ui/layouts/ResponsiveGameLayout';
import { useContentSize } from '@/contexts/ContentSizeContext';

export interface BoardLayout {
  layoutType: string;
  isHorizontalLayout: boolean;
  isDesktopLayout: boolean;
  boardSize: number;
  squareSize: number;
  boardColumnFlex: number;
  movesColumnFlex: number;
  effectiveWidth: number;
  effectiveHeight: number;
  onLayout: (event: any) => void;
}

export function computeBoardLayout(effectiveWidth: number, effectiveHeight: number) {
  const layoutType = getLayoutType(effectiveWidth);
  const isHorizontalLayout = layoutType !== 'mobile';
  const isDesktopLayout = layoutType === 'desktop';
  const { boardSize, squareSize } = calculateBoardSize(layoutType, effectiveWidth, effectiveHeight);
  const boardColumnFlex = isHorizontalLayout ? (isDesktopLayout ? 0.7 : 0.65) : 1;
  const movesColumnFlex = isHorizontalLayout ? (isDesktopLayout ? 0.3 : 0.35) : 0;

  return {
    layoutType,
    isHorizontalLayout,
    isDesktopLayout,
    boardSize,
    squareSize,
    boardColumnFlex,
    movesColumnFlex,
  };
}

export function useBoardLayout(): BoardLayout {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const globalContent = useContentSize();

  const [contentDimensions, setContentDimensions] = useState<{ width: number; height: number } | null>(globalContent ?? null);

  useEffect(() => {
    if (globalContent) setContentDimensions(globalContent);
  }, [globalContent]);

  const layoutDebounceRef = useRef<number | null>(null);
  const pendingDimsRef = useRef<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((event: any) => {
    const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
    setContentDimensions((prev) => {
      if (prev && Math.abs(measuredWidth - prev.width) <= 1 && Math.abs(measuredHeight - prev.height) <= 1) {
        return prev;
      }
      pendingDimsRef.current = { width: measuredWidth, height: measuredHeight };
      if (layoutDebounceRef.current) {
        clearTimeout(layoutDebounceRef.current);
      }
      layoutDebounceRef.current = (setTimeout(() => {
        if (pendingDimsRef.current) {
          setContentDimensions(pendingDimsRef.current);
          pendingDimsRef.current = null;
        }
        layoutDebounceRef.current = null;
      }, 80) as any) as number;
      return prev;
    });
  }, []);

  const effectiveWidth = contentDimensions?.width ?? windowWidth;
  const effectiveHeight = contentDimensions?.height ?? windowHeight;

  const layout = useMemo(() => computeBoardLayout(effectiveWidth, effectiveHeight), [effectiveWidth, effectiveHeight]);

  return {
    layoutType: layout.layoutType,
    isHorizontalLayout: layout.isHorizontalLayout,
    isDesktopLayout: layout.isDesktopLayout,
    boardSize: layout.boardSize,
    squareSize: layout.squareSize,
    boardColumnFlex: layout.boardColumnFlex,
    movesColumnFlex: layout.movesColumnFlex,
    effectiveWidth,
    effectiveHeight,
    onLayout,
  };
}
