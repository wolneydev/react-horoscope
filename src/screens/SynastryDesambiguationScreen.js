import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import StorageService from '../store/store';
import CustomButton from '../Components/CustomButton';
import BuyGenericButton from '../Components/BuyGenericButton';
import StripeService from '../services/StripeService';
import { formatNumber } from '../utils/helpers';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import MessageModal from '../Components/MessageModal';
import InfoCardSinastria from '../Components/InfoCardSinastria';
import LoadingOverlay from '../Components/LoadingOverlay';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';
import { useUser } from '../contexts/UserContext';

const SynastryScreen = () => {
  const navigation = useNavigation();
  const { userData, refreshUserData } = useUser();
  const [extraCharts, setExtraCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [extraMapsUsed, setExtraMapsUsed] = useState(0);
  const [maxExtraMaps, setMaxExtraMaps] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    actions: [],
    extraContent: null,
    loading: false
  });

  const memoStars = useMemo(() => <AnimatedStars />, []);

  useFocusEffect(
    useCallback(() => {
      initializeScreen();
    }, [])
  );

  const initializeScreen = async () => {
    try {
      await refreshUserData();
      await StripeService.initializeStripe();
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar tela:', error);
    }
  };

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
          message: 'Novo(s) mapa(s) extra(s) foram adicionado(s) à sua conta. Você já pode criá-lo(s) e realizar a sinastria com o seu mapa astral!',
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
    
    setShowCreditsModal(false);
  };

  const handlePurchaseCancel = (failMessage) => {
    setIsAnyProcessing(false);
    setLoadingMessage('');
    
    if (failMessage) {
      setMessageModal({
        visible: true,
        title: 'Erro na Compra!',
        message: 'Você pode tentar outros cartões ou tentar novamente quando a situação for resolvida. Caso queira mais informações sobre esta transação, acesse o menu \'Minhas Compras\'.',
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => {
              setMessageModal(prev => ({ ...prev, visible: false }));
              setShowCreditsModal(true);
            }
          }
        ],
        extraContent: failMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Retorno da operadora:</Text>
            <Text style={styles.errorMessage}>{failMessage}</Text>
          </View>
        ) : null
      });
    } else {
      setShowCreditsModal(true);
    }
  };

  const handleCloseErrorPopup = () => {
    setMessageModal({
      visible: false,
      title: '',
      message: '',
      type: 'success',
      actions: [],
      extraContent: null
    });
  };

  const renderChartItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chartCard}
      onPress={() => {
        navigation.navigate('HomeScreen', { 
          screen: 'Mapa Astral', 
          params: { astralMap: item } 
        });
      }}
    >
      <View style={styles.chartIconContainer}>
        <Icon name="person" size={24} color="#6D44FF" />
      </View>
      <View style={styles.chartInfo}>
        <Text style={styles.chartName}>{item.astral_map_name}</Text>
        <Text style={styles.chartDetails}>
          {item.birth_city}, {formatNumber(item.birth_day)}/{formatNumber(item.birth_month)}/{item.birth_year} às {formatNumber(item.birth_hour)}:{formatNumber(item.birth_minute)}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#6D44FF" />
    </TouchableOpacity>
  );

  return (
    <EmailVerificationGuard>
      <View style={styles.container}>
        {memoStars}
        
        <View style={styles.content}>
          <InfoCardSinastria 
            isInitialized={isInitialized}
            extraMapsUsed={extraMapsUsed}
            maxExtraMaps={maxExtraMaps}
            isInfoExpanded={isInfoExpanded}
            setIsInfoExpanded={setIsInfoExpanded}
          />
          <View style={styles.chartsSection}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.PRIMARY} size="large" />
            ) : (
              <FlatList
                data={extraCharts}
                renderItem={renderChartItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chartsList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Adicione novos mapas para realizar a sinastria com o seu!
                  </Text>
                }
              />
            )}
          </View>

          <CustomButton
            title="Criar Novo Mapa Astral"
            onPress={() => navigation.navigate('HomeScreen', { screen: 'Mapa Extra' })}
            icon="add-circle-outline"
            disabled={!isInitialized || isLoading}
          />        
        </View>

        <Modal
          visible={showCreditsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCreditsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Mapas</Text>
              <Text style={styles.modalText}>
                Você já utilizou todos os seus mapas extras disponíveis. 
                Escolha um pacote para continuar gerando mapas e verificando as compatibilidades com o seu.
              </Text>

              <View style={styles.creditsOptions}>
                <BuyGenericButton
                  amount={10.00}
                  product_slug={'extra_map'}
                  onSuccess={handlePurchaseSuccess}
                  onCancel={handlePurchaseCancel}
                  onStartProcessing={() => {
                    setIsAnyProcessing(true);
                    setLoadingMessage('Processando pagamento');
                    setShowCreditsModal(false);
                  }}
                  onEndProcessing={() => setIsAnyProcessing(false)}
                  style={[styles.creditButton, isAnyProcessing && styles.disabledButton]}
                  disabled={isAnyProcessing}
                  label={
                    <View style={styles.buttonLabelContainer}>
                      <Text style={[styles.buttonLabel, isAnyProcessing && styles.disabledText]}>1 Mapa Extra</Text>
                      <Text style={[styles.buttonAmount, isAnyProcessing && styles.disabledText]}>R$ 10,00</Text>
                    </View>
                  }
                />

                <View style={styles.discountContainer}>
                  <BuyGenericButton
                    amount={18.00}
                    product_slug={'two_extra_map_pack'}
                    onSuccess={handlePurchaseSuccess}
                    onCancel={handlePurchaseCancel}
                    onStartProcessing={() => {
                      setIsAnyProcessing(true);
                      setLoadingMessage('Processando pagamento');
                      setShowCreditsModal(false);
                    }}
                    onEndProcessing={() => setIsAnyProcessing(false)}
                    style={[styles.creditButton, isAnyProcessing && styles.disabledButton]}
                    disabled={isAnyProcessing}
                    label={
                      <View style={styles.buttonLabelContainer}>
                        <Text style={[styles.buttonLabel, isAnyProcessing && styles.disabledText]}>2 Mapas Extras</Text>
                        <Text style={[styles.buttonAmount, isAnyProcessing && styles.disabledText]}>R$ 18,00</Text>
                      </View>
                    }
                  />
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>10% OFF</Text>
                    <Text style={styles.pricePerUnit}>R$ 9,00/cada</Text>
                  </View>
                </View>

                <View style={styles.bestValueContainer}>
                  <BuyGenericButton
                    amount={40.00}
                    product_slug={'five_extra_map_pack'}
                    onSuccess={handlePurchaseSuccess}
                    onCancel={handlePurchaseCancel}
                    onStartProcessing={() => {
                      setIsAnyProcessing(true);
                      setLoadingMessage('Processando pagamento');
                      setShowCreditsModal(false);
                    }}
                    onEndProcessing={() => setIsAnyProcessing(false)}
                    style={[
                      styles.creditButton, 
                      styles.bestValueButton,
                      isAnyProcessing && styles.disabledButton
                    ]}
                    disabled={isAnyProcessing}
                    label={
                      <View style={styles.buttonLabelContainer}>
                        <Text style={[styles.buttonLabel, styles.bestValueLabel, isAnyProcessing && styles.disabledText]}>
                          5 Mapas Extras
                        </Text>
                        <Text style={[styles.buttonAmount, styles.bestValueAmount, isAnyProcessing && styles.disabledText]}>
                          R$ 40,00
                        </Text>
                      </View>
                    }
                  />
                  <View style={[styles.discountBadge, styles.bestValueBadge]}>
                    <Text style={styles.discountText}>20% OFF</Text>
                    <Text style={styles.pricePerUnit}>R$ 8,00/cada</Text>
                  </View>
                </View>
              </View>

              <CustomButton
                title="Fechar"
                onPress={() => setShowCreditsModal(false)}
              />
            </View>
          </View>
        </Modal>

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

      {isAnyProcessing && <LoadingOverlay message={loadingMessage} />}
    </EmailVerificationGuard>
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
  chartsSection: {
    flex: 1,
  },
  chartsList: {
    flexGrow: 1,
    paddingBottom: SPACING.LARGE,
  },
  titleContainer: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
  },
  extraMapsText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.LARGE,
  },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    padding: SPACING.LARGE,
    borderRadius: 12,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  chartIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: SPACING.SMALL,
    borderRadius: 20,
    marginRight: SPACING.LARGE,
  },
  chartInfo: {
    flex: 1,
  },
  chartName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  chartDetails: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.SMALL,
    marginTop: SPACING.TINY,
  },
  emptyText: {
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: SPACING.LARGE,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  modalContent: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 15,
    padding: SPACING.LARGE,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: FONTS.SIZES.XXLARGE,
    color: COLORS.HIGHLIGHT,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  modalText: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.XLARGE,
  },
  creditsOptions: {
    gap: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  creditButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.25)',
    borderColor: 'rgba(109, 68, 255, 0.75)',
  },
  discountContainer: {
    position: 'relative',
  },
  bestValueContainer: {
    position: 'relative',
    transform: [{ scale: 1.05 }],
  },
  bestValueButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.4)',
    borderColor: COLORS.HIGHLIGHT,
    borderWidth: 2,
  },
  discountBadge: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: '#FF4081',
    borderRadius: 12,
    padding: SPACING.SMALL,
    flexDirection: 'column',
    alignItems: 'center',
  },
  bestValueBadge: {
    backgroundColor: COLORS.HIGHLIGHT,
  },
  discountText: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  pricePerUnit: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.SMALL,
    opacity: 0.9,
  },
  bestValueFlag: {
    position: 'absolute',
    left: 10,
    top: -12,
    backgroundColor: COLORS.HIGHLIGHT,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.TINY,
    borderRadius: 12,
  },
  bestValueText: {
    color: COLORS.BACKGROUND,
    fontWeight: FONTS.WEIGHTS.BOLD,
    fontSize: FONTS.SIZES.TINY,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonLabelContainer: {
    alignItems: 'center',
  },
  buttonLabel: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.TINY,
  },
  buttonAmount: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    opacity: 0.9,
  },
  bestValueLabel: {
    fontSize: FONTS.SIZES.XLARGE,
    color: COLORS.HIGHLIGHT,
  },
  bestValueAmount: {
    fontSize: FONTS.SIZES.LARGE,
    color: COLORS.HIGHLIGHT,
  },
  expandButton: {
    padding: SPACING.SMALL,
  },
  expandedInfo: {
    marginTop: SPACING.LARGE,
    paddingTop: SPACING.LARGE,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 68, 255, 0.2)',
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

export default SynastryScreen;
