import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useSocial } from '@/contexts/SocialContext';
import type { Club } from '@/contexts/SocialContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export default function ClubsScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { getClubs, getMyClubs, joinClub, leaveClub, createClub, isLoading } = useSocial();
  
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [selectedTab, setSelectedTab] = useState<'discover' | 'my-clubs'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clubs, mine] = await Promise.all([getClubs(), getMyClubs()]);
      setAllClubs(clubs);
      setMyClubs(mine);
    } catch (error) {
      console.error('Failed to load clubs data:', error);
      // Silently fail - user needs to be authenticated
    }
  };

  const handleJoinClub = async (clubId: string) => {
    await joinClub(clubId);
    loadData();
  };

  const handleLeaveClub = async (clubId: string) => {
    await leaveClub(clubId);
    loadData();
  };

  const filteredClubs = allClubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClubCard = ({ item, index }: { item: Club; index: number }) => {
    const isMember = myClubs.some((c) => c.id === item.id);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <Card variant="default" size="md" style={{ marginBottom: 12 }}>
          <View style={styles.clubCard}>
            <VStack gap={2} style={{ flex: 1 }}>
              <View style={styles.clubHeader}>
                <Text style={styles.clubIcon}>{item.isPrivate ? '🔒' : '🌐'}</Text>
                <Text style={styles.clubName}>{item.name}</Text>
              </View>
              
              <Text style={styles.clubDescription} numberOfLines={2}>
                {item.description}
              </Text>
              
              <View style={styles.clubStats}>
                <Text style={styles.clubStat}>👥 {ti('social.member_count', { count: item.memberCount })}</Text>
                <Text style={styles.clubStat}>⭐ {ti('social.avg_rating', { rating: item.averageRating })}</Text>
                {item.createdBy && (
                  <Text style={styles.clubStat}>{ti('social.created_by', { name: item.createdBy })}</Text>
                )}
              </View>
            </VStack>

            <TouchableOpacity
              style={[styles.clubButton, isMember && styles.clubButtonJoined]}
              onPress={() => (isMember ? handleLeaveClub(item.id) : handleJoinClub(item.id))}
            >
              <Text style={[styles.clubButtonText, isMember && styles.clubButtonTextJoined]}>
                {isMember ? t('social.joined') : t('social.join_club')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.title}>{t('social.clubs')}</Text>
            <Text style={styles.subtitle}>{t('social.join_communities')}</Text>
          </Animated.View>

          {/* Tabs */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
                onPress={() => setSelectedTab('discover')}
              >
                <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
                  🌍 {t('social.discover')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'my-clubs' && styles.tabActive]}
                onPress={() => setSelectedTab('my-clubs')}
              >
                <Text style={[styles.tabText, selectedTab === 'my-clubs' && styles.tabTextActive]}>
                  👥 {ti('social.my_clubs_count', { count: myClubs.length })}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Search Bar (Discover Tab) */}
          {selectedTab === 'discover' && (
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('social.search_clubs')}
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Animated.View>
          )}

          {/* Content */}
          {selectedTab === 'discover' && (
            <VStack gap={2}>
              {filteredClubs.length === 0 ? (
                <Card variant="default" size="md">
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyTitle}>{t('social.no_clubs_found')}</Text>
                    <Text style={styles.emptyText}>
                      {searchQuery
                        ? t('social.try_different_search')
                        : t('social.be_first_to_create')}
                    </Text>
                  </View>
                </Card>
              ) : (
                <FlatList
                  data={filteredClubs}
                  renderItem={renderClubCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </VStack>
          )}

          {selectedTab === 'my-clubs' && (
            <VStack gap={2}>
              {myClubs.length === 0 ? (
                <Card variant="default" size="md">
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🏛️</Text>
                    <Text style={styles.emptyTitle}>{t('social.not_in_clubs')}</Text>
                    <Text style={styles.emptyText}>
                      {t('social.join_or_create_club')}
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => setSelectedTab('discover')}
                    >
                      <Text style={styles.emptyButtonText}>{t('social.discover_clubs_button')}</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ) : (
                <FlatList
                  data={myClubs}
                  renderItem={renderClubCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  tabActive: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  searchInput: {
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#334155',
  },
  clubCard: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clubIcon: {
    fontSize: 20,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  clubDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  clubStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  clubStat: {
    fontSize: 12,
    color: '#64748B',
  },
  clubButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#667EEA',
    minWidth: 80,
    alignItems: 'center',
  },
  clubButtonJoined: {
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  clubButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clubButtonTextJoined: {
    color: '#10B981',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#667EEA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
