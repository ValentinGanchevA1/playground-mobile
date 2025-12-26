// src/features/trading/TradeOfferDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchReceivedOffers,
  fetchSentOffers,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  TradeOffer,
} from './tradingSlice';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ScreenRouteProp = RouteProp<RootStackParamList, 'TradeOfferDetail'>;

const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: '#FFC107',
  accepted: '#4CAF50',
  rejected: '#ff4444',
  withdrawn: '#666',
};

export const TradeOfferDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { offerId } = route.params;

  const { receivedOffers, sentOffers } = useAppSelector(
    (state) => state.trading
  );
  const { user } = useAppSelector((state) => state.auth);

  const [offer, setOffer] = useState<TradeOffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Find offer in store
    const foundOffer =
      receivedOffers.find((o) => o.id === offerId) ||
      sentOffers.find((o) => o.id === offerId);

    if (foundOffer) {
      setOffer(foundOffer);
    } else {
      // If not found, try fetching
      dispatch(fetchReceivedOffers());
      dispatch(fetchSentOffers());
    }
  }, [offerId, receivedOffers, sentOffers, dispatch]);

  const isReceived = offer?.listing?.sellerId === user?.id;

  const handleAccept = () => {
    if (!offer) return;
    Alert.alert(
      'Accept Offer',
      'Accept this offer? Other offers for this listing will be rejected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await dispatch(acceptOffer(offer.id)).unwrap();
              Alert.alert('Success', 'Offer accepted! Contact the buyer to arrange the trade.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to accept');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    if (!offer) return;
    Alert.alert(
      'Reject Offer',
      'Are you sure you want to reject this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await dispatch(rejectOffer(offer.id)).unwrap();
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reject');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleWithdraw = () => {
    if (!offer) return;
    Alert.alert(
      'Withdraw Offer',
      'Are you sure you want to withdraw this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await dispatch(withdrawOffer(offer.id)).unwrap();
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to withdraw');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  if (!offer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: OFFER_STATUS_COLORS[offer.status] + '20' }]}>
          <Icon name="information" size={20} color={OFFER_STATUS_COLORS[offer.status]} />
          <Text style={[styles.statusText, { color: OFFER_STATUS_COLORS[offer.status] }]}>
            Status: {offer.status.toUpperCase()}
          </Text>
        </View>

        {/* Listing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing</Text>
          <TouchableOpacity
            style={styles.listingCard}
            onPress={() => offer.listing && navigation.navigate('ListingDetail', { listingId: offer.listing.id })}
          >
            {offer.listing?.photos?.[0] ? (
              <Image source={{ uri: offer.listing.photos[0] }} style={styles.listingImage} />
            ) : (
              <View style={[styles.listingImage, styles.placeholderImage]}>
                <Icon name="image-off" size={24} color="#666" />
              </View>
            )}
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle}>{offer.listing?.title}</Text>
              <Text style={styles.listingPrice}>
                {offer.listing?.lookingFor || 'Open to offers'}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Offer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer</Text>
          <View style={styles.offerCard}>
            <View style={styles.userRow}>
              {offer.buyer?.avatarUrl ? (
                <Image source={{ uri: offer.buyer.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Icon name="account" size={24} color="#666" />
                </View>
              )}
              <View>
                <Text style={styles.userName}>{offer.buyer?.displayName || 'Unknown User'}</Text>
                <Text style={styles.timestamp}>
                  {new Date(offer.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.offerContent}>
              <Text style={styles.label}>Offering:</Text>
              <Text style={styles.offerText}>{offer.offerItems}</Text>
            </View>

            {offer.message && (
              <View style={styles.messageBox}>
                <Icon name="format-quote-open" size={20} color="#666" />
                <Text style={styles.messageText}>{offer.message}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      {offer.status === 'pending' && (
        <View style={styles.footer}>
          {isReceived ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={isProcessing}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept Offer</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={handleWithdraw}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.withdrawButtonText}>Withdraw Offer</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 12,
    borderRadius: 12,
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    color: '#00d4ff',
  },
  offerCard: {
    backgroundColor: '#1a1a24',
    padding: 16,
    borderRadius: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  placeholderAvatar: {
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  offerContent: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  offerText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0f',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  rejectButtonText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: '#00d4ff',
  },
  acceptButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  withdrawButton: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#666',
  },
  withdrawButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
