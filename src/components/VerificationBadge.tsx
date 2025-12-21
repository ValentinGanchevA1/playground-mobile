// src/components/VerificationBadge.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  badges: {
    phone?: boolean;
    photo?: boolean;
    id?: boolean;
    premium?: boolean;
  };
  score?: number;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  onPress?: () => void;
}

export const VerificationBadge: React.FC<Props> = ({
                                                     badges,
                                                     score = 0,
                                                     size = 'medium',
                                                     showTooltip = false,
                                                     onPress,
                                                   }) => {
  const isFullyVerified = badges.phone && badges.photo;
  const hasIdVerified = badges.id;

  const getBadgeColor = () => {
    if (hasIdVerified) return '#ffd700'; // Gold
    if (isFullyVerified) return '#00d4ff'; // Blue
    if (badges.phone || badges.photo) return '#888'; // Gray
    return 'transparent';
  };

  const sizes = {
    small: { container: 16, icon: 10 },
    medium: { container: 22, icon: 14 },
    large: { container: 32, icon: 20 },
  };

  const currentSize = sizes[size];

  if (!badges.phone && !badges.photo && !badges.id) {
    return null;
  }

  const content = (
    <View
      style={[
        styles.badge,
        {
          width: currentSize.container,
          height: currentSize.container,
          borderRadius: currentSize.container / 2,
          backgroundColor: getBadgeColor(),
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: currentSize.icon }]}>
        {hasIdVerified ? '★' : '✓'}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// Extended badge with breakdown
export const VerificationBadgeExtended: React.FC<Props> = ({
                                                             badges,
                                                             score = 0,
                                                           }) => {
  return (
    <View style={styles.extendedContainer}>
      <View style={styles.badgeRow}>
        <View style={[styles.miniBadge, badges.phone && styles.miniBadgeActive]}>
          <Text style={styles.miniBadgeIcon}>📱</Text>
        </View>
        <View style={[styles.miniBadge, badges.photo && styles.miniBadgeActive]}>
          <Text style={styles.miniBadgeIcon}>📸</Text>
        </View>
        <View style={[styles.miniBadge, badges.id && styles.miniBadgeActive]}>
          <Text style={styles.miniBadgeIcon}>🪪</Text>
        </View>
      </View>
      <Text style={styles.scoreText}>{score}% verified</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    color: '#fff',
    fontWeight: '700',
  },
  extendedContainer: {
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  miniBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  miniBadgeActive: {
    opacity: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  miniBadgeIcon: {
    fontSize: 14,
  },
  scoreText: {
    color: '#888',
    fontSize: 11,
  },
});
