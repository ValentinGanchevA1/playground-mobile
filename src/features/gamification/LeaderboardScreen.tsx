// src/features/gamification/LeaderboardScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiClient } from '../../api/client';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank: number | null;
  userScore: number | null;
}

type LeaderboardType = 'xp' | 'events' | 'matches' | 'gifts';
type LeaderboardPeriod = 'weekly' | 'monthly' | 'alltime';

const TYPE_LABELS: Record<LeaderboardType, { label: string; icon: string }> = {
  xp: { label: 'XP', icon: 'star' },
  events: { label: 'Events', icon: 'calendar' },
  matches: { label: 'Matches', icon: 'heart' },
  gifts: { label: 'Gifts', icon: 'gift' },
};

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  weekly: 'This Week',
  monthly: 'This Month',
  alltime: 'All Time',
};

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export const LeaderboardScreen: React.FC = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaderboardType>('xp');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('weekly');

  const fetchLeaderboard = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: response } = await apiClient.get(
        `/leaderboard/${selectedType}`,
        { params: { period: selectedPeriod } }
      );
      setData(response);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedType, selectedPeriod]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const renderPodium = () => {
    if (!data || data.entries.length < 3) return null;

    const top3 = data.entries.slice(0, 3);
    const [first, second, third] = top3;

    return (
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <View style={styles.podiumItem}>
          <View style={styles.podiumAvatarContainer}>
            {second.avatarUrl ? (
              <Image source={{ uri: second.avatarUrl }} style={styles.podiumAvatar} />
            ) : (
              <View style={styles.podiumAvatarPlaceholder}>
                <Text style={styles.podiumInitial}>{second.displayName?.[0]}</Text>
              </View>
            )}
            <View style={[styles.podiumBadge, { backgroundColor: RANK_COLORS[2] }]}>
              <Text style={styles.podiumBadgeText}>2</Text>
            </View>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>{second.displayName}</Text>
          <Text style={styles.podiumScore}>{second.score.toLocaleString()}</Text>
          <View style={[styles.podiumBar, styles.podiumBar2]} />
        </View>

        {/* First Place */}
        <View style={styles.podiumItem}>
          <Icon name="crown" size={24} color="#FFD700" style={styles.crownIcon} />
          <View style={styles.podiumAvatarContainer}>
            {first.avatarUrl ? (
              <Image source={{ uri: first.avatarUrl }} style={[styles.podiumAvatar, styles.podiumAvatar1]} />
            ) : (
              <View style={[styles.podiumAvatarPlaceholder, styles.podiumAvatar1]}>
                <Text style={[styles.podiumInitial, { fontSize: 24 }]}>{first.displayName?.[0]}</Text>
              </View>
            )}
            <View style={[styles.podiumBadge, styles.podiumBadge1, { backgroundColor: RANK_COLORS[1] }]}>
              <Text style={styles.podiumBadgeText}>1</Text>
            </View>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>{first.displayName}</Text>
          <Text style={[styles.podiumScore, styles.podiumScore1]}>{first.score.toLocaleString()}</Text>
          <View style={[styles.podiumBar, styles.podiumBar1]} />
        </View>

        {/* Third Place */}
        <View style={styles.podiumItem}>
          <View style={styles.podiumAvatarContainer}>
            {third.avatarUrl ? (
              <Image source={{ uri: third.avatarUrl }} style={styles.podiumAvatar} />
            ) : (
              <View style={styles.podiumAvatarPlaceholder}>
                <Text style={styles.podiumInitial}>{third.displayName?.[0]}</Text>
              </View>
            )}
            <View style={[styles.podiumBadge, { backgroundColor: RANK_COLORS[3] }]}>
              <Text style={styles.podiumBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>{third.displayName}</Text>
          <Text style={styles.podiumScore}>{third.score.toLocaleString()}</Text>
          <View style={[styles.podiumBar, styles.podiumBar3]} />
        </View>
      </View>
    );
  };

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    if (index < 3) return null; // Already shown in podium

    return (
      <View style={styles.entryCard}>
        <Text style={styles.entryRank}>{item.rank}</Text>

        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.entryAvatar} />
        ) : (
          <View style={styles.entryAvatarPlaceholder}>
            <Text style={styles.entryInitial}>{item.displayName?.[0]}</Text>
          </View>
        )}

        <Text style={styles.entryName} numberOfLines={1}>{item.displayName}</Text>

        <View style={styles.entryScoreContainer}>
          <Icon name={TYPE_LABELS[selectedType].icon} size={14} color="#00d4ff" />
          <Text style={styles.entryScore}>{item.score.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  const renderUserRank = () => {
    if (!data || data.userRank === null) return null;

    return (
      <View style={styles.userRankCard}>
        <Text style={styles.userRankLabel}>Your Rank</Text>
        <View style={styles.userRankContent}>
          <Text style={styles.userRankNumber}>#{data.userRank}</Text>
          <View style={styles.userRankScore}>
            <Icon name={TYPE_LABELS[selectedType].icon} size={16} color="#00d4ff" />
            <Text style={styles.userRankScoreText}>
              {data.userScore?.toLocaleString() || 0}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Type Selector */}
      <View style={styles.typeSelector}>
        {(Object.keys(TYPE_LABELS) as LeaderboardType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Icon
              name={TYPE_LABELS[type].icon}
              size={18}
              color={selectedType === type ? '#000' : '#888'}
            />
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextActive,
              ]}
            >
              {TYPE_LABELS[type].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(Object.keys(PERIOD_LABELS) as LeaderboardPeriod[]).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {PERIOD_LABELS[period]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderUserRank()}

      <FlatList
        data={data?.entries || []}
        keyExtractor={(item) => item.userId}
        renderItem={renderEntry}
        ListHeaderComponent={renderPodium}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchLeaderboard(true)}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="trophy-outline" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Rankings Yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to climb the leaderboard!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1a1a24',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: '#00d4ff',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  typeButtonTextActive: {
    color: '#000',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  periodButtonActive: {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  userRankCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  userRankLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00d4ff',
  },
  userRankScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userRankScoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 20,
    marginBottom: 20,
  },
  podiumItem: {
    alignItems: 'center',
    width: 100,
  },
  crownIcon: {
    marginBottom: 4,
  },
  podiumAvatarContainer: {
    position: 'relative',
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#2a2a3a',
  },
  podiumAvatar1: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  podiumAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a4a',
  },
  podiumInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  podiumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumBadge1: {
    width: 26,
    height: 26,
    borderRadius: 13,
    bottom: -6,
    right: -6,
  },
  podiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  podiumName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  podiumScore1: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  podiumBar: {
    width: 60,
    backgroundColor: '#1a1a24',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 8,
  },
  podiumBar1: {
    height: 80,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  podiumBar2: {
    height: 60,
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
  },
  podiumBar3: {
    height: 40,
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  entryRank: {
    width: 32,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  entryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  entryAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  entryName: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  entryScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});
