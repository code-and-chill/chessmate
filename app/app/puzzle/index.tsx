import {useEffect} from 'react';
import {useRouter} from 'expo-router';
import {HStack, VStack} from '@/ui';
import {StatCard} from '@/ui/components/StatCard';
import {usePuzzle} from '@/contexts/PuzzleContext';
import {useI18n} from '@/i18n/I18nContext';
import {FeatureScreenLayout} from '@/ui/components/FeatureScreenLayout';
import {FeatureCard} from '@/ui/components/FeatureCard';

export default function PuzzleHubScreen() {
    const router = useRouter();
    const {t, ti} = useI18n();
    const {dailyPuzzle, puzzleStats, getDailyPuzzle, getUserStats, isLoading} = usePuzzle();

    useEffect(() => {
        getDailyPuzzle();
        getUserStats();
    }, [getDailyPuzzle, getUserStats]);

    if (isLoading) {
        return (
            <FeatureScreenLayout
                title={t('puzzle.puzzles')}
                subtitle={t('puzzle.sharpen_skills')}
                statsRow={null}
            >
                <FeatureCard
                    icon="loader"
                    title={t('puzzle.loading_puzzles')}
                    description={t('puzzle.please_wait')}
                    progress={''}
                    onPress={() => {
                    }}
                    delay={200}
                />
            </FeatureScreenLayout>
        );
    }

    return (
        <FeatureScreenLayout
            title={t('puzzle.puzzles')}
            subtitle={t('puzzle.sharpen_skills')}
            statsRow={puzzleStats && (
                <VStack gap={4}>
                    <HStack gap={3}>
                        <StatCard value={puzzleStats.totalSolved.toString()} label={t('puzzle.solved')}/>
                        <StatCard value={puzzleStats.userRating.toString()} label={t('puzzle.rating')}/>
                    </HStack>
                    <HStack gap={3}>
                        <StatCard icon="flame" value={puzzleStats.currentStreak.toString()}
                                  label={t('puzzle.streak')}/>
                        <StatCard
                            value={`${Math.round((puzzleStats.totalSolved / puzzleStats.totalAttempts) * 100)}%`}
                            label={t('puzzle.success')}/>
                    </HStack>
                </VStack>
            )}
        >
            <FeatureCard
                icon="star"
                title={t('puzzle.daily_puzzle')}
                description={dailyPuzzle ? ti('puzzle.rating_value', {rating: dailyPuzzle.rating}) : t('puzzle.complete_today_challenge')}
                progress={t('puzzle.daily_progress', 'Play today’s challenge')}
                onPress={() => router.push('/puzzle/daily')}
                delay={300}
            />
            <FeatureCard
                icon="dice"
                title={t('puzzle.random_training', 'Random Training')}
                description={t('puzzle.random_desc', 'Practice with random puzzles')}
                progress={t('puzzle.random_progress', 'Select difficulty & theme')}
                onPress={() => router.push('/puzzle/play')}
                delay={400}
            />
            <FeatureCard
                icon="chart-bar"
                title={t('puzzle.history', 'Puzzle History')}
                description={t('puzzle.history_desc', 'Review your solved puzzles')}
                progress={t('puzzle.history_progress', 'See your stats & streaks')}
                onPress={() => router.push('/puzzle/history')}
                delay={500}
            />
        </FeatureScreenLayout>
    );
}
