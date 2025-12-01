/**
 * Friend Mode Component
 * features/play/components/FriendMode.tsx
 */

import { useState } from 'react';
import { SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui/primitives/Stack';
import { Text } from '@/ui/primitives/Text';
import { Input } from '@/ui/primitives/Input';
import { Button } from '@/ui/primitives/Button';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export type FriendModeProps = {
  onBack: () => void;
  onStartGame: (friendId: string) => void;
};

export const FriendMode: React.FC<FriendModeProps> = ({ onBack, onStartGame }) => {
  const [friendId, setFriendId] = useState('');
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[50], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[600], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacingTokens[6] }}>
        <VStack gap={6}>
          <TouchableOpacity
            style={{ paddingVertical: spacingTokens[2], paddingHorizontal: spacingTokens[3], alignSelf: 'flex-start' }}
            onPress={onBack}
          >
            <Text variant="body" color={colors.accent}>
              ← Back
            </Text>
          </TouchableOpacity>

          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Text variant="heading" color={colors.foreground}>
              Friend Challenge
            </Text>
            <Text variant="body" color={colors.secondary}>
              Invite and play with friends
            </Text>
          </VStack>

          <Card variant="default" size="md">
            <VStack gap={4} style={{ padding: spacingTokens[4] }}>
              <Text variant="title" color={colors.foreground}>
                Enter Friend ID
              </Text>
              <Input
                placeholder="friend@example.com"
                value={friendId}
                onChangeText={setFriendId}
              />
              <Button
                variant="solid"
                size="md"
                onPress={() => friendId && onStartGame(friendId)}
                disabled={!friendId}
              >
                Send Invite
              </Button>
            </VStack>
          </Card>

          <Card variant="default" size="md">
            <VStack gap={2} style={{ padding: spacingTokens[4] }}>
              <Text variant="title" color={colors.foreground}>
                Your Game Link
              </Text>
              <Text variant="caption" color={colors.secondary}>
                Share this link with your friend
              </Text>
              <Text variant="body" color={colors.accent} style={{ fontFamily: 'monospace' }}>
                https://chessmate.com/game/abc123
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};
