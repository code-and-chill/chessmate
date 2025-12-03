import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    name: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away'],
    },
    image: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Avatar name="John Doe" size="sm" />
      <Avatar name="John Doe" size="md" />
      <Avatar name="John Doe" size="lg" />
    </View>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Avatar name="Alice" status="online" />
      <Avatar name="Bob" status="offline" />
      <Avatar name="Charlie" status="away" />
    </View>
  ),
};

export const WithImage: Story = {
  args: {
    name: 'Jane Smith',
    image: 'https://i.pravatar.cc/150?img=5',
  },
};

export const InitialVariations: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
      <Avatar name="Alice Anderson" />
      <Avatar name="Bob Brown" />
      <Avatar name="Charlie Chen" />
      <Avatar name="Diana Davis" />
      <Avatar name="Eve Evans" />
      <Avatar name="Frank Foster" />
    </View>
  ),
};

export const AllCombinations: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {['sm', 'md', 'lg'].map((size) => (
        <View key={size} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Avatar name="User" size={size as any} />
          <Avatar name="Online" size={size as any} status="online" />
          <Avatar name="Away" size={size as any} status="away" />
          <Avatar name="Offline" size={size as any} status="offline" />
        </View>
      ))}
    </View>
  ),
};
