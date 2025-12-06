import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SocialScreen } from './screens/SocialScreen';
import { useColors } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function SocialEntry() {
  const { user } = useAuth();
  const userId = user?.id;
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}> 
      {userId && <SocialScreen userId={userId} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
