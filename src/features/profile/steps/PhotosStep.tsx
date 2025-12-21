// src/features/profile/steps/PhotosStep.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { uploadPhoto, removePhoto } from '../profileSlice';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const PhotosStep: React.FC<Props> = ({ onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.profile);

  const hasAtLeastOnePhoto = formData.photos.some((p) => p.uri);

  const handleSelectPhoto = async (position: number) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    });

    if (result.assets?.[0]?.uri) {
      dispatch(uploadPhoto({ uri: result.assets[0].uri, position }));
    }
  };

  const handleRemovePhoto = (position: number) => {
    dispatch(removePhoto(position));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add your photos</Text>
      <Text style={styles.subtitle}>
        Add at least 1 photo. First photo is your main profile picture.
      </Text>

      <View style={styles.grid}>
        {formData.photos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.photoSlot, index === 0 && styles.mainPhoto]}
            onPress={() => handleSelectPhoto(index)}
            disabled={photo.isUploading}
          >
            {photo.uri ? (
              <>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </>
            ) : photo.isUploading ? (
              <View style={styles.uploading}>
                <ActivityIndicator color="#00d4ff" />
                <Text style={styles.progressText}>{photo.uploadProgress}%</Text>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.plusIcon}>+</Text>
                {index === 0 && <Text style={styles.mainLabel}>Main</Text>}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.tip}>
        💡 Tip: Profiles with 3+ photos get 5x more matches
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !hasAtLeastOnePhoto && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!hasAtLeastOnePhoto}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoSlot: {
    width: '31%',
    aspectRatio: 0.75,
    borderRadius: 12,
    backgroundColor: '#1a1a24',
    borderWidth: 2,
    borderColor: '#2a2a3a',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  mainPhoto: {
    width: '48%',
    aspectRatio: 0.8,
    borderColor: '#00d4ff',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 32,
    color: '#666',
  },
  mainLabel: {
    color: '#00d4ff',
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
  },
  uploading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#00d4ff',
    marginTop: 8,
  },
  tip: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 24,
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
