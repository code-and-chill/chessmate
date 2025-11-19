import { Dimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;
const MAX_BOARD_SIZE_MOBILE = 420;
const BOARD_SIZE_TABLET = 480;
const BOARD_PADDING = 48;

export interface ResponsiveLayout {
  isWideLayout: boolean;
  boardSize: number;
  squareSize: number;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = Dimensions.get('window');
  const isWideLayout = width >= TABLET_BREAKPOINT;
  
  const boardSize = isWideLayout 
    ? BOARD_SIZE_TABLET 
    : Math.min(width - BOARD_PADDING, MAX_BOARD_SIZE_MOBILE);
  
  const squareSize = boardSize / 8;

  return {
    isWideLayout,
    boardSize,
    squareSize,
  };
}
