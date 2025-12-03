/**
 * Openings Explorer Screen
 * 
 * Explore and manage chess opening repertoire.
 * Accessed from the Learn feature hub.
 */

import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { DetailScreenLayout } from '@/ui/components/DetailScreenLayout';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, useColors } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

interface Opening {
  id: string;
  name: string;
  eco: string;
  games: number;
  winRate: number;
  color: 'white' | 'black' | 'both';
}

export default function OpeningsExplorerScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  
  const [repertoire] = useState<Opening[]>([
    {
      id: 'opening-1',
      name: 'Italian Game',
      eco: 'C50',
      games: 28,
      winRate: 64,
      color: 'white',
    },
    {
      id: 'opening-2',
      name: 'Sicilian Defense',
      eco: 'B20',
      games: 42,
      winRate: 58,
      color: 'black',
    },
    {
      id: 'opening-3',
      name: "Queen's Gambit",
      eco: 'D06',
      games: 19,
      winRate: 71,
      color: 'white',
    },
    {
      id: 'opening-4',
      name: 'French Defense',
      eco: 'C00',
      games: 15,
      winRate: 53,
      color: 'black',
    },
    {
      id: 'opening-5',
      name: 'King\'s Indian Defense',
      eco: 'E60',
      games: 12,
      winRate: 67,
      color: 'black',
    },
  ]);

  const getColorBadge = (openingColor: Opening['color']) => {
    switch (openingColor) {
      case 'white':
        return { text: '⚪ White', color: colors.foreground.primary };
      case 'black':
        return { text: '⚫ Black', color: colors.foreground.primary };
      case 'both':
        return { text: '⚪⚫ Both', color: colors.accent.primary };
    }
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 60) return colors.success;
    if (winRate >= 50) return colors.warning;
    return colors.error;
  };

  return (
    <DetailScreenLayout
      title={t('learn.openings_explorer')}
      subtitle={t('learn.build_repertoire')}
      onBack={() => router.back()}
    >
      {/* Add Opening Button */}
      <TouchableOpacity 
        style={[styles.addButton, { 
          backgroundColor: colors.accent.primary + '20',
          borderColor: colors.accent.primary,
        }]}
      >
        <Text style={[styles.addButtonText, { color: colors.accent.primary }]}>
          + {t('learn.add_opening')}
        </Text>
      </TouchableOpacity>

      {/* Repertoire */}
      <VStack gap={3}>
        <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
          {t('learn.your_repertoire')} ({repertoire.length})
        </Text>
        
        {repertoire.map((opening) => {
          const colorBadge = getColorBadge(opening.color);
          const winRateColor = getWinRateColor(opening.winRate);
          
          return (
            <Card key={opening.id} variant="elevated" size="md" hoverable pressable>
              <TouchableOpacity
                style={styles.openingCard}
                onPress={() => router.push(`/openings/${opening.eco}` as unknown as any)}
              >
                <VStack gap={3}>
                  {/* Header */}
                  <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text style={[styles.openingName, { color: colors.foreground.primary }]}>
                        {opening.name}
                      </Text>
                      <HStack gap={2} style={{ alignItems: 'center' }}>
                        <Text style={[styles.eco, { color: colors.accent.primary }]}>
                          {opening.eco}
                        </Text>
                        <Text style={[styles.colorBadge, { color: colorBadge.color }]}>
                          {colorBadge.text}
                        </Text>
                      </HStack>
                    </VStack>
                    <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                  </HStack>

                  {/* Stats */}
                  <HStack gap={4}>
                    <VStack gap={1}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Games
                      </Text>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        📊 {opening.games}
                      </Text>
                    </VStack>
                    
                    <VStack gap={1}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Win Rate
                      </Text>
                      <Text style={[styles.statValue, { color: winRateColor }]}>
                        {opening.winRate}%
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </TouchableOpacity>
            </Card>
          );
        })}
      </VStack>

      {/* Empty State */}
      {repertoire.length === 0 && (
        <Card variant="elevated" size="md">
          <VStack gap={3} style={{ padding: 40, alignItems: 'center' }}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
              {t('learn.no_openings_in_repertoire')}
            </Text>
          </VStack>
        </Card>
      )}
    </DetailScreenLayout>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  openingCard: {
    padding: 16,
  },
  openingName: {
    fontSize: 16,
    fontWeight: '600',
  },
  eco: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorBadge: {
    fontSize: 12,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
