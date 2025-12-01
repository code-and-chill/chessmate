import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, useColorScheme } from 'react-native';

import { IconSymbol } from '@/ui';
import { Colors } from '@/core/constants';
import { useThemeTokens } from '@/ui';

function HeaderActions() {
  const router = useRouter();
  const { mode, setMode } = useThemeTokens();
  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingRight: 12 }}>
      <TouchableOpacity onPress={() => router.push('/search')} accessibilityLabel="Search">
        <IconSymbol size={22} name="magnifyingglass" color={Colors.light.tint} />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggle} accessibilityLabel="Toggle Theme">
        <IconSymbol size={22} name={mode === 'dark' ? 'sun.max.fill' : 'moon.fill'} color={Colors.light.tint} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerRight: () => <HeaderActions />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamecontroller.fill" color={color} />,
          headerTitle: 'Live Chess',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Puzzle',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="brain.head.profile" color={color} />,
          headerTitle: 'Daily Puzzle',
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          headerTitle: 'Lessons & Tactics',
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: 'Watch',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="play.rectangle.fill" color={color} />,
          headerTitle: 'Watch & Streams',
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          headerTitle: 'Friends & Clubs',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}
