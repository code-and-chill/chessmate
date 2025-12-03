import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Alert } from 'react-native';
import { FeatureCard } from './FeatureCard';

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    progress: { control: 'text' },
    delay: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    icon: '🌐',
    title: 'Online Play',
    description: 'Find opponents worldwide and compete in real-time matches',
    onPress: () => Alert.alert('Online Play', 'Opening online play mode...'),
  },
};

export const WithProgress: Story = {
  args: {
    icon: '🎯',
    title: 'Daily Puzzle',
    description: 'Sharpen your skills with curated chess puzzles',
    progress: '147 solved • 1450 rating',
    onPress: () => Alert.alert('Daily Puzzle', 'Opening puzzle mode...'),
  },
};

export const FeatureShowcase: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <FeatureCard
        icon="🌐"
        title="Online Play"
        description="Find opponents worldwide"
        progress="1245 rating • 34 games"
        onPress={() => Alert.alert('Online Play')}
        delay={0}
      />
      <FeatureCard
        icon="🤖"
        title="Play vs Bot"
        description="Practice with AI opponents"
        progress="Difficulty: Intermediate"
        onPress={() => Alert.alert('Bot Play')}
        delay={100}
      />
      <FeatureCard
        icon="👥"
        title="Play with Friend"
        description="Challenge your friends locally"
        onPress={() => Alert.alert('Friend Play')}
        delay={200}
      />
      <FeatureCard
        icon="🎯"
        title="Daily Puzzle"
        description="Solve tactical puzzles"
        progress="🔥 7 day streak"
        onPress={() => Alert.alert('Puzzles')}
        delay={300}
      />
    </View>
  ),
};
