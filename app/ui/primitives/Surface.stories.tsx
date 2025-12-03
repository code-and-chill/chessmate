/**
 * Surface Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Surface } from './Surface';
import { Text } from './Text';
import { Button } from './Button';
import { VStack, HStack } from '../layouts/Stack';

const meta = {
  title: 'Primitives/Surface',
  component: Surface,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'accent', 'subtle', 'elevated'],
      description: 'Visual style variant',
    },
    padding: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Padding size (token index)',
    },
    radius: {
      control: { type: 'number', min: 0, max: 32 },
      description: 'Border radius in pixels',
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => (
    <Surface {...args}>
      <Text variant="title" weight="semibold">
        Surface Component
      </Text>
      <Text variant="body" style={{ marginTop: 8 }}>
        A gradient backdrop for AI aesthetic with theme-aware styling.
      </Text>
    </Surface>
  ),
};

export const Variants: Story = {
  render: () => (
    <VStack gap={4} style={{ padding: 20 }}>
      <Surface variant="default">
        <Text variant="label" weight="semibold">
          Default
        </Text>
        <Text variant="caption" style={{ marginTop: 4 }}>
          Standard background for content
        </Text>
      </Surface>

      <Surface variant="accent">
        <Text variant="label" weight="semibold">
          Accent
        </Text>
        <Text variant="caption" style={{ marginTop: 4 }}>
          Highlighted section with accent tint
        </Text>
      </Surface>

      <Surface variant="subtle">
        <Text variant="label" weight="semibold">
          Subtle
        </Text>
        <Text variant="caption" style={{ marginTop: 4 }}>
          Light background for tertiary content
        </Text>
      </Surface>

      <Surface variant="elevated">
        <Text variant="label" weight="semibold">
          Elevated
        </Text>
        <Text variant="caption" style={{ marginTop: 4 }}>
          Raised appearance with shadow
        </Text>
      </Surface>
    </VStack>
  ),
};

export const Padding: Story = {
  render: () => (
    <VStack gap={4} style={{ padding: 20 }}>
      <Surface padding={2}>
        <Text variant="body">Compact (padding: 2 = 8px)</Text>
      </Surface>

      <Surface padding={4}>
        <Text variant="body">Default (padding: 4 = 16px)</Text>
      </Surface>

      <Surface padding={6}>
        <Text variant="body">Comfortable (padding: 6 = 32px)</Text>
      </Surface>

      <Surface padding={8}>
        <Text variant="body">Spacious (padding: 8 = 48px)</Text>
      </Surface>
    </VStack>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <VStack gap={4} style={{ padding: 20 }}>
      <Surface radius={0}>
        <Text variant="body">Sharp corners (radius: 0)</Text>
      </Surface>

      <Surface radius={8}>
        <Text variant="body">Subtle rounding (radius: 8)</Text>
      </Surface>

      <Surface radius={16}>
        <Text variant="body">Medium rounding (radius: 16)</Text>
      </Surface>

      <Surface radius={32}>
        <Text variant="body">Large rounding (radius: 32)</Text>
      </Surface>
    </VStack>
  ),
};

export const WithContent: Story = {
  render: () => (
    <VStack gap={6} style={{ padding: 20 }}>
      <Surface variant="elevated" padding={6}>
        <VStack gap={4}>
          <Text variant="heading" weight="bold">
            Feature Spotlight
          </Text>
          <Text variant="body">
            Discover the latest updates and improvements to your chess
            experience.
          </Text>
          <HStack gap={3}>
            <Button variant="solid" size="sm">
              Learn More
            </Button>
            <Button variant="outline" size="sm">
              Dismiss
            </Button>
          </HStack>
        </VStack>
      </Surface>

      <Surface variant="accent" padding={5}>
        <VStack gap={3}>
          <Text variant="title" weight="semibold">
            📊 Statistics
          </Text>
          <HStack gap={4}>
            <VStack>
              <Text variant="heading" weight="bold">
                1,234
              </Text>
              <Text variant="caption">Games Played</Text>
            </VStack>
            <VStack>
              <Text variant="heading" weight="bold">
                89%
              </Text>
              <Text variant="caption">Win Rate</Text>
            </VStack>
            <VStack>
              <Text variant="heading" weight="bold">
                1450
              </Text>
              <Text variant="caption">Rating</Text>
            </VStack>
          </HStack>
        </VStack>
      </Surface>
    </VStack>
  ),
};

export const Nested: Story = {
  render: () => (
    <Surface variant="default" padding={6}>
      <Text variant="title" weight="bold" style={{ marginBottom: 16 }}>
        Outer Surface
      </Text>
      <Surface variant="accent" padding={5}>
        <Text variant="label" weight="semibold" style={{ marginBottom: 12 }}>
          Nested Surface
        </Text>
        <Surface variant="subtle" padding={4}>
          <Text variant="body">
            Deeply nested content with multiple surface layers
          </Text>
        </Surface>
      </Surface>
    </Surface>
  ),
};

export const AllVariations: Story = {
  render: () => (
    <VStack gap={6} style={{ padding: 20 }}>
      <Text variant="heading" weight="bold">
        All Surface Variations
      </Text>

      <VStack gap={3}>
        <Text variant="label">Variants</Text>
        <HStack gap={3} style={{ flexWrap: 'wrap' }}>
          <Surface variant="default" padding={4} style={{ flex: 1, minWidth: 150 }}>
            <Text variant="caption">Default</Text>
          </Surface>
          <Surface variant="accent" padding={4} style={{ flex: 1, minWidth: 150 }}>
            <Text variant="caption">Accent</Text>
          </Surface>
          <Surface variant="subtle" padding={4} style={{ flex: 1, minWidth: 150 }}>
            <Text variant="caption">Subtle</Text>
          </Surface>
          <Surface variant="elevated" padding={4} style={{ flex: 1, minWidth: 150 }}>
            <Text variant="caption">Elevated</Text>
          </Surface>
        </HStack>
      </VStack>

      <VStack gap={3}>
        <Text variant="label">With Interactive Content</Text>
        <Surface variant="elevated" padding={5}>
          <VStack gap={3}>
            <Text variant="title" weight="semibold">
              Interactive Surface
            </Text>
            <Text variant="body">
              Surfaces can contain any content including interactive elements.
            </Text>
            <Button variant="solid" size="md">
              Take Action
            </Button>
          </VStack>
        </Surface>
      </VStack>
    </VStack>
  ),
};
