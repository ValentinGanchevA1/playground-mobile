// src/features/profile/components/InterestPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { INTEREST_OPTIONS } from '../types';

interface InterestPickerProps {
  selected: string[];
  onChange: (interests: string[]) => void;
  max?: number;
}

export const InterestPicker: React.FC<InterestPickerProps> = ({
  selected,
  onChange,
  max = 10,
}) => {
  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest));
    } else if (selected.length < max) {
      onChange([...selected, interest]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>
        Select {max} interests ({selected.length}/{max})
      </Text>
      <View style={styles.grid}>
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = selected.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggleInterest(interest)}
              disabled={!isSelected && selected.length >= max}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  hint: {
    color: '#666',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  chipSelected: {
    backgroundColor: '#00d4ff20',
    borderColor: '#00d4ff',
  },
  chipText: {
    color: '#888',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#00d4ff',
    fontWeight: '600',
  },
});
