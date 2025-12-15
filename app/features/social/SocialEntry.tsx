import React from 'react';
import { SocialScreen } from './screens/SocialScreen';
import { Box, useColors } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function SocialEntry() {
  const { user } = useAuth();
  const userId = user?.id;
  const colors = useColors();

  return (
    <Box flex={1} backgroundColor={colors.background.primary}>
      {userId && <SocialScreen userId={userId} />}
    </Box>
  );
}
