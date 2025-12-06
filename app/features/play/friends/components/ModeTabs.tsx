import React from 'react';
import Tabs, { TabItem } from '@/ui/components/Tabs';
import { useI18n } from '@/i18n/I18nContext';

type Props = {
  mode: 'local' | 'create' | 'join';
  onChange: (m: 'local' | 'create' | 'join') => void;
  colors?: any;
};

export default function ModeTabs({ mode, onChange }: Props) {
  const { t } = useI18n();

  const tabs: TabItem[] = [
    { id: 'local', icon: '📱', label: t('game_modes.play_local') },
    { id: 'create', icon: '➕', label: t('game_modes.create_challenge') },
    { id: 'join', icon: '🔗', label: t('game_modes.join_challenge') },
  ];

  return (
    <Tabs
      items={tabs}
      selectedId={mode}
      onSelect={(id) => onChange(id as Props['mode'])}
      size="md"
    />
  );
}
