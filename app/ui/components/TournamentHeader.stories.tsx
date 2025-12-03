import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { TournamentHeader } from './TournamentHeader';

const meta: Meta<typeof TournamentHeader> = {
  title: 'Components/TournamentHeader',
  component: TournamentHeader,
  decorators: [
    (Story) => (
      <View>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TournamentHeader>;

export const Default: Story = {
  args: {
    title: 'Chessmate Tournament',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Chessmate Tournament',
    subtitle: 'Round 3 of 8 • Starting soon',
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Chessmate Tournament',
    badge: 'ACTIVE',
  },
};

export const Complete: Story = {
  args: {
    title: 'Chessmate Tournament',
    subtitle: 'Round 3 of 8 • Starting soon',
    badge: 'ACTIVE',
  },
};

export const AllVariations: Story = {
  render: () => (
    <View>
      <TournamentHeader title="Basic Tournament" />
      <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 }} />
      <TournamentHeader
        title="With Subtitle"
        subtitle="Round 5 of 10 • Swiss System"
      />
      <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 }} />
      <TournamentHeader title="With Badge" badge="LIVE" />
      <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 }} />
      <TournamentHeader
        title="Complete Example"
        subtitle="Grand Final • Best of 3"
        badge="COMPLETED"
      />
    </View>
  ),
};
