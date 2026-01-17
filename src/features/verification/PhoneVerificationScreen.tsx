// src/features/verification/PhoneVerificationScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { sendPhoneCode, verifyPhoneCode } from './verificationSlice';

export const PhoneVerificationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, phoneCountdown } = useAppSelector(
    (state) => state.verification
  );

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if ('code' === step) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendCode = async () => {
    Keyboard.dismiss();
    const action = sendPhoneCode(phone);
    const result = await dispatch(action);
    if (sendPhoneCode.fulfilled.match(result)) {
      setStep('code');
    }
  };

  const handleVerifyCode = async (fullCode: string) => {
    Keyboard.dismiss();
    const action = verifyPhoneCode(fullCode);
    const result = await dispatch(action);
    if (verifyPhoneCode.fulfilled.match(result)) {
      // Navigate back or show success
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && 5 > index) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCode.every(Boolean) && 5 === index) {
        const fullCode = newCode.join('');
        // Using void to explicitly ignore the promise, as we don't need to await it here.
        void handleVerifyCode(fullCode);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if ('Backspace' === e.nativeEvent.key && !code[index] && 0 < index) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    const action = sendPhoneCode(phone);
    dispatch(action);
  };

  const renderCodeInputs = () => {
    return code.map((digit, index) => {
      const handleInputChange = (value: string) => {
        const lastChar = value.slice(-1);
        handleCodeChange(lastChar, index);
      };

      return (
        <TextInput
          key={`code-input-${index}`} // Use a more unique key
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.codeInput, digit && styles.codeInputFilled]}
          value={digit}
          onChangeText={handleInputChange}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      );
    });
  };


  return (
    <View style={styles.container}>
      {'phone' === step ? (
        <>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📱</Text>
          </View>

          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>
            We'll send you a 6-digit code to verify your number
          </Text>

          <View style={styles.phoneInputContainer}>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              autoFocus
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, (!phone || isLoading) && styles.buttonDisabled]}
            onPress={handleSendCode}
            disabled={!phone || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Send Code</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            Sent to {phone}
          </Text>

          <View style={styles.codeContainer}>
            {renderCodeInputs()}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          {isLoading ? (
            <ActivityIndicator color="#00d4ff" style={styles.verifying} />
          ) : (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={0 < phoneCountdown}
            >
              <Text style={[styles.resendText, 0 < phoneCountdown && styles.resendDisabled]}>
                {0 < phoneCountdown ? `Resend in ${phoneCountdown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setStep('phone')}>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
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
  phoneInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  phoneInput: {
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
    justifyContent: 'center',
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
  verifying: {
    marginVertical: 20,
  },
  resendButton: {
    padding: 16,
  },
  resendText: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '500',
  },
  resendDisabled: {
    color: '#666',
  },
  changeNumber: {
    color: '#888',
    fontSize: 14,
    marginTop: 16,
  },
});
