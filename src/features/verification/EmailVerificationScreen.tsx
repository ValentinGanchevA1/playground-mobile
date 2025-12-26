// src/features/verification/EmailVerificationScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  sendEmailCode,
  verifyEmailCode,
  resendEmailCode,
  setEmailStep,
  decrementEmailCountdown,
  clearError,
} from './verificationSlice';

export const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { emailStep, emailCountdown, isLoading, error } = useAppSelector(
    (state) => state.verification
  );

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (emailCountdown <= 0) return;

    const timer = setInterval(() => {
      dispatch(decrementEmailCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, [emailCountdown, dispatch]);

  // Success animation
  useEffect(() => {
    if (emailStep === 'success') {
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [emailStep, successAnim]);

  const validateEmail = (emailValue: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      dispatch({ type: 'verification/setError', payload: 'Please enter a valid email' });
      return;
    }

    Keyboard.dismiss();
    dispatch(sendEmailCode(email));
  };

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit
    if (newCode.every((c) => c) && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (fullCode: string) => {
    Keyboard.dismiss();
    dispatch(verifyEmailCode(fullCode));
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    dispatch(resendEmailCode());
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEmailInput = () => (
    <>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✉️</Text>
      </View>

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We'll send a 6-digit code to verify your email address
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.emailInput}
          value={email}
          onChangeText={(text) => {
            setEmail(text.toLowerCase().trim());
            dispatch(clearError());
          }}
          placeholder="your@email.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          (!validateEmail(email) || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleSendCode}
        disabled={!validateEmail(email) || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Send Code</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderCodeInput = () => (
    <>
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>Sent to {email}</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[styles.codeInput, digit && styles.codeInputFilled]}
            value={digit}
            onChangeText={(value) => handleCodeChange(value.slice(-1), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator color="#00d4ff" style={styles.loader} />
      ) : (
        <>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Code expires in {formatCountdown(emailCountdown)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={emailCountdown > 540} // Allow resend after 1 min
          >
            <Text
              style={[
                styles.resendText,
                emailCountdown > 540 && styles.resendDisabled,
              ]}
            >
              {emailCountdown > 540
                ? `Resend in ${formatCountdown(emailCountdown - 540)}`
                : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.changeButton}
        onPress={() => {
          dispatch(setEmailStep('input'));
          setCode(['', '', '', '', '', '']);
        }}
      >
        <Text style={styles.changeText}>Change email</Text>
      </TouchableOpacity>
    </>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Animated.View
        style={[
          styles.successIconContainer,
          {
            transform: [
              { scale: successAnim },
              {
                rotate: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.successIcon}>✓</Text>
      </Animated.View>

      <Text style={styles.successTitle}>Email Verified!</Text>
      <Text style={styles.successSubtitle}>
        You've earned the email verification badge
      </Text>

      <View style={styles.badgePreview}>
        <Text style={styles.badgeEmoji}>✉️</Text>
        <Text style={styles.badgeLabel}>+15 Trust Points</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {emailStep === 'input' && renderEmailInput()}
      {emailStep === 'code' && renderCodeInput()}
      {emailStep === 'success' && renderSuccess()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  emailInput: {
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    padding: 18,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#1a1a24',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a3a',
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: '#00d4ff',
  },
  button: {
    width: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  error: {
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  timerContainer: {
    marginBottom: 16,
  },
  timerText: {
    color: '#888',
    fontSize: 14,
  },
  resendButton: {
    padding: 12,
  },
  resendText: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '500',
  },
  resendDisabled: {
    color: '#666',
  },
  changeButton: {
    marginTop: 16,
    padding: 12,
  },
  changeText: {
    color: '#888',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#000',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
  },
  badgePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 40,
  },
  badgeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  badgeLabel: {
    color: '#00d4ff',
    fontWeight: '600',
  },
});
