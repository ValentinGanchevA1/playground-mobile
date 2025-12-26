// src/features/inbox/InboxScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchReceivedOffers, fetchSentOffers, TradeOffer } from '../trading/tradingSlice';

type FilterType = 'all' | 'social' | 'buying' | 'selling';

interface ChatItem {
  id: string;
  type: 'social' | 'buying' | 'selling';
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  listingTitle?: string;
  listingPhoto?: string;
  offerId?: string;
}

export const InboxScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const { chats } = useAppSelector((state) => state.chat);
  const { receivedOffers, sentOffers } = useAppSelector((state) => state.trading);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchReceivedOffers()),
      dispatch(fetchSentOffers()),
    ]);
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Convert chats and offers to unified format
  const getUnifiedItems = (): ChatItem[] => {
    const items: ChatItem[] = [];

    // Add social chats
    chats.forEach((chat: any) => {
      items.push({
        id: `chat-${chat.id}`,
        type: 'social',
        participantId: chat.participantId || chat.id,
        participantName: chat.participantName || 'Unknown',
        participantAvatar: chat.participantAvatar || null,
        lastMessage: chat.lastMessage?.content || 'Start chatting!',
        timestamp: new Date(chat.updatedAt || chat.lastMessage?.createdAt || Date.now()),
        unreadCount: chat.unreadCount || 0,
      });
    });

    // Add buying offers (offers I've sent)
    sentOffers
      .filter((offer) => offer.status === 'pending' || offer.status === 'accepted')
      .forEach((offer: TradeOffer) => {
        items.push({
          id: `buying-${offer.id}`,
          type: 'buying',
          participantId: offer.listing?.sellerId || '',
          participantName: offer.listing?.sellerName || 'Seller',
          participantAvatar: offer.listing?.sellerAvatar || null,
          lastMessage: offer.status === 'accepted'
            ? 'Offer accepted! Arrange the meetup'
            : `Your offer: ${offer.offerItems || 'Pending'}`,
          timestamp: new Date(offer.createdAt),
          unreadCount: offer.status === 'accepted' ? 1 : 0,
          listingTitle: offer.listing?.title,
          listingPhoto: offer.listing?.photos?.[0],
          offerId: offer.id,
        });
      });

    // Add selling offers (offers I've received)
    receivedOffers
      .filter((offer) => offer.status === 'pending')
      .forEach((offer: TradeOffer) => {
        items.push({
          id: `selling-${offer.id}`,
          type: 'selling',
          participantId: offer.buyer?.id || offer.buyerId,
          participantName: offer.buyer?.displayName || 'Buyer',
          participantAvatar: offer.buyer?.avatarUrl || null,
          lastMessage: `Offer: ${offer.offerItems || 'View offer'}`,
          timestamp: new Date(offer.createdAt),
          unreadCount: 1,
          listingTitle: offer.listing?.title,
          listingPhoto: offer.listing?.photos?.[0],
          offerId: offer.id,
        });
      });

    // Sort by timestamp descending
    items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Filter based on active filter
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.type === activeFilter);
  };

  const handleItemPress = (item: ChatItem) => {
    if (item.type === 'social') {
      navigation.navigate('Chat', {
        recipientId: item.participantId,
        recipientName: item.participantName,
      });
    } else if ((item.type === 'buying' || item.type === 'selling') && item.offerId) {
      navigation.navigate('TradeOfferDetail', { offerId: item.offerId });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'social': return 'chat';
      case 'buying': return 'cart-arrow-down';
      case 'selling': return 'cart-arrow-up';
      default: return 'chat';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'social': return '#00d4ff';
      case 'buying': return '#4ECDC4';
      case 'selling': return '#FF6B6B';
      default: return '#666';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.participantAvatar ? (
          <Image source={{ uri: item.participantAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Icon name="account" size={24} color="#666" />
          </View>
        )}
        {/* Type indicator */}
        <View style={[styles.typeIndicator, { backgroundColor: getTypeBadgeColor(item.type) }]}>
          <Icon name={getTypeIcon(item.type)} size={10} color="#fff" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {item.participantName}
          </Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>

        {/* Listing context for trading */}
        {item.listingTitle && (
          <View style={styles.listingContext}>
            {item.listingPhoto && (
              <Image source={{ uri: item.listingPhoto }} style={styles.listingThumb} />
            )}
            <Text style={styles.listingTitle} numberOfLines={1}>
              {item.listingTitle}
            </Text>
          </View>
        )}

        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {/* Unread badge */}
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {item.unreadCount > 9 ? '9+' : item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Icon name="chat-outline" size={64} color="#333" />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all'
          ? 'Start chatting with people nearby or make trade offers!'
          : `No ${activeFilter} conversations yet`}
      </Text>
    </View>
  );

  const items = getUnifiedItems();
  const socialCount = items.filter((i) => i.type === 'social').length;
  const buyingCount = items.filter((i) => i.type === 'buying').length;
  const sellingCount = items.filter((i) => i.type === 'selling').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'social' && styles.filterChipActive]}
          onPress={() => setActiveFilter('social')}
        >
          <Icon
            name="chat"
            size={14}
            color={activeFilter === 'social' ? '#000' : '#888'}
          />
          <Text style={[styles.filterChipText, activeFilter === 'social' && styles.filterChipTextActive]}>
            Social
          </Text>
          {socialCount > 0 && <Text style={styles.filterCount}>{socialCount}</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'buying' && styles.filterChipActive]}
          onPress={() => setActiveFilter('buying')}
        >
          <Icon
            name="cart-arrow-down"
            size={14}
            color={activeFilter === 'buying' ? '#000' : '#888'}
          />
          <Text style={[styles.filterChipText, activeFilter === 'buying' && styles.filterChipTextActive]}>
            Buying
          </Text>
          {buyingCount > 0 && <Text style={styles.filterCount}>{buyingCount}</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'selling' && styles.filterChipActive]}
          onPress={() => setActiveFilter('selling')}
        >
          <Icon
            name="cart-arrow-up"
            size={14}
            color={activeFilter === 'selling' ? '#000' : '#888'}
          />
          <Text style={[styles.filterChipText, activeFilter === 'selling' && styles.filterChipTextActive]}>
            Selling
          </Text>
          {sellingCount > 0 && <Text style={styles.filterCount}>{sellingCount}</Text>}
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#00d4ff',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  filterChipTextActive: {
    color: '#000',
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a24',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  listingContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
    gap: 6,
  },
  listingThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  listingTitle: {
    flex: 1,
    fontSize: 12,
    color: '#888',
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
  },
  unreadBadge: {
    backgroundColor: '#00d4ff',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
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

export default InboxScreen;
