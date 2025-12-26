// src/features/profile/components/PhotoGrid.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useAppDispatch } from '../../../hooks/redux';
import { uploadEditedPhoto, deletePhoto } from '../profileEditSlice';

interface Props {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  editable?: boolean;
  maxPhotos?: number;
}

export const PhotoGrid: React.FC<Props> = ({
                                             photos,
                                             onPhotosChange,
                                             editable = false,
                                             maxPhotos = 6,
                                           }) => {
  const dispatch = useAppDispatch();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handlePhotoPress = async (index: number) => {
    if (!editable) return;

    const existingPhoto = photos[index];

    if (existingPhoto) {
      // Show options for existing photo
      Alert.alert('Photo Options', undefined, [
        {
          text: 'Replace',
          onPress: () => selectAndCropPhoto(index),
        },
        {
          text: 'Edit Crop',
          onPress: () => editExistingPhoto(existingPhoto, index),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeletePhoto(index),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      selectAndCropPhoto(index);
    }
  };

  const selectAndCropPhoto = async (index: number) => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 800,
        height: 1000,
        cropping: true,
        cropperCircleOverlay: false,
        freeStyleCropEnabled: true,
        cropperToolbarTitle: 'Adjust Photo',
        cropperActiveWidgetColor: '#00d4ff',
        cropperToolbarColor: '#1a1a24',
        cropperToolbarWidgetColor: '#fff',
        compressImageQuality: 0.8,
        mediaType: 'photo',
        forceJpg: true,
      });

      setUploadingIndex(index);

      const result = await dispatch(
        uploadEditedPhoto({ uri: image.path, position: index })
      );

      if (uploadEditedPhoto.fulfilled.match(result)) {
        const newPhotos = [...photos];
        newPhotos[index] = result.payload.url;
        onPhotosChange(newPhotos);
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to process image');
      }
    } finally {
      setUploadingIndex(null);
    }
  };

  const editExistingPhoto = async (photoUrl: string, index: number) => {
    try {
      // Download image first for re-cropping
      const image = await ImageCropPicker.openCropper({
        path: photoUrl,
        mediaType: 'photo',
        width: 800,
        height: 1000,
        freeStyleCropEnabled: true,
        cropperToolbarTitle: 'Adjust Photo',
        cropperActiveWidgetColor: '#00d4ff',
        cropperToolbarColor: '#1a1a24',
        cropperToolbarWidgetColor: '#fff',
        compressImageQuality: 0.8,
        forceJpg: true,
      });

      setUploadingIndex(index);

      const result = await dispatch(
        uploadEditedPhoto({ uri: image.path, position: index })
      );

      if (uploadEditedPhoto.fulfilled.match(result)) {
        const newPhotos = [...photos];
        newPhotos[index] = result.payload.url;
        onPhotosChange(newPhotos);
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to edit image');
      }
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDeletePhoto = (index: number) => {
    Alert.alert('Delete Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deletePhoto(index));
          const newPhotos = photos.filter((_, i) => i !== index);
          onPhotosChange(newPhotos);
        },
      },
    ]);
  };

  const renderSlot = (index: number) => {
    const photo = photos[index];
    const isUploading = uploadingIndex === index;
    const isMainPhoto = index === 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.slot,
          isMainPhoto && styles.mainSlot,
          !photo && styles.emptySlot,
        ]}
        onPress={() => handlePhotoPress(index)}
        disabled={isUploading}
        activeOpacity={0.8}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.plusIcon}>+</Text>
            {isMainPhoto && <Text style={styles.mainLabel}>Main</Text>}
          </View>
        )}

        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#00d4ff" size="small" />
          </View>
        )}

        {photo && editable && !isUploading && (
          <View style={styles.editBadge}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.grid}>
      {Array.from({ length: maxPhotos }).map((_, index) => renderSlot(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    width: '31%',
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a24',
  },
  mainSlot: {
    width: '48%',
    aspectRatio: 0.8,
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: '#2a2a3a',
    borderStyle: 'dashed',
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
    fontSize: 28,
    color: '#666',
  },
  mainLabel: {
    color: '#00d4ff',
    fontSize: 11,
    marginTop: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    color: '#fff',
    fontSize: 14,
  },
});
