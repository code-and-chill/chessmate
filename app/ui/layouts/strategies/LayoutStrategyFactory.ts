/**
 * Layout Strategy Factory
 * 
 * Factory for creating layout strategies based on layout type.
 * Follows Factory Pattern and Strategy Pattern.
 * 
 * @packageDocumentation
 */

import type { LayoutType } from '@/ui/tokens/breakpoints';
import { MobileLayoutStrategy } from './MobileLayoutStrategy';
import { TabletLayoutStrategy } from './TabletLayoutStrategy';
import { DesktopLayoutStrategy } from './DesktopLayoutStrategy';
import type { ILayoutStrategy } from './LayoutStrategy';

/**
 * Factory for creating layout strategies
 */
export class LayoutStrategyFactory {
  private static strategies: Map<LayoutType, ILayoutStrategy> = new Map();
  
  /**
   * Get or create strategy for layout type
   * 
   * Strategies are cached for performance (immutable strategies).
   * 
   * @param layoutType - Layout type
   * @returns Layout strategy instance
   */
  static getStrategy(layoutType: LayoutType): ILayoutStrategy {
    if (!this.strategies.has(layoutType)) {
      let strategy: ILayoutStrategy;
      
      switch (layoutType) {
        case 'mobile':
          strategy = new MobileLayoutStrategy();
          break;
        case 'tablet':
          strategy = new TabletLayoutStrategy();
          break;
        case 'desktop':
          strategy = new DesktopLayoutStrategy();
          break;
        default:
          // Fallback to mobile for unknown types
          strategy = new MobileLayoutStrategy();
      }
      
      this.strategies.set(layoutType, strategy);
    }
    
    return this.strategies.get(layoutType)!;
  }
  
  /**
   * Clear strategy cache (useful for testing)
   */
  static clearCache(): void {
    this.strategies.clear();
  }
}
