/**
 * ResultDialog Component
 * app/ui/components/chess/ResultDialog.tsx
 * 
 * Displays game result with reason, statistics, and actions
 * Features: Win/draw/loss states, result reasons, game stats, rematch/review actions
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { Modal } from '../../primitives/Modal';
import { Badge } from '../../primitives/Badge';
import { colorTokens, getColor } from '../../tokens/colors';
import { spacingTokens, spacingScale } from '../../tokens/spacing';
import { radiusTokens } from '../../tokens/radii';
import { textVariants } from '../../tokens/typography';
import { shadowTokens } from '../../tokens/shadows';
import { useIsDark } from '../../hooks/useThemeTokens';

export type GameResult = 'win' | 'loss' | 'draw';

export type ResultReason =
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'stalemate'
  | 'insufficient_material'
  | 'threefold_repetition'
  | 'fifty_move_rule'
  | 'agreement';

type GameStats = {
  duration: number; // seconds
  totalMoves: number;
  accuracy?: {
    player: number; // 0-100
    opponent: number; // 0-100
  };
  ratingChange?: {
    player: number; // ±rating
    opponent: number;
  };
};

type ResultDialogProps = {
  visible: boolean;
  result: GameResult;
  reason: ResultReason;
  winner?: 'white' | 'black';
  playerColor: 'white' | 'black';
  opponentName: string;
  stats: GameStats;
  onClose: () => void;
  onRematch?: () => void;
  onReview?: () => void;
  onNewGame?: () => void;
  isDark?: boolean;
};

/**
 * ResultDialog Component
 * 
 * @example
 * ```tsx
 * <ResultDialog
 *   visible={gameEnded}
 *   result="win"
 *   reason="checkmate"
 *   winner="white"
 *   playerColor="white"
 *   opponentName="Opponent123"
 *   stats={{
 *     duration: 780,
 *     totalMoves: 45,
 *     accuracy: { player: 92, opponent: 85 },
 *     ratingChange: { player: +12, opponent: -12 },
 *   }}
 *   onClose={() => setGameEnded(false)}
 *   onRematch={handleRematch}
 *   onReview={handleReview}
 * />
 * ```
 */
export const ResultDialog: React.FC<ResultDialogProps> = ({
  visible,
  result,
  reason,
  winner,
  playerColor,
  opponentName,
  stats,
  onClose,
  onRematch,
  onReview,
  onNewGame,
  isDark: isDarkProp,
}) => {
  const isDarkTheme = useIsDark();
  const isDark = isDarkProp ?? isDarkTheme;
  const getResultTitle = (): string => {
    if (result === 'win') return 'Victory!';
    if (result === 'loss') return 'Defeat';
    return 'Draw';
  };

  const getResultSubtitle = (): string => {
    const reasonMap: Record<ResultReason, string> = {
      checkmate: 'by checkmate',
      resignation: 'by resignation',
      timeout: 'on time',
      stalemate: 'by stalemate',
      insufficient_material: 'insufficient material',
      threefold_repetition: 'threefold repetition',
      fifty_move_rule: 'fifty-move rule',
      agreement: 'by agreement',
    };

    const winnerText = winner ? `${winner === 'white' ? 'White' : 'Black'} wins` : 'Game drawn';
    return `${winnerText} ${reasonMap[reason]}`;
  };

  const getResultColor = () => {
    if (result === 'win') return getColor(colorTokens.green[600], isDark);
    if (result === 'loss') return getColor(colorTokens.red[600], isDark);
    return getColor(colorTokens.neutral[600], isDark);
  };

  const getResultBgColor = () => {
    if (result === 'win') return getColor(colorTokens.green[50], isDark);
    if (result === 'loss') return getColor(colorTokens.red[50], isDark);
    return getColor(colorTokens.neutral[100], isDark);
  };

  const getResultIcon = (): string => {
    if (result === 'win') return '👑';
    if (result === 'loss') return '💔';
    return '🤝';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatRatingChange = (change: number): string => {
    return change >= 0 ? `+${change}` : `${change}`;
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      size="md"
      placement="center"
      isDark={isDark}
    >
      <Animated.View
        entering={SlideInUp.duration(300).springify()}
        style={styles.container}
      >
        {/* Result Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: getResultBgColor(),
            },
          ]}
        >
          <Text style={styles.resultIcon}>{getResultIcon()}</Text>
          <Text
            {...textVariants.display}
            style={[
              styles.resultTitle,
              { color: getResultColor() },
            ]}
          >
            {getResultTitle()}
          </Text>
          <Text
            {...textVariants.body}
            style={{ color: getColor(colorTokens.neutral[600], isDark) }}
          >
            {getResultSubtitle()}
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatRow
            label="Duration"
            value={formatDuration(stats.duration)}
            isDark={isDark}
          />
          <StatRow
            label="Total Moves"
            value={stats.totalMoves.toString()}
            isDark={isDark}
          />

          {stats.accuracy && (
            <>
              <StatRow
                label="Your Accuracy"
                value={`${stats.accuracy.player}%`}
                valueColor={getAccuracyColor(stats.accuracy.player, isDark)}
                isDark={isDark}
              />
              <StatRow
                label="Opponent Accuracy"
                value={`${stats.accuracy.opponent}%`}
                valueColor={getAccuracyColor(stats.accuracy.opponent, isDark)}
                isDark={isDark}
              />
            </>
          )}

          {stats.ratingChange && (
            <View style={styles.ratingChangeContainer}>
              <View
                style={[
                  styles.ratingChangeBadge,
                  {
                    backgroundColor:
                      stats.ratingChange.player >= 0
                        ? getColor(colorTokens.green[100], isDark)
                        : getColor(colorTokens.red[100], isDark),
                  },
                ]}
              >
                <Text
                  {...textVariants.title}
                  style={{
                    color:
                      stats.ratingChange.player >= 0
                        ? getColor(colorTokens.green[700], isDark)
                        : getColor(colorTokens.red[700], isDark),
                    fontWeight: '700',
                  }}
                >
                  {formatRatingChange(stats.ratingChange.player)}
                </Text>
                <Text
                  {...textVariants.caption}
                  style={{ color: getColor(colorTokens.neutral[600], isDark) }}
                >
                  Rating
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onReview && (
            <Button
              variant="primary"
              onPress={onReview}
              style={styles.actionButton}
            >
              Review Game
            </Button>
          )}

          <View style={styles.secondaryActions}>
            {onRematch && (
              <Button
                variant="outline"
                onPress={onRematch}
                style={styles.secondaryButton}
              >
                Rematch
              </Button>
            )}
            {onNewGame && (
              <Button
                variant="ghost"
                onPress={onNewGame}
                style={styles.secondaryButton}
              >
                New Game
              </Button>
            )}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

type StatRowProps = {
  label: string;
  value: string;
  valueColor?: string;
  isDark: boolean;
};

const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  valueColor,
  isDark,
}) => (
  <View style={styles.statRow}>
    <Text
      {...textVariants.body}
      style={{ color: getColor(colorTokens.neutral[600], isDark) }}
    >
      {label}
    </Text>
    <Text
      {...textVariants.body}
      style={{
        color: valueColor || getColor(colorTokens.neutral[900], isDark),
        fontWeight: '600',
      }}
    >
      {value}
    </Text>
  </View>
);

const getAccuracyColor = (accuracy: number, isDark: boolean): string => {
  if (accuracy >= 90) return getColor(colorTokens.green[600], isDark);
  if (accuracy >= 80) return getColor(colorTokens.blue[600], isDark);
  if (accuracy >= 70) return getColor(colorTokens.orange[600], isDark);
  return getColor(colorTokens.red[600], isDark);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacingTokens[6],
    paddingHorizontal: spacingScale.gutter,
    borderTopLeftRadius: radiusTokens.lg,
    borderTopRightRadius: radiusTokens.lg,
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: spacingTokens[2],
  },
  resultTitle: {
    fontWeight: '700',
    marginBottom: spacingTokens[1],
  },
  statsContainer: {
    padding: spacingScale.gutter,
    gap: spacingTokens[3],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingChangeContainer: {
    alignItems: 'center',
    marginTop: spacingTokens[3],
  },
  ratingChangeBadge: {
    paddingVertical: spacingTokens[3],
    paddingHorizontal: spacingTokens[5],
    borderRadius: radiusTokens.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  actions: {
    padding: spacingScale.gutter,
    gap: spacingTokens[3],
  },
  actionButton: {
    width: '100%',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacingTokens[2],
  },
  secondaryButton: {
    flex: 1,
  },
});
