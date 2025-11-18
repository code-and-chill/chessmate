import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from 'react-native';
import { Colors } from '@/core/constants';
import { IconSymbol } from '@/ui';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: tint,
        drawerType: 'permanent',
      }}
    >
      <Drawer.Screen
        name="play"
        options={{
          title: 'Play',
          drawerIcon: ({ color, size }) => <IconSymbol size={size} name="gamecontroller.fill" color={color} />,
          headerTitle: 'Live Chess',
        }}
      />
      <Drawer.Screen
        name="puzzle"
        options={{
          title: 'Puzzle',
          drawerIcon: ({ color, size }) => <IconSymbol size={size} name="brain.head.profile" color={color} />,
          headerTitle: 'Daily Puzzle',
        }}
      />
      <Drawer.Screen
        name="learn"
        options={{
          title: 'Learn',
          drawerIcon: ({ color, size }) => <IconSymbol size={size} name="book.fill" color={color} />,
          headerTitle: 'Lessons & Tactics',
        }}
      />
      <Drawer.Screen
        name="watch"
        options={{
          title: 'Watch',
          drawerIcon: ({ color, size }) => <IconSymbol size={size} name="play.rectangle.fill" color={color} />,
          headerTitle: 'Watch & Streams',
        }}
      />
      <Drawer.Screen
        name="social"
        options={{
          title: 'Social',
          drawerIcon: ({ color, size }) => <IconSymbol size={size} name="person.2.fill" color={color} />,
          headerTitle: 'Friends & Clubs',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => <IconSymbol size={size} name="gearshape.fill" color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Drawer>
  );
}
