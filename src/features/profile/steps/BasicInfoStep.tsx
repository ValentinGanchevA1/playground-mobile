// src/features/profile/steps/BasicInfoStep.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { updateFormData } from '../profileSlice';
import { Gender } from '../types';

interface Props {
  onNext: () => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.MALE, label: 'Man' },
  { value: Gender.FEMALE, label: 'Woman' },
  { value: Gender.NON_BINARY, label: 'Non-binary' },
  { value: Gender.OTHER, label: 'Other' },
  { value: Gender.PREFER_NOT_TO_SAY, label: 'Prefer not to say' },
];

export const BasicInfoStep: React.FC<Props> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.profile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 18) {
      newErrors.age = 'Must be 18 or older';
    } else if (formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Let's get started</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>

      {/* Display Name */}
      <View style={styles.field}>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={[styles.input, errors.displayName && styles.inputError]}
          placeholder="Your name"
          placeholderTextColor="#666"
          value={formData.displayName}
          onChangeText={(text) => dispatch(updateFormData({ displayName: text }))}
          maxLength={50}
        />
        {errors.displayName && (
          <Text style={styles.error}>{errors.displayName}</Text>
        )}
      </View>

      {/* Age */}
      <View style={styles.field}>
        <Text style={styles.label}>How old are you?</Text>
        <TextInput
          style={[styles.input, styles.ageInput, errors.age && styles.inputError]}
          placeholder="Age"
          placeholderTextColor="#666"
          value={formData.age?.toString() || ''}
          onChangeText={(text) => {
            const age = parseInt(text, 10) || null;
            dispatch(updateFormData({ age }));
          }}
          keyboardType="number-pad"
          maxLength={3}
        />
        {errors.age && <Text style={styles.error}>{errors.age}</Text>}
      </View>

      {/* Gender */}
      <View style={styles.field}>
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.optionsGrid}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.gender === option.value && styles.optionSelected,
              ]}
              onPress={() => dispatch(updateFormData({ gender: option.value }))}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.gender === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}
      </View>

      {/* Bio (Optional) */}
      <View style={styles.field}>
        <Text style={styles.label}>Bio (optional)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Tell people about yourself..."
          placeholderTextColor="#666"
          value={formData.bio}
          onChangeText={(text) => dispatch(updateFormData({ bio: text }))}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{formData.bio.length}/500</Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 32,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
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
  inputError: {
    borderColor: '#ff4444',
  },
  ageInput: {
    width: 100,
  },
  bioInput: {
    height: 120,
    paddingTop: 16,
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  optionSelected: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#000',
  },
  nextButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
});
