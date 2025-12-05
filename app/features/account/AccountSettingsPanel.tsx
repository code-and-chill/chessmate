import React from 'react';
import { VStack, Text, Card, Button } from '@/ui';

export const AccountSettingsPanel: React.FC = () => {
  return (
    <VStack gap={4} fullWidth>
      <Text variant="heading">Account</Text>
      <Card>
        <VStack gap={2}>
          <Text variant="body">Email: hidden@example.com</Text>
          <Text variant="body">Two-factor: Disabled</Text>
          <Button variant="subtle">Manage Account</Button>
        </VStack>
      </Card>
    </VStack>
  );
};

export default AccountSettingsPanel;
