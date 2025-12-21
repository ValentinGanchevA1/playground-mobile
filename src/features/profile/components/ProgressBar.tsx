// src/features/profile/components/ProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileStep } from '../types';

interface Props {
  progress: number;
  steps: ProfileStep[];
  currentStep: ProfileStep;
}

const STEP_LABELS: Record<ProfileStep, string> = {
  basics: 'About You',
  photos: 'Photos',
  interests: 'Interests',
  goals: 'Goals',
  location: 'Location',
};

export const ProgressBar: React.FC<Props> = ({ progress, steps, currentStep }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{STEP_LABELS[currentStep]}</Text>
        <Text style={styles.stepCount}>
          {steps.indexOf(currentStep) + 1} of {steps.length}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepCount: {
    color: '#666',
    fontSize: 14,
  },
  track: {
    height: 4,
    backgroundColor: '#2a2a3a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 2,
  },
});
