// src/features/map/components/UserMarker.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NearbyUser } from '../mapSlice';

interface UserMarkerProps {
  user: NearbyUser;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ user }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.marker, user.isOnline && styles.markerOnline]}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <Text style={styles.text}>{user.displayName?.charAt(0) || '?'}</Text>
        )}
        {user.verificationScore > 50 && (
          <View style={styles.verifiedBadge}>
            <Icon name="check-decagram" size={12} color="#00d4ff" />
          </View>
        )}
      </View>
      <View style={[styles.pointer, user.isOnline && styles.pointerOnline]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  markerOnline: {
    borderColor: '#4CAF50',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0a0f',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0a0a0f',
    borderRadius: 8,
    padding: 2,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -2,
  },
  pointerOnline: {
    borderTopColor: '#4CAF50',
  },
});
