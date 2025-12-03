/**
 * Tests for Coach Feedback Generator
 */

import {
  generateCoachFeedback,
  getOverallSentiment,
  detectComeback,
  getMaxEvalLoss,
  calculatePhaseAccuracy,
  type GameAnalysis,
} from '../feedback-generator';

describe('generateCoachFeedback', () => {
  it('generates positive feedback for brilliant win', () => {
    const analysis: GameAnalysis = {
      result: 'win',
      playerAccuracy: 92,
      opponentAccuracy: 78,
      moveQualities: {
        brilliant: 3,
        great: 5,
        best: 8,
        good: 4,
        inaccuracy: 1,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.sentiment).toBe('positive');
    expect(feedback.message).toContain('brilliant');
    expect(feedback.message).toContain('92%');
  });
  
  it('generates comeback message for recovered position', () => {
    const analysis: GameAnalysis = {
      result: 'win',
      playerAccuracy: 85,
      opponentAccuracy: 80,
      moveQualities: {
        great: 10,
        good: 8,
        inaccuracy: 3,
      },
      comeback: true,
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.sentiment).toBe('positive');
    expect(feedback.message).toContain('comeback');
  });
  
  it('generates critical feedback for blunder-heavy loss', () => {
    const analysis: GameAnalysis = {
      result: 'loss',
      playerAccuracy: 68,
      opponentAccuracy: 85,
      moveQualities: {
        good: 10,
        inaccuracy: 4,
        mistake: 2,
        blunder: 3,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.sentiment).toBe('critical');
    expect(feedback.message).toContain('blunder');
    expect(feedback.message).toContain('3');
  });
  
  it('generates cautionary feedback for low accuracy loss', () => {
    const analysis: GameAnalysis = {
      result: 'loss',
      playerAccuracy: 65,
      opponentAccuracy: 80,
      moveQualities: {
        good: 8,
        inaccuracy: 5,
        mistake: 3,
        blunder: 1,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.sentiment).toBe('critical');
    expect(feedback.message).toContain('65%');
  });
  
  it('generates neutral feedback for solid draw', () => {
    const analysis: GameAnalysis = {
      result: 'draw',
      playerAccuracy: 82,
      opponentAccuracy: 81,
      moveQualities: {
        great: 8,
        good: 10,
        inaccuracy: 3,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.sentiment).toBe('neutral');
    expect(feedback.message).toContain('draw');
  });
  
  it('generates phase-specific feedback for opening struggles', () => {
    const analysis: GameAnalysis = {
      result: 'loss',
      playerAccuracy: 72,
      opponentAccuracy: 78,
      accuracyByPhase: {
        opening: 60,
        middlegame: 75,
        endgame: 80,
      },
      moveQualities: {
        good: 10,
        inaccuracy: 5,
        mistake: 2,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.message).toContain('opening');
  });
  
  it('generates phase-specific feedback for endgame excellence', () => {
    const analysis: GameAnalysis = {
      result: 'win',
      playerAccuracy: 87,
      opponentAccuracy: 80,
      accuracyByPhase: {
        opening: 78,
        middlegame: 82,
        endgame: 95,
      },
      moveQualities: {
        great: 12,
        good: 8,
        inaccuracy: 1,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.message).toContain('endgame');
    expect(feedback.message).toContain('90');
  });
  
  it('generates dominant performance message', () => {
    const analysis: GameAnalysis = {
      result: 'win',
      playerAccuracy: 90,
      opponentAccuracy: 72,
      moveQualities: {
        brilliant: 1,
        great: 10,
        best: 8,
        good: 4,
      },
    };
    
    const feedback = generateCoachFeedback(analysis);
    expect(feedback.sentiment).toBe('positive');
    expect(feedback.message).toContain('Dominant');
    expect(feedback.message).toContain('90%');
    expect(feedback.message).toContain('72%');
  });
});

describe('getOverallSentiment', () => {
  it('returns positive for high-accuracy win', () => {
    expect(getOverallSentiment('win', 90)).toBe('positive');
  });
  
  it('returns neutral for decent win', () => {
    expect(getOverallSentiment('win', 78)).toBe('neutral');
  });
  
  it('returns critical for low-accuracy loss', () => {
    expect(getOverallSentiment('loss', 65)).toBe('critical');
  });
  
  it('returns cautionary for decent loss', () => {
    expect(getOverallSentiment('loss', 78)).toBe('cautionary');
  });
  
  it('returns neutral for draw', () => {
    expect(getOverallSentiment('draw', 80)).toBe('neutral');
  });
});

describe('detectComeback', () => {
  it('detects comeback for white', () => {
    // Evals: White starts -300, recovers to +100
    const evaluations = [0, -100, -200, -300, -250, -150, -50, 50, 100, 150];
    expect(detectComeback(evaluations, 'white')).toBe(true);
  });
  
  it('detects comeback for black', () => {
    // Evals: Black starts at +300 (disadvantage), recovers to -100 (advantage)
    const evaluations = [0, 100, 200, 300, 250, 150, 50, -50, -100, -150];
    expect(detectComeback(evaluations, 'black')).toBe(true);
  });
  
  it('returns false for no significant disadvantage', () => {
    const evaluations = [0, 50, 30, 20, 50, 80, 100, 120];
    expect(detectComeback(evaluations, 'white')).toBe(false);
  });
  
  it('returns false for no recovery', () => {
    const evaluations = [0, -100, -200, -300, -350, -400, -450];
    expect(detectComeback(evaluations, 'white')).toBe(false);
  });
  
  it('returns false for short game', () => {
    const evaluations = [0, -100, -50];
    expect(detectComeback(evaluations, 'white')).toBe(false);
  });
});

describe('getMaxEvalLoss', () => {
  it('calculates max eval loss for white', () => {
    const evaluations = [200, 180, 150, 120, -80]; // Lost 200cp in one move
    expect(getMaxEvalLoss(evaluations, 'white')).toBe(200);
  });
  
  it('calculates max eval loss for black', () => {
    const evaluations = [-200, -180, -150, -120, 80]; // Lost 200cp in one move
    expect(getMaxEvalLoss(evaluations, 'black')).toBe(200);
  });
  
  it('returns 0 for improving position', () => {
    const evaluations = [0, 50, 100, 150, 200];
    expect(getMaxEvalLoss(evaluations, 'white')).toBe(0);
  });
  
  it('returns 0 for short evaluation array', () => {
    expect(getMaxEvalLoss([100], 'white')).toBe(0);
    expect(getMaxEvalLoss([], 'white')).toBe(0);
  });
});

describe('calculatePhaseAccuracy', () => {
  it('calculates accuracy by phase', () => {
    const accuracyData = [
      90, 85, 88, // Opening (3 moves)
      75, 72, 78, 80, 76, // Middlegame (5 moves)
      92, 95, 90, 93, // Endgame (4 moves)
    ];
    
    const phases = { opening: 3, middlegame: 8, endgame: 12 };
    const result = calculatePhaseAccuracy(accuracyData, phases);
    
    expect(result.opening).toBeCloseTo((90 + 85 + 88) / 3, 1);
    expect(result.middlegame).toBeCloseTo((75 + 72 + 78 + 80 + 76) / 5, 1);
    expect(result.endgame).toBeCloseTo((92 + 95 + 90 + 93) / 4, 1);
  });
  
  it('handles empty phases', () => {
    const accuracyData = [90, 85, 88];
    const phases = { opening: 3, middlegame: 3, endgame: 3 };
    const result = calculatePhaseAccuracy(accuracyData, phases);
    
    expect(result.opening).toBeCloseTo(87.67, 1);
    expect(result.middlegame).toBe(0);
    expect(result.endgame).toBe(0);
  });
});
