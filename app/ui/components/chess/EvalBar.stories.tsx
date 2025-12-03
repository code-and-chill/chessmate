/**
 * EvalBar Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { EvalBar } from './EvalBar';
import { HStack, VStack } from '../../primitives/Stack';

const meta: Meta<typeof EvalBar> = {
  title: 'Chess/EvalBar',
  component: EvalBar,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof EvalBar>;

export const EqualPosition: Story = {
  args: {
    evaluation: 0,
    animated: true,
  },
};

export const WhiteAdvantageSmall: Story = {
  args: {
    evaluation: 100, // +1.0
    animated: true,
  },
};

export const WhiteAdvantageLarge: Story = {
  args: {
    evaluation: 500, // +5.0
    animated: true,
  },
};

export const BlackAdvantageSmall: Story = {
  args: {
    evaluation: -100, // -1.0
    animated: true,
  },
};

export const BlackAdvantageLarge: Story = {
  args: {
    evaluation: -500, // -5.0
    animated: true,
  },
};

export const WhiteMate: Story = {
  args: {
    evaluation: 15000, // Mate for white
    animated: true,
  },
};

export const BlackMate: Story = {
  args: {
    evaluation: -15000, // Mate for black
    animated: true,
  },
};

export const HorizontalOrientation: Story = {
  args: {
    evaluation: 300,
    orientation: 'horizontal',
    width: 200,
    height: 32,
    animated: true,
  },
};

export const WithoutValue: Story = {
  args: {
    evaluation: 250,
    showValue: false,
    animated: true,
  },
};

export const CustomDimensions: Story = {
  args: {
    evaluation: 150,
    width: 48,
    height: 300,
    animated: true,
  },
};

export const MultipleOrientations: Story = {
  render: () => (
    <HStack gap={6}>
      <VStack gap={2}>
        <EvalBar evaluation={0} />
        <EvalBar evaluation={200} />
        <EvalBar evaluation={-200} />
      </VStack>
      
      <VStack gap={2}>
        <EvalBar evaluation={0} orientation="horizontal" width={200} />
        <EvalBar evaluation={200} orientation="horizontal" width={200} />
        <EvalBar evaluation={-200} orientation="horizontal" width={200} />
      </VStack>
    </HStack>
  ),
};

export const EvaluationSequence: Story = {
  render: () => (
    <HStack gap={3}>
      <VStack gap={2} style={{ alignItems: 'center' }}>
        <EvalBar evaluation={0} width={24} height={150} />
      </VStack>
      <VStack gap={2} style={{ alignItems: 'center' }}>
        <EvalBar evaluation={100} width={24} height={150} />
      </VStack>
      <VStack gap={2} style={{ alignItems: 'center' }}>
        <EvalBar evaluation={300} width={24} height={150} />
      </VStack>
      <VStack gap={2} style={{ alignItems: 'center' }}>
        <EvalBar evaluation={150} width={24} height={150} />
      </VStack>
      <VStack gap={2} style={{ alignItems: 'center' }}>
        <EvalBar evaluation={-200} width={24} height={150} />
      </VStack>
      <VStack gap={2} style={{ alignItems: 'center' }}>
        <EvalBar evaluation={50} width={24} height={150} />
      </VStack>
    </HStack>
  ),
};

export const CompactSize: Story = {
  args: {
    evaluation: 150,
    width: 16,
    height: 100,
    showValue: false,
    animated: true,
  },
};

export const LargeSize: Story = {
  args: {
    evaluation: 150,
    width: 64,
    height: 400,
    animated: true,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
