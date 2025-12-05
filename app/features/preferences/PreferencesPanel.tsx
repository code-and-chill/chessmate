import React from 'react';
import { VStack, Text, Card, Button } from '@/ui';

export const PreferencesPanel: React.FC = () => {
  return (
    <VStack gap={4} fullWidth>
      <Text variant="heading">Preferences</Text>
      <Card>
        <VStack gap={2}>
          <Text variant="body">Notifications: Enabled</Text>
          <Text variant="body">Language: English</Text>
          <Button variant="subtle">Manage Preferences</Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default PreferencesPanel;
