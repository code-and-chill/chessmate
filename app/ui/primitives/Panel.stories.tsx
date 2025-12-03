import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Platform } from 'react-native';
import { Panel } from './Panel';
import { Text } from './Text';

const meta: Meta<typeof Panel> = {
  title: 'Primitives/Panel',
  component: Panel,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#E8E8E8' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['glass', 'solid', 'translucent'],
    },
    padding: { control: 'number' },
    blur: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  render: () => (
    <Panel>
      <Text variant="title">Default Panel</Text>
      <Text variant="body" style={{ marginTop: 8 }}>
        Glassmorphic panel with backdrop blur (iOS/Android).
      </Text>
    </Panel>
  ),
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Panel variant="glass">
        <Text variant="title">Glass Variant</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          {Platform.OS === 'web'
            ? 'Translucent background (blur not supported on web)'
            : 'Glassmorphic with backdrop blur'}
        </Text>
      </Panel>

      <Panel variant="solid">
        <Text variant="title">Solid Variant</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          Solid background without blur
        </Text>
      </Panel>

      <Panel variant="translucent">
        <Text variant="title">Translucent Variant</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          Semi-transparent without blur
        </Text>
      </Panel>
    </View>
  ),
};

export const Padding: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Panel padding={12}>
        <Text variant="title">Compact Padding (12px)</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Less space for dense information.
        </Text>
      </Panel>

      <Panel padding={16}>
        <Text variant="title">Default Padding (16px)</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Standard comfortable spacing.
        </Text>
      </Panel>

      <Panel padding={24}>
        <Text variant="title">Spacious Padding (24px)</Text>
        <Text variant="body" style={{ marginTop: 4 }}>
          Extra breathing room for emphasis.
        </Text>
      </Panel>
    </View>
  ),
};

export const BlurComparison: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Panel variant="glass" blur={true}>
        <Text variant="title">With Blur</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          {Platform.OS === 'web'
            ? 'Blur not supported on web'
            : 'Backdrop blur enabled (iOS/Android)'}
        </Text>
      </Panel>

      <Panel variant="glass" blur={false}>
        <Text variant="title">Without Blur</Text>
        <Text variant="caption" style={{ marginTop: 4, color: '#737373' }}>
          Fallback solid background
        </Text>
      </Panel>
    </View>
  ),
};

export const ContentExamples: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {/* Stats Panel */}
      <Panel variant="glass" padding={20}>
        <Text variant="title" style={{ marginBottom: 12 }}>
          Your Progress
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
              1450
            </Text>
            <Text variant="caption" style={{ color: '#737373' }}>
              Rating
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
      </Panel>

      {/* Feature Panel */}
      <Panel variant="glass" padding={24}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>⭐</Text>
          </View>
          <Text variant="title" style={{ textAlign: 'center' }}>
            Daily Puzzle
          </Text>
          <Text variant="body" style={{ textAlign: 'center', color: '#737373' }}>
            Rating: 1520 • Tactical Theme
          </Text>
          <View
            style={{
              marginTop: 8,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: '#3B82F6',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Play Now →</Text>
          </View>
        </View>
      </Panel>

      {/* Info Panel */}
      <Panel variant="solid" padding={16}>
        <Text variant="label" style={{ color: '#3B82F6', marginBottom: 8 }}>
          💡 Pro Tip
        </Text>
        <Text variant="body" style={{ color: '#525252' }}>
          Solve at least one puzzle daily to maintain your streak and improve your tactical skills.
        </Text>
      </Panel>
    </View>
  ),
};

export const NestedPanels: Story = {
  render: () => (
    <Panel variant="glass" padding={24}>
      <Text variant="title" style={{ marginBottom: 16 }}>
        Tournament Info
      </Text>
      <View style={{ gap: 12 }}>
        <Panel variant="solid" padding={12}>
          <Text variant="label" style={{ marginBottom: 4 }}>
            Tournament Name
          </Text>
          <Text variant="body">Grand Championship 2025</Text>
        </Panel>

        <Panel variant="solid" padding={12}>
          <Text variant="label" style={{ marginBottom: 4 }}>
            Status
          </Text>
          <Text variant="body" style={{ color: '#10B981' }}>
            ✓ Active
          </Text>
        </Panel>

        <Panel variant="solid" padding={12}>
          <Text variant="label" style={{ marginBottom: 4 }}>
            Participants
          </Text>
          <Text variant="body">128 players</Text>
        </Panel>
      </View>
    </Panel>
  ),
};
