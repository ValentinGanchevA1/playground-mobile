// src/features/discovery/LikesReceivedScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchLikesReceived, likeProfile, LikeReceived } from './discoverySlice';
import { SubscriptionTier } from '../profile/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const LikesReceivedScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { likesReceived } = useAppSelector((state) => state.discovery);
  const user = useAppSelector((state) => state.auth?.user);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPremium = user?.subscriptionTier && user.subscriptionTier !== SubscriptionTier.FREE;

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    setIsLoading(true);
    await dispatch(fetchLikesReceived());
    setIsLoading(false);
  };

  const handleLikeBack = async (like: LikeReceived) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    // Like the user back - this will create a match
    await dispatch(likeProfile(like.user.id));
    // Refresh the likes list
    dispatch(fetchLikesReceived());
  };

  const handleViewProfile = (like: LikeReceived) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    navigation.navigate('UserProfile' as never, { userId: like.user.id } as never);
  };

  const renderLikeCard = ({ item }: { item: LikeReceived }) => {
    const photoUrl = item.user.avatarUrl || item.user.profile?.photoUrls?.[0];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleViewProfile(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: photoUrl }}
            style={styles.cardImage}
            blurRadius={isPremium ? 0 : 20}
          />
          {!isPremium && (
            <View style={styles.blurOverlay}>
              <Icon name="lock" size={32} color="#fff" />
            </View>
          )}
          {item.type === 'super_like' && (
            <View style={styles.superLikeBadge}>
              <Icon name="star" size={16} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {isPremium ? item.user.displayName : '???'}
          </Text>
          <Text style={styles.cardAge}>
            {isPremium ? `${item.user.profile?.age || '?'} years old` : 'Unlock to see'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.likeBackButton, !isPremium && styles.likeBackButtonLocked]}
          onPress={() => handleLikeBack(item)}
        >
          <Icon
            name={isPremium ? 'heart' : 'lock'}
            size={20}
            color={isPremium ? '#4CAF50' : '#888'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart-outline" size={80} color="#444" />
      <Text style={styles.emptyTitle}>No likes yet</Text>
      <Text style={styles.emptyText}>
        When someone likes your profile, they'll appear here
      </Text>
    </View>
  );

  const renderUpgradePrompt = () => (
    <View style={styles.upgradePrompt}>
      <Icon name="crown" size={24} color="#FFD700" />
      <Text style={styles.upgradeText}>
        Upgrade to Premium to see who likes you
      </Text>
      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Premium' as never)}
      >
        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Likes Received</Text>
        <View style={styles.headerRight}>
          <Text style={styles.likeCount}>{likesReceived.length}</Text>
        </View>
      </View>

      {!isPremium && renderUpgradePrompt()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      ) : (
        <FlatList
          data={likesReceived}
          renderItem={renderLikeCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Upgrade Modal */}
      <Modal visible={showUpgradeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Icon name="crown" size={48} color="#FFD700" />
            </View>
            <Text style={styles.modalTitle}>Premium Feature</Text>
            <Text style={styles.modalDescription}>
              Upgrade to Premium to see who likes you and like them back instantly!
            </Text>
            <View style={styles.modalFeatures}>
              <View style={styles.modalFeature}>
                <Icon name="check" size={20} color="#4CAF50" />
                <Text style={styles.modalFeatureText}>See all your likes</Text>
              </View>
              <View style={styles.modalFeature}>
                <Icon name="check" size={20} color="#4CAF50" />
                <Text style={styles.modalFeatureText}>Like back for instant match</Text>
              </View>
              <View style={styles.modalFeature}>
                <Icon name="check" size={20} color="#4CAF50" />
                <Text style={styles.modalFeatureText}>Unlimited rewinds</Text>
              </View>
              <View style={styles.modalFeature}>
                <Icon name="check" size={20} color="#4CAF50" />
                <Text style={styles.modalFeatureText}>Profile boost</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalUpgradeButton}
              onPress={() => {
                setShowUpgradeModal(false);
                navigation.navigate('Premium' as never);
              }}
            >
              <Text style={styles.modalUpgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowUpgradeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Maybe Later</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerRight: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4d6d',
    borderRadius: 12,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  upgradeText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0a0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.3,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  superLikeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00d4ff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardAge: {
    fontSize: 13,
    color: '#888',
  },
  likeBackButton: {
    position: 'absolute',
    bottom: 60,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeBackButtonLocked: {
    borderColor: '#444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a24',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalFeatures: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  modalFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalFeatureText: {
    fontSize: 15,
    color: '#fff',
  },
  modalUpgradeButton: {
    width: '100%',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalUpgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0f',
  },
  modalCloseButton: {
    paddingVertical: 12,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#888',
  },
});
