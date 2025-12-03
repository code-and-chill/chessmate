/**
 * Modal Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { Text } from './Text';
import { Input } from './Input';
import { VStack } from '../layouts/Stack';

const meta = {
  title: 'Primitives/Modal',
  component: Modal,
  argTypes: {
    visible: {
      control: 'boolean',
      description: 'Whether the modal is visible',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Modal size variant',
    },
    placement: {
      control: 'select',
      options: ['center', 'bottom', 'top'],
      description: 'Modal placement on screen',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header',
    },
    scrollable: {
      control: 'boolean',
      description: 'Enable scrolling for long content',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalWrapper = ({  size = 'md',
  placement = 'center',
  title = 'Modal Title',
  children,
  footer,
}: any) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ padding: 20 }}>
      <Button onPress={() => setVisible(true)}>Open Modal</Button>
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        size={size}
        placement={placement}
        title={title}
        footer={footer}
      >
        {children}
      </Modal>
    </View>
  );
};

export const Default: Story = {
  render: () => (
    <ModalWrapper>
      <Text variant="body">
        This is a default modal with standard configuration.
      </Text>
    </ModalWrapper>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap={4} style={{ padding: 20 }}>
      <ModalWrapper size="sm" title="Small Modal">
        <Text variant="body">This is a small modal (400px max width).</Text>
      </ModalWrapper>

      <ModalWrapper size="md" title="Medium Modal">
        <Text variant="body">This is a medium modal (600px max width).</Text>
      </ModalWrapper>

      <ModalWrapper size="lg" title="Large Modal">
        <Text variant="body">This is a large modal (800px max width).</Text>
      </ModalWrapper>

      <ModalWrapper size="full" title="Full Modal">
        <Text variant="body">This is a full-size modal (95% width).</Text>
      </ModalWrapper>
    </VStack>
  ),
};

export const Placement: Story = {
  render: () => (
    <VStack gap={4} style={{ padding: 20 }}>
      <ModalWrapper placement="center" title="Center Modal">
        <Text variant="body">Modal positioned in the center of the screen.</Text>
      </ModalWrapper>

      <ModalWrapper placement="bottom" title="Bottom Sheet">
        <Text variant="body">Modal slides up from the bottom (mobile pattern).</Text>
      </ModalWrapper>

      <ModalWrapper placement="top" title="Top Modal">
        <Text variant="body">Modal slides down from the top.</Text>
      </ModalWrapper>
    </VStack>
  ),
};

export const WithForm: Story = {
  render: () => (
    <ModalWrapper
      title="Sign In"
      footer={
        <>
          <Button variant="outline" size="md">
            Cancel
          </Button>
          <Button variant="solid" size="md">
            Sign In
          </Button>
        </>
      }
    >
      <VStack gap={4}>
        <Input label="Email" placeholder="your@email.com" />
        <Input label="Password" placeholder="••••••••" secureTextEntry />
        <Text variant="caption" style={{ marginTop: 8 }}>
          Forgot your password?
        </Text>
      </VStack>
    </ModalWrapper>
  ),
};

export const LongContent: Story = {
  render: () => (
    <ModalWrapper title="Terms of Service" size="lg">
      <VStack gap={4}>
        <Text variant="title" weight="semibold">
          1. Acceptance of Terms
        </Text>
        <Text variant="body">
          By accessing and using this service, you accept and agree to be bound
          by the terms and provision of this agreement.
        </Text>

        <Text variant="title" weight="semibold">
          2. Use License
        </Text>
        <Text variant="body">
          Permission is granted to temporarily download one copy of the materials
          on ChessMate's website for personal, non-commercial transitory viewing only.
        </Text>

        <Text variant="title" weight="semibold">
          3. Disclaimer
        </Text>
        <Text variant="body">
          The materials on ChessMate's website are provided on an 'as is' basis.
          ChessMate makes no warranties, expressed or implied, and hereby disclaims
          and negates all other warranties.
        </Text>

        <Text variant="title" weight="semibold">
          4. Limitations
        </Text>
        <Text variant="body">
          In no event shall ChessMate or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit).
        </Text>

        <Text variant="title" weight="semibold">
          5. Revisions
        </Text>
        <Text variant="body">
          The materials appearing on ChessMate's website could include technical,
          typographical, or photographic errors. ChessMate does not warrant that
          any of the materials on its website are accurate, complete, or current.
        </Text>
      </VStack>
    </ModalWrapper>
  ),
};

export const ConfirmationDialog: Story = {
  render: () => (
    <ModalWrapper
      size="sm"
      title="Confirm Delete"
      footer={
        <>
          <Button variant="outline" size="md">
            Cancel
          </Button>
          <Button variant="solid" size="md" color="#EF4444">
            Delete
          </Button>
        </>
      }
    >
      <Text variant="body">
        Are you sure you want to delete this item? This action cannot be undone.
      </Text>
    </ModalWrapper>
  ),
};
