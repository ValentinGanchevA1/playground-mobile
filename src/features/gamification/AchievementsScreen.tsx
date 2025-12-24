// src/features/gamification/AchievementsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiClient } from '../../api/client';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  criteria: {
    type: string;
    target: number;
  };
}

interface UserAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  progress: number;
  unlockedAt: string | null;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9e9e9e',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

const RARITY_BACKGROUNDS: Record<string, string> = {
  common: '#2a2a3a',
  rare: '#1a2a3a',
  epic: '#2a1a3a',
  legendary: '#3a2a1a',
};

const CATEGORY_ICONS: Record<string, string> = {
  social: 'account-group',
  events: 'calendar-star',
  profile: 'account-check',
  premium: 'crown',
};

export const AchievementsScreen: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchAchievements = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [allResponse, myResponse] = await Promise.all([
        apiClient.get('/achievements'),
        apiClient.get('/achievements/my'),
      ]);

      setAchievements(allResponse.data);
      setUserAchievements(myResponse.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getUnlockedAchievement = (achievementId: string) => {
    return userAchievements.find((ua) => ua.achievementId === achievementId);
  };

  const categories = ['social', 'events', 'profile', 'premium'];

  const filteredAchievements = selectedCategory
    ? achievements.filter((a) => a.category === selectedCategory)
    : achievements;

  const unlockedCount = userAchievements.filter((ua) => ua.unlockedAt).length;
  const totalXP = userAchievements
    .filter((ua) => ua.unlockedAt)
    .reduce((sum, ua) => sum + (ua.achievement?.xpReward || 0), 0);

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const userAchievement = getUnlockedAchievement(item.id);
    const isUnlocked = userAchievement?.unlockedAt;
    const progress = userAchievement?.progress || 0;
    const progressPercent = Math.min((progress / item.criteria.target) * 100, 100);

    return (
      <View
        style={[
          styles.achievementCard,
          {
            backgroundColor: isUnlocked
              ? RARITY_BACKGROUNDS[item.rarity] || '#2a2a3a'
              : '#1a1a24',
            opacity: isUnlocked ? 1 : 0.7,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isUnlocked
                ? RARITY_COLORS[item.rarity] || '#666'
                : '#333',
            },
          ]}
        >
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>

        <View style={styles.achievementContent}>
          <View style={styles.achievementHeader}>
            <Text style={styles.achievementName}>{item.name}</Text>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: RARITY_COLORS[item.rarity] || '#666' },
              ]}
            >
              <Text style={styles.rarityText}>{item.rarity}</Text>
            </View>
          </View>

          <Text style={styles.achievementDescription}>{item.description}</Text>

          {!isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: RARITY_COLORS[item.rarity] || '#666',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{item.criteria.target}
              </Text>
            </View>
          )}

          <View style={styles.achievementFooter}>
            <View style={styles.xpBadge}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.xpText}>{item.xpReward} XP</Text>
            </View>

            {isUnlocked && (
              <View style={styles.unlockedBadge}>
                <Icon name="check-circle" size={14} color="#4CAF50" />
                <Text style={styles.unlockedText}>Unlocked</Text>
              </View>
            )}
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
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}/{achievements.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoryFilters}>
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Icon
              name={CATEGORY_ICONS[category] || 'trophy'}
              size={14}
              color={selectedCategory === category ? '#000' : '#888'}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAchievements}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievement}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchAchievements(true)}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="trophy-outline" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Achievements Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring to unlock achievements!
            </Text>
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2a2a3a',
    marginHorizontal: 16,
  },
  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: '#00d4ff',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#000',
  },
  listContent: {
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 28,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  achievementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
