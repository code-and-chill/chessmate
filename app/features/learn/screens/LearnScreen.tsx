import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { FeatureScreenLayout, FeatureCard, StatCard } from '@/ui/components';
import { HStack } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export function LearnScreen() {
  const router = useRouter();
  const { t, ti } = useI18n();
  const [streak] = useState(7);
  const [tacticsRating] = useState(1450);

  return (
    <FeatureScreenLayout
      title={t('learn.learn_improve')}
      subtitle={t('learn.master_chess')}
      statsRow={
        <HStack gap={3}>
          <StatCard icon="flame" value={streak} label={t('learn.day_streak')} />
          <StatCard icon="bolt" value={tacticsRating} label={t('learn.tactics_rating')} />
        </HStack>
      }
    >
      <FeatureCard
        icon="book"
        title={t('learn.interactive_lessons')}
        description={t('learn.lessons_description')}
        progress={ti('learn.lessons_completed', { count: 12, total: 48 })}
        onPress={() => router.push('/learning')}
        delay={200}
      />

      <FeatureCard
        icon="target"
        title={t('learn.tactics_trainer')}
        description={t('learn.tactics_description')}
        progress={ti('learn.tactics_progress', { rating: tacticsRating, solved: 234 })}
        onPress={() => router.push('/learning/tactics')}
        delay={300}
      />

      <FeatureCard
        icon="search"
        title={t('learn.game_review')}
        description={t('learn.review_description')}
        progress={ti('learn.games_pending', { count: 3 })}
        onPress={() => router.push('/learning/review')}
        delay={400}
      />

      <FeatureCard
        icon="book-open"
        title={t('learn.openings_explorer')}
        description={t('learn.openings_description')}
        progress={ti('learn.openings_in_repertoire', { count: 5 })}
        onPress={() => router.push('/learning/openings')}
        delay={500}
      />
    </FeatureScreenLayout>
  );
}

export default LearnScreen;
