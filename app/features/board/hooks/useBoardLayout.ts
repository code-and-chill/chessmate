import { useState, useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { getLayoutType, calculateBoardSize } from '@/ui/layouts/ResponsiveGameLayout';

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
  const [contentDimensions, setContentDimensions] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((event: any) => {
    const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
    setContentDimensions((prev) => {
      if (!prev || Math.abs(measuredWidth - prev.width) > 1 || Math.abs(measuredHeight - prev.height) > 1) {
        return { width: measuredWidth, height: measuredHeight };
      }
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
