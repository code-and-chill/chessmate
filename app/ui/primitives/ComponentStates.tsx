/**
 * Component Lifecycle Framework
 * app/ui/primitives/ComponentStates.tsx
 * 
 * States: Empty | Loading | Ready | Error | Disabled
 * 
 * Every component follows this lifecycle for production-grade UX
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { spacingTokens, spacingScale } from '../tokens/spacing';
import { colorTokens, getColor } from '../tokens/colors';

// ==================== TYPES ====================

export type ComponentState = 'empty' | 'loading' | 'ready' | 'error' | 'disabled';

export type EmptyStateProps = {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  isDark?: boolean;
};

export type LoadingStateProps = {
  message?: string;
  size?: 'small' | 'large';
  isDark?: boolean;
};

export type ErrorStateProps = {
  title?: string;
  message: string;
  error?: Error;
  retry?: () => void;
  isDark?: boolean;
};

// ==================== EMPTY STATE ====================

/**
 * EmptyState - No content available
 * 
 * Usage: No puzzles, no games, no friends
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  action,
  isDark = false,
}) => {
  return (
    <View style={styles.container}>
      {illustration && <View style={styles.illustration}>{illustration}</View>}
      
      <Text
        size="xl"
        weight="semibold"
        color={getColor(colorTokens.neutral[900], isDark)}
        style={styles.title}
      >
        {title}
      </Text>
      
      {description && (
        <Text
          size="base"
          color={getColor(colorTokens.neutral[600], isDark)}
          style={styles.description}
        >
          {description}
        </Text>
      )}
      
      {action && (
        <Button
          variant="solid"
          onPress={action.onPress}
          style={styles.action}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
};

// ==================== LOADING STATE ====================

/**
 * LoadingState - Content is being fetched
 * 
 * Usage: Loading games, puzzles, profile
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  isDark = false,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={getColor(colorTokens.blue[600], isDark)}
      />
      
      {message && (
        <Text
          size="sm"
          color={getColor(colorTokens.neutral[600], isDark)}
          style={styles.loadingMessage}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

// ==================== ERROR STATE ====================

/**
 * ErrorState - Something went wrong
 * 
 * Usage: Failed to load game, network error, invalid move
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  error,
  retry,
  isDark = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorIcon}>
        <Text size="3xl">⚠️</Text>
      </View>
      
      <Text
        size="xl"
        weight="semibold"
        color={getColor(colorTokens.red[600], isDark)}
        style={styles.title}
      >
        {title}
      </Text>
      
      <Text
        size="base"
        color={getColor(colorTokens.neutral[700], isDark)}
        style={styles.description}
      >
        {message}
      </Text>
      
      {error && __DEV__ && (
        <Text
          size="xs"
          color={getColor(colorTokens.neutral[500], isDark)}
          style={styles.errorDetails}
        >
          {error.message}
        </Text>
      )}
      
      {retry && (
        <Button
          variant="solid"
          onPress={retry}
          style={styles.action}
        >
          Try Again
        </Button>
      )}
    </View>
  );
};

// ==================== SKELETON LOADER ====================

/**
 * SkeletonLoader - Placeholder during loading
 * 
 * Usage: Card loading, list item loading
 */
export const SkeletonLoader: React.FC<{
  width?: number | string;
  height?: number;
  radius?: number;
  style?: any;
}> = ({ width = '100%', height = 20, radius = 8, style }) => {
  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius },
        style,
      ]}
    />
  );
};

/**
 * SkeletonCard - Card placeholder during loading
 */
export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonLoader width="60%" height={24} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 16 }} />
      <SkeletonLoader width={120} height={40} />
    </View>
  );
};

// ==================== COMPONENT STATE WRAPPER ====================

/**
 * ComponentStateManager - Manages component lifecycle
 * 
 * Usage: Wrap any component to handle all states automatically
 */
export type ComponentStateManagerProps = {
  state: ComponentState;
  children: React.ReactNode;
  emptyState?: EmptyStateProps;
  loadingState?: LoadingStateProps;
  errorState?: ErrorStateProps;
  disabledOpacity?: number;
};

export const ComponentStateManager: React.FC<ComponentStateManagerProps> = ({
  state,
  children,
  emptyState,
  loadingState,
  errorState,
  disabledOpacity = 0.5,
}) => {
  switch (state) {
    case 'empty':
      return emptyState ? <EmptyState {...emptyState} /> : null;
      
    case 'loading':
      return <LoadingState {...loadingState} />;
      
    case 'error':
      return errorState ? <ErrorState {...errorState} /> : null;
      
    case 'disabled':
      return (
        <View style={{ opacity: disabledOpacity }}>
          {children}
        </View>
      );
      
    case 'ready':
    default:
      return <>{children}</>;
  }
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacingScale.gutter,
  },
  
  illustration: {
    marginBottom: spacingTokens[5],
  },
  
  title: {
    textAlign: 'center',
    marginBottom: spacingTokens[3],
  },
  
  description: {
    textAlign: 'center',
    marginBottom: spacingTokens[5],
    maxWidth: 300,
  },
  
  action: {
    marginTop: spacingTokens[4],
  },
  
  loadingMessage: {
    marginTop: spacingTokens[4],
  },
  
  errorIcon: {
    marginBottom: spacingTokens[4],
  },
  
  errorDetails: {
    marginTop: spacingTokens[3],
    padding: spacingTokens[3],
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    maxWidth: 300,
  },
  
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  
  skeletonCard: {
    padding: spacingScale.cardPadding,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
});
