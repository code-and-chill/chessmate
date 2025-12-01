/**
 * Drawer Index Route
 * app/(drawer)/index.tsx
 * 
 * Redirects to the default screen (Play)
 */

import { Redirect } from 'expo-router';

export default function DrawerIndex() {
  return <Redirect href="/(drawer)/play" />;
}
