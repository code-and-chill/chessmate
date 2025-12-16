import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { 
  Card, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  useThemeTokens,
  Box,
  Icon,
  ChoiceChip,
  Grid,
  SelectionCard,
} from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useI18n } from '@/i18n/I18nContext';
import { spacingScale, spacingTokens, touchTargets } from '@/ui/tokens/spacing';

type BotDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';
type PlayerColor = 'white' | 'black' | 'random';

interface BotLevel {
  id: BotDifficulty;
  label: string;
  icon: string;
  rating: number;
}

export default function BotPlayScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { createBotGame, isCreatingGame } = useGame();
  
  const BOT_LEVELS: BotLevel[] = useMemo(() => [
    { id: 'beginner', label: t('game_modes.beginner'), icon: 'person', rating: 400 },
    { id: 'easy', label: t('game_modes.easy'), icon: 'person', rating: 800 },
    { id: 'medium', label: t('game_modes.intermediate'), icon: 'target', rating: 1200 },
    { id: 'hard', label: t('game_modes.advanced'), icon: 'bolt', rating: 1600 },
    { id: 'expert', label: t('game_modes.master'), icon: 'flame', rating: 2000 },
    { id: 'master', label: t('game_modes.grandmaster'), icon: 'trophy', rating: 2400 },
  ], [t]);
  
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('random');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleStartGame = async () => {
    try {
      const gameId = await createBotGame({
        difficulty,
        playerColor: playerColor === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : playerColor,
      });
      
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to create bot game:', error);
    }
  };

  // Responsive layout - shared constants
  const gridColumns = width < 500 ? 1 : 2;
  const maxWidth = gridColumns === 1 ? 400 : Math.min(700, width - spacingTokens[6] * 2);

  const getDifficultyColor = (id: BotDifficulty) => {
    switch (id) {
      case 'beginner':
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.info;
      case 'hard':
        return colors.warning;
      case 'expert':
      case 'master':
        return colors.error;
      default:
        return colors.accent.primary;
    }
  };

  if (isCreatingGame) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <VStack 
          flex={1} 
          justifyContent="center" 
          alignItems="center" 
          gap={spacingTokens[4]}
          style={{ paddingHorizontal: spacingTokens[6] }}
        >
          <Animated.View entering={FadeInUp.duration(400)}>
            <Box
              width={80}
              height={80}
              radius="full"
              alignItems="center"
              justifyContent="center"
              backgroundColor={colors.accent.primary + '15'}
            >
              <ActivityIndicator size="large" color={colors.accent.primary} />
            </Box>
          </Animated.View>
          
          <VStack gap={spacingTokens[2]} alignItems="center" style={{ maxWidth: 400 }}>
            <Text variant="title" weight="bold" style={{ color: colors.foreground.primary }}>
              {t('game_modes.preparing_game')}
            </Text>
            <Text variant="body" style={{ color: colors.foreground.secondary, textAlign: 'center' }}>
              Setting up your game with the bot...
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VStack 
          gap={spacingTokens[5]} 
          style={[
            styles.content,
            { 
              paddingHorizontal: spacingScale.gutter,
              paddingTop: spacingTokens[4],
              paddingBottom: spacingTokens[8],
              maxWidth,
            }
          ]}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={spacingTokens[2]} alignItems="center">
              <HStack gap={spacingTokens[2]} alignItems="center">
                <Box
                  width={48}
                  height={48}
                  radius="full"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={colors.accent.primary + '15'}
                >
                  <Icon name="robot" size={28} color={colors.accent.primary} />
                </Box>
                <Text variant="display" weight="bold" style={[styles.title, { color: colors.accent.primary }]}>
                  {t('game_modes.play_vs_bot')}
                </Text>
              </HStack>
              <Text variant="body" style={[styles.subtitle, { color: colors.foreground.secondary }]}>
                Practice against AI opponents of varying strength
              </Text>
            </VStack>
          </Animated.View>

          {/* Difficulty Selection - Grid Layout */}
          <VStack gap={spacingTokens[3]}>
            <Text variant="label" weight="semibold" style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
              {t('game_modes.bot_difficulty')}
            </Text>
            <Grid gap={spacingTokens[3]} columns={gridColumns}>
              {BOT_LEVELS.map((bot, idx) => (
                <SelectionCard
                  key={bot.id}
                  label={bot.label}
                  subtitle={`Rating: ${bot.rating}`}
                  icon={bot.icon}
                  accentColor={getDifficultyColor(bot.id)}
                  isSelected={difficulty === bot.id}
                  onSelect={() => setDifficulty(bot.id)}
                  index={idx}
                  accessibilityLabel={`Select ${bot.label} difficulty`}
                />
              ))}
            </Grid>
          </VStack>

          {/* Color Selection */}
          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <Card variant="elevated" size="md">
              <VStack gap={spacingTokens[3]}>
                <Text variant="label" weight="semibold" style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  {t('game_modes.play_as')}
                </Text>
                <HStack gap={spacingTokens[2]} alignItems="center">
                  {(['white', 'black', 'random'] as PlayerColor[]).map((color) => (
                    <ColorChip
                      key={color}
                      color={color}
                      isSelected={playerColor === color}
                      onSelect={() => setPlayerColor(color)}
                      colors={colors}
                      t={t}
                    />
                  ))}
                </HStack>
              </VStack>
            </Card>
          </Animated.View>

          {/* Start Game Button */}
          <Animated.View entering={FadeInUp.delay(800).duration(400)}>
            <Button 
              variant="primary" 
              size="lg" 
              onPress={handleStartGame}
              style={styles.startButton}
            >
              {t('game_modes.start_game')}
            </Button>
          </Animated.View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

// Color Chip Component
interface ColorChipProps {
  color: PlayerColor;
  isSelected: boolean;
  onSelect: () => void;
  colors: ReturnType<typeof useThemeTokens>['colors'];
  t: (key: string) => string;
}

const ColorChip: React.FC<ColorChipProps> = ({ color, isSelected, onSelect, colors, t }) => {
  const getIcon = () => {
    if (color === 'white') {
      return (
        <Box
          width={16}
          height={16}
          radius="full"
          backgroundColor="#FFFFFF"
          borderWidth={1.5}
          borderColor={colors.border}
        />
      );
    }
    if (color === 'black') {
      return (
        <Box
          width={16}
          height={16}
          radius="full"
          backgroundColor="#000000"
        />
      );
    }
    return (
      <Icon 
        name="bolt" 
        size={16} 
        color={isSelected ? colors.accent.primary : colors.foreground.secondary} 
      />
    );
  };

  return (
    <ChoiceChip
      label={t(`game_modes.${color}`)}
      icon={getIcon()}
      selected={isSelected}
      onPress={onSelect}
      flex={true}
      style={styles.colorChip}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  colorChip: {
    flex: 1,
    minHeight: touchTargets.minimum,
  },
  startButton: {
    width: '100%',
    marginTop: spacingTokens[2],
  },
});
