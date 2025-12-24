// src/features/verification/IdVerificationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { apiClient } from '../../api/client';
import { useAppDispatch } from '../../hooks/redux';
import { fetchVerificationStatus } from './verificationSlice';

export const IdVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectImage = async (side: 'front' | 'back') => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add your ID photo',
      [
        {
          text: 'Camera',
          onPress: () => captureImage(side, 'camera'),
        },
        {
          text: 'Gallery',
          onPress: () => captureImage(side, 'gallery'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const captureImage = async (side: 'front' | 'back', source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    try {
      const result = source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.assets && result.assets[0]?.uri) {
        if (side === 'front') {
          setFrontImage(result.assets[0].uri);
        } else {
          setBackImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image capture error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!frontImage) {
      Alert.alert('Error', 'Please capture the front of your ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('frontImage', {
        uri: frontImage,
        type: 'image/jpeg',
        name: 'id-front.jpg',
      } as any);

      if (backImage) {
        formData.append('backImage', {
          uri: backImage,
          type: 'image/jpeg',
          name: 'id-back.jpg',
        } as any);
      }

      await apiClient.post('/verification/id/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert(
        'Submitted!',
        'Your ID is being reviewed. This usually takes 24-48 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      dispatch(fetchVerificationStatus());
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit ID');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ID Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="card-account-details" size={64} color="#00d4ff" />
        </View>

        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>
          Upload a government-issued ID to verify your identity. Your information is encrypted and secure.
        </Text>

        {/* Front of ID */}
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={() => selectImage('front')}
        >
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Icon name="camera-plus" size={40} color="#666" />
              <Text style={styles.uploadText}>Front of ID</Text>
              <Text style={styles.uploadHint}>Required</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Back of ID */}
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={() => selectImage('back')}
        >
          {backImage ? (
            <Image source={{ uri: backImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Icon name="camera-plus" size={40} color="#666" />
              <Text style={styles.uploadText}>Back of ID</Text>
              <Text style={styles.uploadHint}>Optional</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Accepted IDs */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Accepted Documents</Text>
          <View style={styles.infoRow}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>Driver's License</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>Passport</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.infoText}>National ID Card</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !frontImage && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !frontImage}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadCard: {
    width: '100%',
    height: 140,
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2a2a3a',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#2a2a3a',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
