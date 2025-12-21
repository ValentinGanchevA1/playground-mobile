// src/features/profile/steps/LocationStep.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { updateFormData } from '../profileSlice';

interface Props {
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const LocationStep: React.FC<Props> = ({ onNext, onBack, isSubmitting }) => {
  const dispatch = useAppDispatch();
  const { formData, error } = useAppSelector((state) => state.profile);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const requestLocation = async () => {
    setLocationStatus('requesting');

    try {
      const permission = await Geolocation.requestAuthorization('whenInUse');

      if (permission === 'granted') {
        Geolocation.getCurrentPosition(
          (position) => {
            dispatch(updateFormData({
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            }));
            setLocationStatus('granted');
          },
          (error) => {
            console.error('Location error:', error);
            setLocationStatus('denied');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setLocationStatus('denied');
      }
    } catch (err) {
      setLocationStatus('denied');
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleComplete = () => {
    console.log('LocationStep: handleComplete called');
    onNext(); // This triggers submitProfile
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📍</Text>
      </View>

      <Text style={styles.title}>Enable location</Text>
      <Text style={styles.subtitle}>
        Location lets you discover people nearby and appear on the map.
        You can change this anytime in settings.
      </Text>

      {locationStatus === 'idle' && (
        <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
          <Text style={styles.locationButtonText}>Enable Location</Text>
        </TouchableOpacity>
      )}

      {locationStatus === 'requesting' && (
        <View style={styles.statusContainer}>
          <ActivityIndicator color="#00d4ff" size="large" />
          <Text style={styles.statusText}>Getting your location...</Text>
        </View>
      )}

      {locationStatus === 'granted' && (
        <View style={styles.statusContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Location enabled!</Text>
          <Text style={styles.coordsText}>
            {formData.location?.lat.toFixed(4)}, {formData.location?.lng.toFixed(4)}
          </Text>
        </View>
      )}

      {locationStatus === 'denied' && (
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedText}>
            Location access was denied. You can still use the app, but you won't
            appear on the map or see nearby users.
          </Text>
          <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isSubmitting}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.nextButtonText}>
              {locationStatus === 'granted' ? 'Complete Profile' : 'Skip for Now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
    lineHeight: 24,
  },
  locationButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  locationButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    color: '#888',
    marginTop: 12,
  },
  successIcon: {
    fontSize: 48,
    color: '#00d4ff',
  },
  successText: {
    fontSize: 18,
    color: '#00d4ff',
    fontWeight: '600',
    marginTop: 8,
  },
  coordsText: {
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  deniedContainer: {
    padding: 24,
    alignItems: 'center',
  },
  deniedText: {
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  settingsButton: {
    marginTop: 16,
    padding: 12,
  },
  settingsButtonText: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    marginTop: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 24,
    width: '100%',
  },
  backButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3a',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
});
