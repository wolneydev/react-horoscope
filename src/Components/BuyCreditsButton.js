import React, { useState } from 'react';
import { Alert, TouchableOpacity, StyleSheet } from 'react-native';
import StripeService from '../services/StripeService';

const BuyCreditsButton = ({ 
  label,
  amount, 
  credits, 
  onSuccess,
  onStartProcessing,
  onEndProcessing,
  product_slug,
  style,
  disabled
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePress = async () => {
    try {
      onStartProcessing && onStartProcessing();
      
      const result = await StripeService.processPayment(amount, credits, product_slug);
      console.log('result', result);
      if (result.success) {
        Alert.alert('Sucesso', 'Créditos comprados com sucesso!');
        onSuccess(credits);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.');
    } finally {
      onEndProcessing && onEndProcessing();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        (disabled || isProcessing) && styles.disabledButton
      ]}
      onPress={handlePress}
      disabled={disabled || isProcessing}
    >
      {label}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default BuyCreditsButton; 