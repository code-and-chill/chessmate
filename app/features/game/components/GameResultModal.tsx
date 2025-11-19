import { Modal, Pressable } from 'react-native';
import { Box } from '@/ui/primitives/Box';
import { Surface } from '@/ui/primitives/Surface';
import { Text } from '@/ui/primitives/Text';
import { Button } from '@/ui/primitives/Button';
import { Badge } from '@/ui/primitives/Badge';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';

export interface GameResultModalProps {
  visible: boolean;
  result: '1-0' | '0-1' | '1/2-1/2';
  reason: string;
  isPlayerWhite: boolean;
  onClose: () => void;
  onRematch?: () => void;
  onNewGame?: () => void;
}

export const GameResultModal = ({
  visible,
  result,
  reason,
  isPlayerWhite,
  onClose,
  onRematch,
  onNewGame,
}: GameResultModalProps) => {
  const { colors } = useThemeTokens();

  const getResultText = () => {
    if (result === '1/2-1/2') {
      return { title: 'Draw', subtitle: 'Game Drawn', variant: 'neutral' as const };
    }
    
    const playerWon = (result === '1-0' && isPlayerWhite) || (result === '0-1' && !isPlayerWhite);
    
    if (playerWon) {
      return { title: 'You Win!', subtitle: 'Congratulations!', variant: 'success' as const };
    } else {
      return { title: 'You Lost', subtitle: 'Better luck next time', variant: 'error' as const };
    }
  };

  const resultText = getResultText();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacingTokens[4],
        }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Surface
            variant="default"
            style={{
              padding: spacingTokens[6],
              borderRadius: radiusTokens.xl,
              minWidth: 300,
              maxWidth: 400,
            }}
          >
            <Box gap={spacingTokens[4]} alignItems="center">
              <Badge variant={resultText.variant} size="lg">
                {result}
              </Badge>

              <Text
                variant="heading"
                weight="bold"
                color={colors.foreground.primary}
                style={{ fontSize: 32, textAlign: 'center' }}
              >
                {resultText.title}
              </Text>

              <Text
                variant="body"
                color={colors.foreground.secondary}
                style={{ fontSize: 18, textAlign: 'center' }}
              >
                {resultText.subtitle}
              </Text>

              <Box
                style={{
                  backgroundColor: colors.background.secondary,
                  padding: spacingTokens[3],
                  borderRadius: radiusTokens.md,
                  width: '100%',
                }}
              >
                <Text
                  variant="body"
                  color={colors.foreground.muted}
                  style={{ textAlign: 'center', fontSize: 14 }}
                >
                  {reason}
                </Text>
              </Box>

              <Box gap={spacingTokens[3]} style={{ width: '100%', marginTop: spacingTokens[4] }}>
                {onRematch && (
                  <Button variant="solid" onPress={onRematch} style={{ width: '100%' }}>
                    Rematch
                  </Button>
                )}
                {onNewGame && (
                  <Button variant="outline" onPress={onNewGame} style={{ width: '100%' }}>
                    New Game
                  </Button>
                )}
                <Button variant="outline" onPress={onClose} style={{ width: '100%' }}>
                  Close
                </Button>
              </Box>
            </Box>
          </Surface>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
