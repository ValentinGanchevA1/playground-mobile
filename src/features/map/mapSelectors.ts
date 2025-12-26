// src/features/map/mapSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { NearbyEvent, MarkerCategory } from './mapSlice';

// Base selectors
export const selectMapState = (state: RootState) => state.map;
export const selectNearbyUsers = (state: RootState) => state.map.nearbyUsers;
export const selectNearbyEvents = (state: RootState) => state.map.nearbyEvents;
export const selectFilters = (state: RootState) => state.map.filters;
export const selectCurrentLocation = (state: RootState) => state.map.currentLocation;
export const selectIsLoading = (state: RootState) => state.map.isLoading;
export const selectError = (state: RootState) => state.map.error;

// Marker colors
export const CATEGORY_COLORS = {
  dating: '#FF69B4', // Pink
  trading: '#4CAF50', // Green
  events: '#FF9800', // Orange
  currentUser: '#007AFF', // Blue
} as const;

// Marker representation for rendering
export interface MapMarker {
  id: string;
  displayName: string;
  avatarUrl?: string;
  latitude: number;
  longitude: number;
  distance: number;
  verificationScore: number;
  isOnline: boolean;
  markerCategory: MarkerCategory;
  isSecondary: boolean;
  opacity: number;
  color: string;
  goals: string[];
}

// Filtered users selector - returns markers for both primary and secondary categories
export const selectFilteredUserMarkers = createSelector(
  [selectNearbyUsers, selectFilters],
  (users, filters): MapMarker[] => {
    const markers: MapMarker[] = [];

    users.forEach((user) => {
      // Add primary category marker if filter is enabled
      if (
        (user.primaryCategory === 'dating' && filters.dating) ||
        (user.primaryCategory === 'trading' && filters.trading)
      ) {
        markers.push({
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          latitude: user.latitude,
          longitude: user.longitude,
          distance: user.distance,
          verificationScore: user.verificationScore,
          isOnline: user.isOnline,
          markerCategory: user.primaryCategory,
          isSecondary: false,
          opacity: 1,
          color: CATEGORY_COLORS[user.primaryCategory],
          goals: user.goals,
        });
      }

      // Add secondary category marker if filter is enabled (with reduced opacity)
      if (
        user.secondaryCategory &&
        ((user.secondaryCategory === 'dating' && filters.dating) ||
          (user.secondaryCategory === 'trading' && filters.trading))
      ) {
        markers.push({
          id: `${user.id}-secondary`,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          latitude: user.latitude,
          longitude: user.longitude,
          distance: user.distance,
          verificationScore: user.verificationScore,
          isOnline: user.isOnline,
          markerCategory: user.secondaryCategory,
          isSecondary: true,
          opacity: 0.5,
          color: CATEGORY_COLORS[user.secondaryCategory],
          goals: user.goals,
        });
      }
    });

    return markers;
  }
);

// Filtered events selector
export const selectFilteredEvents = createSelector(
  [selectNearbyEvents, selectFilters],
  (events, filters): NearbyEvent[] => {
    if (!filters.events) {
      return [];
    }
    return events;
  }
);

// Combined markers count for UI display
export const selectMarkerCounts = createSelector(
  [selectFilteredUserMarkers, selectFilteredEvents],
  (userMarkers, events) => ({
    users: userMarkers.filter((m) => !m.isSecondary).length,
    events: events.length,
    total: userMarkers.filter((m) => !m.isSecondary).length + events.length,
  })
);

// Get unique primary users (for clustering - avoid counting secondary)
export const selectPrimaryUserMarkers = createSelector(
  [selectFilteredUserMarkers],
  (markers) => markers.filter((m) => !m.isSecondary)
);

// Get category breakdown for a set of user IDs (for cluster display)
export const selectCategoryBreakdown = createSelector(
  [selectNearbyUsers],
  (users) => {
    const breakdown = { dating: 0, trading: 0 };
    users.forEach((user) => {
      breakdown[user.primaryCategory]++;
    });
    return breakdown;
  }
);
