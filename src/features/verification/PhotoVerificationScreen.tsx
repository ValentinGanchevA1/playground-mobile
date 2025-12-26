// src/features/verification/PhotoVerificationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { initiatePhotoVerification, submitPhotoVerification } from './verificationSlice';

type Step = 'intro' | 'challenge' | 'capture' | 'review' | 'result';

const CHALLENGE_INSTRUCTIONS: Record<string, string> = {
  smile: 'Give us a big smile! 😊',
  turn_left: 'Turn your head slightly left',
  turn_right: 'Turn your head slightly right',
  thumbs_up: 'Show a thumbs up gesture 👍',
  peace_sign: 'Show a peace sign ✌️',
};

export const PhotoVerificationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { challenge, isLoading, verificationResult } = useAppSelector(
    (state) => state.verification
  );

  const [step, setStep] = useState<Step>('intro');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const handleStart = async () => {
    await dispatch(initiatePhotoVerification());
    setStep('challenge');
  };

  const handleCapture = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      cameraType: 'front',
      saveToPhotos: false,
    });

    if (result.assets && result.assets[0]?.uri) {
      setCapturedPhoto(result.assets[0].uri);
      setStep('review');
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setStep('challenge');
  };

  const handleSubmit = async () => {
    if (!capturedPhoto) return;

    await dispatch(submitPhotoVerification(capturedPhoto));
    setStep('result');
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📸</Text>
            </View>
            <Text style={styles.title}>Photo Verification</Text>
            <Text style={styles.subtitle}>
              Take a selfie to prove your profile photos are really you.
              We'll compare it with your profile pictures.
            </Text>

            <View style={styles.tips}>
              <Text style={styles.tip}>• Good lighting</Text>
              <Text style={styles.tip}>• Face clearly visible</Text>
              <Text style={styles.tip}>• No sunglasses or masks</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Start Verification</Text>
            </TouchableOpacity>
          </View>
        );

      case 'challenge':
        return (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <View style={styles.faceGuide} />
              <Text style={styles.cameraText}>Camera will open when you tap capture</Text>
            </View>

            <View style={styles.challengeBox}>
              <Text style={styles.challengeLabel}>Your Challenge:</Text>
              <Text style={styles.challengeText}>
                {challenge ? CHALLENGE_INSTRUCTIONS[challenge] : 'Look at the camera'}
              </Text>
            </View>

            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        );

      case 'review':
        return (
          <View style={styles.centered}>
            <Text style={styles.title}>Review Photo</Text>

            <View style={styles.reviewImageContainer}>
              <Image source={{ uri: capturedPhoto! }} style={styles.reviewImage} />
            </View>

            <View style={styles.reviewButtons}>
              <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'result':
        const isSuccess = verificationResult?.status === 'approved';
        const isPending = verificationResult?.status === 'pending';

        return (
          <View style={styles.centered}>
            <View style={[styles.resultIcon, isSuccess && styles.resultIconSuccess]}>
              <Text style={styles.resultEmoji}>
                {isSuccess ? '✓' : isPending ? '⏳' : '✗'}
              </Text>
            </View>

            <Text style={styles.title}>
              {isSuccess
                ? 'Verified!'
                : isPending
                  ? 'Under Review'
                  : 'Verification Failed'}
            </Text>

            <Text style={styles.subtitle}>
              {verificationResult?.message}
            </Text>

            {!isSuccess && !isPending && (
              <TouchableOpacity style={styles.button} onPress={() => setStep('intro')}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  tips: {
    marginBottom: 32,
  },
  tip: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: '#888',
    fontSize: 14,
    marginTop: 24,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 320,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: '#00d4ff',
    borderStyle: 'dashed',
  },
  challengeBox: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  challengeLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  challengeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 6,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: '#fff',
  },
  reviewImageContainer: {
    width: 280,
    height: 350,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  reviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  retakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 48,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultIconSuccess: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  resultEmoji: {
    fontSize: 48,
  },
});
