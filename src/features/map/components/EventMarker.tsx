// src/features/map/components/EventMarker.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NearbyEvent } from '../mapSlice';
import { CATEGORY_COLORS } from '../mapSelectors';

interface EventMarkerProps {
  event: NearbyEvent;
}

export const EventMarker: React.FC<EventMarkerProps> = ({ event }) => {
  return (
    <View style={styles.container}>
      <View style={styles.marker}>
        {event.coverImageUrl ? (
          <Image source={{ uri: event.coverImageUrl }} style={styles.cover} />
        ) : (
          <Icon name="calendar-star" size={24} color="#fff" />
        )}
        {event.attendeeCount > 0 && (
          <View style={styles.attendeeBadge}>
            <Text style={styles.attendeeCount}>
              {event.attendeeCount > 99 ? '99+' : event.attendeeCount}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.pointer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CATEGORY_COLORS.events,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  cover: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  attendeeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0a0a0f',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  attendeeCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -2,
  },
});

export default EventMarker;
