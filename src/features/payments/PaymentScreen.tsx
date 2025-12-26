// src/features/payments/PaymentScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { apiClient } from '../../api/client';

interface PaymentScreenProps {
  amount: number;
  onSuccess: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ amount, onSuccess }) => {
  const { confirmPayment } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please complete card details');
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent on backend
      const { data } = await apiClient.post('/payments/create-intent', { amount });

      // Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(data.clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent?.status === 'Succeeded') {
        Alert.alert('Success', 'Payment completed!');
        onSuccess();
      }
    } catch {
      Alert.alert('Error', 'Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Payment</Text>
      <Text style={styles.amount}>${amount.toFixed(2)}</Text>

      <CardField
        postalCodeEnabled={false}
        style={styles.cardField}
        cardStyle={styles.card}
        onCardChange={(details) => setCardComplete(details.complete)}
      />

      <TouchableOpacity
        style={[styles.button, (!cardComplete || isLoading) && styles.buttonDisabled]}
        onPress={handlePayment}
        disabled={!cardComplete || isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0a0a0f',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  amount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00d4ff',
    textAlign: 'center',
    marginVertical: 24,
  },
  cardField: {
    height: 50,
    marginVertical: 24,
  },
  card: {
    backgroundColor: '#1a1a24',
  },
  button: {
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
});
