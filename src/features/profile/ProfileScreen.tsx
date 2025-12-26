// src/features/profile/ProfileScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout, fetchCurrentUser } from '../auth/authSlice';
import {
  SubscriptionTier,
  GOAL_OPTIONS,
  SOCIAL_PROVIDER_CONFIG,
  SocialProvider,
} from './types';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchCurrentUser());
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit' as never);
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const handleVerification = () => {
    navigation.navigate('Verification' as never);
  };

  const handleUpgrade = () => {
    navigation.navigate('Subscription' as never);
  };

  const getVerificationBadges = () => {
    if (!user?.badges) return [];
    const badges = [];
    if (user.badges.email) badges.push({ icon: 'email-check', label: 'Email', color: '#4CAF50' });
    if (user.badges.phone) badges.push({ icon: 'phone-check', label: 'Phone', color: '#2196F3' });
    if (user.badges.photo) badges.push({ icon: 'camera-account', label: 'Photo', color: '#9C27B0' });
    if (user.badges.id) badges.push({ icon: 'card-account-details', label: 'ID', color: '#FF9800' });
    if (user.badges.social) badges.push({ icon: 'link-variant', label: 'Social', color: '#E91E63' });
    if (user.badges.premium) badges.push({ icon: 'crown', label: 'Premium', color: '#FFD700' });
    return badges;
  };

  const getTierLabel = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.BASIC: return 'Basic';
      case SubscriptionTier.PREMIUM: return 'Premium';
      case SubscriptionTier.VIP: return 'VIP';
      default: return 'Free';
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.BASIC: return '#00d4ff';
      case SubscriptionTier.PREMIUM: return '#9C27B0';
      case SubscriptionTier.VIP: return '#FFD700';
      default: return '#666';
    }
  };

  const photos = user?.profile?.photoUrls || [];
  const mainPhoto = photos[activePhotoIndex] || user?.avatarUrl;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
            <Icon name="cog" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Photo */}
      <View style={styles.mainPhotoContainer}>
        {mainPhoto ? (
          <Image source={{ uri: mainPhoto }} style={styles.mainPhoto} />
        ) : (
          <View style={[styles.mainPhoto, styles.placeholderPhoto]}>
            <Icon name="account" size={80} color="#444" />
          </View>
        )}

        {/* Subscription Badge */}
        {user?.subscriptionTier != null && user.subscriptionTier !== SubscriptionTier.FREE ? (
          <View style={[styles.tierBadge, { backgroundColor: getTierColor(user.subscriptionTier) }]}>
            <Icon name="crown" size={14} color="#fff" />
            <Text style={styles.tierBadgeText}>{getTierLabel(user.subscriptionTier)}</Text>
          </View>
        ) : null}

        {/* Photo Indicators */}
        {photos.length > 1 ? (
          <View style={styles.photoIndicators}>
            {photos.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.photoIndicator, index === activePhotoIndex && styles.photoIndicatorActive]}
                onPress={() => setActivePhotoIndex(index)}
              />
            ))}
          </View>
        ) : null}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>
            {user?.displayName}{user?.profile?.age ? `, ${user.profile.age}` : ''}
          </Text>
          {user?.verificationScore != null && user.verificationScore > 50 ? (
            <Icon name="check-decagram" size={24} color="#00d4ff" />
          ) : null}
        </View>

        {/* Verification Score */}
        <View style={styles.verificationRow}>
          <View style={styles.verificationBar}>
            <View
              style={[styles.verificationProgress, { width: `${user?.verificationScore || 0}%` }]}
            />
          </View>
          <Text style={styles.verificationText}>{user?.verificationScore || 0}% Verified</Text>
        </View>

        {/* Badges */}
        <View style={styles.badgesRow}>
          {getVerificationBadges().map((badge, index) => (
            <View key={index} style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
              <Icon name={badge.icon} size={16} color={badge.color} />
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          ))}
          {getVerificationBadges().length === 0 && (
            <TouchableOpacity style={styles.verifyNowButton} onPress={handleVerification}>
              <Icon name="shield-check" size={16} color="#00d4ff" />
              <Text style={styles.verifyNowText}>Get Verified</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bio */}
        {user?.profile?.bio ? (
          <Text style={styles.bio}>{user.profile.bio}</Text>
        ) : null}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Icon name="pencil" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleVerification}>
          <Icon name="shield-check" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Verification</Text>
        </TouchableOpacity>
      </View>

      {/* Gamification Cards */}
      <View style={styles.gamificationRow}>
        <TouchableOpacity
          style={styles.gamificationCard}
          onPress={() => navigation.navigate('Achievements' as never)}
        >
          <Icon name="trophy" size={28} color="#FFD700" />
          <Text style={styles.gamificationTitle}>Achievements</Text>
          <Text style={styles.gamificationSubtitle}>View badges</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gamificationCard}
          onPress={() => navigation.navigate('Leaderboard' as never)}
        >
          <Icon name="podium-gold" size={28} color="#00d4ff" />
          <Text style={styles.gamificationTitle}>Leaderboard</Text>
          <Text style={styles.gamificationSubtitle}>Compete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.gamificationCard}
          onPress={() => navigation.navigate('Gifts' as never)}
        >
          <Icon name="gift" size={28} color="#E91E63" />
          <Text style={styles.gamificationTitle}>Gifts</Text>
          <Text style={styles.gamificationSubtitle}>Send & receive</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActivePhotoIndex(index)}
                style={[styles.gridPhoto, index === activePhotoIndex && styles.gridPhotoActive]}
              >
                <Image source={{ uri: photo }} style={styles.gridPhotoImage} />
              </TouchableOpacity>
            ))}
            {photos.length < 6 ? (
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleEditProfile}>
                <Icon name="plus" size={24} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Interests */}
      {user?.profile?.interests && user.profile.interests.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagsContainer}>
            {user.profile.interests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Goals */}
      {user?.profile?.goals && user.profile.goals.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.goalsContainer}>
            {user.profile.goals.map((goal, index) => {
              const goalConfig = GOAL_OPTIONS.find((g) => g.value === goal);
              if (!goalConfig) return null;
              return (
                <View key={index} style={styles.goalTag}>
                  <Text style={styles.goalIcon}>{goalConfig.icon}</Text>
                  <Text style={styles.goalText}>{goalConfig.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Social Links */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SocialLinking' as never)}>
            <Text style={styles.sectionAction}>Manage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.socialLinksContainer}>
          {user?.socialLinks && user.socialLinks.length > 0 ? (
            user.socialLinks.map((link, index) => {
              const config = SOCIAL_PROVIDER_CONFIG[link.provider as SocialProvider];
              return (
                <View key={index} style={styles.socialLinkItem}>
                  <View style={[styles.socialIcon, { backgroundColor: config?.color || '#666' }]}>
                    <Icon name={config?.icon || 'link'} size={20} color="#fff" />
                  </View>
                  <View style={styles.socialLinkInfo}>
                    <Text style={styles.socialLinkName}>{config?.label || link.provider}</Text>
                    {link.username ? (
                      <Text style={styles.socialLinkUsername}>@{link.username}</Text>
                    ) : null}
                  </View>
                  {link.verified ? (
                    <Icon name="check-circle" size={18} color="#4CAF50" />
                  ) : null}
                </View>
              );
            })
          ) : (
            <TouchableOpacity
              style={styles.connectSocialButton}
              onPress={() => navigation.navigate('SocialLinking' as never)}
            >
              <Icon name="link-plus" size={24} color="#00d4ff" />
              <Text style={styles.connectSocialText}>Connect Social Accounts</Text>
              <Text style={styles.connectSocialSubtext}>Boost your trust score</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subscription */}
      {user?.subscriptionTier === SubscriptionTier.FREE || !user?.subscriptionTier ? (
        <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
          <View style={styles.upgradeContent}>
            <Icon name="crown" size={32} color="#FFD700" />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Unlimited likes, see who viewed you, and more
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      ) : null}

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Icon name="cog" size={24} color="#888" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Icon name="chevron-right" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Privacy' as never)}>
          <Icon name="shield-lock" size={24} color="#888" />
          <Text style={styles.menuItemText}>Privacy</Text>
          <Icon name="chevron-right" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help' as never)}>
          <Icon name="help-circle" size={24} color="#888" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('About' as never)}>
          <Icon name="information" size={24} color="#888" />
          <Text style={styles.menuItemText}>About</Text>
          <Icon name="chevron-right" size={24} color="#444" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
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
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  mainPhotoContainer: {
    width: width,
    height: width * 1.2,
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderPhoto: {
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tierBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  userInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  verificationBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1a1a24',
    borderRadius: 3,
    overflow: 'hidden',
  },
  verificationProgress: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 3,
  },
  verificationText: {
    color: '#888',
    fontSize: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#00d4ff20',
    borderRadius: 16,
  },
  verifyNowText: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  bio: {
    marginTop: 16,
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a24',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  gamificationRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  gamificationCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingVertical: 16,
    borderRadius: 12,
  },
  gamificationTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 8,
  },
  gamificationSubtitle: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
    marginTop: 20,
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
  sectionAction: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridPhotoActive: {
    borderColor: '#00d4ff',
  },
  gridPhotoImage: {
    width: '100%',
    height: '100%',
  },
  addPhotoButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a34',
    borderStyle: 'dashed',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1a1a24',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalTag: {
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
    fontWeight: '500',
  },
  socialLinksContainer: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    overflow: 'hidden',
  },
  socialLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a34',
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLinkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  socialLinkName: {
    color: '#fff',
    fontWeight: '600',
  },
  socialLinkUsername: {
    color: '#888',
    fontSize: 12,
  },
  connectSocialButton: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  connectSocialText: {
    color: '#00d4ff',
    fontWeight: '600',
    fontSize: 16,
  },
  connectSocialSubtext: {
    color: '#666',
    fontSize: 12,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD70040',
  },
  upgradeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 16,
  },
  upgradeSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  menuSection: {
    margin: 20,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a34',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    padding: 16,
    backgroundColor: '#ff444420',
    borderRadius: 12,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: '600',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: '#444',
    marginBottom: 40,
  },
});
