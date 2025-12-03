import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { MatchCard } from './MatchCard';

const meta: Meta<typeof MatchCard> = {
  title: 'Components/MatchCard',
  component: MatchCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'completed', 'pending'],
    },
    animated: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MatchCard>;

export const Active: Story = {
  args: {
    player1: { name: 'Alice', avatar: 'A', rating: 2100 },
    player2: { name: 'Bob', avatar: 'B', rating: 2050 },
    score1: 2,
    score2: 1,
    status: 'active',
    animated: true,
  },
};

export const Completed: Story = {
  args: {
    player1: { name: 'Charlie', avatar: 'C', rating: 1950 },
    player2: { name: 'Diana', avatar: 'D', rating: 2000 },
    score1: 3,
    score2: 2,
    status: 'completed',
    animated: false,
  },
};

export const Pending: Story = {
  args: {
    player1: { name: 'Eve', avatar: 'E', rating: 1800 },
    player2: { name: 'Frank', avatar: 'F', rating: 1850 },
    score1: 0,
    score2: 0,
    status: 'pending',
    animated: false,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <MatchCard
        player1={{ name: 'Alice', avatar: 'A', rating: 2100 }}
        player2={{ name: 'Bob', avatar: 'B', rating: 2050 }}
        score1={2}
        score2={1}
        status="active"
        animated={false}
      />
      <MatchCard
        player1={{ name: 'Charlie', avatar: 'C', rating: 1950 }}
        player2={{ name: 'Diana', avatar: 'D', rating: 2000 }}
        score1={3}
        score2={2}
        status="completed"
        animated={false}
      />
      <MatchCard
        player1={{ name: 'Eve', avatar: 'E', rating: 1800 }}
        player2={{ name: 'Frank', avatar: 'F', rating: 1850 }}
        score1={0}
        score2={0}
        status="pending"
        animated={false}
      />
    </View>
  ),
};
