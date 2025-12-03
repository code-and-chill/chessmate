import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Tag',
  component: Tag,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    style: {
      control: 'select',
      options: ['filled', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    label: 'Default Tag',
  },
};

export const SemanticVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Tag label="Default" variant="default" />
      <Tag label="Success" variant="success" />
      <Tag label="Error" variant="error" />
      <Tag label="Warning" variant="warning" />
      <Tag label="Info" variant="info" />
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Tag label="Small Tag" size="sm" />
      <Tag label="Medium Tag" size="md" />
      <Tag label="Large Tag" size="lg" />
    </View>
  ),
};

export const Styles: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Tag label="Filled Success" variant="success" style="filled" />
      <Tag label="Outline Success" variant="success" style="outline" />
      <Tag label="Filled Error" variant="error" style="filled" />
      <Tag label="Outline Error" variant="error" style="outline" />
    </View>
  ),
};

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    
    return visible ? (
      <Tag
        label="Click × to dismiss"
        variant="info"
        onDismiss={() => setVisible(false)}
      />
    ) : (
      <RNText>Tag dismissed! Refresh to reset.</RNText>
    );
  },
};

export const AllCombinations: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      {['default', 'success', 'error', 'warning', 'info'].map((variant) => (
        <View key={variant} style={{ flexDirection: 'row', gap: 8 }}>
          <Tag label={variant} variant={variant as any} size="sm" />
          <Tag label={variant} variant={variant as any} size="md" />
          <Tag label={variant} variant={variant as any} size="lg" />
        </View>
      ))}
    </View>
  ),
};
