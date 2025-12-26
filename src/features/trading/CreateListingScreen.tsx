// src/features/trading/CreateListingScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootState, AppDispatch } from '../../store';
import { createListing, uploadListingPhoto } from './tradingSlice';

const CATEGORIES = [
  { key: 'clothing', label: 'Clothing', icon: 'tshirt-crew' },
  { key: 'electronics', label: 'Electronics', icon: 'laptop' },
  { key: 'collectibles', label: 'Collectibles', icon: 'diamond-stone' },
  { key: 'books', label: 'Books', icon: 'book-open-variant' },
  { key: 'sports', label: 'Sports', icon: 'basketball' },
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'toys', label: 'Toys', icon: 'puzzle' },
  { key: 'accessories', label: 'Accessories', icon: 'watch' },
  { key: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const CONDITIONS = [
  { key: 'new', label: 'New' },
  { key: 'like_new', label: 'Like New' },
  { key: 'good', label: 'Good' },
  { key: 'fair', label: 'Fair' },
  { key: 'worn', label: 'Worn' },
];

export const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { currentLocation } = useSelector((state: RootState) => state.map);
  const { isLoading, isUploading } = useSelector((state: RootState) => state.trading);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [localPhotos, setLocalPhotos] = useState<{ uri: string; uploaded?: string }[]>([]);

  const handlePickImage = useCallback(async () => {
    if (localPhotos.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 photos per listing');
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    });

    if (result.assets?.[0]?.uri) {
      const newPhoto = { uri: result.assets[0].uri };
      setLocalPhotos([...localPhotos, newPhoto]);

      // Upload immediately
      try {
        const url = await dispatch(
          uploadListingPhoto({
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          }),
        ).unwrap();

        setPhotos([...photos, url]);
        setLocalPhotos((prev) =>
          prev.map((p) => (p.uri === newPhoto.uri ? { ...p, uploaded: url } : p)),
        );
      } catch {
        Alert.alert('Upload Failed', 'Failed to upload photo');
        setLocalPhotos((prev) => prev.filter((p) => p.uri !== newPhoto.uri));
      }
    }
  }, [dispatch, localPhotos, photos]);

  const handleRemovePhoto = (index: number) => {
    const newLocalPhotos = [...localPhotos];
    newLocalPhotos.splice(index, 1);
    setLocalPhotos(newLocalPhotos);

    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title');
      return;
    }
    if (!category) {
      Alert.alert('Required', 'Please select a category');
      return;
    }
    if (!condition) {
      Alert.alert('Required', 'Please select a condition');
      return;
    }
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please enable location services');
      return;
    }

    try {
      await dispatch(
        createListing({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          condition,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          lookingFor: lookingFor.trim() || undefined,
          photos,
        }),
      ).unwrap();

      Alert.alert('Success', 'Your listing has been created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create listing';
      Alert.alert('Error', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Listing</Text>
        <TouchableOpacity
          style={[styles.submitButton, (!title || !category || !condition) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || !title || !category || !condition}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.submitButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosRow}>
              {localPhotos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  {!photo.uploaded && (
                    <View style={styles.photoOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {localPhotos.length < 5 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickImage}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#00d4ff" />
                  ) : (
                    <>
                      <Icon name="camera-plus" size={28} color="#666" />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What are you trading?"
            placeholderTextColor="#666"
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            maxLength={2000}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.optionsGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.optionChip, category === cat.key && styles.optionChipActive]}
                onPress={() => setCategory(cat.key)}
              >
                <Icon
                  name={cat.icon}
                  size={18}
                  color={category === cat.key ? '#000' : '#888'}
                />
                <Text
                  style={[
                    styles.optionChipText,
                    category === cat.key && styles.optionChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition *</Text>
          <View style={styles.optionsRow}>
            {CONDITIONS.map((cond) => (
              <TouchableOpacity
                key={cond.key}
                style={[styles.conditionChip, condition === cond.key && styles.conditionChipActive]}
                onPress={() => setCondition(cond.key)}
              >
                <Text
                  style={[
                    styles.conditionChipText,
                    condition === cond.key && styles.conditionChipTextActive,
                  ]}
                >
                  {cond.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={lookingFor}
            onChangeText={setLookingFor}
            placeholder="What would you like in exchange?"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
  },
  submitButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  optionChipActive: {
    backgroundColor: '#00d4ff',
  },
  optionChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    backgroundColor: '#1a1a24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  conditionChipActive: {
    backgroundColor: '#00d4ff',
  },
  conditionChipText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  conditionChipTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default CreateListingScreen;
