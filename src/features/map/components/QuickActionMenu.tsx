// src/features/map/components/QuickActionMenu.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NearbyUser } from '../mapSlice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_WIDTH = 180;
const MENU_HEIGHT = 120;

interface QuickActionMenuProps {
  user: NearbyUser;
  position: { x: number; y: number };
  onWave: () => void;
  onMessage: () => void;
  onViewProfile: () => void;
  onClose: () => void;
  isWaving?: boolean;
}

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
  user,
  position,
  onWave,
  onMessage,
  onViewProfile,
  onClose,
  isWaving = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  // Calculate menu position to keep it on screen
  let menuX = position.x - MENU_WIDTH / 2;
  let menuY = position.y - MENU_HEIGHT - 60; // Above the marker

  // Adjust if too close to edges
  if (menuX < 16) menuX = 16;
  if (menuX + MENU_WIDTH > SCREEN_WIDTH - 16) menuX = SCREEN_WIDTH - MENU_WIDTH - 16;
  if (menuY < 100) menuY = position.y + 60; // Show below if too close to top

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* Menu */}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            left: menuX,
            top: menuY,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* User info header */}
        <View style={styles.header}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.displayName?.charAt(0) || '?'}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text style={styles.userDistance}>
              {user.distance < 1
                ? `${Math.round(user.distance * 1000)}m away`
                : `${user.distance.toFixed(1)}km away`}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.waveButton]}
            onPress={onWave}
            disabled={isWaving}
          >
            <Icon
              name="hand-wave"
              size={24}
              color={isWaving ? '#666' : '#FFD700'}
            />
            <Text style={[styles.actionLabel, isWaving && styles.actionLabelDisabled]}>
              Wave
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={onMessage}
          >
            <Icon name="message-text" size={24} color="#00d4ff" />
            <Text style={styles.actionLabel}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.profileButton]}
            onPress={onViewProfile}
          >
            <Icon name="account" size={24} color="#fff" />
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3a',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0f',
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userDistance: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  waveButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  messageButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionLabel: {
    fontSize: 11,
    color: '#fff',
    marginTop: 4,
  },
  actionLabelDisabled: {
    color: '#666',
  },
});
