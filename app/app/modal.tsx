import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, Box } from '@/ui';

export default function ModalScreen() {
  return (
    <Box style={styles.container}>
      <Text variant="heading" size="xl">This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text variant="body" color="blue">Go to home screen</Text>
      </Link>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
