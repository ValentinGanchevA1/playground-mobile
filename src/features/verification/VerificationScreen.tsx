// src/features/verification/VerificationScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchVerificationStatus } from './verificationSlice';

const VERIFICATION_METHODS = [
  {
    type: 'phone',
    title: 'Phone Number',
    description: 'Verify via SMS code',
    icon: '📱',
    points: 20,
    route: 'PhoneVerification',
  },
  {
    type: 'email',
    title: 'Email Address',
    description: 'Verify via email code',
    icon: '✉️',
    points: 15,
    route: 'EmailVerification',
  },
  {
    type: 'photo',
    title: 'Photo Verification',
    description: "Take a selfie to prove it's you",
    icon: '📸',
    points: 35,
    route: 'PhotoVerification',
  },
  {
    type: 'id',
    title: 'ID Verification',
    description: 'Upload government-issued ID',
    icon: '🪪',
    points: 25,
    route: 'IdVerification',
  },
  {
    type: 'social',
    title: 'Social Accounts',
    description: 'Link your social profiles',
    icon: '🔗',
    points: 10,
    route: 'SocialLinking',
  },
];

export const VerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { badges, score, pending } = useAppSelector((state) => state.verification);

  useEffect(() => {
    dispatch(fetchVerificationStatus());
  }, [dispatch]);

  const getMethodStatus = (type: string) => {
    if (badges?.[type]) return 'verified';
    if (pending?.includes(type)) return 'pending';
    return 'available';
  };


  const handleMethodPress = (type: string) => {
    switch (type) {
      case 'phone':
        navigation.navigate('PhoneVerification');
        break;
      case 'photo':
        navigation.navigate('PhotoVerification');
        break;
      case 'id':
        navigation.navigate('IdVerification');
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Trust Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Trust Score</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <Text style={styles.scoreDescription}>
          Higher scores increase visibility and trust
        </Text>
      </View>

      {/* Verification Methods */}
      <Text style={styles.sectionTitle}>Verification Methods</Text>

      {VERIFICATION_METHODS.map((method) => {
        const status = getMethodStatus(method.type);

        return (
          <TouchableOpacity
            key={method.type}
            style={[styles.methodCard, status === 'verified' && styles.methodVerified]}
            onPress={() => handleMethodPress(method.type)}
            disabled={status === 'verified'}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>

            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>

            <View style={styles.methodStatus}>
              {status === 'verified' ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              ) : status === 'pending' ? (
                <Text style={styles.pendingText}>Pending</Text>
              ) : (
                <Text style={styles.pointsText}>+{method.points} pts</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Why Verify?</Text>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🔝</Text>
          <Text style={styles.benefitText}>Appear higher in search results</Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>💬</Text>
          <Text style={styles.benefitText}>Get more messages from verified users</Text>
        </View>
        <View style={styles.benefit}>
          <Text style={styles.benefitIcon}>🛡️</Text>
          <Text style={styles.benefitText}>Blue verification badge on profile</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#00d4ff',
  },
  scoreMax: {
    fontSize: 20,
    color: '#666',
  },
  scoreDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  methodVerified: {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  methodDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  methodStatus: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#000',
    fontWeight: '700',
  },
  pendingText: {
    color: '#f0ad4e',
    fontSize: 12,
    fontWeight: '500',
  },
  pointsText: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  benefitText: {
    color: '#aaa',
    fontSize: 14,
  },
});
