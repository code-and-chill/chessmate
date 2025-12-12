/**
 * Desktop Layout Strategy
 * 
 * Strategy for desktop layout (≥ 1024px).
 * Horizontal layout with board (70%) and move list (30%).
 * 
 * @packageDocumentation
 */

import { BaseLayoutStrategy } from './LayoutStrategy';
import type { BoardSizeConfig } from '../ResponsiveGameLayout';

/**
 * Desktop layout strategy implementation
 */
export class DesktopLayoutStrategy extends BaseLayoutStrategy {
  readonly layoutType = 'desktop' as const;
  
  private readonly BOARD_COLUMN_WIDTH_RATIO = 0.70; // 70% of width
  
  calculateBoardSize(contentWidth: number, contentHeight: number): BoardSizeConfig {
    const { width: availableWidth, height: availableHeight } = this.getAvailableSpace(
      contentWidth,
      contentHeight
    );

    // Board column takes 70% of width (more generous than tablet)
    // Board size is primarily height-driven to fill the screen
    const boardColumnWidth = availableWidth * this.BOARD_COLUMN_WIDTH_RATIO;
    const boardSize = this.clampBoardSize(
      Math.min(boardColumnWidth, availableHeight)
    );

    return {
      boardSize,
      squareSize: boardSize / 8,
    };
  }
  
  getBoardColumnFlex(): number {
    return 0.70; // 70% of horizontal space
  }
  
  getMovesColumnFlex(): number {
    return 0.30; // 30% of horizontal space
  }
  
  isHorizontalLayout(): boolean {
    return true; // Horizontal side-by-side layout
  }
}
