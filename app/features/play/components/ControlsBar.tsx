/**
 * ControlsBar Component
 * app/components/play/ControlsBar.tsx
 * 
 * Game control buttons (Resign, Draw, etc.)
 */

import React from 'react';
import { Pressable } from 'react-native';
import { HStack, Card, Text, useColors } from '@/ui';
import { safeStyles } from '@/ui/utilities/safeStyles';

export interface ControlsBarProps {
  status: 'in_progress' | 'waiting_for_opponent' | 'ended' | 'preparing';
  onResign?: () => void;
  onOfferDraw?: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  status,
  onResign,
  onOfferDraw,
}) => {
  const colors = useColors();
  const isGameActive = status === 'in_progress';

  if (!isGameActive) {
    return null;
  }

  return (
    <Card
      padding={3}
      shadow="card"
      style={{ backgroundColor: colors.background.secondary }}
    >
      <HStack gap={3} justifyContent="center" fullWidth>
        {onResign && (
          <Pressable
            onPress={onResign}
            style={({ pressed }) =>
              safeStyles(
                {
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: colors.feedback.error,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                pressed && { opacity: 0.8 }
              )
            }
          >
            <Text 
              variant="body" 
              style={{ color: '#FFFFFF', fontWeight: '600' }}
            >
              Resign
            </Text>
          </Pressable>
        )}

        {onOfferDraw && (
          <Pressable
            onPress={onOfferDraw}
            style={({ pressed }) =>
              safeStyles(
                {
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: colors.background.tertiary,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                pressed && { opacity: 0.8 }
              )
            }
          >
            <Text 
              variant="body" 
              color={colors.foreground.primary}
              style={{ fontWeight: '600' }}
            >
              Offer Draw
            </Text>
          </Pressable>
        )}
      </HStack>
    </Card>
  );
};

ControlsBar.displayName = 'ControlsBar';
