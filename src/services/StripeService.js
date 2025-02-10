import { Alert } from 'react-native';
import { 
  initStripe, 
  presentPaymentSheet, 
  initPaymentSheet 
} from '@stripe/stripe-react-native';
import api from './api';

class StripeService {
  static async initializeStripe() {
    try {
      await initStripe({
        publishableKey: 'pk_test_51IjTO6FgY3qL9Yy9YxgyVyOGKiUC08dYI51M0Ss76qUpeyowI4phNGtbYaY1lpduXNHdg3NeoviKoHjcWjvd0YrM00ojju594Q', // Sua chave publicável do Stripe
        merchantIdentifier: 'your_merchant_identifier', // Para Apple Pay
      });
    } catch (error) {
      console.error('Erro ao inicializar Stripe:', error);
    }
  }

  static async processPayment(amount, credits) {
    try {
      console.log('starting payment', amount);
      // 1. Criar intent de pagamento no backend
      const response = await api.post('payments/create-intent',
        {
          amount: 1000,
          currency: 'brl',
          metadata: {
            order_id: '123',
            customer_id: '456'
          },
          payment_method_types: ['card'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('response', response.data);

      const { clientSecret, ephemeralKey, customer } = response.data;

      // 2. Configurar folha de pagamento
      const { error: paymentSheetError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        merchantDisplayName: 'Astral Match',
        style: 'automatic',
        googlePay: true,
        applePay: true,
        merchantCountryCode: 'BR',
      });

      if (paymentSheetError) {
        throw new Error(paymentSheetError.message);
      }

      // 3. Apresentar folha de pagamento
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        throw new Error(presentError.message);
      }

      // 4. Pagamento bem-sucedido
      return {
        success: true,
        credits: credits
      };

    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      
      // Tratamento específico para erro 422
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors)
          .flat()
          .join('\n');
        
        Alert.alert('Erro de Validação', errorMessage);
      }
      throw error;
    }
  }
}

export default StripeService; 