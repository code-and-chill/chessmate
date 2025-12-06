import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, Text } from '@/ui';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

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

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {options.map((tc) => (
            <TouchableOpacity
              key={tc}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 2,
                backgroundColor: value === tc ? 'rgba(102, 126, 234, 0.15)' : colors.background.secondary,
                borderColor: value === tc ? colors.accent.primary : 'transparent',
                marginRight: 8,
                marginBottom: 8,
              }}
              onPress={() => onChange(tc)}
              activeOpacity={0.7}
            >
              <Text variant="label" weight="semibold" color={value === tc ? colors.accent.primary : colors.foreground.secondary}>
                {tc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </VStack>
    </Panel>
  );
};


