/**
 * Layout Strategy Pattern
 * 
 * Strategy interface for layout calculations following SOLID Open/Closed Principle.
 * Enables extensible layout behavior without modifying existing code.
 * 
 * @packageDocumentation
 */

import type { LayoutType } from '@/ui/tokens/breakpoints';
import type { BoardSizeConfig } from '../ResponsiveGameLayout';

/**
 * Layout strategy interface
 * 
 * Each strategy implements layout-specific calculations for board sizing,
 * column flex values, and layout behavior.
 */
export interface ILayoutStrategy {
  /** Layout type this strategy handles */
  readonly layoutType: LayoutType;
  
  /**
   * Calculate board size for this layout type
   * 
   * @param contentWidth - Available content width
   * @param contentHeight - Available content height
   * @returns Board size configuration
   */
  calculateBoardSize(contentWidth: number, contentHeight: number): BoardSizeConfig;
  
  /**
   * Get flex value for board column
   * 
   * @returns Flex value (0-1)
   */
  getBoardColumnFlex(): number;
  
  /**
   * Get flex value for moves column
   * 
   * @returns Flex value (0-1)
   */
  getMovesColumnFlex(): number;
  
  /**
   * Whether layout is horizontal (side-by-side)
   * 
   * @returns True if horizontal layout
   */
  isHorizontalLayout(): boolean;
}

/**
 * Base layout strategy with common functionality
 */
export abstract class BaseLayoutStrategy implements ILayoutStrategy {
  abstract readonly layoutType: LayoutType;
  
  protected readonly MIN_BOARD_SIZE = 280;
  protected readonly MAX_BOARD_SIZE = 800;
  protected readonly MINIMAL_VERTICAL_MARGIN = 8; // 8px top/bottom
  protected readonly MINIMAL_HORIZONTAL_MARGIN = 8; // 8px left/right
  protected readonly PLAYER_INFO_HEIGHT = 32; // Compact player info
  protected readonly HEADER_BAR_HEIGHT = 40; // Compact header
  
  /**
   * Calculate available space after margins
   */
  protected getAvailableSpace(
    contentWidth: number,
    contentHeight: number
  ): { width: number; height: number } {
    const availableHeight = contentHeight 
      - this.HEADER_BAR_HEIGHT 
      - (this.MINIMAL_VERTICAL_MARGIN * 2) 
      - (this.PLAYER_INFO_HEIGHT * 2);
    const availableWidth = contentWidth - (this.MINIMAL_HORIZONTAL_MARGIN * 2);
    
    return { width: availableWidth, height: availableHeight };
  }
  
  /**
   * Clamp board size to reasonable bounds
   */
  protected clampBoardSize(size: number): number {
    return Math.max(this.MIN_BOARD_SIZE, Math.min(size, this.MAX_BOARD_SIZE));
  }
  
  abstract calculateBoardSize(contentWidth: number, contentHeight: number): BoardSizeConfig;
  abstract getBoardColumnFlex(): number;
  abstract getMovesColumnFlex(): number;
  abstract isHorizontalLayout(): boolean;
}
