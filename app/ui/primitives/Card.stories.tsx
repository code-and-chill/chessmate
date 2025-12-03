import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    padding: { control: 'number' },
    shadow: {
      control: 'select',
      options: ['card', 'panel', 'floating'],
    },
    borderWidth: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <Text variant="title">Default Card</Text>
      <Text variant="body" style={{ marginTop: 8 }}>
        This is a card with default styling.
      </Text>
    </Card>
  ),
};

export const Shadows: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Card shadow="card">
        <Text variant="title">Card Shadow</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          Standard card elevation
        </Text>
      </Card>

      <Card shadow="panel">
        <Text variant="title">Panel Shadow</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          Deeper shadow for panels
        </Text>
      </Card>

      <Card shadow="floating">
        <Text variant="title">Floating Shadow</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          Highest elevation for floating elements
        </Text>
      </Card>
    </View>
  ),
};

export const Padding: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Card padding={4}>
        <Text variant="title">Compact Padding (16px)</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Less breathing room for dense layouts.
        </Text>
      </Card>

      <Card padding={6}>
        <Text variant="title">Default Padding (24px)</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Standard comfortable spacing.
        </Text>
      </Card>

      <Card padding={8}>
        <Text variant="title">Spacious Padding (32px)</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Extra breathing room for emphasis.
        </Text>
      </Card>
    </View>
  ),
};

export const WithBorder: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Card borderColor="#3B82F6" borderWidth={1}>
        <Text variant="title" style={{ color: '#3B82F6' }}>
          Blue Border
        </Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Card with a subtle blue border.
        </Text>
      </Card>

      <Card borderColor="#10B981" borderWidth={2}>
        <Text variant="title" style={{ color: '#10B981' }}>
          Green Border (2px)
        </Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Thicker border for emphasis.
        </Text>
      </Card>
    </View>
  ),
};

export const ContentExamples: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {/* Profile Card */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>JD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="title">John Doe</Text>
            <Text variant="caption" style={{ color: '#737373' }}>
              Rating: 1450 • 42 games
            </Text>
          </View>
        </View>
      </Card>

      {/* Stats Card */}
      <Card shadow="panel">
        <Text variant="title" style={{ marginBottom: 12 }}>
          Performance
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading" style={{ color: '#3B82F6' }}>
              147
            </Text>
            <Text variant="caption" style={{ color: '#737373' }}>
              Solved
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading" style={{ color: '#10B981' }}>
              89%
            </Text>
            <Text variant="caption" style={{ color: '#737373' }}>
              Success
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading" style={{ color: '#F59E0B' }}>
              🔥 7
            </Text>
            <Text variant="caption" style={{ color: '#737373' }}>
              Streak
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Card */}
      <Card borderColor="#8B5CF6" borderWidth={1}>
        <Text variant="title" style={{ color: '#8B5CF6' }}>
          Daily Puzzle
        </Text>
        <Text variant="body" style={{ marginTop: 4, marginBottom: 12 }}>
          Sharpen your tactical skills with today's puzzle.
        </Text>
        <View
          style={{
            padding: 12,
            backgroundColor: '#8B5CF6',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Start Puzzle →</Text>
        </View>
      </Card>
    </View>
  ),
};
