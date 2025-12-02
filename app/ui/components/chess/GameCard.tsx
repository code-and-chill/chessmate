/**
 * Chess UI Components
 * app/ui/components/chess/GameCard.tsx
 * 
 * Production-grade chess game cards with states and interactions
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../primitives/Text';
import { Card } from '../../primitives/Card';
import { Badge } from '../../primitives/Badge';
import { Avatar } from '../../primitives/Avatar';
import { spacingTokens, spacingScale } from '../../tokens/spacing';
import { radiusTokens } from '../../tokens/radii';
import { microInteractions } from '../../tokens/motion';
import { colorTokens, getColor } from '../../tokens/colors';

// ==================== TYPES ====================

export type GameStatus = 'active' | 'completed' | 'pending' | 'abandoned';
export type GameResult = 'win' | 'loss' | 'draw' | null;

export type Player = {
  id: string;
  username: string;
  rating: number;
  avatar?: string;
  country?: string;
};

export type GameCardProps = {
  gameId: string;
  players: {
    white: Player;
    black: Player;
  };
  currentTurn?: 'white' | 'black';
  timeControl?: string;
  status: GameStatus;
  result?: GameResult;
  userColor?: 'white' | 'black';
  lastMove?: string;
  moveCount?: number;
  onPress?: () => void;
  isDark?: boolean;
};

// ==================== GAME CARD ====================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GameCard: React.FC<GameCardProps> = ({
  gameId,
  players,
  currentTurn,
  timeControl,
  status,
  result,
  userColor,
  lastMove,
  moveCount,
  onPress,
  isDark = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }), []);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(microInteractions.scalePress, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Live</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Starting</Badge>;
      case 'completed':
        if (result && userColor) {
          if (result === 'draw') {
            return <Badge variant="default" size="sm">Draw</Badge>;
          }
          const userWon =
            (result === 'win' && currentTurn !== userColor) ||
            (result === 'loss' && currentTurn === userColor);
          return (
            <Badge variant={userWon ? 'success' : 'destructive'} size="sm">
              {userWon ? 'Won' : 'Lost'}
            </Badge>
          );
        }
        return <Badge variant="default" size="sm">Finished</Badge>;
      case 'abandoned':
        return <Badge variant="default" size="sm">Abandoned</Badge>;
      default:
        return null;
    }
  };

  const Wrapper = onPress ? AnimatedPressable : View;

  return (
    <Wrapper
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Card
        variant="default"
        size="md"
        animated={false}
        style={styles.card}
      >
        {/* Header: Status and Time Control */}
        <View style={styles.header}>
          {getStatusBadge()}
          {timeControl && (
            <Text size="sm" color={getColor(colorTokens.neutral[600], isDark)}>
              {timeControl}
            </Text>
          )}
        </View>

        {/* Players */}
        <View style={styles.players}>
          {/* White Player */}
          <View style={styles.player}>
            <Avatar
              src={players.white.avatar}
              size="md"
              fallback={players.white.username[0].toUpperCase()}
            />
            <View style={styles.playerInfo}>
              <Text size="base" weight="semibold" numberOfLines={1}>
                {players.white.username}
              </Text>
              <Text size="sm" color={getColor(colorTokens.neutral[600], isDark)}>
                {players.white.rating}
              </Text>
            </View>
            {currentTurn === 'white' && status === 'active' && (
              <View style={styles.turnIndicator} />
            )}
          </View>

          {/* VS Divider */}
          <Text
            size="xs"
            weight="semibold"
            color={getColor(colorTokens.neutral[500], isDark)}
          >
            VS
          </Text>

          {/* Black Player */}
          <View style={styles.player}>
            <Avatar
              src={players.black.avatar}
              size="md"
              fallback={players.black.username[0].toUpperCase()}
            />
            <View style={styles.playerInfo}>
              <Text size="base" weight="semibold" numberOfLines={1}>
                {players.black.username}
              </Text>
              <Text size="sm" color={getColor(colorTokens.neutral[600], isDark)}>
                {players.black.rating}
              </Text>
            </View>
            {currentTurn === 'black' && status === 'active' && (
              <View style={styles.turnIndicator} />
            )}
          </View>
        </View>

        {/* Footer: Move info */}
        {(lastMove || moveCount !== undefined) && (
          <View style={styles.footer}>
            {moveCount !== undefined && (
              <Text size="sm" color={getColor(colorTokens.neutral[600], isDark)}>
                Move {moveCount}
              </Text>
            )}
            {lastMove && (
              <Text
                size="sm"
                weight="semibold"
                color={getColor(colorTokens.neutral[800], isDark)}
              >
                {lastMove}
              </Text>
            )}
          </View>
        )}
      </Card>
    </Wrapper>
  );
};

GameCard.displayName = 'GameCard';

// ==================== STYLES ====================

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingScale.md,
  },
  
  players: {
    gap: spacingTokens[3],
  },
  
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.md,
  },
  
  playerInfo: {
    flex: 1,
  },
  
  turnIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacingScale.md,
    paddingTop: spacingScale.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
