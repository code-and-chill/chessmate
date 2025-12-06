import React from 'react';
import { ViewStyle } from 'react-native';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, Text } from '@/ui';

type Props = {
  title?: string;
  description?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export default function Section({ title, description, children, style }: Props) {
  return (
    <Panel variant="glass" padding={20} style={style}>
      <VStack gap={2}>
        {title && <Text variant="title" weight="semibold">{title}</Text>}
        {description && <Text variant="body" color="#737373">{description}</Text>}
        {children}
      </VStack>
    </Panel>
  );
}
