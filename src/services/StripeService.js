import { Alert } from 'react-native';
import { 
  initStripe, 
  presentPaymentSheet, 
  initPaymentSheet 
} from '@stripe/stripe-react-native';
import api from './api';
import StorageService from '../store/store';

class StripeService {
  static async initializeStripe() {
    try {
      console.log('initializeStripe asasasasa');
      await initStripe({
        publishableKey: 'pk_test_51R6Bh2GOWG1KPjIkZrGgjklojx0tDrKsQHmgPwF74bWjW9hW8UnHMaqmcNci9cg2TMRtVJXi9NPsA1b0k4HvAXVd004KyHGmoL', // Sua chave publicável do Stripe
        merchantIdentifier: 'your_merchant_identifier', // Para Apple Pay
      });
    } catch (error) {
      console.error('Erro ao inicializar Stripe:', error);
    }
  }

  static async processPayment(amount, order_id, product_slug) {
    try {
      console.log('processPayment', amount, order_id, product_slug);
      centavosAmount = amount * 100;

      const accessToken = await StorageService.getAccessToken();
      const user = await StorageService.getUserData();

      // 1. Criar intent de pagamento no backend
      const response = await api.post('orders/create',
        {
          amount: centavosAmount,
          currency: 'brl',
          metadata: {
            order_id: order_id ? order_id : null,
            customer_id: user.uuid,
            product_slug: product_slug ? product_slug : null
          },
          payment_method_types: ['card'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('response', response.data);

      const { clientSecret, id } = response.data.data;

      // Configuração de aparência
      const appearance = {
        theme: 'night',
        variables: {
          fontFamily: 'Sohne, system-ui, sans-serif',
          fontWeightNormal: '500',
          borderRadius: '8px',
          colorBackground: '#0A2540',
          colorPrimary: '#EFC078',
          accessibleColorOnColorPrimary: '#1A1B25',
          colorText: 'white',
          colorTextSecondary: 'white',
          colorTextPlaceholder: '#ABB2BF',
          tabIconColor: 'white',
          logoColor: 'dark'
        },
        rules: {
          '.Input': {
            backgroundColor: '#212D63',
            border: '1px solid var(--colorPrimary)'
          }
        }
      };

      // 2. Configurar folha de pagamento
      const { error: paymentSheetError } = await initPaymentSheet({
        appearance,
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Astral Match',
        style: 'automatic',
        googlePay: true,
        applePay: true,
        merchantCountryCode: 'BR',
      });

      if (paymentSheetError) {
        console.error('Erro ao inicializar folha de pagamento:', paymentSheetError);
        throw new Error(paymentSheetError.message);
      }

      // 3. Apresentar folha de pagamento
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Erro ao apresentar folha de pagamento:', presentError);

        if (presentError.code === 'Canceled') {
          console.log('Pagamento cancelado pelo usuário');

          // 1. Cancelar intent de pagamento no backend
          const response = await api.post('orders/cancel-payment',
            {
              paymentIntentId: id,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          return {
            success: false,
            message: response.data.data.paymentIntentErrorMessage
          };
        }

        throw new Error(presentError.message);
      }

      // 4. Pagamento bem-sucedido
      return {
        success: true,
      };

    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      console.error('Error:', error);
      
      // The payment flow has been canceled

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

  // Método para reprocessar um pagamento
  static async reProcessPayment(amount, order_id) {
    try {
      centavosAmount = amount * 100;

      const accessToken = await StorageService.getAccessToken();
      const user = await StorageService.getUserData();

      // 1. Criar intent de pagamento no backend
      const response = await api.post(`orders/retry-payment`,
        {
          amount: centavosAmount,
          currency: 'brl',
          metadata: {
            order_id: order_id ? order_id : null,
            customer_id: user.uuid,
          },
          payment_method_types: ['card'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('response', response.data);

      const { clientSecret, id } = response.data.data;

      // Configuração de aparência
      const appearance = {
        theme: 'night',
        variables: {
          fontFamily: 'Sohne, system-ui, sans-serif',
          fontWeightNormal: '500',
          borderRadius: '8px',
          colorBackground: '#0A2540',
          colorPrimary: '#EFC078',
          accessibleColorOnColorPrimary: '#1A1B25',
          colorText: 'white',
          colorTextSecondary: 'white',
          colorTextPlaceholder: '#ABB2BF',
          tabIconColor: 'white',
          logoColor: 'dark'
        },
        rules: {
          '.Input': {
            backgroundColor: '#212D63',
            border: '1px solid var(--colorPrimary)'
          }
        }
      };

      // 2. Configurar folha de pagamento
      const { error: paymentSheetError } = await initPaymentSheet({
        appearance,
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Astral Match',
        style: 'automatic',
        googlePay: true,
        applePay: true,
        merchantCountryCode: 'BR',
      });

      if (paymentSheetError) {
        console.error('Erro ao inicializar folha de pagamento:', paymentSheetError);
        throw new Error(paymentSheetError.message);
      }

      // 3. Apresentar folha de pagamento
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Erro ao apresentar folha de pagamento:', presentError);

        if (presentError.code === 'Canceled') {
          console.log('Pagamento cancelado pelo usuário');

          // 1. Cancelar intent de pagamento no backend
          const response = await api.post('orders/cancel-payment',
            {
              paymentIntentId: id,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          console.log('response', response.data);

          return {
            success: false,
            message: response.data.data.paymentIntentErrorMessage
          };
        }

        throw new Error(presentError.message);
      }

      // 4. Pagamento bem-sucedido
      return {
        success: true,
      };

    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      console.error('Error:', error);
      
      // The payment flow has been canceled

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