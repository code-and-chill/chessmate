import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Box } from './Box';
import { Text } from './Text';

const meta: Meta<typeof Box> = {
  title: 'Primitives/Box',
  component: Box,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    padding: { control: 'number' },
    margin: { control: 'number' },
    radius: { control: 'number' },
    backgroundColor: { control: 'color' },
    flexDirection: {
      control: 'select',
      options: ['row', 'column'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  render: () => (
    <Box padding={4} backgroundColor="#F3F3F3" radius={2}>
      <Text>Box with default styles</Text>
    </Box>
  ),
};

export const Padding: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Box padding={2} backgroundColor="#E8E8E8" radius={2}>
        <Text>Padding: 2 (8px)</Text>
      </Box>
      <Box padding={4} backgroundColor="#E8E8E8" radius={2}>
        <Text>Padding: 4 (16px)</Text>
      </Box>
      <Box padding={6} backgroundColor="#E8E8E8" radius={2}>
        <Text>Padding: 6 (24px)</Text>
      </Box>
    </View>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Box padding={4} backgroundColor="#3B82F6" radius={1}>
        <Text style={{ color: 'white' }}>Radius: sm (4px)</Text>
      </Box>
      <Box padding={4} backgroundColor="#8B5CF6" radius={2}>
        <Text style={{ color: 'white' }}>Radius: md (8px)</Text>
      </Box>
      <Box padding={4} backgroundColor="#10B981" radius={3}>
        <Text style={{ color: 'white' }}>Radius: lg (12px)</Text>
      </Box>
    </View>
  ),
};

export const FlexDirection: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Box flexDirection="row" gap={2} padding={4} backgroundColor="#F3F3F3" radius={2}>
        <Box padding={2} backgroundColor="#3B82F6" radius={1}>
          <Text style={{ color: 'white' }}>Item 1</Text>
        </Box>
        <Box padding={2} backgroundColor="#8B5CF6" radius={1}>
          <Text style={{ color: 'white' }}>Item 2</Text>
        </Box>
        <Box padding={2} backgroundColor="#10B981" radius={1}>
          <Text style={{ color: 'white' }}>Item 3</Text>
        </Box>
      </Box>

      <Box flexDirection="column" gap={2} padding={4} backgroundColor="#F3F3F3" radius={2}>
        <Box padding={2} backgroundColor="#3B82F6" radius={1}>
          <Text style={{ color: 'white' }}>Item 1</Text>
        </Box>
        <Box padding={2} backgroundColor="#8B5CF6" radius={1}>
          <Text style={{ color: 'white' }}>Item 2</Text>
        </Box>
        <Box padding={2} backgroundColor="#10B981" radius={1}>
          <Text style={{ color: 'white' }}>Item 3</Text>
        </Box>
      </Box>
    </View>
  ),
};

export const Alignment: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Box
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        padding={4}
        backgroundColor="#F3F3F3"
        radius={2}
      >
        <Text>Flex Start</Text>
      </Box>

      <Box
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        padding={4}
        backgroundColor="#F3F3F3"
        radius={2}
      >
        <Text>Center</Text>
      </Box>

      <Box
        flexDirection="row"
        justifyContent="flex-end"
        alignItems="center"
        padding={4}
        backgroundColor="#F3F3F3"
        radius={2}
      >
        <Text>Flex End</Text>
      </Box>

      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        padding={4}
        backgroundColor="#F3F3F3"
        radius={2}
      >
        <Text>Space</Text>
        <Text>Between</Text>
      </Box>
    </View>
  ),
};

export const Shadows: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 8 }}>
      <Box padding={4} backgroundColor="white" radius={2} shadow="sm">
        <Text>Shadow: sm</Text>
      </Box>
      <Box padding={4} backgroundColor="white" radius={2} shadow="md">
        <Text>Shadow: md</Text>
      </Box>
      <Box padding={4} backgroundColor="white" radius={2} shadow="lg">
        <Text>Shadow: lg</Text>
      </Box>
    </View>
  ),
};

export const Composition: Story = {
  render: () => (
    <Box padding={6} backgroundColor="white" radius={3} shadow="card">
      <Box gap={3}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Card Title</Text>
        <Text style={{ color: '#737373' }}>
          This demonstrates Box composition for building complex layouts.
        </Text>
        <Box flexDirection="row" gap={2}>
          <Box padding={2} backgroundColor="#3B82F6" radius={1} style={{ flex: 1 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Action 1</Text>
          </Box>
          <Box padding={2} backgroundColor="#8B5CF6" radius={1} style={{ flex: 1 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Action 2</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  ),
};
