import React from 'react';
import { View } from 'react-native';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, Text, spacingTokens } from '@/ui';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import ChoiceChip from '@/ui/primitives/ChoiceChip';

type Color = 'white' | 'black' | 'random';

type Props = {
  value: Color;
  onChange: (v: Color) => void;
  label?: string;
};

export const PlayerColorSelector: React.FC<Props> = ({ value, onChange, label }) => {
  const { colors } = useThemeTokens();
  const { t } = useI18n();

  const choices: Color[] = ['white', 'black', 'random'];

  return (
    <Panel variant="glass" padding={20}>
      <VStack gap={3}>
        {label && (
          <Text variant="title" weight="semibold" color={colors.foreground.primary}>
            {label}
          </Text>
        )}

        <HStack gap={3}>
          {choices.map((color) => (
            <View key={color} style={{ flex: 1, marginVertical: spacingTokens[0] }}>
              <ChoiceChip
                label={
                  color === 'white' ? `⚪ ${t('game_modes.white')}` :
                  color === 'black' ? `⚫ ${t('game_modes.black')}` :
                  `🎲 ${t('game_modes.random')}`
                }
                selected={value === color}
                onPress={() => onChange(color)}
                flex
              />
            </View>
          ))}
        </HStack>
      </VStack>
    </Panel>
  );
};

export default PlayerColorSelector;
