/**
 * Divider Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Divider } from './Divider';
import { Text } from './Text';
import { VStack } from '../layouts/Stack';

const meta = {
  title: 'Primitives/Divider',
  component: Divider,
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'default', 'strong'],
      description: 'Visual weight of the divider',
    },
    color: {
      control: 'color',
      description: 'Custom color (overrides variant)',
    },
    thickness: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Thickness in pixels',
    },
    marginVertical: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Vertical margin (token index)',
    },
    marginHorizontal: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Horizontal margin (token index)',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <View style={{ padding: 20 }}>
      <Text variant="body">Content above divider</Text>
      <Divider {...args} />
      <Text variant="body">Content below divider</Text>
    </View>
  ),
};

export const Variants: Story = {
  render: () => (
    <VStack gap={6} style={{ padding: 20 }}>
      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Subtle (light gray)
        </Text>
        <Divider variant="subtle" />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Default (medium gray)
        </Text>
        <Divider variant="default" />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Strong (dark gray)
        </Text>
        <Divider variant="strong" />
      </View>
    </VStack>
  ),
};

export const Thickness: Story = {
  render: () => (
    <VStack gap={6} style={{ padding: 20 }}>
      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          1px (default)
        </Text>
        <Divider thickness={1} />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          2px
        </Text>
        <Divider thickness={2} />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          4px
        </Text>
        <Divider thickness={4} />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          8px
        </Text>
        <Divider thickness={8} />
      </View>
    </VStack>
  ),
};

export const Spacing: Story = {
  render: () => (
    <VStack gap={6} style={{ padding: 20 }}>
      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          No margin (marginVertical: 0)
        </Text>
        <Text variant="body">Above</Text>
        <Divider marginVertical={0} />
        <Text variant="body">Below</Text>
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Default margin (marginVertical: 4)
        </Text>
        <Text variant="body">Above</Text>
        <Divider marginVertical={4} />
        <Text variant="body">Below</Text>
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Large margin (marginVertical: 6)
        </Text>
        <Text variant="body">Above</Text>
        <Divider marginVertical={6} />
        <Text variant="body">Below</Text>
      </View>
    </VStack>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <VStack gap={6} style={{ padding: 20 }}>
      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Primary blue
        </Text>
        <Divider color="#3B82F6" thickness={2} />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Success green
        </Text>
        <Divider color="#10B981" thickness={2} />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Error red
        </Text>
        <Divider color="#EF4444" thickness={2} />
      </View>

      <View>
        <Text variant="caption" style={{ marginBottom: 8 }}>
          Warning amber
        </Text>
        <Divider color="#F59E0B" thickness={2} />
      </View>
    </VStack>
  ),
};

export const InContent: Story = {
  render: () => (
    <View style={{ padding: 20 }}>
      <Text variant="heading" style={{ marginBottom: 12 }}>
        Section 1: Introduction
      </Text>
      <Text variant="body" style={{ marginBottom: 16 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Text>

      <Divider marginVertical={5} />

      <Text variant="heading" style={{ marginBottom: 12 }}>
        Section 2: Details
      </Text>
      <Text variant="body" style={{ marginBottom: 16 }}>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </Text>

      <Divider marginVertical={5} />

      <Text variant="heading" style={{ marginBottom: 12 }}>
        Section 3: Conclusion
      </Text>
      <Text variant="body">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur.
      </Text>
    </View>
  ),
};

export const AllVariations: Story = {
  render: () => (
    <VStack gap={8} style={{ padding: 20 }}>
      <Text variant="title" weight="bold">
        All Divider Variations
      </Text>

      <View>
        <Text variant="label" style={{ marginBottom: 8 }}>
          Variants
        </Text>
        <Divider variant="subtle" marginVertical={2} />
        <Divider variant="default" marginVertical={2} />
        <Divider variant="strong" marginVertical={2} />
      </View>

      <View>
        <Text variant="label" style={{ marginBottom: 8 }}>
          Thickness Options
        </Text>
        <Divider thickness={1} marginVertical={2} />
        <Divider thickness={2} marginVertical={2} />
        <Divider thickness={4} marginVertical={2} />
      </View>

      <View>
        <Text variant="label" style={{ marginBottom: 8 }}>
          Custom Colors
        </Text>
        <Divider color="#3B82F6" thickness={2} marginVertical={2} />
        <Divider color="#10B981" thickness={2} marginVertical={2} />
        <Divider color="#EF4444" thickness={2} marginVertical={2} />
      </View>
    </VStack>
  ),
};
