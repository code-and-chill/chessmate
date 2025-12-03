import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, gap: 12 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'subtle', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="solid">Solid Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="subtle">Subtle Button</Button>
      <Button variant="ghost">Ghost Button</Button>
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </View>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button icon={<View style={{ width: 16, height: 16, backgroundColor: 'white', borderRadius: 8 }} />}>
        With Icon
      </Button>
      <Button
        variant="outline"
        icon={<View style={{ width: 16, height: 16, backgroundColor: '#3B82F6', borderRadius: 8 }} />}
      >
        Outline with Icon
      </Button>
    </View>
  ),
};

export const States: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button>Normal State</Button>
      <Button disabled>Disabled State</Button>
      <Button isLoading>Loading State</Button>
    </View>
  ),
};

export const Colors: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button color="#3B82F6">Blue Button</Button>
      <Button color="#8B5CF6">Purple Button</Button>
      <Button color="#10B981">Green Button</Button>
      <Button color="#EF4444">Red Button</Button>
      <Button color="#F59E0B">Amber Button</Button>
    </View>
  ),
};

export const AllCombinations: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {(['solid', 'outline', 'subtle', 'ghost'] as const).map((variant) => (
        <View key={variant} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button variant={variant} size="sm">
              Small
            </Button>
            <Button variant={variant} size="md">
              Medium
            </Button>
            <Button variant={variant} size="lg">
              Large
            </Button>
          </View>
        </View>
      ))}
    </View>
  ),
};
