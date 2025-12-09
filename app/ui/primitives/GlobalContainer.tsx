import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/ui/hooks/useThemeTokens';

type GlobalContainerProps = {
  children: React.ReactNode;
  /** If true, content is wrapped in a ScrollView */
  scrollable?: boolean;
  /** Style applied to the outer container */
  style?: ViewStyle | ViewStyle[];
  /** contentContainerStyle used when `scrollable` is true */
  contentContainerStyle?: ViewStyle | ViewStyle[];
  /** Optional background color override */
  backgroundColor?: string;
};

export const GlobalContainer: React.FC<GlobalContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  backgroundColor,
}) => {
  const colors = useColors();
  const bg = backgroundColor ?? colors.background.primary;

  const mergedSafeAreaStyle = [styles.root, { backgroundColor: bg }, ...(Array.isArray(style) ? style : [style ?? {}])];

  if (scrollable) {
    return (
      <SafeAreaView style={mergedSafeAreaStyle} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, ...(Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle ?? {}])]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={mergedSafeAreaStyle} edges={['top', 'bottom']}>
      <View style={[styles.inner, ...(Array.isArray(style) ? style : [style ?? {}])]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    paddingBottom: 48,
    flexGrow: 1,
  },
});

GlobalContainer.displayName = 'GlobalContainer';
