import React from 'react';
import { VStack, Text, Card, Button } from '@/ui';

export const AppearancePanel: React.FC = () => {
  return (
    <VStack gap={4} fullWidth>
      <Text variant="heading">Appearance</Text>
      <Card>
        <VStack gap={2}>
          <Text variant="body">Theme: System</Text>
          <Button variant="subtle">Change Theme</Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default AppearancePanel;
