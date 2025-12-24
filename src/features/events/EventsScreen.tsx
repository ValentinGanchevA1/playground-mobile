// src/features/events/EventsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiClient } from '../../api/client';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  startTime: string;
  endTime: string;
  maxCapacity: number | null;
  coverImageUrl: string | null;
  hostName: string;
  hostAvatar: string | null;
  attendeeCount: number;
  distance: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  music: 'music',
  sports: 'basketball',
  food: 'food',
  social: 'account-group',
  business: 'briefcase',
  gaming: 'gamepad-variant',
  fitness: 'dumbbell',
  arts: 'palette',
  networking: 'handshake',
  other: 'calendar',
};

const CATEGORY_COLORS: Record<string, string> = {
  music: '#9C27B0',
  sports: '#4CAF50',
  food: '#FF9800',
  social: '#00d4ff',
  business: '#607D8B',
  gaming: '#E91E63',
  fitness: '#FF5722',
  arts: '#3F51B5',
  networking: '#009688',
  other: '#666',
};

export const EventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEvents = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // Using Sofia coordinates as default (should get from device)
      const { data } = await apiClient.get('/events/nearby', {
        params: {
          latitude: 42.6977,
          longitude: 23.3219,
          radius: 20,
          limit: 50,
        },
      });
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.8}
    >
      {item.coverImageUrl ? (
        <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: CATEGORY_COLORS[item.category] || '#333' }]}>
          <Icon name={CATEGORY_ICONS[item.category] || 'calendar'} size={40} color="#fff" />
        </View>
      )}

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] || '#333' }]}>
            <Icon name={CATEGORY_ICONS[item.category] || 'calendar'} size={12} color="#fff" />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>

        <View style={styles.eventMeta}>
          <Icon name="clock-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{formatDate(item.startTime)}</Text>
        </View>

        {item.address && (
          <View style={styles.eventMeta}>
            <Icon name="map-marker-outline" size={14} color="#888" />
            <Text style={styles.metaText} numberOfLines={1}>{item.address}</Text>
          </View>
        )}

        <View style={styles.eventFooter}>
          <View style={styles.hostInfo}>
            {item.hostAvatar ? (
              <Image source={{ uri: item.hostAvatar }} style={styles.hostAvatar} />
            ) : (
              <View style={styles.hostAvatarPlaceholder}>
                <Text style={styles.hostInitial}>{item.hostName?.[0]}</Text>
              </View>
            )}
            <Text style={styles.hostName}>{item.hostName}</Text>
          </View>

          <View style={styles.attendeeInfo}>
            <Icon name="account-group" size={16} color="#00d4ff" />
            <Text style={styles.attendeeCount}>
              {item.attendeeCount}{item.maxCapacity ? `/${item.maxCapacity}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Icon name="plus" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchEvents(true)}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="calendar-blank" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Events Nearby</Text>
            <Text style={styles.emptySubtitle}>Be the first to create an event!</Text>
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Text style={styles.createEventText}>Create Event</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  distance: {
    color: '#888',
    fontSize: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    color: '#888',
    fontSize: 13,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3a',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  hostAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  hostName: {
    color: '#aaa',
    fontSize: 13,
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeeCount: {
    color: '#00d4ff',
    fontSize: 13,
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
  createEventButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  createEventText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
