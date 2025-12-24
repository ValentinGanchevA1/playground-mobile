// src/features/discovery/DiscoveryScreen.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import {
  fetchDiscoveryProfiles,
  likeProfile,
  passProfile,
  superLikeProfile,
  rewindLastSwipe,
  activateBoost,
  fetchBoostStatus,
} from './discoverySlice';
import { User, GOAL_OPTIONS, SubscriptionTier } from '../profile/types';
import { FiltersModal } from './FiltersModal';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export const DiscoveryScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { profiles, currentIndex, isLoading, hasMore, boostStatus, lastSwipedProfile } = useAppSelector(
    (state) => state.discovery
  );
  const user = useAppSelector((state) => state.auth?.user);
  const [showMatch, setShowMatch] = useState<User | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<'rewind' | 'boost' | null>(null);

  const isPremium = user?.subscriptionTier && user.subscriptionTier !== SubscriptionTier.FREE;

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    dispatch(fetchDiscoveryProfiles());
    dispatch(fetchBoostStatus());
  }, [dispatch]);

  const handleRewind = async () => {
    if (!isPremium) {
      setPremiumFeature('rewind');
      setShowPremiumModal(true);
      return;
    }

    if (!lastSwipedProfile) {
      Alert.alert('No swipes', 'No profiles to rewind');
      return;
    }

    try {
      await dispatch(rewindLastSwipe()).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to rewind');
    }
  };

  const handleBoost = async () => {
    if (!isPremium) {
      setPremiumFeature('boost');
      setShowPremiumModal(true);
      return;
    }

    if (boostStatus.isBoosted) {
      const remainingTime = boostStatus.boostedUntil
        ? Math.ceil((new Date(boostStatus.boostedUntil).getTime() - Date.now()) / 60000)
        : 0;
      Alert.alert('Already Boosted', `Your profile is boosted for ${remainingTime} more minutes`);
      return;
    }

    try {
      await dispatch(activateBoost()).unwrap();
      Alert.alert('Boost Activated!', 'Your profile will be shown to more people for 30 minutes');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to activate boost');
    }
  };

  useEffect(() => {
    // Load more profiles when running low
    if (profiles.length - currentIndex < 3 && hasMore && !isLoading) {
      dispatch(fetchDiscoveryProfiles());
    }
  }, [currentIndex, profiles.length, hasMore, isLoading, dispatch]);

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [position]);

  const swipeCard = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      const currentProfile = profiles[currentIndex];
      if (!currentProfile) return;

      const x = direction === 'left' ? -width * 1.5 : direction === 'right' ? width * 1.5 : 0;
      const y = direction === 'up' ? -height : 0;

      Animated.timing(position, {
        toValue: { x, y },
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        position.setValue({ x: 0, y: 0 });
        setCurrentPhotoIndex(0);

        if (direction === 'right') {
          dispatch(likeProfile(currentProfile.id)).then((result) => {
            if (likeProfile.fulfilled.match(result) && result.payload.matched) {
              setShowMatch(currentProfile);
            }
          });
        } else if (direction === 'up') {
          dispatch(superLikeProfile(currentProfile.id)).then((result) => {
            if (superLikeProfile.fulfilled.match(result) && result.payload.matched) {
              setShowMatch(currentProfile);
            }
          });
        } else {
          dispatch(passProfile(currentProfile.id));
        }
      });
    },
    [position, profiles, currentIndex, dispatch]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          swipeCard('up');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const currentProfile = profiles[currentIndex];
  const photos = currentProfile?.profile?.photoUrls || [];

  const handlePhotoTap = (side: 'left' | 'right') => {
    if (side === 'left' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    } else if (side === 'right' && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handleViewProfile = () => {
    if (currentProfile) {
      navigation.navigate('UserProfile', { userId: currentProfile.id });
    }
  };

  const renderCard = (profile: User, index: number) => {
    if (index < currentIndex) return null;
    if (index > currentIndex + 1) return null;

    const isCurrentCard = index === currentIndex;
    const profilePhotos = profile.profile?.photoUrls || [];
    const photo = profilePhotos[isCurrentCard ? currentPhotoIndex : 0] || profile.avatarUrl;

    const cardStyle = isCurrentCard
      ? [
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]
      : [styles.card, styles.nextCard];

    return (
      <Animated.View
        key={profile.id}
        style={cardStyle}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        {/* Photo */}
        <Image source={{ uri: photo }} style={styles.cardImage} />

        {/* Photo navigation areas */}
        {isCurrentCard && (
          <>
            <TouchableOpacity
              style={styles.photoNavLeft}
              onPress={() => handlePhotoTap('left')}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={styles.photoNavRight}
              onPress={() => handlePhotoTap('right')}
              activeOpacity={1}
            />
          </>
        )}

        {/* Photo indicators */}
        {profilePhotos.length > 1 && isCurrentCard && (
          <View style={styles.photoIndicators}>
            {profilePhotos.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.photoIndicator,
                  i === currentPhotoIndex && styles.photoIndicatorActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Like/Nope Labels */}
        {isCurrentCard && (
          <>
            <Animated.View style={[styles.label, styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.labelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.label, styles.nopeLabel, { opacity: nopeOpacity }]}>
              <Text style={[styles.labelText, styles.nopeLabelText]}>NOPE</Text>
            </Animated.View>
          </>
        )}

        {/* User Info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        >
          <TouchableOpacity onPress={handleViewProfile} activeOpacity={0.9}>
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>
                  {profile.displayName}, {profile.profile?.age}
                </Text>
                {profile.verificationScore > 50 && (
                  <Icon name="check-decagram" size={22} color="#00d4ff" />
                )}
              </View>

              {profile.profile?.bio && (
                <Text style={styles.cardBio} numberOfLines={2}>
                  {profile.profile.bio}
                </Text>
              )}

              {profile.profile?.goals && profile.profile.goals.length > 0 && (
                <View style={styles.goalsRow}>
                  {profile.profile.goals.slice(0, 2).map((goal, i) => {
                    const goalConfig = GOAL_OPTIONS.find((g) => g.value === goal);
                    return (
                      <View key={i} style={styles.goalChip}>
                        <Text style={styles.goalIcon}>{goalConfig?.icon}</Text>
                        <Text style={styles.goalText}>{goalConfig?.label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (!currentProfile && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cards-outline" size={80} color="#444" />
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptyText}>
          Check back later or adjust your filters
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => dispatch(fetchDiscoveryProfiles())}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Icon name="tune-vertical" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logoText}>G88</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
          <Icon name="heart-multiple" size={28} color="#00d4ff" />
        </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, i) =>
          renderCard(profile, currentIndex + 1 - i)
        )}
        {currentProfile && renderCard(currentProfile, currentIndex)}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rewindButton, !lastSwipedProfile && styles.actionButtonDisabled]}
          onPress={handleRewind}
          disabled={!lastSwipedProfile && isPremium}
        >
          <Icon name="undo" size={28} color={lastSwipedProfile || !isPremium ? '#FFD700' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.nopeButton]}
          onPress={() => swipeCard('left')}
        >
          <Icon name="close" size={36} color="#ff4444" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => swipeCard('up')}
        >
          <Icon name="star" size={32} color="#00d4ff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swipeCard('right')}
        >
          <Icon name="heart" size={36} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.boostButton, boostStatus.isBoosted && styles.boostButtonActive]}
          onPress={handleBoost}
        >
          <Icon name="lightning-bolt" size={28} color={boostStatus.isBoosted ? '#fff' : '#9C27B0'} />
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      <Modal visible={!!showMatch} transparent animationType="fade">
        <View style={styles.matchModal}>
          <Text style={styles.matchTitle}>It's a Match!</Text>
          <Text style={styles.matchSubtitle}>
            You and {showMatch?.displayName} liked each other
          </Text>
          <View style={styles.matchAvatars}>
            <Image
              source={{ uri: showMatch?.avatarUrl }}
              style={styles.matchAvatar}
            />
          </View>
          <View style={styles.matchActions}>
            <TouchableOpacity
              style={styles.matchSendMessage}
              onPress={() => {
                setShowMatch(null);
                navigation.navigate('Chat', { recipientId: showMatch?.id || '' });
              }}
            >
              <Text style={styles.matchSendMessageText}>Send Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.matchKeepSwiping}
              onPress={() => setShowMatch(null)}
            >
              <Text style={styles.matchKeepSwipingText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}
      <FiltersModal visible={showFilters} onClose={() => setShowFilters(false)} />

      {/* Premium Feature Modal */}
      <Modal visible={showPremiumModal} transparent animationType="fade">
        <View style={styles.premiumModal}>
          <View style={styles.premiumModalContent}>
            <View style={styles.premiumIconContainer}>
              <Icon
                name={premiumFeature === 'rewind' ? 'undo' : 'lightning-bolt'}
                size={48}
                color={premiumFeature === 'rewind' ? '#FFD700' : '#9C27B0'}
              />
            </View>
            <Text style={styles.premiumTitle}>
              {premiumFeature === 'rewind' ? 'Rewind' : 'Boost'}
            </Text>
            <Text style={styles.premiumDescription}>
              {premiumFeature === 'rewind'
                ? 'Go back and swipe again on profiles you accidentally passed. Upgrade to Premium to unlock!'
                : 'Get more visibility and be seen by more people for 30 minutes. Upgrade to Premium to unlock!'}
            </Text>
            <TouchableOpacity
              style={styles.premiumUpgradeButton}
              onPress={() => {
                setShowPremiumModal(false);
                navigation.navigate('Premium');
              }}
            >
              <Text style={styles.premiumUpgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.premiumCloseButton}
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={styles.premiumCloseButtonText}>Maybe Later</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: width - 20,
    height: height * 0.65,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a24',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoNavLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 100,
    width: '40%',
  },
  photoNavRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 100,
    width: '40%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
  },
  label: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 4,
    borderRadius: 10,
  },
  likeLabel: {
    right: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '15deg' }],
  },
  nopeLabel: {
    left: 20,
    borderColor: '#ff4444',
    transform: [{ rotate: '-15deg' }],
  },
  labelText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nopeLabelText: {
    color: '#ff4444',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  cardInfo: {
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardBio: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  goalsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  goalIcon: {
    fontSize: 14,
  },
  goalText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a34',
  },
  rewindButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  nopeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: '#ff4444',
  },
  superLikeButton: {
    borderColor: '#00d4ff',
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: '#4CAF50',
  },
  boostButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  boostButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
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
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 24,
    backgroundColor: '#00d4ff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#0a0a0f',
    fontWeight: '600',
    fontSize: 16,
  },
  matchModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  matchTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  matchAvatars: {
    marginBottom: 40,
  },
  matchAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00d4ff',
  },
  matchActions: {
    width: '100%',
    gap: 16,
  },
  matchSendMessage: {
    backgroundColor: '#00d4ff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  matchSendMessageText: {
    color: '#0a0a0f',
    fontSize: 18,
    fontWeight: '600',
  },
  matchKeepSwiping: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  matchKeepSwipingText: {
    color: '#888',
    fontSize: 16,
  },
  premiumModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  premiumModalContent: {
    backgroundColor: '#1a1a24',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  premiumIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  premiumUpgradeButton: {
    width: '100%',
    backgroundColor: '#00d4ff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumUpgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0f',
  },
  premiumCloseButton: {
    paddingVertical: 12,
  },
  premiumCloseButtonText: {
    fontSize: 16,
    color: '#888',
  },
});
