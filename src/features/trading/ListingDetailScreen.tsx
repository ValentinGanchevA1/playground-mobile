// src/features/trading/ListingDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import {
  fetchListingDetails,
  toggleFavorite,
  makeOffer,
  TradeListing,
} from './tradingSlice';

const { width } = Dimensions.get('window');

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  worn: 'Worn',
};

export const ListingDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ListingDetail'>>();
  const dispatch = useDispatch<AppDispatch>();

  const { listingId } = route.params;
  const { currentListing, isLoading, error } = useSelector(
    (state: RootState) => state.trading,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerItems, setOfferItems] = useState('');
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  const isOwner = currentListing?.sellerId === user?.id;

  useEffect(() => {
    dispatch(fetchListingDetails(listingId));
  }, [dispatch, listingId]);

  const handleFavorite = () => {
    if (currentListing) {
      dispatch(toggleFavorite(currentListing.id));
    }
  };

  const handleMakeOffer = async () => {
    if (!offerItems.trim()) {
      Alert.alert('Required', 'Please describe what you\'re offering');
      return;
    }

    setIsSendingOffer(true);
    try {
      await dispatch(
        makeOffer({
          listingId,
          message: offerMessage.trim() || undefined,
          offerItems: offerItems.trim(),
        }),
      ).unwrap();

      setShowOfferModal(false);
      setOfferMessage('');
      setOfferItems('');
      Alert.alert('Success', 'Your offer has been sent!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send offer';
      Alert.alert('Error', message);
    } finally {
      setIsSendingOffer(false);
    }
  };

  const handleChat = () => {
    if (currentListing) {
      navigation.navigate('Chat', {
        recipientId: currentListing.sellerId,
        recipientName: currentListing.sellerName,
      });
    }
  };

  if (isLoading && !currentListing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (error || !currentListing) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const listing = currentListing as TradeListing & {
    seller?: { displayName: string; avatarUrl: string | null };
    offers?: Array<{ id: string; buyerId: string }>;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {!isOwner && (
            <TouchableOpacity style={styles.headerButton} onPress={handleFavorite}>
              <Icon
                name={listing.isFavorited ? 'heart' : 'heart-outline'}
                size={24}
                color={listing.isFavorited ? '#ff4444' : '#fff'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="share-variant" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        <View style={styles.photoSection}>
          {listing.photos && listing.photos.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentPhotoIndex(index);
                }}
              >
                {listing.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {listing.photos.length > 1 && (
                <View style={styles.photoDots}>
                  {listing.photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.photoDot,
                        index === currentPhotoIndex && styles.photoDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noPhoto}>
              <Icon name="image-off" size={64} color="#333" />
              <Text style={styles.noPhotoText}>No photos</Text>
            </View>
          )}
        </View>

        {/* Title & Meta */}
        <View style={styles.mainInfo}>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {CONDITION_LABELS[listing.condition] || listing.condition}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{listing.category}</Text>
            </View>
            {listing.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Icon name="map-marker" size={14} color="#00d4ff" />
                <Text style={styles.distanceText}>{listing.distance} km</Text>
              </View>
            )}
          </View>
        </View>

        {/* Seller */}
        <TouchableOpacity
          style={styles.sellerSection}
          onPress={() => navigation.navigate('UserProfile', { userId: listing.sellerId })}
        >
          {listing.seller?.avatarUrl || listing.sellerAvatar ? (
            <Image
              source={{ uri: listing.seller?.avatarUrl || listing.sellerAvatar || '' }}
              style={styles.sellerAvatar}
            />
          ) : (
            <View style={[styles.sellerAvatar, styles.avatarPlaceholder]}>
              <Icon name="account" size={24} color="#666" />
            </View>
          )}
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>
              {listing.seller?.displayName || listing.sellerName}
            </Text>
            <View style={styles.verificationRow}>
              <Icon name="shield-check" size={14} color="#4CAF50" />
              <Text style={styles.verificationText}>
                {listing.verificationScore || 0}% verified
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        {/* Description */}
        {listing.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        )}

        {/* Looking For */}
        {listing.lookingFor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.lookingForBox}>
              <Icon name="swap-horizontal" size={20} color="#00d4ff" />
              <Text style={styles.lookingForText}>{listing.lookingFor}</Text>
            </View>
          </View>
        )}

        {/* Location */}
        {listing.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={20} color="#888" />
              <Text style={styles.locationText}>{listing.address}</Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{listing.offerCount || 0}</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {new Date(listing.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Posted</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {!isOwner && listing.status === 'active' && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Icon name="chat" size={22} color="#fff" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.offerButton}
            onPress={() => setShowOfferModal(true)}
          >
            <Icon name="hand-wave" size={22} color="#000" />
            <Text style={styles.offerButtonText}>Make Offer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>What are you offering? *</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={offerItems}
              onChangeText={setOfferItems}
              placeholder="Describe the items you'd like to trade..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Message (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={offerMessage}
              onChangeText={setOfferMessage}
              placeholder="Add a message to the seller..."
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={[styles.sendOfferButton, isSendingOffer && styles.sendOfferButtonDisabled]}
              onPress={handleMakeOffer}
              disabled={isSendingOffer}
            >
              {isSendingOffer ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.sendOfferButtonText}>Send Offer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1a1a24',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    width,
    height: width,
    backgroundColor: '#1a1a24',
  },
  photo: {
    width,
    height: width,
  },
  photoDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  photoDotActive: {
    backgroundColor: '#fff',
  },
  noPhoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    color: '#666',
    marginTop: 8,
  },
  mainInfo: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#1a1a24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '500',
  },
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1a1a24',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verificationText: {
    fontSize: 13,
    color: '#4CAF50',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  lookingForBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,212,255,0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  lookingForText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#1a1a24',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1a1a24',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#0a0a0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a24',
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  offerButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00d4ff',
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  offerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendOfferButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  sendOfferButtonDisabled: {
    backgroundColor: '#333',
  },
  sendOfferButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListingDetailScreen;
