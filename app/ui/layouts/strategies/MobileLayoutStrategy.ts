/**
 * Mobile Layout Strategy
 * 
 * Strategy for mobile layout (< 768px).
 * Vertical stacked layout with full-width board.
 * 
 * @packageDocumentation
 */

import { BaseLayoutStrategy } from './LayoutStrategy';
import type { BoardSizeConfig } from '../ResponsiveGameLayout';

/**
 * Mobile layout strategy implementation
 */
export class MobileLayoutStrategy extends BaseLayoutStrategy {
  readonly layoutType = 'mobile' as const;
  
  calculateBoardSize(contentWidth: number, contentHeight: number): BoardSizeConfig {
    const { width: availableWidth, height: availableHeight } = this.getAvailableSpace(
      contentWidth,
      contentHeight
    );
    
    // On mobile, board fills width but respects height
    const boardSize = this.clampBoardSize(
      Math.min(availableWidth, availableHeight, contentWidth * 0.95)
    );
    
    return {
      boardSize,
      squareSize: boardSize / 8,
    };
  }
  
  getBoardColumnFlex(): number {
    return 1; // Full width on mobile
  }
  
  getMovesColumnFlex(): number {
    return 0; // No side-by-side on mobile
  }
  
  isHorizontalLayout(): boolean {
    return false; // Vertical stacked layout
  }
}
