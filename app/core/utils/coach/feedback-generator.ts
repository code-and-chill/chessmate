/**
 * Coach Feedback Generator
 * 
 * Rule-based system for generating personalized coaching messages based on:
 * - Accuracy delta (player vs opponent)
 * - Evaluation swings (critical moments)
 * - Phase performance (opening/middlegame/endgame)
 * - Move quality distribution
 * - Game result
 */

import type { MoveQuality } from '@/ui';

export type GameResult = 'win' | 'loss' | 'draw';
export type GamePhase = 'opening' | 'middlegame' | 'endgame';
export type CoachSentiment = 'positive' | 'neutral' | 'cautionary' | 'critical';

export interface GameAnalysis {
  result: GameResult;
  playerAccuracy: number;
  opponentAccuracy: number;
  accuracyByPhase?: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
  moveQualities: {
    brilliant?: number;
    great?: number;
    best?: number;
    good?: number;
    book?: number;
    inaccuracy?: number;
    mistake?: number;
    blunder?: number;
    miss?: number;
  };
  criticalMoments?: number; // Count of significant eval swings
  maxEvalLoss?: number; // Largest eval drop in centipawns
  comeback?: boolean; // Recovered from disadvantage
}

interface FeedbackTemplate {
  condition: (analysis: GameAnalysis) => boolean;
  message: string | ((analysis: GameAnalysis) => string);
  sentiment: CoachSentiment;
  priority: number; // Higher = more specific/important
}

/**
 * Message templates organized by priority
 */
const feedbackTemplates: FeedbackTemplate[] = [
  // Brilliant performance (90%+ accuracy, win)
  {
    priority: 100,
    condition: (a) => a.result === 'win' && a.playerAccuracy >= 90 && (a.moveQualities.brilliant || 0) >= 2,
    message: (a) => `🎉 Outstanding performance! You played with incredible precision (${a.playerAccuracy}% accuracy) and delivered ${a.moveQualities.brilliant} brilliant moves. Keep up the excellent work!`,
    sentiment: 'positive',
  },
  
  // Near-perfect game (95%+ accuracy)
  {
    priority: 95,
    condition: (a) => a.playerAccuracy >= 95,
    message: (a) => `🌟 Nearly flawless execution! ${a.playerAccuracy}% accuracy is exceptional. Your calculation skills are top-notch!`,
    sentiment: 'positive',
  },
  
  // Comeback victory
  {
    priority: 90,
    condition: (a) => a.result === 'win' && a.comeback === true,
    message: '🔥 Incredible comeback! You showed great resilience by recovering from a difficult position. Your fighting spirit is commendable!',
    sentiment: 'positive',
  },
  
  // Dominant win (high accuracy + big accuracy delta)
  {
    priority: 85,
    condition: (a) => a.result === 'win' && a.playerAccuracy >= 85 && (a.playerAccuracy - a.opponentAccuracy) >= 15,
    message: (a) => `✨ Dominant performance! Your ${a.playerAccuracy}% accuracy significantly outclassed your opponent's ${a.opponentAccuracy}%. Excellent strategic play!`,
    sentiment: 'positive',
  },
  
  // Good win with some mistakes
  {
    priority: 75,
    condition: (a) => a.result === 'win' && a.playerAccuracy >= 75 && (a.moveQualities.mistake || 0) <= 2,
    message: (a) => `👍 Great win! You capitalized on your opponent's mistakes. Watch out for those ${a.moveQualities.inaccuracy || 0} inaccuracies to reach the next level.`,
    sentiment: 'neutral',
  },
  
  // Lucky win (lower accuracy than opponent)
  {
    priority: 70,
    condition: (a) => a.result === 'win' && a.playerAccuracy < a.opponentAccuracy,
    message: '🍀 A win is a win! Your opponent made critical errors at key moments. Focus on improving accuracy to win more consistently.',
    sentiment: 'neutral',
  },
  
  // Close loss (high accuracy, just couldn\'t convert)
  {
    priority: 80,
    condition: (a) => a.result === 'loss' && a.playerAccuracy >= 80 && (a.moveQualities.blunder || 0) === 0,
    message: '🤔 You played well but couldn\'t convert. Review the critical moments to understand where the advantage slipped. Your accuracy was solid!',
    sentiment: 'cautionary',
  },
  
  // Blunder-heavy loss
  {
    priority: 85,
    condition: (a) => a.result === 'loss' && (a.moveQualities.blunder || 0) >= 2,
    message: (a) => `💪 Tough game with ${a.moveQualities.blunder} blunders. Focus on slowing down in critical positions and double-checking forcing moves.`,
    sentiment: 'critical',
  },
  
  // Low accuracy loss
  {
    priority: 75,
    condition: (a) => a.result === 'loss' && a.playerAccuracy < 70,
    message: (a) => `💡 This game has a lot to teach! Your ${a.playerAccuracy}% accuracy shows room for improvement. Focus on candidate moves and threat detection.`,
    sentiment: 'critical',
  },
  
  // Competitive loss
  {
    priority: 65,
    condition: (a) => a.result === 'loss' && Math.abs(a.playerAccuracy - a.opponentAccuracy) <= 10,
    message: '⚔️ A closely contested battle! Both sides played well. Analyze the key turning points to find improvement opportunities.',
    sentiment: 'cautionary',
  },
  
  // Solid draw
  {
    priority: 70,
    condition: (a) => a.result === 'draw' && a.playerAccuracy >= 80,
    message: '🤝 A well-fought draw! Both sides had chances. Your solid defensive technique kept you in the game.',
    sentiment: 'neutral',
  },
  
  // Scrappy draw
  {
    priority: 60,
    condition: (a) => a.result === 'draw' && a.playerAccuracy < 75,
    message: '🎭 A dramatic game with many twists! Work on accuracy in complex positions to convert advantages.',
    sentiment: 'neutral',
  },
  
  // Phase-specific: Opening struggles
  {
    priority: 55,
    condition: (a) => a.accuracyByPhase && a.accuracyByPhase.opening < 70 && a.accuracyByPhase.opening < a.accuracyByPhase.middlegame - 10,
    message: '📚 Your opening needs work. Consider studying opening theory and common patterns in your repertoire.',
    sentiment: 'cautionary',
  },
  
  // Phase-specific: Endgame excellence
  {
    priority: 50,
    condition: (a) => a.accuracyByPhase && a.accuracyByPhase.endgame >= 90,
    message: '♟️ Excellent endgame technique! Your accuracy improved significantly in the final phase.',
    sentiment: 'positive',
  },
  
  // Phase-specific: Middlegame struggles
  {
    priority: 50,
    condition: (a) => a.accuracyByPhase && a.accuracyByPhase.middlegame < 70,
    message: '🎯 Focus on improving middlegame strategy. Practice tactical puzzles and positional play.',
    sentiment: 'cautionary',
  },
  
  // Default fallback
  {
    priority: 0,
    condition: () => true,
    message: '♟️ Every game is a learning opportunity. Review your moves and look for patterns to improve.',
    sentiment: 'neutral',
  },
];

/**
 * Generate personalized coaching message based on game analysis
 */
export const generateCoachFeedback = (analysis: GameAnalysis): { message: string; sentiment: CoachSentiment } => {
  // Sort templates by priority (highest first)
  const sortedTemplates = [...feedbackTemplates].sort((a, b) => b.priority - a.priority);
  
  // Find first matching template
  for (const template of sortedTemplates) {
    if (template.condition(analysis)) {
      const message = typeof template.message === 'function' 
        ? template.message(analysis) 
        : template.message;
      
      return {
        message,
        sentiment: template.sentiment,
      };
    }
  }
  
  // Fallback (should never reach here due to default template)
  return {
    message: '♟️ Keep playing and learning!',
    sentiment: 'neutral',
  };
};

/**
 * Determine overall sentiment based on result and accuracy
 */
export const getOverallSentiment = (result: GameResult, accuracy: number): CoachSentiment => {
  if (result === 'win' && accuracy >= 85) return 'positive';
  if (result === 'win') return 'neutral';
  if (result === 'loss' && accuracy < 70) return 'critical';
  if (result === 'loss') return 'cautionary';
  return 'neutral';
};

/**
 * Detect if game was a comeback (recovered from significant disadvantage)
 */
export const detectComeback = (evaluations: number[], playerColor: 'white' | 'black'): boolean => {
  if (evaluations.length < 10) return false;
  
  const multiplier = playerColor === 'white' ? 1 : -1;
  const adjustedEvals = evaluations.map(e => e * multiplier);
  
  // Find minimum eval (worst position)
  const minEval = Math.min(...adjustedEvals);
  const minIndex = adjustedEvals.indexOf(minEval);
  
  // Check if recovered significantly after hitting low point
  if (minEval < -200 && minIndex < evaluations.length - 5) {
    const finalEvals = adjustedEvals.slice(minIndex + 5);
    const avgFinalEval = finalEvals.reduce((sum, e) => sum + e, 0) / finalEvals.length;
    
    return avgFinalEval > minEval + 300; // Recovered at least 3 pawns
  }
  
  return false;
};

/**
 * Calculate maximum evaluation loss in a single move
 */
export const getMaxEvalLoss = (evaluations: number[], playerColor: 'white' | 'black'): number => {
  if (evaluations.length < 2) return 0;
  
  const multiplier = playerColor === 'white' ? 1 : -1;
  let maxLoss = 0;
  
  for (let i = 1; i < evaluations.length; i++) {
    const prevEval = evaluations[i - 1] * multiplier;
    const currEval = evaluations[i] * multiplier;
    const loss = prevEval - currEval;
    
    if (loss > maxLoss) {
      maxLoss = loss;
    }
  }
  
  return maxLoss;
};

/**
 * Calculate accuracy by game phase
 */
export const calculatePhaseAccuracy = (
  accuracyData: number[],
  phases: { opening: number; middlegame: number; endgame: number }
): { opening: number; middlegame: number; endgame: number } => {
  const openingAccuracy = accuracyData.slice(0, phases.opening);
  const middlegameAccuracy = accuracyData.slice(phases.opening, phases.middlegame);
  const endgameAccuracy = accuracyData.slice(phases.middlegame);
  
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
  
  return {
    opening: avg(openingAccuracy),
    middlegame: avg(middlegameAccuracy),
    endgame: avg(endgameAccuracy),
  };
};
