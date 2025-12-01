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
 *   <StatCard value="🔥 7" label="Day Streak" />
 *   <StatCard value="⚡ 1450" label="Rating" />
 * </HStack>
 * ```
 */

import { StyleSheet, Text } from 'react-native';
import { Card } from '@/ui/primitives/Card';
import { useColors } from '@/ui';

interface StatCardProps {
  /** Display value (can include emoji) */
  value: string;
  
  /** Label text below the value */
  label: string;
}

export function StatCard({
  value,
  label,
}: StatCardProps) {
  const colors = useColors();
  
  return (
    <Card variant="elevated" size="sm" style={styles.container}>
      <Text style={[styles.value, { color: colors.accent.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.foreground.secondary }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    // color set dynamically from theme
  },
  label: {
    fontSize: 13,
    // color set dynamically from theme
    fontWeight: '500',
  },
});
