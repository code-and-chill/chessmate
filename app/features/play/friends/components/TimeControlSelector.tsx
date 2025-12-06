import React from 'react';
import { View } from 'react-native';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, Text, spacingTokens } from '@/ui';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import ChoiceChip from '@/ui/primitives/ChoiceChip';

type Props = {
  value: string;
  onChange: (tc: string) => void;
};

export const TimeControlSelector: React.FC<Props> = ({ value, onChange }) => {
  const { colors } = useThemeTokens();
  const { t } = useI18n();

  const options = ['1+0', '3+0', '5+0', '10+0', '15+10', '30+0'];

  return (
    <Panel variant="glass" padding={20}>
      <VStack gap={3}>
        <Text variant="title" weight="semibold" color={colors.foreground.primary}>
          {t('game_modes.time_control')}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' as const, margin: -spacingTokens[1] }}>
          {options.map((tc) => (
            <View key={tc} style={{ margin: spacingTokens[1] }}>
              <ChoiceChip
                label={tc}
                selected={value === tc}
                onPress={() => onChange(tc)}
              />
            </View>
          ))}
        </View>
      </VStack>
    </Panel>
  );
};

export default TimeControlSelector;
