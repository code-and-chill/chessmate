/**
 * Tablet Layout Strategy
 * 
 * Strategy for tablet layout (768px - 1023px).
 * Horizontal layout with board (65%) and move list (35%).
 * 
 * @packageDocumentation
 */

import { BaseLayoutStrategy } from './LayoutStrategy';
import type { BoardSizeConfig } from '../ResponsiveGameLayout';

/**
 * Tablet layout strategy implementation
 */
export class TabletLayoutStrategy extends BaseLayoutStrategy {
  readonly layoutType = 'tablet' as const;
  
  private readonly BOARD_COLUMN_WIDTH_RATIO = 0.65; // 65% of width
  
  calculateBoardSize(contentWidth: number, contentHeight: number): BoardSizeConfig {
    const { width: availableWidth, height: availableHeight } = this.getAvailableSpace(
      contentWidth,
      contentHeight
    );
    
    // Board column takes 65% of width
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
    return 0.65; // 65% of horizontal space
  }
  
  getMovesColumnFlex(): number {
    return 0.35; // 35% of horizontal space
  }
  
  isHorizontalLayout(): boolean {
    return true; // Horizontal side-by-side layout
  }
}
