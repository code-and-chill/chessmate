import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    icon: { control: 'text' },
    trend: {
      control: 'select',
      options: [undefined, 'up', 'down', 'neutral'],
    },
    trendValue: { control: 'text' },
    delay: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    value: '147',
    label: 'Puzzles Solved',
  },
};

export const WithIcon: Story = {
  args: {
    value: '🔥 7',
    label: 'Day Streak',
  },
};

export const WithTrend: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <StatCard value="1450" label="Rating" trend="up" trendValue="+25" />
      <StatCard value="342" label="Games" trend="neutral" trendValue="0" />
      <StatCard value="89%" label="Accuracy" trend="down" trendValue="-2%" />
    </View>
  ),
};

export const StatsGrid: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard value="147" label="Solved" delay={0} />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="1450" label="Rating" delay={50} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard value="🔥 7" label="Streak" delay={100} />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="89%" label="Success" delay={150} />
        </View>
      </View>
    </View>
  ),
};

export const MetricsDashboard: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {/* Performance Metrics */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard value="1450" label="Rating" trend="up" trendValue="+25" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="342" label="Games Played" trend="neutral" trendValue="0" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="89%" label="Win Rate" trend="up" trendValue="+3%" />
        </View>
      </View>

      {/* Activity Metrics */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard value="🔥 7" label="Day Streak" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="⚡ 147" label="Puzzles" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="🏆 12" label="Tournaments" />
        </View>
      </View>

      {/* Time Metrics */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard value="42h" label="Total Play Time" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="12m" label="Avg Game" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard value="1.5k" label="Moves Made" />
        </View>
      </View>
    </View>
  ),
};
