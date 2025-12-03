import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { MoveQualityBadge, MoveQualityList } from './MoveQualityBadge';

const meta: Meta<typeof MoveQualityBadge> = {
  title: 'Chess/MoveQualityBadge',
  component: MoveQualityBadge,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#F8F9FA' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    quality: {
      control: 'select',
      options: ['brilliant', 'best', 'great', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'outlined', 'subtle'],
    },
    showLabel: { control: 'boolean' },
    animated: { control: 'boolean' },
    delay: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof MoveQualityBadge>;

export const Brilliant: Story = {
  args: {
    quality: 'brilliant',
    size: 'md',
    variant: 'solid',
    animated: true,
  },
};

export const Blunder: Story = {
  args: {
    quality: 'blunder',
    size: 'md',
    variant: 'solid',
    animated: true,
  },
};

export const WithLabel: Story = {
  args: {
    quality: 'brilliant',
    size: 'md',
    variant: 'solid',
    showLabel: true,
    animated: true,
  },
};

export const AllQualities: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <MoveQualityBadge quality="brilliant" />
        <MoveQualityBadge quality="best" />
        <MoveQualityBadge quality="great" />
        <MoveQualityBadge quality="good" />
        <MoveQualityBadge quality="book" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <MoveQualityBadge quality="inaccuracy" />
        <MoveQualityBadge quality="mistake" />
        <MoveQualityBadge quality="blunder" />
        <MoveQualityBadge quality="miss" />
      </View>
    </View>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MoveQualityBadge quality="brilliant" variant="solid" showLabel />
          <MoveQualityBadge quality="blunder" variant="solid" showLabel />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MoveQualityBadge quality="brilliant" variant="outlined" showLabel />
          <MoveQualityBadge quality="blunder" variant="outlined" showLabel />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MoveQualityBadge quality="brilliant" variant="subtle" showLabel />
          <MoveQualityBadge quality="blunder" variant="subtle" showLabel />
        </View>
      </View>
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <MoveQualityBadge quality="brilliant" size="xs" showLabel />
        <MoveQualityBadge quality="brilliant" size="sm" showLabel />
        <MoveQualityBadge quality="brilliant" size="md" showLabel />
        <MoveQualityBadge quality="brilliant" size="lg" showLabel />
      </View>
    </View>
  ),
};

export const StaggeredAnimation: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <MoveQualityBadge quality="brilliant" delay={0} />
      <MoveQualityBadge quality="best" delay={50} />
      <MoveQualityBadge quality="good" delay={100} />
      <MoveQualityBadge quality="inaccuracy" delay={150} />
      <MoveQualityBadge quality="mistake" delay={200} />
      <MoveQualityBadge quality="blunder" delay={250} />
    </View>
  ),
};

export const QualityList: Story = {
  render: () => (
    <View style={{ gap: 20 }}>
      <MoveQualityList
        qualities={[
          { quality: 'brilliant', count: 2 },
          { quality: 'good', count: 8 },
          { quality: 'inaccuracy', count: 3 },
          { quality: 'mistake', count: 2 },
          { quality: 'blunder', count: 1 },
        ]}
        showLabels={true}
      />
      
      <MoveQualityList
        qualities={[
          { quality: 'best', count: 5 },
          { quality: 'book', count: 7 },
          { quality: 'good', count: 12 },
        ]}
        variant="outlined"
        showLabels={true}
      />
    </View>
  ),
};

export const GameAnalysisSummary: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
      <View style={{ marginBottom: 8 }}>
        <View style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Move Quality Analysis</View>
      </View>
      
      <View style={{ gap: 12 }}>
        <View>
          <View style={{ fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#6B7280' }}>Excellent Moves</View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <MoveQualityBadge quality="brilliant" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 2</View>
          </View>
        </View>
        
        <View>
          <View style={{ fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#6B7280' }}>Good Moves</View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <MoveQualityBadge quality="best" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 5</View>
            <MoveQualityBadge quality="great" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 8</View>
            <MoveQualityBadge quality="good" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 12</View>
          </View>
        </View>
        
        <View>
          <View style={{ fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#6B7280' }}>Errors</View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <MoveQualityBadge quality="inaccuracy" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 3</View>
            <MoveQualityBadge quality="mistake" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 2</View>
            <MoveQualityBadge quality="blunder" showLabel size="sm" />
            <View style={{ fontSize: 13, color: '#9CA3AF', alignSelf: 'center' }}>× 1</View>
          </View>
        </View>
      </View>
    </View>
  ),
};
