import React from 'react';
import { VStack, Text, Card, Button } from '@/ui';

export const AccessibilitySettingsPanel: React.FC = () => {
  return (
    <VStack gap={4} fullWidth>
      <Text variant="heading">Accessibility</Text>
      <Card>
        <VStack gap={2}>
          <Text variant="body">High Contrast Mode: Off</Text>
          <Text variant="body">Reduce Motion: Off</Text>
          <Button variant="subtle">Accessibility Settings</Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default AccessibilitySettingsPanel;
