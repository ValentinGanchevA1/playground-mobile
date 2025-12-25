// src/features/map/components/CategoryMarker.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MapMarker, CATEGORY_COLORS } from '../mapSelectors';

interface CategoryMarkerProps {
  marker: MapMarker;
}

export const CategoryMarker: React.FC<CategoryMarkerProps> = ({ marker }) => {
  const borderColor = marker.color;
  const opacity = marker.opacity;

  return (
    <View style={[styles.container, { opacity }]}>
      <View style={[styles.marker, { borderColor }]}>
        {marker.avatarUrl ? (
          <Image source={{ uri: marker.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.initialContainer, { backgroundColor: marker.color }]}>
            <Text style={styles.initial}>
              {marker.displayName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        {marker.verificationScore > 50 && (
          <View style={styles.verifiedBadge}>
            <Icon name="check-decagram" size={12} color="#00d4ff" />
          </View>
        )}
        {marker.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={[styles.pointer, { borderTopColor: borderColor }]} />
      {marker.isSecondary && (
        <View style={styles.secondaryIndicator}>
          <Icon
            name={marker.markerCategory === 'dating' ? 'heart' : 'briefcase'}
            size={10}
            color="#fff"
          />
        </View>
      )}
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
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    overflow: 'hidden',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  initialContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0a0a0f',
    borderRadius: 8,
    padding: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#0a0a0f',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  secondaryIndicator: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 2,
  },
});

export default CategoryMarker;
