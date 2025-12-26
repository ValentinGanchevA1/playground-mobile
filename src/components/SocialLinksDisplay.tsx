// src/components/SocialLinksDisplay.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

interface SocialLink {
  id: string;
  provider: string;
  displayName?: string;
  profileUrl?: string;
  username?: string;
  verified?: boolean;
  followers?: number;
  avatarUrl?: string;
}

interface Props {
  links: SocialLink[];
  compact?: boolean;
}

const PROVIDER_CONFIG: Record<string, { icon: string; color: string }> = {
  google: { icon: '🔍', color: '#4285F4' },
  apple: { icon: '🍎', color: '#000' },
  facebook: { icon: '📘', color: '#1877F2' },
  twitter: { icon: '𝕏', color: '#000' },
  instagram: { icon: '📷', color: '#E4405F' },
  linkedin: { icon: '💼', color: '#0A66C2' },
  tiktok: { icon: '🎵', color: '#000' },
};

export const SocialLinksDisplay: React.FC<Props> = ({ links, compact = false }) => {
  if (!links.length) return null;

  const handlePress = (link: SocialLink) => {
    if (link.profileUrl) {
      Linking.openURL(link.profileUrl);
    }
  };

  if (compact) {
    // Compact view - just icons
    return (
      <View style={styles.compactContainer}>
        {links.map((link) => {
          const config = PROVIDER_CONFIG[link.provider];
          return (
            <TouchableOpacity
              key={link.id}
              style={[styles.compactIcon, { backgroundColor: config?.color || '#333' }]}
              onPress={() => handlePress(link)}
            >
              <Text style={styles.compactIconText}>{config?.icon || '🔗'}</Text>
              {link.verified && <View style={styles.miniVerified} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Full view
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Accounts</Text>
      {links.map((link) => {
        const config = PROVIDER_CONFIG[link.provider];
        return (
          <TouchableOpacity
            key={link.id}
            style={styles.linkCard}
            onPress={() => handlePress(link)}
          >
            <View style={[styles.iconContainer, { backgroundColor: config?.color || '#333' }]}>
              <Text style={styles.iconText}>{config?.icon || '🔗'}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {link.username ? `@${link.username}` : link.displayName}
                </Text>
                {link.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              {link.followers && (
                <Text style={styles.followers}>
                  {formatFollowers(link.followers)} followers
                </Text>
              )}
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const formatFollowers = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  verifiedText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  followers: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: '#666',
    fontSize: 16,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compactIconText: {
    fontSize: 14,
  },
  miniVerified: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00d4ff',
    borderWidth: 2,
    borderColor: '#0a0a0f',
  },
});
