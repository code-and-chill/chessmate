import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { FeatureScreenLayout, FeatureCard, StatCard } from '@/ui/components';
import { HStack } from '@/ui';

type LearnMode = 'hub' | 'lessons' | 'tactics' | 'review' | 'openings';
type LessonCategory = 'beginner' | 'intermediate' | 'advanced';

export default function LearnTab() {
  const router = useRouter();
  const [mode, setMode] = useState<LearnMode>('hub');
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory>('beginner');
  const [streak] = useState(7);
  const [tacticsRating] = useState(1450);

  // Learn Hub
  if (mode === 'hub') {
    return (
      <FeatureScreenLayout
        title="Learn & Improve"
        subtitle="Master chess through structured learning"
        statsRow={
          <HStack gap={3}>
            <StatCard value={`🔥 ${streak}`} label="Day Streak" />
            <StatCard value={`⚡ ${tacticsRating}`} label="Tactics Rating" />
          </HStack>
        }
      >
        <FeatureCard
          icon="📚"
          title="Interactive Lessons"
          description="Structured courses from basics to advanced"
          progress="12 of 48 lessons completed"
          onPress={() => setMode('lessons')}
          delay={200}
        />
        
        <FeatureCard
          icon="🎯"
          title="Tactics Trainer"
          description="Solve puzzles, improve pattern recognition"
          progress={`Rating: ${tacticsRating} • 234 solved`}
          onPress={() => setMode('tactics')}
          delay={300}
        />
        
        <FeatureCard
          icon="🔍"
          title="Game Review"
          description="Analyze your games, find improvements"
          progress="3 games pending review"
          onPress={() => setMode('review')}
          delay={400}
        />
        
        <FeatureCard
          icon="📖"
          title="Openings Explorer"
          description="Study openings with statistics"
          progress="5 openings in repertoire"
          onPress={() => setMode('openings')}
          delay={500}
        />
      </FeatureScreenLayout>
    );
  }

  // Lessons Module
  if (mode === 'lessons') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.detailContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Interactive Lessons</Text>
          <Text style={styles.subtitle}>Progress: 12/48 lessons • 🔥 {streak} day streak</Text>

          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            {(['beginner', 'intermediate', 'advanced'] as LessonCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, selectedCategory === cat ? styles.categoryTabActive : undefined]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryTabText, selectedCategory === cat ? styles.categoryTabTextActive : undefined]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lesson List */}
          {selectedCategory === 'beginner' && (
            <>
              <LessonCard title="How Pieces Move" completed={true} time="5 min" />
              <LessonCard title="Basic Checkmates" completed={true} time="10 min" />
              <LessonCard title="Opening Principles" completed={false} time="15 min" />
              <LessonCard title="Pawn Structure Basics" completed={false} time="12 min" />
            </>
          )}
          {selectedCategory === 'intermediate' && (
            <>
              <LessonCard title="Tactics: Forks & Pins" completed={true} time="20 min" />
              <LessonCard title="Endgame Essentials" completed={false} time="25 min" />
              <LessonCard title="Attacking the King" completed={false} time="30 min" />
            </>
          )}
          {selectedCategory === 'advanced' && (
            <>
              <LessonCard title="Advanced Endgames" completed={false} time="40 min" />
              <LessonCard title="Positional Sacrifices" completed={false} time="35 min" />
              <LessonCard title="Modern Opening Theory" completed={false} time="45 min" />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Tactics Trainer
  if (mode === 'tactics') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.detailContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Tactics Trainer</Text>
          <Text style={styles.subtitle}>Rating: {tacticsRating} • Solved: 234</Text>

          <View style={styles.ratingCard}>
            <Text style={styles.ratingLabel}>Your Tactics Rating</Text>
            <Text style={styles.ratingValue}>{tacticsRating}</Text>
            <Text style={styles.ratingChange}>+15 this week</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.buttonText}>Start Training Session</Text>
          </TouchableOpacity>

          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <CategoryButton icon="🔱" title="Forks" count={45} />
            <CategoryButton icon="📌" title="Pins" count={38} />
            <CategoryButton icon="🎭" title="Discovered Attacks" count={22} />
            <CategoryButton icon="👑" title="Back Rank Mates" count={31} />
            <CategoryButton icon="⚔️" title="Deflection" count={18} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Game Review
  if (mode === 'review') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.detailContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Game Review</Text>
          <Text style={styles.subtitle}>Analyze your recent games</Text>

          <GameReviewCard 
            opponent="Magnus2024"
            result="win"
            accuracy={87}
            blunders={1}
            mistakes={2}
          />
          <GameReviewCard 
            opponent="Stockfish_Easy"
            result="loss"
            accuracy={72}
            blunders={3}
            mistakes={4}
          />
          <GameReviewCard 
            opponent="ChessGuru99"
            result="draw"
            accuracy={81}
            blunders={0}
            mistakes={3}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Openings Explorer
  if (mode === 'openings') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.detailContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Openings Explorer</Text>
          <Text style={styles.subtitle}>Build your opening repertoire</Text>

          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Your Repertoire</Text>
            <OpeningCard 
              name="Italian Game"
              eco="C50"
              games={28}
              winRate={64}
            />
            <OpeningCard 
              name="Sicilian Defense"
              eco="B20"
              games={42}
              winRate={58}
            />
            <OpeningCard 
              name="Queen's Gambit"
              eco="D06"
              games={19}
              winRate={71}
            />
          </View>

          <TouchableOpacity style={[styles.button, styles.secondary]}>
            <Text style={styles.buttonText}>+ Add Opening</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// Helper Components
function LessonCard({ title, completed, time }: { title: string; completed: boolean; time: string }) {
  return (
    <TouchableOpacity style={styles.lessonCard}>
      <Text style={styles.lessonIcon}>{completed ? '✅' : '⭕'}</Text>
      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle}>{title}</Text>
        <Text style={styles.lessonTime}>⏱️ {time}</Text>
      </View>
    </TouchableOpacity>
  );
}

function CategoryButton({ icon, title, count }: { icon: string; title: string; count: number }) {
  return (
    <TouchableOpacity style={styles.categoryButton}>
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryCount}>{count} puzzles</Text>
    </TouchableOpacity>
  );
}

function GameReviewCard({ 
  opponent, 
  result, 
  accuracy, 
  blunders, 
  mistakes 
}: { 
  opponent: string; 
  result: 'win' | 'loss' | 'draw'; 
  accuracy: number;
  blunders: number;
  mistakes: number;
}) {
  const resultColor = result === 'win' ? '#34C759' : result === 'loss' ? '#FF3B30' : '#8E8E93';
  const resultText = result === 'win' ? '🏆 Win' : result === 'loss' ? '❌ Loss' : '🤝 Draw';
  
  return (
    <TouchableOpacity style={styles.gameCard}>
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameOpponent}>vs {opponent}</Text>
        <Text style={[styles.gameResult, { color: resultColor }]}>{resultText}</Text>
      </View>
      <View style={styles.gameStats}>
        <View style={styles.gameStat}>
          <Text style={styles.gameStatLabel}>Accuracy</Text>
          <Text style={styles.gameStatValue}>{accuracy}%</Text>
        </View>
        <View style={styles.gameStat}>
          <Text style={styles.gameStatLabel}>Blunders</Text>
          <Text style={styles.gameStatValue}>{blunders}</Text>
        </View>
        <View style={styles.gameStat}>
          <Text style={styles.gameStatLabel}>Mistakes</Text>
          <Text style={styles.gameStatValue}>{mistakes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function OpeningCard({ 
  name, 
  eco, 
  games, 
  winRate 
}: { 
  name: string; 
  eco: string; 
  games: number; 
  winRate: number;
}) {
  return (
    <TouchableOpacity style={styles.openingCard}>
      <View style={styles.openingHeader}>
        <Text style={styles.openingName}>{name}</Text>
        <Text style={styles.openingEco}>{eco}</Text>
      </View>
      <View style={styles.openingStats}>
        <Text style={styles.openingStat}>📊 {games} games</Text>
        <Text style={[styles.openingStat, { color: winRate >= 55 ? '#34C759' : '#FF9500' }]}>
          {winRate}% win rate
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#667EEA',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  detailContent: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#007AFF',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  lessonTime: {
    fontSize: 13,
    color: '#666',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  ratingChange: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categorySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  categoryCount: {
    fontSize: 13,
    color: '#666',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameOpponent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  gameResult: {
    fontSize: 16,
    fontWeight: '600',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameStat: {
    alignItems: 'center',
  },
  gameStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  gameStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  openingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  openingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  openingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  openingEco: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  openingStats: {
    flexDirection: 'row',
    gap: 16,
  },
  openingStat: {
    fontSize: 13,
    color: '#666',
  },
});
