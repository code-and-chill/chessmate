/**
 * Layout Strategy Tests
 * 
 * Unit tests for layout strategy pattern implementations.
 */

import { MobileLayoutStrategy } from '../MobileLayoutStrategy';
import { TabletLayoutStrategy } from '../TabletLayoutStrategy';
import { DesktopLayoutStrategy } from '../DesktopLayoutStrategy';
import { LayoutStrategyFactory } from '../LayoutStrategyFactory';

describe('LayoutStrategy', () => {
  describe('MobileLayoutStrategy', () => {
    let strategy: MobileLayoutStrategy;

    beforeEach(() => {
      strategy = new MobileLayoutStrategy();
    });

    it('should have correct layout type', () => {
      expect(strategy.layoutType).toBe('mobile');
    });

    it('should calculate board size for mobile', () => {
      const result = strategy.calculateBoardSize(400, 600);
      expect(result.boardSize).toBeGreaterThanOrEqual(280);
      expect(result.boardSize).toBeLessThanOrEqual(800);
      expect(result.squareSize).toBe(result.boardSize / 8);
    });

    it('should return full width flex for board column', () => {
      expect(strategy.getBoardColumnFlex()).toBe(1);
    });

    it('should return zero flex for moves column', () => {
      expect(strategy.getMovesColumnFlex()).toBe(0);
    });

    it('should return false for horizontal layout', () => {
      expect(strategy.isHorizontalLayout()).toBe(false);
    });
  });

  describe('TabletLayoutStrategy', () => {
    let strategy: TabletLayoutStrategy;

    beforeEach(() => {
      strategy = new TabletLayoutStrategy();
    });

    it('should have correct layout type', () => {
      expect(strategy.layoutType).toBe('tablet');
    });

    it('should calculate board size for tablet', () => {
      const result = strategy.calculateBoardSize(800, 600);
      expect(result.boardSize).toBeGreaterThanOrEqual(280);
      expect(result.boardSize).toBeLessThanOrEqual(800);
      expect(result.squareSize).toBe(result.boardSize / 8);
    });

    it('should return 0.65 flex for board column', () => {
      expect(strategy.getBoardColumnFlex()).toBe(0.65);
    });

    it('should return 0.35 flex for moves column', () => {
      expect(strategy.getMovesColumnFlex()).toBe(0.35);
    });

    it('should return true for horizontal layout', () => {
      expect(strategy.isHorizontalLayout()).toBe(true);
    });
  });

  describe('DesktopLayoutStrategy', () => {
    let strategy: DesktopLayoutStrategy;

    beforeEach(() => {
      strategy = new DesktopLayoutStrategy();
    });

    it('should have correct layout type', () => {
      expect(strategy.layoutType).toBe('desktop');
    });

    it('should calculate board size for desktop', () => {
      const result = strategy.calculateBoardSize(1200, 800);
      expect(result.boardSize).toBeGreaterThanOrEqual(280);
      expect(result.boardSize).toBeLessThanOrEqual(800);
      expect(result.squareSize).toBe(result.boardSize / 8);
    });

    it('should return 0.70 flex for board column', () => {
      expect(strategy.getBoardColumnFlex()).toBe(0.70);
    });

    it('should return 0.30 flex for moves column', () => {
      expect(strategy.getMovesColumnFlex()).toBe(0.30);
    });

    it('should return true for horizontal layout', () => {
      expect(strategy.isHorizontalLayout()).toBe(true);
    });
  });

  describe('LayoutStrategyFactory', () => {
    beforeEach(() => {
      LayoutStrategyFactory.clearCache();
    });

    it('should create mobile strategy', () => {
      const strategy = LayoutStrategyFactory.getStrategy('mobile');
      expect(strategy.layoutType).toBe('mobile');
      expect(strategy).toBeInstanceOf(MobileLayoutStrategy);
    });

    it('should create tablet strategy', () => {
      const strategy = LayoutStrategyFactory.getStrategy('tablet');
      expect(strategy.layoutType).toBe('tablet');
      expect(strategy).toBeInstanceOf(TabletLayoutStrategy);
    });

    it('should create desktop strategy', () => {
      const strategy = LayoutStrategyFactory.getStrategy('desktop');
      expect(strategy.layoutType).toBe('desktop');
      expect(strategy).toBeInstanceOf(DesktopLayoutStrategy);
    });

    it('should cache strategies', () => {
      const strategy1 = LayoutStrategyFactory.getStrategy('mobile');
      const strategy2 = LayoutStrategyFactory.getStrategy('mobile');
      expect(strategy1).toBe(strategy2); // Same instance
    });

    it('should clear cache', () => {
      const strategy1 = LayoutStrategyFactory.getStrategy('mobile');
      LayoutStrategyFactory.clearCache();
      const strategy2 = LayoutStrategyFactory.getStrategy('mobile');
      expect(strategy1).not.toBe(strategy2); // Different instances
    });
  });

  describe('Board size constraints', () => {
    it('should respect minimum board size', () => {
      const mobile = new MobileLayoutStrategy();
      const result = mobile.calculateBoardSize(100, 100); // Very small
      expect(result.boardSize).toBeGreaterThanOrEqual(280);
    });

    it('should respect maximum board size', () => {
      const desktop = new DesktopLayoutStrategy();
      const result = desktop.calculateBoardSize(5000, 5000); // Very large
      expect(result.boardSize).toBeLessThanOrEqual(800);
    });
  });
});
