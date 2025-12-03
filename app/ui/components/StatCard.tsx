/**
 * StatCard Component
 * 
 * A standardized stat card for displaying metrics in feature screens.
 * Part of the Design Language System (DLS) Screen Layout Pattern.
 * 
 * @see /app/DLS.md - Tab Screen Pattern documentation
 * 
 * @example
 * ```tsx
 * <HStack gap={3}>
 *   <StatCard icon="flame" value="7" label="Day Streak" />
 *   <StatCard icon="bolt" value="1450" label="Rating" />
 * </HStack>
 * ```
 */

import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { Icon, type IconName } from '@/ui/icons';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { typographyTokens } from '@/ui/tokens/typography';
import { spacingTokens } from '@/ui/tokens/spacing';

interface StatCardProps {
  /** Display value (numeric or string) */
  value: string | number;
  
  /** Label text below the value */
  label: string;
  
  /** Optional icon name from icon library */
  icon?: IconName;
}

export function StatCard({
  value,
  label,
  icon,
}: StatCardProps) {
  const colors = useColors();
  
  return (
    <Card variant="elevated" size="sm" style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color={colors.accent.primary} />
        </View>
      )}
      <Text style={[styles.value, { color: colors.accent.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.foreground.secondary }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: spacingTokens[4],
  },
  iconContainer: {
    marginBottom: spacingTokens[2],
  },
  value: {
    fontSize: typographyTokens.fontSize['2xl'],
    fontWeight: typographyTokens.fontWeight.bold,
    marginBottom: spacingTokens[1],
    fontVariantNumeric: 'tabular-nums',
  },
  label: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.medium,
  },
});
