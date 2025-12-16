/**
 * InlineIcon Component
 * 
 * Properly aligned icon for inline use with text
 * Fixes alignment issues with emojis/SVG icons in text
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Icon, type IconName } from '@/ui/icons';

export interface InlineIconProps {
  /** Icon name or emoji string */
  icon?: IconName | string;
  /** Size of the icon */
  size?: number;
  /** Color of the icon */
  color?: string;
  /** Additional style */
  style?: any;
}

export const InlineIcon: React.FC<InlineIconProps> = ({
  icon,
  size = 16,
  color,
  style,
}) => {
  // If it's an emoji string, render as text with proper alignment
  if (typeof icon === 'string' && !icon.match(/^[a-z-]+$/)) {
    return (
      <Text
        style={[
          styles.emoji,
          { fontSize: size },
          style,
        ]}
      >
        {icon}
      </Text>
    );
  }

  // Otherwise render as Icon component
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon as IconName} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: undefined,
  },
});

InlineIcon.displayName = 'InlineIcon';
