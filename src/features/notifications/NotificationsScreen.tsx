// src/features/notifications/NotificationsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Notification {
  id: string;
  type: 'wave' | 'match' | 'message' | 'offer' | 'event' | 'system';
  title: string;
  body: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  data?: {
    userId?: string;
    listingId?: string;
    eventId?: string;
    chatId?: string;
  };
}

// Mock notifications - replace with actual state/API
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'wave',
    title: 'New Wave!',
    body: 'Sarah waved at you',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    data: { userId: 'user-1' },
  },
  {
    id: '2',
    type: 'offer',
    title: 'New Offer',
    body: 'Someone made an offer on your Vintage Watch',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    data: { listingId: 'listing-1' },
  },
  {
    id: '3',
    type: 'event',
    title: 'Event Reminder',
    body: 'Coffee Meetup starts in 1 hour',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    data: { eventId: 'event-1' },
  },
  {
    id: '4',
    type: 'match',
    title: 'New Match!',
    body: 'You and Alex matched',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    data: { userId: 'user-2' },
  },
  {
    id: '5',
    type: 'system',
    title: 'Welcome!',
    body: 'Complete your profile to get more matches',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

const getNotificationIcon = (type: string): { name: string; color: string } => {
  switch (type) {
    case 'wave':
      return { name: 'hand-wave', color: '#FFD700' };
    case 'match':
      return { name: 'heart', color: '#FF6B6B' };
    case 'message':
      return { name: 'message', color: '#00d4ff' };
    case 'offer':
      return { name: 'tag', color: '#4ECDC4' };
    case 'event':
      return { name: 'calendar-star', color: '#9B59B6' };
    case 'system':
      return { name: 'information', color: '#888' };
    default:
      return { name: 'bell', color: '#888' };
  }
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch notifications from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );

    // Navigate based on type
    switch (notification.type) {
      case 'wave':
      case 'match':
        if (notification.data?.userId) {
          navigation.navigate('UserProfile', { userId: notification.data.userId });
        }
        break;
      case 'message':
        if (notification.data?.chatId) {
          navigation.navigate('Chat', { recipientId: notification.data.chatId });
        }
        break;
      case 'offer':
        navigation.navigate('Offers');
        break;
      case 'event':
        if (notification.data?.eventId) {
          navigation.navigate('EventDetail', { eventId: notification.data.eventId });
        }
        break;
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
      >
        {/* Avatar or Icon */}
        <View style={styles.iconContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: icon.color + '20' }]}>
              <Icon name={icon.name} size={22} color={icon.color} />
            </View>
          )}
          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: icon.color }]}>
            <Icon name={icon.name} size={10} color="#fff" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>

        {/* Unread indicator */}
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="bell-off-outline" size={64} color="#333" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! We'll notify you when something happens.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.headerAction} onPress={handleMarkAllRead}>
            <Icon name="check-all" size={24} color="#00d4ff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Unread count */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBanner: {
    backgroundColor: '#00d4ff20',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unreadBannerText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  unreadItem: {
    backgroundColor: 'rgba(0,212,255,0.05)',
  },
  iconContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ccc',
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#fff',
  },
  body: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00d4ff',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
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
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
