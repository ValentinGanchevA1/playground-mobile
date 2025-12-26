// src/features/discovery/UserProfileScreen.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../api/client';
import {
  User,
  GOAL_OPTIONS,
  SOCIAL_PROVIDER_CONFIG,
  SocialProvider,
  SubscriptionTier,
} from '../profile/types';
import { useAppDispatch } from '../../hooks/redux';
import { likeProfile, passProfile, superLikeProfile } from './discoverySlice';

const { width } = Dimensions.get('window');

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { userId } = route.params as { userId: string };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/users/${userId}`);
      setUser(data);
    } catch {
      Alert.alert('Error', 'Failed to load profile');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [userId, navigation]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLike = async () => {
    if (!user) return;
    const result = await dispatch(likeProfile(user.id));
    if (likeProfile.fulfilled.match(result)) {
      if (result.payload.matched) {
        Alert.alert("It's a Match!", `You and ${user.displayName} liked each other!`, [
          { text: 'Send Message', onPress: () => navigation.navigate('Chat', { recipientId: user.id }) },
          { text: 'Keep Browsing', onPress: () => navigation.goBack() },
        ]);
      } else {
        navigation.goBack();
      }
    }
  };

  const handlePass = async () => {
    if (!user) return;
    await dispatch(passProfile(user.id));
    navigation.goBack();
  };

  const handleSuperLike = async () => {
    if (!user) return;
    const result = await dispatch(superLikeProfile(user.id));
    if (superLikeProfile.fulfilled.match(result)) {
      if (result.payload.matched) {
        Alert.alert("It's a Match!", `You and ${user.displayName} liked each other!`);
      }
      navigation.goBack();
    }
  };


  const handleReport = () => {
    Alert.alert('Report User', 'Why are you reporting this user?', [
      { text: 'Inappropriate Photos', onPress: () => submitReport('photos') },
      { text: 'Fake Profile', onPress: () => submitReport('fake') },
      { text: 'Harassment', onPress: () => submitReport('harassment') },
      { text: 'Spam', onPress: () => submitReport('spam') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submitReport = async (reason: string) => {
    try {
      await apiClient.post('/reports', { userId, reason });
      Alert.alert('Reported', 'Thank you for your report. We will review it.');
    } catch {
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const photos = user.profile?.photoUrls || [];
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.headerTitle}>{user.displayName}</Text>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-down" size={32} color="#fff" />
      </TouchableOpacity>

      {/* More Options */}
      <TouchableOpacity style={styles.moreButton} onPress={handleReport}>
        <Icon name="dots-horizontal" size={28} color="#fff" />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Photo Gallery */}
        <View style={styles.photoGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentPhotoIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.galleryPhoto} />
            ))}
          </ScrollView>

          {/* Photo Indicators */}
          {photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.photoIndicator,
                    index === currentPhotoIndex && styles.photoIndicatorActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', '#0a0a0f']}
            style={styles.photoGradient}
          />
        </View>

        {/* User Info */}
        <View style={styles.content}>
          {/* Name and Age */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>
                {user.displayName}, {user.profile?.age}
              </Text>
              {user.verificationScore > 50 && (
                <Icon name="check-decagram" size={28} color="#00d4ff" />
              )}
            </View>

            {/* Subscription Badge */}
            {user.subscriptionTier !== SubscriptionTier.FREE && (
              <View style={styles.tierBadge}>
                <Icon name="crown" size={14} color="#FFD700" />
                <Text style={styles.tierText}>{user.subscriptionTier}</Text>
              </View>
            )}
          </View>

          {/* Verification Score */}
          <View style={styles.verificationRow}>
            <Icon name="shield-check" size={18} color="#00d4ff" />
            <Text style={styles.verificationText}>
              {user.verificationScore}% Verified
            </Text>
          </View>

          {/* Bio */}
          {user.profile?.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{user.profile.bio}</Text>
            </View>
          )}

          {/* Goals */}
          {user.profile?.goals && user.profile.goals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Looking For</Text>
              <View style={styles.goalsContainer}>
                {user.profile.goals.map((goal, index) => {
                  const config = GOAL_OPTIONS.find((g) => g.value === goal);
                  return (
                    <View key={index} style={styles.goalChip}>
                      <Text style={styles.goalIcon}>{config?.icon}</Text>
                      <Text style={styles.goalText}>{config?.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Interests */}
          {user.profile?.interests && user.profile.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {user.profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Social Links */}
          {user.socialLinks && user.socialLinks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connected Accounts</Text>
              <View style={styles.socialLinks}>
                {user.socialLinks.map((link, index) => {
                  const config = SOCIAL_PROVIDER_CONFIG[link.provider as SocialProvider];
                  return (
                    <View key={index} style={styles.socialLink}>
                      <View style={[styles.socialIcon, { backgroundColor: config?.color }]}>
                        <Icon name={config?.icon || 'link'} size={18} color="#fff" />
                      </View>
                      {link.username && (
                        <Text style={styles.socialUsername}>@{link.username}</Text>
                      )}
                      {link.verified && (
                        <Icon name="check-circle" size={14} color="#4CAF50" />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              {user.profile?.gender && (
                <View style={styles.detailItem}>
                  <Icon name="gender-male-female" size={20} color="#888" />
                  <Text style={styles.detailText}>
                    {user.profile.gender.replace('_', ' ')}
                  </Text>
                </View>
              )}
              {user.profile?.height && (
                <View style={styles.detailItem}>
                  <Icon name="human-male-height" size={20} color="#888" />
                  <Text style={styles.detailText}>{user.profile.height} cm</Text>
                </View>
              )}
              {user.profile?.occupation && (
                <View style={styles.detailItem}>
                  <Icon name="briefcase" size={20} color="#888" />
                  <Text style={styles.detailText}>{user.profile.occupation}</Text>
                </View>
              )}
              {user.profile?.education && (
                <View style={styles.detailItem}>
                  <Icon name="school" size={20} color="#888" />
                  <Text style={styles.detailText}>{user.profile.education}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Spacer for bottom actions */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Icon name="close" size={32} color="#ff4444" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.superLikeButton} onPress={handleSuperLike}>
          <Icon name="star" size={28} color="#00d4ff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Icon name="heart" size={32} color="#4CAF50" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#0a0a0f',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGallery: {
    width,
    height: width * 1.3,
    position: 'relative',
  },
  galleryPhoto: {
    width,
    height: width * 1.3,
    resizeMode: 'cover',
  },
  photoIndicators: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
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
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  content: {
    padding: 20,
    marginTop: -60,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tierText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  verificationText: {
    color: '#00d4ff',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bioText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  goalIcon: {
    fontSize: 18,
  },
  goalText: {
    color: '#fff',
    fontSize: 14,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#1a1a24',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialUsername: {
    color: '#888',
    fontSize: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#0a0a0f',
    gap: 20,
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
});
