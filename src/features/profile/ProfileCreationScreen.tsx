// src/features/profile/ProfileCreationScreen.tsx
import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setStep, submitProfile } from './profileSlice';
import { fetchCurrentUser } from '../auth/authSlice';
import { ProfileStep } from './types';

import { ProgressBar } from './components/ProgressBar';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PhotosStep } from './steps/PhotosStep';
import { InterestsStep } from './steps/InterestsStep';
import { GoalsStep } from './steps/GoalsStep';
import { LocationStep } from './steps/LocationStep';

const STEPS: ProfileStep[] = ['basics', 'photos', 'interests', 'goals', 'location'];

export const ProfileCreationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStep, formData, isSubmitting } = useAppSelector(
    (state) => state.profile
  );

  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  const goNext = useCallback(async () => {
    if (currentIndex < STEPS.length - 1) {
      dispatch(setStep(STEPS[currentIndex + 1]));
    } else {
      console.log('ProfileCreation: Submitting profile...');
      // Submit profile and refresh user data
      const result = await dispatch(submitProfile());
      console.log('ProfileCreation: Submit result:', result);
      if (submitProfile.fulfilled.match(result)) {
        console.log('ProfileCreation: Success, fetching user...');
        // Refresh user to update profile.completedAt - triggers navigation
        await dispatch(fetchCurrentUser());
        console.log('ProfileCreation: User fetched');
      } else {
        console.log('ProfileCreation: Submit failed:', result.payload);
      }
    }
  }, [currentIndex, dispatch]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      dispatch(setStep(STEPS[currentIndex - 1]));
    }
  }, [currentIndex, dispatch]);

  const renderStep = () => {
    switch (currentStep) {
      case 'basics':
        return <BasicInfoStep onNext={goNext} />;
      case 'photos':
        return <PhotosStep onNext={goNext} onBack={goBack} />;
      case 'interests':
        return <InterestsStep onNext={goNext} onBack={goBack} />;
      case 'goals':
        return <GoalsStep onNext={goNext} onBack={goBack} />;
      case 'location':
        return <LocationStep onNext={goNext} onBack={goBack} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar progress={progress} steps={STEPS} currentStep={currentStep} />
      <View style={styles.content}>{renderStep()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
