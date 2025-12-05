import React from 'react';
import { VStack, Text, Card, Button } from '@/ui';

export const GameplaySettingsPanel: React.FC = () => {
  return (
    <VStack gap={4} fullWidth>
      <Text variant="heading">Gameplay</Text>
      <Card>
        <VStack gap={2}>
          <Text variant="body">Move Confirmation: Off</Text>
          <Text variant="body">Auto-Queen: On</Text>
          <Button variant="subtle">Manage Gameplay Settings</Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default GameplaySettingsPanel;
