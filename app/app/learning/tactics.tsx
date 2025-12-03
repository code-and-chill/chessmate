/**
 * Tactics Training Screen
 * 
 * Dedicated screen for tactics training by category.
 * Accessed from the Learn feature hub.
 */

import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DetailScreenLayout } from '@/ui/components/DetailScreenLayout';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, useColors } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

const CATEGORY_ICONS: Record<string, string> = {
  forks: '🔱',
  pins: '📌',
  'discovered-attacks': '🎭',
  'back-rank-mates': '👑',
  deflection: '⚔️',
  all: '🎯',
};

export default function TacticsTrainingScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t, ti } = useI18n();
  const { category = 'all' } = useLocalSearchParams<{ category?: string }>();
  
  const [rating] = useState(1450);
  const [solved] = useState(234);

  const categories = [
    { id: 'forks', label: t('learn.forks'), count: 45 },
    { id: 'pins', label: t('learn.pins'), count: 38 },
    { id: 'discovered-attacks', label: t('learn.discovered_attacks'), count: 22 },
    { id: 'back-rank-mates', label: t('learn.back_rank_mates'), count: 31 },
    { id: 'deflection', label: t('learn.deflection'), count: 18 },
  ];

  const handleStartTraining = () => {
    router.push({ 
      pathname: '/puzzle',
      params: { category: category !== 'all' ? category : undefined }
    });
  };

  return (
    <DetailScreenLayout
      title={t('learn.tactics_trainer')}
      subtitle={ti('learn.tactics_stats', { rating, solved })}
      onBack={() => router.back()}
    >
      {/* Rating Card */}
      <Card variant="gradient" size="md">
        <VStack gap={3} style={{ padding: 20, alignItems: 'center' }}>
          <Text style={[styles.ratingLabel, { color: colors.foreground.secondary }]}>
            {t('learn.your_tactics_rating')}
          </Text>
          <Text style={[styles.ratingValue, { color: colors.accent.primary }]}>
            {rating}
          </Text>
          <Text style={[styles.ratingChange, { color: colors.success }]}>
            +15 this week
          </Text>
        </VStack>
      </Card>

      {/* Start Training Button */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.accent.primary }]}
        onPress={handleStartTraining}
      >
        <Text style={styles.buttonText}>
          {t('learn.start_training')}
        </Text>
      </TouchableOpacity>

      {/* Categories */}
      <VStack gap={3}>
        <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
          {t('learn.categories')}
        </Text>
        
        {categories.map((cat) => (
          <Card key={cat.id} variant="elevated" size="sm" hoverable pressable>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => router.push({
                pathname: '/learning/tactics',
                params: { category: cat.id }
              })}
            >
              <HStack gap={3} style={{ alignItems: 'center', flex: 1 }}>
                <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat.id]}</Text>
                <VStack gap={1} style={{ flex: 1 }}>
                  <Text style={[styles.categoryTitle, { color: colors.foreground.primary }]}>
                    {cat.label}
                  </Text>
                  <Text style={[styles.categoryCount, { color: colors.foreground.tertiary }]}>
                    {ti('learn.puzzle_count', { count: cat.count })}
                  </Text>
                </VStack>
                <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
              </HStack>
            </TouchableOpacity>
          </Card>
        ))}
      </VStack>
    </DetailScreenLayout>
  );
}

const styles = StyleSheet.create({
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  ratingChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoryButton: {
    padding: 16,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 13,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
});
