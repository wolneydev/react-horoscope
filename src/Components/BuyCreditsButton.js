import React, { useState } from 'react';
import { Alert } from 'react-native';
import CustomButton from './CustomButton';
import StripeService from '../services/StripeService';

const BuyCreditsButton = ({ 
  amount, 
  credits, 
  onSuccess, 
  style 
}) => {
  const [loading, setLoading] = useState(false);

  const handleBuyCredits = async () => {
    try {
      setLoading(true);
      const result = await StripeService.processPayment(amount, credits);
      
      if (result.success) {
        //await updateUserCredits(credits); // Atualiza créditos do usuário
        onSuccess?.(result);
        Alert.alert(
          'Sucesso!', 
          `${credits} créditos foram adicionados à sua conta!`
        );
      }
    } catch (error) {
      console.error('Erro na compra de créditos:', error);
      Alert.alert(
        'Erro',
        'Não foi possível processar seu pagamento. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomButton
      title={`${credits} Créditos por R$ ${amount.toFixed(2)}`}
      onPress={handleBuyCredits}
      loading={loading}
      style={style}
      icon="stars"
    />
  );
};

export default BuyCreditsButton; 