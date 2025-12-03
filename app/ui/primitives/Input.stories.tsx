import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text as RNText } from 'react-native';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    editable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Invalid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    editable: false,
  },
};

export const WithAccessories: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftAccessory: <RNText>🔍</RNText>,
    rightAccessory: <RNText>❌</RNText>,
  },
};

export const FocusStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Input label="Normal" placeholder="Click to focus" />
      <Input label="With Error" placeholder="Has error" error="Error message" />
      <Input label="Disabled" placeholder="Cannot edit" editable={false} />
    </View>
  ),
};
