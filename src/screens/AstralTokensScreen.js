import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import UserInfoHeader from '../Components/UserInfoHeader';
import LoadingOverlay from '../Components/LoadingOverlay';
import { COLORS, SPACING, FONTS } from '../styles/theme';
import BuyGenericButton from '../Components/BuyGenericButton';
import MessageModal from '../Components/MessageModal';
import StripeService from '../services/StripeService';
import { useUser } from '../contexts/UserContext';

const AstralTokensScreen = () => {  
  const { userData, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando ...');
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    actions: [],
    extraContent: null,
    loading: false
  });

  React.useEffect(() => {
    initializeStripe();
  }, []);

  const initializeStripe = async () => {
    try {
      await StripeService.initializeStripe();
    } catch (error) {
      console.error('Erro ao inicializar Stripe:', error);
    }
  };

  const tokenPackages = [
    { id: 1, tokens: 100, price: 9.90, bonus: '0%', product_slug: 'astral_tokens_100' },
    { id: 2, tokens: 275, price: 21.90, bonus: ' 25 tokens', product_slug: 'astral_tokens_275' },
    { id: 3, tokens: 600, price: 39.90, bonus: ' 100 tokens', product_slug: 'astral_tokens_600' },
    { id: 4, tokens: 1250, price: 74.90, bonus: ' 250 tokens', product_slug: 'astral_tokens_1250' },
  ];

  const handlePurchaseSuccess = async () => {
    setIsAnyProcessing(false);
    setLoadingMessage('');
    
    setMessageModal({
      visible: true,
      title: 'Processando...',
      message: 'Verificando sua compra',
      type: 'info',
      loading: true
    });
    
    try {
      const result = await refreshUserData();
      
      if (result.success) {
        setMessageModal({
          visible: true,
          title: 'Compra Realizada!',
          message: 'Seus Astral Tokens foram adicionados à sua conta com sucesso!',
          type: 'success',
          loading: false,
          actions: [
            {
              text: 'OK',
              primary: true,
              onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
            }
          ]
        });
        
        setTimeout(() => {
          setMessageModal(prev => ({ ...prev, visible: false }));
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setMessageModal({
        visible: true,
        title: 'Erro!',
        message: 'Ocorreu um erro ao atualizar seus dados. Por favor, tente novamente.',
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    }
  };

  const handlePurchaseCancel = (failMessage) => {
    setIsAnyProcessing(false);
    setLoadingMessage('');
    
    setMessageModal({
      visible: true,
      title: 'Erro na Compra!',
      message: 'Você pode tentar outros cartões ou tentar novamente quando a situação for resolvida.',
      type: 'error',
      loading: false,
      actions: [
        {
          text: 'OK',
          primary: true,
          onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
        }
      ],
      extraContent: failMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Retorno da operadora:</Text>
          <Text style={styles.errorMessage}>{failMessage}</Text>
        </View>
      ) : null
    });
  };

  return (
    <View style={styles.container}>
      <UserInfoHeader userData={userData} />
      
      <ScrollView style={styles.content}>
        <View style={styles.currentBalance}>
          <Text style={styles.balanceLabel}>Seu Saldo Atual</Text>
          <Text style={styles.balanceValue}>{userData?.astral_tokens || 0} Tokens</Text>
        </View>

        <Text style={styles.sectionTitle}>Escolha seu Pacote</Text>
        
        {tokenPackages.map((pkg) => (
          <View key={pkg.id} style={styles.packageContainer}>
            <BuyGenericButton
              amount={pkg.price}
              product_slug={pkg.product_slug}
              onSuccess={handlePurchaseSuccess}
              onCancel={handlePurchaseCancel}
              onStartProcessing={() => {
                setIsAnyProcessing(true);
                setLoadingMessage('Processando pagamento');
              }}
              onEndProcessing={() => setIsAnyProcessing(false)}
              style={[styles.packageCard, isAnyProcessing && styles.disabledButton]}
              disabled={isAnyProcessing}
              label={
                <View style={styles.packageInfo}>
                  <View>
                    <Text style={styles.tokenAmount}>{pkg.tokens} Tokens</Text>
                    {pkg.bonus !== '0%' && (
                      <View style={styles.bonusBadge}>
                        <Text style={styles.bonusText}>+{pkg.bonus} Bônus</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.packagePrice}>R$ {pkg.price.toFixed(2).replace('.', ',')}</Text>
                </View>
              }
            />
          </View>
        ))}
      </ScrollView>

      {isAnyProcessing && <LoadingOverlay message={loadingMessage} />}

      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        actions={messageModal.actions}
        onClose={() => setMessageModal(prev => ({ ...prev, visible: false }))}
        extraContent={messageModal.extraContent}
        loading={messageModal.loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    padding: SPACING.LARGE,
  },
  currentBalance: {
    backgroundColor: COLORS.SECONDARY_LIGHT,
    padding: SPACING.LARGE,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: SPACING.LARGE,
  },
  balanceLabel: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
  balanceValue: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.LARGE,
  },
  packageContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  packageCard: {
    backgroundColor: COLORS.SECONDARY_LIGHT,
    padding: SPACING.LARGE,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tokenAmount: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  bonusBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 12,
    marginTop: SPACING.SMALL,
    alignSelf: 'flex-start',
  },
  bonusText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.TINY,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  packagePrice: {
    color: '#FFD700',
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorContainer: {
    marginTop: SPACING.MEDIUM,
    padding: SPACING.MEDIUM,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4444',
    marginBottom: SPACING.LARGE,
    alignItems: 'center',
  },
  errorTitle: {
    color: '#FF4444',
    fontWeight: FONTS.WEIGHTS.BOLD,
    fontSize: FONTS.SIZES.MEDIUM,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
  },
  errorMessage: {
    color: COLORS.ERROR || '#FF4444',
    fontSize: FONTS.SIZES.SMALL,
    textAlign: 'center',
  },
});

export default AstralTokensScreen; 