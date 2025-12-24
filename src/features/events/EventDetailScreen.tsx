// src/features/events/EventDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiClient } from '../../api/client';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  startTime: string;
  endTime: string;
  maxCapacity: number | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  status: string;
  host: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  attendeeCount: number;
  isAttending: boolean;
  attendees: Array<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
  }>;
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

export const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data } = await apiClient.get(`/events/${eventId}`);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!event) return;

    setIsJoining(true);
    try {
      if (event.isAttending) {
        await apiClient.delete(`/events/${eventId}/leave`);
        setEvent({ ...event, isAttending: false, attendeeCount: event.attendeeCount - 1 });
      } else {
        await apiClient.post(`/events/${eventId}/join`);
        setEvent({ ...event, isAttending: true, attendeeCount: event.attendeeCount + 1 });
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update attendance');
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Icon name="calendar-remove" size={64} color="#333" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFull = !!(event.maxCapacity && event.attendeeCount >= event.maxCapacity);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        {event.coverImageUrl ? (
          <Image source={{ uri: event.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View
            style={[
              styles.coverPlaceholder,
              { backgroundColor: CATEGORY_COLORS[event.category] || '#333' },
            ]}
          >
            <Icon
              name={CATEGORY_ICONS[event.category] || 'calendar'}
              size={80}
              color="#fff"
            />
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: CATEGORY_COLORS[event.category] || '#333' },
            ]}
          >
            <Icon
              name={CATEGORY_ICONS[event.category] || 'calendar'}
              size={14}
              color="#fff"
            />
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          {/* Host Info */}
          <TouchableOpacity style={styles.hostRow}>
            {event.host.avatarUrl ? (
              <Image source={{ uri: event.host.avatarUrl }} style={styles.hostAvatar} />
            ) : (
              <View style={styles.hostAvatarPlaceholder}>
                <Text style={styles.hostInitial}>{event.host.displayName?.[0]}</Text>
              </View>
            )}
            <View style={styles.hostInfo}>
              <Text style={styles.hostedBy}>Hosted by</Text>
              <Text style={styles.hostName}>{event.host.displayName}</Text>
            </View>
          </TouchableOpacity>

          {/* Date & Time */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="calendar" size={24} color="#00d4ff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.startTime)}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={24} color="#00d4ff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={24} color="#00d4ff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.address}</Text>
              </View>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Attendees */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attendees</Text>
              <Text style={styles.attendeeCount}>
                {event.attendeeCount}
                {event.maxCapacity ? `/${event.maxCapacity}` : ''}
              </Text>
            </View>

            {event.attendees && event.attendees.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.attendeesList}
              >
                {event.attendees.slice(0, 10).map((attendee) => (
                  <View key={attendee.id} style={styles.attendeeItem}>
                    {attendee.avatarUrl ? (
                      <Image
                        source={{ uri: attendee.avatarUrl }}
                        style={styles.attendeeAvatar}
                      />
                    ) : (
                      <View style={styles.attendeeAvatarPlaceholder}>
                        <Text style={styles.attendeeInitial}>
                          {attendee.displayName?.[0]}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.attendeeName} numberOfLines={1}>
                      {attendee.displayName}
                    </Text>
                  </View>
                ))}
                {event.attendeeCount > 10 && (
                  <View style={styles.moreAttendees}>
                    <Text style={styles.moreAttendeesText}>
                      +{event.attendeeCount - 10}
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <Text style={styles.noAttendees}>Be the first to join!</Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[
            styles.joinButton,
            event.isAttending && styles.leaveButton,
            isFull && !event.isAttending && styles.fullButton,
          ]}
          onPress={handleJoin}
          disabled={isJoining || (isFull && !event.isAttending)}
        >
          {isJoining ? (
            <ActivityIndicator color={event.isAttending ? '#ff4444' : '#000'} />
          ) : (
            <>
              <Icon
                name={event.isAttending ? 'close' : isFull ? 'account-cancel' : 'check'}
                size={20}
                color={event.isAttending ? '#ff4444' : isFull ? '#666' : '#000'}
              />
              <Text
                style={[
                  styles.joinButtonText,
                  event.isAttending && styles.leaveButtonText,
                  isFull && !event.isAttending && styles.fullButtonText,
                ]}
              >
                {event.isAttending
                  ? 'Leave Event'
                  : isFull
                  ? 'Event Full'
                  : 'Join Event'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  errorText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1a1a24',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  coverImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    marginTop: -30,
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  hostAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  hostInfo: {
    marginLeft: 12,
  },
  hostedBy: {
    fontSize: 12,
    color: '#888',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2a2a3a',
    marginVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#aaa',
    lineHeight: 24,
  },
  attendeeCount: {
    fontSize: 14,
    color: '#00d4ff',
    fontWeight: '600',
  },
  attendeesList: {
    gap: 12,
  },
  attendeeItem: {
    alignItems: 'center',
    width: 70,
  },
  attendeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  attendeeAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  attendeeName: {
    fontSize: 11,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  moreAttendees: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAttendeesText: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  noAttendees: {
    color: '#666',
    fontSize: 14,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: '#0a0a0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  leaveButtonText: {
    color: '#ff4444',
  },
  fullButton: {
    backgroundColor: '#2a2a3a',
  },
  fullButtonText: {
    color: '#666',
  },
});
