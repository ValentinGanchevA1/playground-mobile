// src/features/map/MapScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateLocation, fetchNearbyUsers, updateUserLocation, NearbyUser } from './mapSlice';
import { UserMarker } from './components/UserMarker';
import { UserProfileSheet } from './components/UserProfileSheet';

const { width, height } = Dimensions.get('window');

const calculateRadiusFromZoom = (latitudeDelta: number): number => {
  return Math.round(latitudeDelta * 111); // Approximate km from latitude delta
};

export const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const dispatch = useAppDispatch();
  const { currentLocation, nearbyUsers, isLoading, error } = useAppSelector((state) => state.map);

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

  const handleMarkerPress = (user: NearbyUser) => {
    setSelectedUser(user);
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
        showsUserLocation
        showsMyLocationButton
      >
        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{
              latitude: user.latitude,
              longitude: user.longitude,
            }}
            onPress={() => handleMarkerPress(user)}
          >
            <UserMarker user={user} />
          </Marker>
        ))}
      </MapView>

      {selectedUser && (
        <UserProfileSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onMessage={() => {
            setSelectedUser(null);
            navigation.navigate('Chat', { recipientId: selectedUser.id });
          }}
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
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  // ... more style rules
];
