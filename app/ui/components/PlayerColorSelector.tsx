import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, Text, Icon } from '@/ui';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

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
            <TouchableOpacity
              key={color}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                alignItems: 'center',
                borderWidth: 2,
                backgroundColor: value === color ? 'rgba(102, 126, 234, 0.15)' : colors.background.secondary,
                borderColor: value === color ? colors.accent.primary : 'transparent',
              }}
              onPress={() => onChange(color)}
              activeOpacity={0.7}
            >
              <HStack gap={2} alignItems="center">
                {color === 'white' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border }} />}
                {color === 'black' && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#000000' }} />}
                {color === 'random' && <Icon name="bolt" size={14} color={value === color ? colors.accent.primary : colors.foreground.secondary} />}
                <Text variant="body" weight="semibold" color={value === color ? colors.accent.primary : colors.foreground.secondary}>
                  {color === 'white' && t('game_modes.white')}
                  {color === 'black' && t('game_modes.black')}
                  {color === 'random' && t('game_modes.random')}
                </Text>
              </HStack>
            </TouchableOpacity>
          ))}
        </HStack>
      </VStack>
    </Panel>
  );
};


