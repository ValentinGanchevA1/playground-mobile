// src/features/map/components/EventQuickInfo.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NearbyEvent } from '../mapSlice';
import { CATEGORY_COLORS } from '../mapSelectors';

interface EventQuickInfoProps {
  event: NearbyEvent;
  onClose: () => void;
  onViewDetails: () => void;
}

const formatEventTime = (startTime: string): string => {
  const date = new Date(startTime);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today at ${time}`;
  if (isTomorrow) return `Tomorrow at ${time}`;

  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)}km away`;
};

export const EventQuickInfo: React.FC<EventQuickInfoProps> = ({
  event,
  onClose,
  onViewDetails,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={20} color="#888" />
      </TouchableOpacity>

      <View style={styles.content}>
        {event.coverImageUrl ? (
          <Image source={{ uri: event.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Icon name="calendar-star" size={32} color={CATEGORY_COLORS.events} />
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.meta}>
            <Icon name="clock-outline" size={14} color="#888" />
            <Text style={styles.metaText}>{formatEventTime(event.startTime)}</Text>
          </View>

          <View style={styles.meta}>
            <Icon name="account-group" size={14} color="#888" />
            <Text style={styles.metaText}>
              {event.attendeeCount} attending
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{formatDistance(event.distance)}</Text>
          </View>

          <View style={styles.host}>
            {event.hostAvatar ? (
              <Image source={{ uri: event.hostAvatar }} style={styles.hostAvatar} />
            ) : (
              <View style={styles.hostAvatarPlaceholder}>
                <Text style={styles.hostInitial}>
                  {event.hostName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <Text style={styles.hostText}>Hosted by {event.hostName}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
        <Text style={styles.viewButtonText}>View Details</Text>
        <Icon name="chevron-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    flexDirection: 'row',
  },
  coverImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: CATEGORY_COLORS.events,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  metaDot: {
    color: '#888',
    marginHorizontal: 6,
  },
  host: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  hostAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInitial: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  hostText: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 6,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CATEGORY_COLORS.events,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 14,
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EventQuickInfo;
