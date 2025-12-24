// src/features/map/MapScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MarkerPressEvent } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateLocation, fetchNearbyUsers, updateUserLocation, NearbyUser } from './mapSlice';
import { sendWave } from '../interactions/interactionsSlice';
import { UserMarker } from './components/UserMarker';
import { QuickActionMenu } from './components/QuickActionMenu';

const { width, height } = Dimensions.get('window');

const calculateRadiusFromZoom = (latitudeDelta: number): number => {
  return Math.round(latitudeDelta * 111); // Approximate km from latitude delta
};

export const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const dispatch = useAppDispatch();
  const { currentLocation, nearbyUsers } = useAppSelector((state) => state.map);
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

    // Android
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
        // Update location on backend
        dispatch(updateUserLocation({ lat: latitude, lng: longitude }));
        // Fetch nearby users
        dispatch(fetchNearbyUsers({ lat: latitude, lng: longitude, radius: 5 }));
      },
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 50, // meters
        interval: 10000,
        fastestInterval: 5000,
      }
    );
  };

  const handleRegionChange = (region: Region) => {
    // Fetch users in new viewport
    dispatch(fetchNearbyUsers({
      lat: region.latitude,
      lng: region.longitude,
      radius: calculateRadiusFromZoom(region.latitudeDelta),
    }));
  };

  const handleMarkerPress = (user: NearbyUser, event: MarkerPressEvent) => {
    const { x, y } = event.nativeEvent.position || { x: width / 2, y: height / 2 };
    setSelectedUser(user);
    setMenuPosition({ x, y });
    setMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedUser(null);
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

  return (
    <View style={styles.container}>
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
      >
        {/* Current user location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.currentUserMarker}>
              <View style={styles.currentUserDot} />
            </View>
          </Marker>
        )}

        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{
              latitude: user.latitude,
              longitude: user.longitude,
            }}
            onPress={(e) => handleMarkerPress(user, e)}
          >
            <UserMarker user={user} />
          </Marker>
        ))}
      </MapView>

      {menuVisible && selectedUser && (
        <QuickActionMenu
          user={selectedUser}
          position={menuPosition}
          onWave={handleWave}
          onMessage={handleMessage}
          onViewProfile={handleViewProfile}
          onClose={handleCloseMenu}
          isWaving={isSending}
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
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  // ... more style rules
];
