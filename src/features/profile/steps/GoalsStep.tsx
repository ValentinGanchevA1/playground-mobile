// src/features/profile/steps/GoalsStep.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { toggleGoal } from '../profileSlice';
import { GOAL_OPTIONS } from '../types';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export const GoalsStep: React.FC<Props> = ({ onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.profile);

  const hasGoal = formData.goals.length >= 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What brings you here?</Text>
      <Text style={styles.subtitle}>Select all that apply</Text>

      <View style={styles.options}>
        {GOAL_OPTIONS.map((option) => {
          const isSelected = formData.goals.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              onPress={() => dispatch(toggleGoal(option.value))}
            >
              <Text style={styles.goalIcon}>{option.icon}</Text>
              <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                {option.label}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !hasGoal && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!hasGoal}
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
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1a1a24',
    borderWidth: 2,
    borderColor: '#2a2a3a',
  },
  goalCardSelected: {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  goalIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  goalLabelSelected: {
    color: '#00d4ff',
  },
  checkmark: {
    fontSize: 20,
    color: '#00d4ff',
    fontWeight: '700',
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
