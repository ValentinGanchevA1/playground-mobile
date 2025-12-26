// src/features/profile/ProfileEditScreen.tsx
import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchProfile,
  saveProfile,
  updateField,
  resetChanges,
} from './profileEditSlice';
import { PhotoGrid } from './components/PhotoGrid';
import { InterestPicker } from './components/InterestPicker';
import { GenderPicker } from './components/GenderPicker';

export const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { originalData, editedData, hasChanges, isSaving, error } = useAppSelector(
    (state) => state.profileEdit
  );

  // Merged view: original + edits
  const currentData = { ...originalData, ...originalData?.profile, ...editedData };

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    // Warn on back if unsaved changes
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) return;

      e.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              dispatch(resetChanges());
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, dispatch]);

  const handleSave = useCallback(async () => {
    const result = await dispatch(saveProfile());
    if (saveProfile.fulfilled.match(result)) {
      Alert.alert('Success', 'Profile updated');
    }
  }, [dispatch]);

  if (!originalData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#00d4ff" />
          ) : (
            <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <PhotoGrid
            photos={originalData.profile?.photoUrls || []}
            onPhotosChange={(photos) => dispatch(updateField({ field: 'photoUrls', value: photos }))}
            editable
          />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={currentData.displayName || ''}
              onChangeText={(text) => dispatch(updateField({ field: 'displayName', value: text }))}
              placeholder="Your name"
              placeholderTextColor="#666"
              maxLength={50}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={currentData.bio || ''}
              onChangeText={(text) => dispatch(updateField({ field: 'bio', value: text }))}
              placeholder="Tell people about yourself..."
              placeholderTextColor="#666"
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {(currentData.bio || '').length}/500
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, styles.ageInput]}
              value={currentData.age?.toString() || ''}
              onChangeText={(text) => {
                const age = parseInt(text, 10) || null;
                dispatch(updateField({ field: 'age', value: age }));
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <GenderPicker
              value={currentData.gender}
              onChange={(gender) => dispatch(updateField({ field: 'gender', value: gender }))}
            />
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <InterestPicker
            selected={currentData.interests || []}
            onChange={(interests) => dispatch(updateField({ field: 'interests', value: interests }))}
          />
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => dispatch(updateField({ field: 'isVisible', value: !currentData.isVisible }))}
          >
            <View>
              <Text style={styles.toggleLabel}>Visible on Map</Text>
              <Text style={styles.toggleDescription}>
                Others can see you on the map when enabled
              </Text>
            </View>
            <View style={[styles.toggle, currentData.isVisible && styles.toggleActive]}>
              <View style={[styles.toggleKnob, currentData.isVisible && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Verification Status */}
        <TouchableOpacity
          style={styles.verificationCard}
          onPress={() => navigation.navigate('Verification')}
        >
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationTitle}>Verification</Text>
            <Text style={styles.verificationScore}>
              Trust Score: {originalData.verificationScore || 0}%
            </Text>
          </View>
          <View style={styles.badges}>
            {originalData.badges?.phone && <Text style={styles.badge}>📱</Text>}
            {originalData.badges?.photo && <Text style={styles.badge}>📸</Text>}
            {originalData.badges?.id && <Text style={styles.badge}>🪪</Text>}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
  saveText: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveTextDisabled: {
    color: '#444',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  bioInput: {
    height: 100,
    paddingTop: 16,
  },
  ageInput: {
    width: 100,
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#00d4ff',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleKnobActive: {
    marginLeft: 22,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationScore: {
    color: '#00d4ff',
    fontSize: 12,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 8,
  },
  badge: {
    fontSize: 18,
  },
  chevron: {
    color: '#666',
    fontSize: 24,
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
