import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Primitives/Text',
  component: Text,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['heading', 'subheading', 'title', 'body', 'caption', 'label', 'hint'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'Default text',
  },
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text variant="heading">Heading Text (30px, bold)</Text>
      <Text variant="subheading">Subheading Text (20px, semibold)</Text>
      <Text variant="title">Title Text (18px, semibold)</Text>
      <Text variant="body">Body Text (16px, normal)</Text>
      <Text variant="caption">Caption Text (14px, normal)</Text>
      <Text variant="label">Label Text (14px, semibold)</Text>
      <Text variant="hint">Hint Text (12px, normal)</Text>
    </View>
  ),
};

export const Weights: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text variant="body" weight="normal">
        Normal weight (400)
      </Text>
      <Text variant="body" weight="medium">
        Medium weight (500)
      </Text>
      <Text variant="body" weight="semibold">
        Semibold weight (600)
      </Text>
      <Text variant="body" weight="bold">
        Bold weight (700)
      </Text>
    </View>
  ),
};

export const Colors: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Text variant="body" color="#171717">
        Dark Gray (#171717)
      </Text>
      <Text variant="body" color="#737373">
        Medium Gray (#737373)
      </Text>
      <Text variant="body" color="#3B82F6">
        Blue (#3B82F6)
      </Text>
      <Text variant="body" color="#8B5CF6">
        Purple (#8B5CF6)
      </Text>
      <Text variant="body" color="#10B981">
        Green (#10B981)
      </Text>
      <Text variant="body" color="#EF4444">
        Red (#EF4444)
      </Text>
    </View>
  ),
};

export const Hierarchy: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View>
        <Text variant="heading" color="#171717">
          Main Heading
        </Text>
        <Text variant="body" color="#737373">
          Supporting body text with additional context and information.
        </Text>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 12 }}>
        <Text variant="subheading" color="#171717">
          Section Subheading
        </Text>
        <Text variant="caption" color="#737373">
          Caption providing extra details about this section.
        </Text>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingTop: 12 }}>
        <Text variant="title" color="#171717">
          Subsection Title
        </Text>
        <Text variant="body" color="#525252">
          Body text with good readability for longer content.
        </Text>
        <Text variant="hint" color="#A1A1A1">
          Hint text for additional help or context.
        </Text>
      </View>
    </View>
  ),
};

export const LabelSystem: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Text variant="label" color="#525252">
          Email Address
        </Text>
        <Text variant="body" color="#171717">
          user@example.com
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text variant="label" color="#525252">
          Username
        </Text>
        <Text variant="body" color="#171717">
          chessmaster2025
        </Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text variant="label" color="#525252">
          Status
        </Text>
        <Text variant="caption" color="#10B981" weight="semibold">
          ✓ Active
        </Text>
      </View>
    </View>
  ),
};

export const LongContent: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Text variant="heading" color="#171717">
        Typography in Practice
      </Text>
      <Text variant="body" color="#525252">
        Good typography is essential for readability and user experience. This example demonstrates
        how different text variants work together to create a clear visual hierarchy. The body text
        uses a comfortable 16px size with 1.5 line height for optimal reading.
      </Text>
      <Text variant="caption" color="#737373">
        Caption text provides supplementary information at a smaller size, perfect for timestamps,
        metadata, or additional context that doesn't need to stand out as much as body text.
      </Text>
    </View>
  ),
};
