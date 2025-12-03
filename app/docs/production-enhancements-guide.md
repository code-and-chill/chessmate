# Production Enhancements - Usage Guide

**Created**: December 2025  
**Components**: EvalBar, GameReviewPanel, Feedback Generator  
**Status**: Production Ready

---

## Overview

This guide demonstrates how to integrate the production-grade chess analysis components into your application. These components provide Chess.com-level visual feedback and coaching intelligence.

## Components

### 1. EvalBar - Real-Time Evaluation Display

**Purpose**: Display position evaluation during live games with smooth animated transitions.

**Features**:
- Real-time centipawn to percentage conversion
- Smooth spring-based animations
- Mate detection with M/-M display
- Horizontal/vertical orientation
- Optional numeric value display
- Theme-aware colors

**API**:
```typescript
interface EvalBarProps {
  evaluation: number;           // Centipawns (e.g., 100 = +1 pawn for white)
  playerColor: 'white' | 'black';
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  showValue?: boolean;          // Show numeric eval (default: true)
  animated?: boolean;           // Enable animations (default: true)
}
```

**Usage Example** (Live Game Screen):
```tsx
import { View, StyleSheet } from 'react-native';
import { EvalBar } from '@/ui';

export function LiveGameScreen() {
  const [currentEval, setCurrentEval] = useState(0);
  const playerColor = 'white';
  
  // Update eval when engine analysis arrives
  useEffect(() => {
    const unsubscribe = gameEngine.onEvalUpdate((eval) => {
      setCurrentEval(eval);
    });
    return unsubscribe;
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Chessboard */}
      <ChessBoard ... />
      
      {/* Real-time eval bar */}
      <EvalBar
        evaluation={currentEval}
        playerColor={playerColor}
        orientation="vertical"
        width={24}
        height={400}
        showValue
        animated
      />
      
      {/* Move controls */}
      <MoveControls ... />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 20,
  },
});
```

**Horizontal Layout** (Compact UI):
```tsx
<View style={styles.compactLayout}>
  <EvalBar
    evaluation={currentEval}
    playerColor={playerColor}
    orientation="horizontal"
    width={300}
    height={16}
    showValue={false}  // Hide numeric for space
  />
  <ChessBoard ... />
</View>
```

---

### 2. GameReviewPanel - Composite Analysis Component

**Purpose**: Reusable panel combining accuracy graph, evaluation graph, move quality list, and coach feedback. Ideal for post-game analysis screens.

**Features**:
- Tabbed graph switching (Accuracy/Evaluation)
- Coach avatar with sentiment-based feedback
- Move quality breakdown list
- Configurable sections (show/hide any component)
- Compact mode for smaller screens
- Consistent elevation and spacing

**API**:
```typescript
interface GameReviewPanelProps {
  // Data props
  playerAccuracy: number[];
  opponentAccuracy: number[];
  evaluations: number[];
  playerColor: 'white' | 'black';
  playerName: string;
  opponentName: string;
  moveQualities: MoveQuality[];
  criticalMoments?: number[];
  phases?: { opening: number; middlegame: number; endgame: number };
  
  // Coach feedback
  coachMessage?: string;
  coachSentiment?: CoachSentiment;
  
  // Section toggles
  showAccuracyGraph?: boolean;
  showEvalGraph?: boolean;
  showMoveQuality?: boolean;
  showCoachFeedback?: boolean;
  
  // Graph switching
  defaultGraph?: 'accuracy' | 'evaluation';
  enableGraphSwitch?: boolean;
  
  // Layout
  compact?: boolean;
}
```

**Usage Example** (Analysis Screen):
```tsx
import { ScrollView } from 'react-native';
import { GameReviewPanel } from '@/ui';
import { generateCoachFeedback } from '@/core/utils';

export function GameAnalysisScreen({ gameId }: { gameId: string }) {
  const game = useGameAnalysis(gameId);
  
  // Generate personalized coach feedback
  const analysis = {
    result: game.result,
    playerAccuracy: game.averageAccuracy,
    opponentAccuracy: game.opponentAverageAccuracy,
    moveQualities: {
      brilliant: game.moveQualities.filter(m => m === 'brilliant').length,
      great: game.moveQualities.filter(m => m === 'great').length,
      // ... count other qualities
    },
    comeback: detectComeback(game.evaluations, game.playerColor),
  };
  
  const { message, sentiment } = generateCoachFeedback(analysis);
  
  return (
    <ScrollView>
      <GameReviewPanel
        playerAccuracy={game.accuracyByMove}
        opponentAccuracy={game.opponentAccuracyByMove}
        evaluations={game.evaluations}
        playerColor={game.playerColor}
        playerName={game.playerName}
        opponentName={game.opponentName}
        moveQualities={game.moveQualities}
        criticalMoments={game.criticalMoments}
        phases={game.phases}
        coachMessage={message}
        coachSentiment={sentiment}
        defaultGraph="accuracy"
        enableGraphSwitch
      />
    </ScrollView>
  );
}
```

**Compact Mode** (Mobile):
```tsx
<GameReviewPanel
  {...gameData}
  compact              // Smaller graphs (180px vs 250px)
  showMoveQuality={false}  // Hide on small screens
/>
```

**Selective Sections**:
```tsx
// Show only accuracy graph and coach feedback
<GameReviewPanel
  {...gameData}
  showAccuracyGraph
  showEvalGraph={false}
  showMoveQuality={false}
  showCoachFeedback
  enableGraphSwitch={false}  // Only one graph, no switcher needed
/>
```

---

### 3. Feedback Generator - Intelligent Coaching Messages

**Purpose**: Generate personalized coaching messages based on game performance analysis.

**Features**:
- 15+ rule-based message templates
- Priority-based template matching
- Sentiment classification (positive/neutral/cautionary/critical)
- Comeback detection
- Phase-specific feedback
- Max eval loss calculation
- Variable substitution in messages

**API**:
```typescript
function generateCoachFeedback(analysis: GameAnalysis): {
  message: string;
  sentiment: CoachSentiment;
}

interface GameAnalysis {
  result: 'win' | 'loss' | 'draw';
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
  criticalMoments?: number;
  maxEvalLoss?: number;
  comeback?: boolean;
}
```

**Usage Example** (Post-Game Analysis):
```tsx
import {
  generateCoachFeedback,
  detectComeback,
  getMaxEvalLoss,
  calculatePhaseAccuracy,
} from '@/core/utils';

function analyzeGame(game: Game) {
  // Count move qualities
  const moveQualities = {
    brilliant: game.moves.filter(m => m.quality === 'brilliant').length,
    great: game.moves.filter(m => m.quality === 'great').length,
    inaccuracy: game.moves.filter(m => m.quality === 'inaccuracy').length,
    mistake: game.moves.filter(m => m.quality === 'mistake').length,
    blunder: game.moves.filter(m => m.quality === 'blunder').length,
  };
  
  // Detect comeback
  const comeback = detectComeback(game.evaluations, game.playerColor);
  
  // Calculate max eval loss
  const maxEvalLoss = getMaxEvalLoss(game.evaluations, game.playerColor);
  
  // Calculate phase accuracy
  const accuracyByPhase = calculatePhaseAccuracy(
    game.accuracyByMove,
    { opening: 8, middlegame: 25, endgame: game.moves.length }
  );
  
  // Generate feedback
  const analysis = {
    result: game.result,
    playerAccuracy: game.averageAccuracy,
    opponentAccuracy: game.opponentAverageAccuracy,
    accuracyByPhase,
    moveQualities,
    comeback,
    maxEvalLoss,
  };
  
  const { message, sentiment } = generateCoachFeedback(analysis);
  
  return { message, sentiment };
}
```

**Example Outputs**:

**Brilliant Win**:
```typescript
Input: {
  result: 'win',
  playerAccuracy: 92,
  opponentAccuracy: 78,
  moveQualities: { brilliant: 3, great: 5 }
}

Output: {
  message: "🎉 Outstanding performance! You played with incredible precision (92% accuracy) and delivered 3 brilliant moves. Keep up the excellent work!",
  sentiment: 'positive'
}
```

**Blunder Loss**:
```typescript
Input: {
  result: 'loss',
  playerAccuracy: 68,
  opponentAccuracy: 85,
  moveQualities: { blunder: 3, mistake: 2 }
}

Output: {
  message: "💪 Tough game with 3 blunders. Focus on slowing down in critical positions and double-checking forcing moves.",
  sentiment: 'critical'
}
```

**Comeback Win**:
```typescript
Input: {
  result: 'win',
  playerAccuracy: 85,
  comeback: true
}

Output: {
  message: "🔥 Incredible comeback! You showed great resilience by recovering from a difficult position. Your fighting spirit is commendable!",
  sentiment: 'positive'
}
```

**Opening Struggles**:
```typescript
Input: {
  result: 'loss',
  playerAccuracy: 72,
  accuracyByPhase: {
    opening: 60,
    middlegame: 75,
    endgame: 80
  }
}

Output: {
  message: "📚 Your opening needs work. Consider studying opening theory and common patterns in your repertoire.",
  sentiment: 'cautionary'
}
```

---

## Integration Patterns

### Pattern 1: Live Game with Real-Time Feedback

```tsx
import { useState, useEffect } from 'react';
import { EvalBar, MoveQualityBadge, CoachTooltip } from '@/ui';

export function LiveGameScreen() {
  const [currentEval, setCurrentEval] = useState(0);
  const [latestMoveQuality, setLatestMoveQuality] = useState<MoveQuality | null>(null);
  const [showCoachTip, setShowCoachTip] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  
  // Listen for move submissions
  const handleMove = async (move: Move) => {
    const analysis = await analyzeMove(move);
    
    setCurrentEval(analysis.evaluation);
    setLatestMoveQuality(analysis.quality);
    
    // Show coach tooltip for significant moves
    if (analysis.quality === 'blunder' || analysis.quality === 'brilliant') {
      setCoachMessage(analysis.feedback);
      setShowCoachTip(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShowCoachTip(false), 5000);
    }
  };
  
  return (
    <View style={styles.container}>
      <EvalBar
        evaluation={currentEval}
        playerColor="white"
        orientation="vertical"
      />
      
      <ChessBoard onMove={handleMove} />
      
      {latestMoveQuality && (
        <MoveQualityBadge
          quality={latestMoveQuality}
          size="md"
          animated
        />
      )}
      
      {showCoachTip && (
        <CoachTooltip
          message={coachMessage}
          position="top"
          sentiment="cautionary"
          visible
          onDismiss={() => setShowCoachTip(false)}
        />
      )}
    </View>
  );
}
```

### Pattern 2: Post-Game Analysis with Generated Feedback

```tsx
import { GameReviewPanel } from '@/ui';
import { generateCoachFeedback, detectComeback } from '@/core/utils';

export function PostGameAnalysisScreen({ gameId }: { gameId: string }) {
  const game = useGameData(gameId);
  
  // Prepare analysis data
  const analysis = useMemo(() => {
    const moveQualities = countMoveQualities(game.moves);
    const comeback = detectComeback(game.evaluations, game.playerColor);
    
    return {
      result: game.result,
      playerAccuracy: game.averageAccuracy,
      opponentAccuracy: game.opponentAverageAccuracy,
      moveQualities,
      comeback,
    };
  }, [game]);
  
  // Generate personalized feedback
  const { message, sentiment } = generateCoachFeedback(analysis);
  
  return (
    <ScrollView>
      <GameReviewPanel
        playerAccuracy={game.accuracyByMove}
        opponentAccuracy={game.opponentAccuracyByMove}
        evaluations={game.evaluations}
        playerColor={game.playerColor}
        playerName={game.playerName}
        opponentName={game.opponentName}
        moveQualities={game.moves.map(m => m.quality)}
        criticalMoments={game.criticalMoments}
        phases={game.phases}
        coachMessage={message}
        coachSentiment={sentiment}
        enableGraphSwitch
      />
    </ScrollView>
  );
}
```

### Pattern 3: Lightweight Review List with Selective Feedback

```tsx
import { FlatList } from 'react-native';
import { GameCard, CoachAvatar } from '@/ui';
import { generateCoachFeedback } from '@/core/utils';

export function GameHistoryScreen() {
  const games = useGameHistory();
  
  const renderGameCard = ({ item: game }) => {
    const analysis = {
      result: game.result,
      playerAccuracy: game.averageAccuracy,
      opponentAccuracy: game.opponentAverageAccuracy,
      moveQualities: game.qualityCounts,
    };
    
    const { message, sentiment } = generateCoachFeedback(analysis);
    
    return (
      <View style={styles.gameCard}>
        <GameCard {...game} />
        
        <View style={styles.coachFeedback}>
          <CoachAvatar
            sentiment={sentiment}
            size="sm"
            animated={false}
          />
          <Text style={styles.feedbackText}>{message}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <FlatList
      data={games}
      renderItem={renderGameCard}
      keyExtractor={(game) => game.id}
    />
  );
}
```

---

## Best Practices

### EvalBar
✅ **DO**:
- Use vertical orientation for desktop (sidebar)
- Use horizontal orientation for mobile (top/bottom)
- Enable animations for live games
- Show numeric value for learning/analysis
- Update evaluation smoothly (avoid rapid flickering)

❌ **DON'T**:
- Update evaluation more than 10 times per second (causes visual jitter)
- Use extremely large dimensions (performance impact)
- Hide value in analysis mode (users want to see exact eval)

### GameReviewPanel
✅ **DO**:
- Use compact mode on mobile devices
- Enable graph switching for detailed analysis
- Generate coach feedback from actual game data
- Hide sections that aren't relevant (e.g., no eval graph if data unavailable)
- Use consistent player names across components

❌ **DON'T**:
- Show all sections on small screens (overwhelming)
- Hard-code coach messages (use feedback generator)
- Disable graph switching in full analysis mode
- Mix up player/opponent data (causes confusing graphs)

### Feedback Generator
✅ **DO**:
- Count move qualities accurately
- Detect comebacks using evaluation history
- Calculate phase accuracy when available
- Use generated messages directly (templates are well-tested)
- Show sentiment via CoachAvatar expression

❌ **DON'T**:
- Override generated messages with generic text
- Ignore comeback detection (users love recognizing resilience)
- Skip phase analysis (valuable learning insight)
- Mix up player vs opponent accuracy (incorrect feedback)

---

## Testing

All components include comprehensive test coverage:

**EvalBar**: 15 Storybook stories
- Evaluation ranges (equal, small/large advantage, mate)
- Orientations (horizontal, vertical)
- Sizes (compact, standard, large)
- Animation states

**GameReviewPanel**: 9 Storybook stories
- Complete (all features)
- Individual sections (accuracy only, eval only)
- Compact mode
- Different sentiments
- Graph switching

**Feedback Generator**: 12 Jest unit tests
- Message generation for all scenarios
- Sentiment classification
- Comeback detection
- Max eval loss calculation
- Phase accuracy calculation

Run tests:
```bash
# Storybook (visual testing)
pnpm storybook

# Unit tests
pnpm test feedback-generator
```

---

## Performance Considerations

**EvalBar**:
- Uses Reanimated worklets (runs on UI thread)
- Spring animations are GPU-accelerated
- Color interpolation is optimized
- Minimal re-renders (useSharedValue)

**GameReviewPanel**:
- Lazy renders graphs only when tab is active
- Memoizes graph data to avoid recalculation
- Compact mode reduces memory footprint
- Chart rendering uses react-native-svg (optimized)

**Feedback Generator**:
- Pure functions (no side effects)
- O(n) template matching (n = number of templates)
- No heavy computation (simple threshold checks)
- Memoize results when used in React components

---

## Accessibility

All components follow accessibility best practices:

- **EvalBar**: Announce evaluation changes to screen readers
- **GameReviewPanel**: Keyboard navigation for graph tabs
- **CoachAvatar**: Alt text for expressions
- **Tooltips**: Dismissible with touch/click/keyboard

---

## Theming

All components are theme-aware and automatically adapt to light/dark mode:

```tsx
import { useColors, useIsDark } from '@/ui';

// Components automatically use theme
<EvalBar ... />  // Colors adapt to theme

// Manual theme access if needed
const colors = useColors();
const isDark = useIsDark();
```

---

## Migration from Old Components

If you have existing analysis screens with individual graphs, migrate to GameReviewPanel:

**Before** (duplicated code):
```tsx
<View>
  <AccuracyGraph playerAccuracy={...} opponentAccuracy={...} />
  <EvalGraph evaluations={...} />
  <MoveQualityList qualities={...} />
  <CoachAvatar sentiment="positive" />
  <Text>Hard-coded message</Text>
</View>
```

**After** (single component):
```tsx
<GameReviewPanel
  playerAccuracy={...}
  opponentAccuracy={...}
  evaluations={...}
  moveQualities={...}
  coachMessage={generatedMessage}
  coachSentiment={generatedSentiment}
  enableGraphSwitch
/>
```

**Benefits**:
- 80% less code
- Consistent layout across screens
- Automatic graph switching
- Intelligent feedback generation
- Easier maintenance

---

## Support

For issues or questions:
1. Check Storybook for visual examples
2. Review unit tests for usage patterns
3. See `design-language-system.md` for design tokens
4. Consult `AGENTS.md` for architectural decisions

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: ✅ Production Ready
