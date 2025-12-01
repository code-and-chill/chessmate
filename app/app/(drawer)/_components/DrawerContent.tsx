import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Text, IconSymbol, useThemeTokens } from '@/ui';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';

export function DrawerContent(props: DrawerContentComponentProps) {
  const { mode, isDark, setMode } = useThemeTokens();
  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  const colors = {
    background: getColor(colorTokens.neutral[100], isDark),
    border: getColor(colorTokens.neutral[200], isDark),
    text: getColor(colorTokens.neutral[900], isDark),
    textSecondary: getColor(colorTokens.neutral[600], isDark),
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text variant="h3" style={{ color: colors.text }}>
          ChessMate
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/search')}
            style={styles.iconButton}
            accessibilityLabel="Search"
          >
            <IconSymbol name="magnifyingglass" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.iconButton}
            accessibilityLabel="Toggle theme"
          >
            <IconSymbol 
              name={isDark ? 'sun.max.fill' : 'moon.fill'} 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Items */}
      <DrawerItemList {...props} />

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text variant="caption" style={{ color: colors.textSecondary, textAlign: 'center' }}>
          v1.0.0
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacingTokens[4],
    paddingVertical: spacingTokens[4],
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacingTokens[2],
  },
  iconButton: {
    padding: spacingTokens[2],
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: spacingTokens[4],
    borderTopWidth: 1,
  },
});
