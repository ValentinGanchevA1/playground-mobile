// src/features/profile/components/GenderPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Gender, GENDER_OPTIONS } from '../types';

interface GenderPickerProps {
  value: Gender | null | undefined;
  onChange: (gender: Gender) => void;
}

export const GenderPicker: React.FC<GenderPickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {GENDER_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            value === option.value && styles.optionSelected,
          ]}
          onPress={() => onChange(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              value === option.value && styles.optionTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  optionSelected: {
    backgroundColor: '#00d4ff20',
    borderColor: '#00d4ff',
  },
  optionText: {
    color: '#888',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#00d4ff',
    fontWeight: '600',
  },
});
