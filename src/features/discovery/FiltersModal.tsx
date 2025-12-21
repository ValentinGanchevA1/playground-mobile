// src/features/discovery/FiltersModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateFilters, resetDiscovery, fetchDiscoveryProfiles } from './discoverySlice';
import { GENDER_OPTIONS, GOAL_OPTIONS, Gender, RelationshipGoal } from '../profile/types';

const { height } = Dimensions.get('window');

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
}

interface LocalFilters {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  genders: string[];
  goals: string[];
}

export const FiltersModal: React.FC<FiltersModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector((state) => state.discovery.filters);

  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    minAge: currentFilters.minAge,
    maxAge: currentFilters.maxAge,
    maxDistance: currentFilters.maxDistance,
    genders: currentFilters.genders,
    goals: currentFilters.goals,
  });

  useEffect(() => {
    if (visible) {
      setLocalFilters({
        minAge: currentFilters.minAge,
        maxAge: currentFilters.maxAge,
        maxDistance: currentFilters.maxDistance,
        genders: currentFilters.genders,
        goals: currentFilters.goals,
      });
    }
  }, [visible, currentFilters]);

  const toggleGender = (gender: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter((g) => g !== gender)
        : [...prev.genders, gender],
    }));
  };

  const toggleGoal = (goal: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleApply = () => {
    dispatch(updateFilters(localFilters));
    dispatch(fetchDiscoveryProfiles());
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: LocalFilters = {
      minAge: 18,
      maxAge: 50,
      maxDistance: 50,
      genders: [],
      goals: [],
    };
    setLocalFilters(defaultFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Age Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Age Range</Text>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeValue}>{localFilters.minAge}</Text>
              <Text style={styles.rangeSeparator}>-</Text>
              <Text style={styles.rangeValue}>{localFilters.maxAge}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Min Age</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={100}
                step={1}
                value={localFilters.minAge}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    minAge: Math.min(value, prev.maxAge - 1),
                  }))
                }
                minimumTrackTintColor="#00d4ff"
                maximumTrackTintColor="#2a2a34"
                thumbTintColor="#00d4ff"
              />
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Max Age</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={100}
                step={1}
                value={localFilters.maxAge}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    maxAge: Math.max(value, prev.minAge + 1),
                  }))
                }
                minimumTrackTintColor="#00d4ff"
                maximumTrackTintColor="#2a2a34"
                thumbTintColor="#00d4ff"
              />
            </View>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maximum Distance</Text>
            <Text style={styles.distanceValue}>{localFilters.maxDistance} km</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={localFilters.maxDistance}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, maxDistance: value }))
              }
              minimumTrackTintColor="#00d4ff"
              maximumTrackTintColor="#2a2a34"
              thumbTintColor="#00d4ff"
            />
            <View style={styles.sliderLabelsRow}>
              <Text style={styles.sliderEndLabel}>1 km</Text>
              <Text style={styles.sliderEndLabel}>100 km</Text>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Show Me</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            <View style={styles.optionsGrid}>
              {GENDER_OPTIONS.filter((g) => g.value !== Gender.PREFER_NOT_TO_SAY).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    localFilters.genders.includes(option.value) && styles.optionChipActive,
                  ]}
                  onPress={() => toggleGender(option.value)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      localFilters.genders.includes(option.value) && styles.optionChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {localFilters.genders.includes(option.value) && (
                    <Icon name="check" size={16} color="#0a0a0f" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
            <View style={styles.optionsGrid}>
              {GOAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    localFilters.goals.includes(option.value) && styles.optionChipActive,
                  ]}
                  onPress={() => toggleGoal(option.value)}
                >
                  <Text style={styles.goalIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionChipText,
                      localFilters.goals.includes(option.value) && styles.optionChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {localFilters.goals.includes(option.value) && (
                    <Icon name="check" size={16} color="#0a0a0f" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  resetButton: {
    padding: 8,
  },
  resetText: {
    fontSize: 16,
    color: '#00d4ff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  rangeLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  rangeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  rangeSeparator: {
    fontSize: 24,
    color: '#666',
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderEndLabel: {
    fontSize: 12,
    color: '#666',
  },
  distanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2a2a34',
  },
  optionChipActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  optionChipText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#0a0a0f',
  },
  goalIcon: {
    fontSize: 16,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#0a0a0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
  },
  applyButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0f',
  },
});
