import React from 'react';
import { VStack, Text, Card, Button } from '@/ui';

export const BoardSettingsPanel: React.FC = () => {
  return (
    <VStack gap={4} fullWidth>
      <Text variant="heading">Board & Pieces</Text>
      <Card>
        <VStack gap={2}>
          <Text variant="body">Board Theme: Classic</Text>
          <Text variant="body">Piece Set: Staunton</Text>
          <Button variant="subtle">Change Board Theme</Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default BoardSettingsPanel;
