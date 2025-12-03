import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { CoachTooltip, useCoachTooltip } from './CoachTooltip';

const meta: Meta<typeof CoachTooltip> = {
  title: 'Coach/CoachTooltip',
  component: CoachTooltip,
  decorators: [
    (Story) => (
      <View style={{ padding: 40, backgroundColor: '#F8F9FA', minHeight: 300, justifyContent: 'center', alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    message: { control: 'text' },
    sentiment: {
      control: 'select',
      options: ['positive', 'neutral', 'cautionary', 'critical'],
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    variant: {
      control: 'select',
      options: ['glass', 'solid', 'outlined'],
    },
    showPointer: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
    entranceFrom: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    icon: { control: 'text' },
    autoDismiss: { control: 'number' },
    delay: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof CoachTooltip>;

export const Positive: Story = {
  args: {
    message: 'Excellent move! You\'ve gained a significant advantage.',
    sentiment: 'positive',
    icon: '✨',
    variant: 'glass',
  },
};

export const Neutral: Story = {
  args: {
    message: 'Your position is balanced. Consider developing your pieces.',
    sentiment: 'neutral',
    icon: '💭',
    variant: 'glass',
  },
};

export const Cautionary: Story = {
  args: {
    message: 'Be careful! Your king is exposed and needs protection.',
    sentiment: 'cautionary',
    icon: '⚠️',
    variant: 'glass',
  },
};

export const Critical: Story = {
  args: {
    message: 'Critical mistake! You\'ve lost your queen.',
    sentiment: 'critical',
    icon: '❗',
    variant: 'glass',
  },
};

export const AllSentiments: Story = {
  render: () => (
    <View style={{ gap: 16, width: '100%' }}>
      <CoachTooltip
        message="Brilliant! That was a winning tactical combination."
        sentiment="positive"
        icon="🎯"
        variant="solid"
        showPointer={false}
      />
      <CoachTooltip
        message="The position is equal. Focus on piece coordination."
        sentiment="neutral"
        icon="💡"
        variant="solid"
        showPointer={false}
      />
      <CoachTooltip
        message="Watch out for the knight fork on f7!"
        sentiment="cautionary"
        icon="⚠️"
        variant="solid"
        showPointer={false}
      />
      <CoachTooltip
        message="Blunder! This loses material immediately."
        sentiment="critical"
        icon="❌"
        variant="solid"
        showPointer={false}
      />
    </View>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16, width: '100%' }}>
      <CoachTooltip
        message="Glass variant with backdrop blur effect"
        sentiment="positive"
        variant="glass"
        icon="✨"
        showPointer={false}
      />
      <CoachTooltip
        message="Solid variant with colored left border"
        sentiment="neutral"
        variant="solid"
        icon="💭"
        showPointer={false}
      />
      <CoachTooltip
        message="Outlined variant with border accent"
        sentiment="cautionary"
        variant="outlined"
        icon="⚠️"
        showPointer={false}
      />
    </View>
  ),
};

export const WithPointers: Story = {
  render: () => (
    <View style={{ gap: 60, width: '100%', alignItems: 'center' }}>
      <CoachTooltip
        message="Pointer at bottom"
        sentiment="positive"
        position="top"
        showPointer={true}
        icon="👆"
      />
      <CoachTooltip
        message="Pointer at top"
        sentiment="neutral"
        position="bottom"
        showPointer={true}
        icon="👇"
      />
    </View>
  ),
};

export const WithCloseButton: Story = {
  args: {
    message: 'Click the × button to dismiss this tooltip.',
    sentiment: 'neutral',
    showCloseButton: true,
    icon: '💬',
  },
};

export const AutoDismiss: Story = {
  args: {
    message: 'This tooltip will automatically disappear in 3 seconds.',
    sentiment: 'positive',
    icon: '⏱️',
    autoDismiss: 3000,
  },
};

export const EntranceAnimations: Story = {
  render: () => (
    <View style={{ gap: 16, width: '100%' }}>
      <CoachTooltip
        message="Slides in from bottom"
        sentiment="positive"
        entranceFrom="bottom"
        showPointer={false}
        delay={0}
      />
      <CoachTooltip
        message="Slides in from top"
        sentiment="neutral"
        entranceFrom="top"
        showPointer={false}
        delay={200}
      />
      <CoachTooltip
        message="Slides in from left"
        sentiment="cautionary"
        entranceFrom="left"
        showPointer={false}
        delay={400}
      />
      <CoachTooltip
        message="Slides in from right"
        sentiment="critical"
        entranceFrom="right"
        showPointer={false}
        delay={600}
      />
    </View>
  ),
};

export const GameFeedbackExamples: Story = {
  render: () => (
    <View style={{ gap: 16, width: '100%' }}>
      <CoachTooltip
        message="Opening: Excellent choice! You're following the Italian Game theory."
        sentiment="positive"
        icon="📖"
        variant="glass"
        showPointer={false}
      />
      <CoachTooltip
        message="Middlegame: Your pieces are well-coordinated. Look for tactical opportunities."
        sentiment="neutral"
        icon="♟️"
        variant="glass"
        showPointer={false}
      />
      <CoachTooltip
        message="Endgame: Convert your material advantage carefully. Don't rush."
        sentiment="cautionary"
        icon="⏰"
        variant="glass"
        showPointer={false}
      />
    </View>
  ),
};

export const PositionAnalysis: Story = {
  render: () => (
    <View style={{ gap: 16, width: '100%' }}>
      <CoachTooltip
        message="You have a powerful bishop pair and control the center. Press your advantage!"
        sentiment="positive"
        icon="🎯"
        variant="solid"
        showPointer={false}
        maxWidth={360}
      />
      <CoachTooltip
        message="Your opponent's king is weak. Consider a mating attack on the kingside."
        sentiment="neutral"
        icon="👑"
        variant="solid"
        showPointer={false}
        maxWidth={360}
      />
      <CoachTooltip
        message="You're behind in development. Complete castling before attacking."
        sentiment="cautionary"
        icon="⚡"
        variant="solid"
        showPointer={false}
        maxWidth={360}
      />
    </View>
  ),
};

/**
 * Interactive example using the useCoachTooltip hook
 */
const InteractiveExample: React.FC = () => {
  const { tooltip, showTooltip, hideTooltip, isVisible } = useCoachTooltip();
  const [moveCount, setMoveCount] = React.useState(0);

  const handleMove = () => {
    setMoveCount((prev) => prev + 1);
    
    // Simulate different feedback based on move count
    if (moveCount === 0) {
      showTooltip('Great opening! You control the center.', 'positive', '✨');
    } else if (moveCount === 1) {
      showTooltip('Solid development. Keep improving your position.', 'neutral', '💭');
    } else if (moveCount === 2) {
      showTooltip('Watch your queen! It\'s under attack.', 'cautionary', '⚠️');
    } else {
      showTooltip('Excellent save! Crisis averted.', 'positive', '🎉');
    }
  };

  return (
    <View style={{ gap: 20, width: '100%', alignItems: 'center' }}>
      <View
        style={{
          padding: 16,
          backgroundColor: '#3B82F6',
          borderRadius: 8,
        }}
        onTouchEnd={handleMove}
      >
        <View style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
          Make Move {moveCount + 1}
        </View>
      </View>

      {isVisible && tooltip && (
        <CoachTooltip
          message={tooltip.message}
          sentiment={tooltip.sentiment}
          icon={tooltip.icon}
          variant="glass"
          showPointer={false}
          autoDismiss={3000}
          onDismiss={hideTooltip}
          showCloseButton
        />
      )}
    </View>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};
