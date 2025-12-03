import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Box } from '@/ui/primitives/Box';
import { Text } from '@/ui/primitives/Text';
import { Button } from '@/ui/primitives/Button';
import { Icon, type IconName } from '@/ui/icons/Icon';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  delay = 0,
}) => {
  const { colors } = useThemeTokens();

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <Box
        style={[
          styles.container,
          { backgroundColor: colors.background.secondary },
        ]}
      >
        <Box
          style={[
            styles.iconContainer,
            { backgroundColor: colors.accent.primary + '15' },
          ]}
        >
          <Icon
            name={icon}
            size={48}
            color={colors.accent.primary}
          />
        </Box>

        <Text
          variant="title"
          weight="semibold"
          style={[styles.title, { color: colors.foreground.primary }]}
        >
          {title}
        </Text>

        <Text
          variant="body"
          style={[
            styles.description,
            { color: colors.foreground.secondary },
          ]}
        >
          {description}
        </Text>

        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="md"
            onPress={onAction}
            style={styles.button}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacingTokens[8],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacingTokens[5],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacingTokens[3],
  },
  description: {
    textAlign: 'center',
    marginBottom: spacingTokens[6],
    maxWidth: 300,
    lineHeight: 24,
  },
  button: {
    minWidth: 160,
  },
});
