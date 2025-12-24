// src/features/map/MapScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, Alert, Text } from 'react-native';
import MapView from 'react-native-map-clustering';
import { Marker, PROVIDER_GOOGLE, Region, MarkerPressEvent } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateLocation, fetchMapData, updateUserLocation, NearbyEvent } from './mapSlice';
import {
  selectFilteredUserMarkers,
  selectFilteredEvents,
  selectCurrentLocation,
  MapMarker,
  CATEGORY_COLORS,
} from './mapSelectors';
import { sendWave } from '../interactions/interactionsSlice';
import { FilterBar } from './components/FilterBar';
import { CategoryMarker } from './components/CategoryMarker';
import { EventMarker } from './components/EventMarker';
import { EventQuickInfo } from './components/EventQuickInfo';
import { QuickActionMenu } from './components/QuickActionMenu';

const { width, height } = Dimensions.get('window');

const calculateRadiusFromZoom = (latitudeDelta: number): number => {
  return Math.round(latitudeDelta * 111);
};

export const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [selectedUser, setSelectedUser] = useState<MapMarker | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NearbyEvent | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const dispatch = useAppDispatch();
  const currentLocation = useAppSelector(selectCurrentLocation);
  const userMarkers = useAppSelector(selectFilteredUserMarkers);
  const events = useAppSelector(selectFilteredEvents);
  const { isSending } = useAppSelector((state) => state.interactions);

  useEffect(() => {
    const init = async () => {
      const granted = await requestLocationPermission();
      if (granted) {
        setHasPermission(true);
        startLocationTracking();
      }
    };
    init();

    return () => Geolocation.stopObserving();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show nearby users.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startLocationTracking = () => {
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(updateLocation({ lat: latitude, lng: longitude }));
        dispatch(updateUserLocation({ lat: latitude, lng: longitude }));
        dispatch(fetchMapData({ lat: latitude, lng: longitude, radius: 5 }));
      },
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 50,
        interval: 10000,
        fastestInterval: 5000,
      }
    );
  };

  const handleRegionChange = (region: Region) => {
    dispatch(fetchMapData({
      lat: region.latitude,
      lng: region.longitude,
      radius: calculateRadiusFromZoom(region.latitudeDelta),
    }));
  };

  const handleUserMarkerPress = (marker: MapMarker, event: MarkerPressEvent) => {
    if (marker.isSecondary) return; // Ignore secondary marker taps

    const { x, y } = event.nativeEvent.position || { x: width / 2, y: height / 2 };
    setSelectedUser(marker);
    setSelectedEvent(null);
    setMenuPosition({ x, y });
    setMenuVisible(true);
  };

  const handleEventMarkerPress = (event: NearbyEvent) => {
    setSelectedEvent(event);
    setSelectedUser(null);
    setMenuVisible(false);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedUser(null);
  };

  const handleCloseEventInfo = () => {
    setSelectedEvent(null);
  };

  const handleWave = async () => {
    if (!selectedUser) return;

    const result = await dispatch(sendWave(selectedUser.id));
    if (sendWave.fulfilled.match(result)) {
      Alert.alert('Wave Sent!', `You waved at ${selectedUser.displayName}`);
      handleCloseMenu();
    } else if (sendWave.rejected.match(result)) {
      Alert.alert('Cannot Wave', result.payload as string);
    }
  };

  const handleMessage = () => {
    if (!selectedUser) return;
    handleCloseMenu();
    navigation.navigate('Chat', { recipientId: selectedUser.id });
  };

  const handleViewProfile = () => {
    if (!selectedUser) return;
    handleCloseMenu();
    navigation.navigate('UserProfile', { userId: selectedUser.id });
  };

  const handleViewEventDetails = () => {
    if (!selectedEvent) return;
    handleCloseEventInfo();
    navigation.navigate('EventDetail', { eventId: selectedEvent.id });
  };

  // Custom cluster component
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;

    // Determine dominant category color
    // For simplicity, use dating color by default
    const clusterColor = CATEGORY_COLORS.dating;

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}
      >
        <View style={[styles.cluster, { backgroundColor: clusterColor }]}>
          <Text style={styles.clusterText}>{points}</Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <FilterBar />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation?.lat || 37.78825,
          longitude: currentLocation?.lng || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChangeComplete={handleRegionChange}
        customMapStyle={darkMapStyle}
        showsMyLocationButton
        clusteringEnabled={true}
        radius={60}
        maxZoom={18}
        renderCluster={renderCluster}
      >
        {/* Current user location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.currentUserMarker}>
              <View style={styles.currentUserDot} />
            </View>
          </Marker>
        )}

        {/* User markers */}
        {userMarkers.map((marker) => (
          <Marker
            key={marker.id}
            identifier={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            onPress={(e) => handleUserMarkerPress(marker, e)}
            tracksViewChanges={false}
          >
            <CategoryMarker marker={marker} />
          </Marker>
        ))}

        {/* Event markers */}
        {events.map((event) => (
          <Marker
            key={`event-${event.id}`}
            identifier={`event-${event.id}`}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            onPress={() => handleEventMarkerPress(event)}
            tracksViewChanges={false}
          >
            <EventMarker event={event} />
          </Marker>
        ))}
      </MapView>

      {/* User Quick Action Menu */}
      {menuVisible && selectedUser && (
        <QuickActionMenu
          user={{
            id: selectedUser.id,
            displayName: selectedUser.displayName,
            avatarUrl: selectedUser.avatarUrl,
            latitude: selectedUser.latitude,
            longitude: selectedUser.longitude,
            distance: selectedUser.distance,
            verificationScore: selectedUser.verificationScore,
            isOnline: selectedUser.isOnline,
            primaryCategory: selectedUser.markerCategory,
            secondaryCategory: null,
            goals: selectedUser.goals,
          }}
          position={menuPosition}
          onWave={handleWave}
          onMessage={handleMessage}
          onViewProfile={handleViewProfile}
          onClose={handleCloseMenu}
          isWaving={isSending}
        />
      )}

      {/* Event Quick Info */}
      {selectedEvent && (
        <EventQuickInfo
          event={selectedEvent}
          onClose={handleCloseEventInfo}
          onViewDetails={handleViewEventDetails}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  currentUserMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cluster: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  clusterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e87' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3a4762' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];
