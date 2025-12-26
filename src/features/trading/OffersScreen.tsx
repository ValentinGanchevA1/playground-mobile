// src/features/trading/OffersScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../store';
import {
  fetchReceivedOffers,
  fetchSentOffers,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  TradeOffer,
} from './tradingSlice';

type TabType = 'received' | 'sent';

const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: '#FFC107',
  accepted: '#4CAF50',
  rejected: '#ff4444',
  withdrawn: '#666',
};

export const OffersScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { receivedOffers, sentOffers, isLoading } = useSelector(
    (state: RootState) => state.trading,
  );

  const [activeTab, setActiveTab] = useState<TabType>('received');

  const loadOffers = useCallback(() => {
    if (activeTab === 'received') {
      dispatch(fetchReceivedOffers());
    } else {
      dispatch(fetchSentOffers());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleAccept = (offer: TradeOffer) => {
    Alert.alert(
      'Accept Offer',
      'Accept this offer? Other offers for this listing will be rejected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await dispatch(acceptOffer(offer.id)).unwrap();
              Alert.alert('Success', 'Offer accepted! Contact the buyer to arrange the trade.');
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to accept';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const handleReject = (offer: TradeOffer) => {
    Alert.alert(
      'Reject Offer',
      'Are you sure you want to reject this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(rejectOffer(offer.id)).unwrap();
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to reject';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const handleWithdraw = (offer: TradeOffer) => {
    Alert.alert(
      'Withdraw Offer',
      'Are you sure you want to withdraw this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(withdrawOffer(offer.id)).unwrap();
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to withdraw';
              Alert.alert('Error', message);
            }
          },
        },
      ],
    );
  };

  const renderReceivedOffer = ({ item }: { item: TradeOffer }) => (
    <View style={styles.offerCard}>
      {/* Buyer Info */}
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => item.buyer && navigation.navigate('UserProfile', { userId: item.buyer.id })}
      >
        {item.buyer?.avatarUrl ? (
          <Image source={{ uri: item.buyer.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Icon name="account" size={20} color="#666" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.buyer?.displayName || 'Unknown'}</Text>
          <Text style={styles.offerDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Listing */}
      {item.listing && (
        <TouchableOpacity
          style={styles.listingPreview}
          onPress={() => navigation.navigate('ListingDetail', { listingId: item.listing!.id })}
        >
          <Text style={styles.listingLabel}>For:</Text>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.listing.title}
          </Text>
        </TouchableOpacity>
      )}

      {/* Offer Details */}
      {item.offerItems && (
        <View style={styles.offerDetails}>
          <Text style={styles.offerLabel}>Offering:</Text>
          <Text style={styles.offerItems}>{item.offerItems}</Text>
        </View>
      )}
      {item.message && (
        <View style={styles.messageBox}>
          <Icon name="format-quote-open" size={16} color="#666" />
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}

      {/* Actions */}
      {item.status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item)}
          >
            <Icon name="close" size={18} color="#ff4444" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(item)}
          >
            <Icon name="check" size={18} color="#000" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status !== 'pending' && (
        <View style={[styles.statusBadge, { backgroundColor: OFFER_STATUS_COLORS[item.status] || '#666' }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );

  const renderSentOffer = ({ item }: { item: TradeOffer }) => (
    <View style={styles.offerCard}>
      {/* Listing */}
      {item.listing && (
        <TouchableOpacity
          style={styles.sentListingRow}
          onPress={() => navigation.navigate('ListingDetail', { listingId: item.listing!.id })}
        >
          {item.listing.photos?.[0] ? (
            <Image source={{ uri: item.listing.photos[0] }} style={styles.listingThumb} />
          ) : (
            <View style={[styles.listingThumb, styles.noImage]}>
              <Icon name="image-off" size={20} color="#333" />
            </View>
          )}
          <View style={styles.listingMeta}>
            <Text style={styles.listingTitle} numberOfLines={2}>
              {item.listing.title}
            </Text>
            <Text style={styles.sellerName}>
              by {item.listing.sellerName || 'Unknown'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Your Offer */}
      {item.offerItems && (
        <View style={styles.offerDetails}>
          <Text style={styles.offerLabel}>Your offer:</Text>
          <Text style={styles.offerItems}>{item.offerItems}</Text>
        </View>
      )}

      {/* Status & Actions */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: OFFER_STATUS_COLORS[item.status] || '#666' }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => handleWithdraw(item)}
          >
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="hand-wave" size={64} color="#333" />
        <Text style={styles.emptyTitle}>
          {activeTab === 'received' ? 'No Offers Received' : 'No Offers Sent'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeTab === 'received'
            ? 'When someone makes an offer on your listings, it will appear here.'
            : 'Browse listings and make offers to trade!'}
        </Text>
      </View>
    );
  };

  const offers = activeTab === 'received' ? receivedOffers : sentOffers;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Received
          </Text>
          {receivedOffers.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{receivedOffers.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Sent
          </Text>
          {sentOffers.filter((o) => o.status === 'pending').length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {sentOffers.filter((o) => o.status === 'pending').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Offers List */}
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'received' ? renderReceivedOffer : renderSentOffer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadOffers}
            tintColor="#00d4ff"
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#00d4ff" />
            </View>
          ) : null
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#1a1a24',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#00d4ff',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  tabTextActive: {
    color: '#000',
  },
  tabBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  offerCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  offerDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  listingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  listingLabel: {
    fontSize: 13,
    color: '#666',
  },
  listingTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  sentListingRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  listingThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingMeta: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  offerDetails: {
    marginBottom: 12,
  },
  offerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  offerItems: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,68,68,0.1)',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff4444',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00d4ff',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  withdrawButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#666',
  },
  withdrawButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default OffersScreen;
