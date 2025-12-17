---
title: Chess Analysis Features
service: chess-app
status: active
last_reviewed: 2025-12-03
type: feature
---

# Chess Analysis Features

## Overview

The app integrates with `engine-cluster-api` to provide real-time position analysis and post-game analysis using Stockfish engine evaluation. This enables features like evaluation bars, move quality feedback, and game accuracy metrics.

## Components

### Real-Time Position Analysis

**Hook**: `usePositionAnalysis`

**Location**: `app/features/board/hooks/usePositionAnalysis.ts`

**Purpose**: Provides real-time position evaluation during active games.

**Features**:
- Automatic analysis when position changes
- Debouncing to avoid excessive API calls
- Result caching (5-minute TTL)
- Configurable depth and time limits
- Graceful error handling

**Usage**:
```typescript
import { usePositionAnalysis } from '@/features/board/hooks';

function GameScreen({ fen }: { fen: string }) {
  const analysis = usePositionAnalysis(fen, {
    maxDepth: 12,
    timeLimitMs: 1000,
    multiPv: 1,
    enabled: true,
    debounceMs: 300,
  });

  return (
    <View>
      {analysis.isLoading && <Text>Analyzing...</Text>}
      {analysis.error && <Text>Error: {analysis.error.message}</Text>}
      {analysis.bestMove && (
        <Text>Best move: {analysis.bestMove.move}</Text>
      )}
      <EvalBar evaluation={analysis.evaluation} />
    </View>
  );
}
```

**Return Value**:
```typescript
interface PositionAnalysisResult {
  bestMove: Candidate | null;
  candidates: Candidate[];
  evaluation: number;        // Centipawns
  isLoading: boolean;
  error: Error | null;
  timeMs: number | null;
  analyze: () => Promise<void>;  // Manual trigger
}
```

### Post-Game Analysis

**Hook**: `useGameAnalysis`

**Location**: `app/features/game/hooks/useGameAnalysis.ts`

**Purpose**: Analyzes entire game move-by-move for post-game review.

**Features**:
- Batch processing for efficiency
- Progress tracking
- Accuracy calculation
- Move quality classification (best/good/inaccuracy/mistake/blunder)

**Usage**:
```typescript
import { useGameAnalysis } from '@/features/game/hooks';

function GameAnalysisScreen({ positions, moves }: Props) {
  const analysis = useGameAnalysis(positions, moves, {
    maxDepth: 15,
    timeLimitMs: 2000,
    multiPv: 1,
    batchSize: 3,
  });

  return (
    <View>
      {analysis.isLoading && (
        <Text>Analyzing... {analysis.progress}%</Text>
      )}
      <Text>Accuracy: {analysis.accuracy}%</Text>
      {analysis.moves.map((move, i) => (
        <MoveAnalysisRow key={i} move={move} />
      ))}
    </View>
  );
}
```

**Return Value**:
```typescript
interface GameAnalysisResult {
  moves: MoveAnalysis[];
  accuracy: number;           // 0-100
  isLoading: boolean;
  progress: number;           // 0-100
  error: Error | null;
  totalTimeMs: number;
  analyze: () => Promise<void>;
}
```

## UI Components

### Evaluation Bar

**Component**: `EvalBar`

**Location**: `app/ui/components/chess/EvalBar.tsx`

**Purpose**: Visual representation of position evaluation.

**Features**:
- Animated transitions
- Vertical or horizontal orientation
- Mate score indicators
- Centipawn to visual percentage conversion

**Usage**:
```typescript
import { EvalBar } from '@/ui/components/chess/EvalBar';

<EvalBar
  evaluation={analysis.evaluation}  // Centipawns
  playerColor="white"
  orientation="vertical"
  width={32}
  height={200}
  showValue={true}
  animated={true}
/>
```

### Integration in PlayScreen

The evaluation bar is automatically displayed during active games in `PlayScreen`:

```typescript
// In app/features/board/screens/PlayScreen.tsx
const positionAnalysis = usePositionAnalysis(
  showAnalysis ? gameState.fen : null,
  { maxDepth: 12, timeLimitMs: 1000 }
);

// Passed to BoardColumn component
<BoardColumn
  evaluation={positionAnalysis.evaluation}
  showEvaluation={showAnalysis}
  // ... other props
/>
```

## Configuration

### Environment Setup

Engine cluster API URL is configured per environment:

```typescript
// app/config/environments.ts
LOCAL_CONFIG: {
  api: {
    engineClusterUrl: 'http://localhost:9000',
  }
}
```

### Mock Mode

When `mockApi` feature flag is enabled, `MockEngineApiClient` is used instead of the real API client. This provides realistic mock evaluations for development.

## Performance Considerations

### Caching

- Position analysis results are cached for 5 minutes
- Cache key includes FEN, depth, time limit, and multi-PV
- Cache size limited to 50 entries (LRU eviction)

### Debouncing

- Default debounce: 300ms
- Prevents excessive API calls during rapid position changes
- Configurable via `debounceMs` option

### Batch Processing

- Post-game analysis processes positions in batches (default: 3 concurrent)
- Reduces API load while maintaining reasonable analysis speed
- Configurable via `batchSize` option

## Error Handling

### Network Errors

- Graceful degradation when engine-cluster-api is unavailable
- Error state exposed via `error` property
- UI components handle loading/error states appropriately

### Timeout Handling

- Default timeout: 30 seconds (from environment config)
- Requests automatically cancelled on component unmount
- AbortController used for request cancellation

## Settings Integration

### User Preferences

Analysis features respect user preferences:

- `show_engine_lines` - Enable/disable engine line display (future)
- `evaluation_bar` - Show/hide evaluation bar
- `post_game_analysis` - Automatic/manual/off post-game analysis

## Future Enhancements

1. **Engine Lines Display**: Show principal variations as arrows on board
2. **Move Hints**: Display best move suggestions during games
3. **Blunder Detection**: Real-time alerts for major mistakes
4. **Opening Book Integration**: Combine with chess-knowledge-api for opening analysis
5. **Cloud Analysis**: Store analysis results for later review
6. **Depth Presets**: Quick depth selection (quick/standard/deep)

## Related Documentation

- [Engine-Cluster-API Audit](../audits/engine-cluster-api-audit-2025-12-03.md)
- [API Layer Documentation](./api-layer.md)
- [Engine-Cluster-API Service Docs](../../engine-cluster-api/docs/api.md)
