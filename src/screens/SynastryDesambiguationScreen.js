import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import StorageService from '../store/store';
import CustomButton from '../Components/CustomButton';
import BuyExtraMapsButton from '../Components/BuyExtraMapsButton';
import StripeService from '../services/StripeService';
import { formatNumber } from '../utils/helpers';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import BuyMapsPopupMessage from '../Components/BuyMapsPopupMessage';
import InfoCardSinastria from '../Components/InfoCardSinastria';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';

const SynastryScreen = () => {
  const navigation = useNavigation();
  const [extraCharts, setExtraCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [extraMapsUsed, setExtraMapsUsed] = useState(0);
  const [maxExtraMaps, setMaxExtraMaps] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [failMessage, setFailMessage] = useState(null);

  const memoStars = useMemo(() => <AnimatedStars />, []);

  useFocusEffect(
    useCallback(() => {
      initializeScreen();
    }, [])
  );

  const initializeScreen = async () => {
    try {
      await refreshUserData();
      //await loadChartInfo();
      await StripeService.initializeStripe();
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar tela:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      const token = await StorageService.getAccessToken();

      const response = await api.get(`users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { status, data } = response.data;

      if (status === 'success') {
        // Preparando dados do usuário para salvar localmente
        const userData = {
          extra_maps_max_number: data.extra_maps_max_number,
        };

        await StorageService.saveAstralMaps(data.astral_maps);
        await StorageService.setExtraMapsMaxNumber(userData.extra_maps_max_number);

        setExtraMapsUsed(await StorageService.getExtraMapsUsed());
        setMaxExtraMaps(await StorageService.getExtraMapsMaxNumber());
        setExtraCharts(await StorageService.getExtraCharts());
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Erro ao verificar dados do usuário (users/me)', error);
      return null;
    }
  };

  const handleCreateChart = async () => {
    const used = await StorageService.getExtraMapsUsed();
    const max = await StorageService.getExtraMapsMaxNumber();
    
    if (used >= max) {
      setShowCreditsModal(true);
    } else {
      navigation.navigate('CreateExtraChartScreen');
    }
  };

  const handlePurchaseSuccess = async () => {
    setShowSuccessPopup(true);
    setIsLoading(true);
    console.log('Iniciando verificação de atualização de número de mapas extras');

    // Função para verificar os mapas extras
    const checkMaxExtraMaps = async () => {
      try {
        const token = await StorageService.getAccessToken();
        const userData = await StorageService.getUserData();
        const response = await api.get(`users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        return response.data.data.extra_maps_max_number;
      } catch (error) {
        console.error('Erro ao verificar mapas extras:', error);
        return null;
      }
    };

    // Verifica a cada 2 segundos até confirmar atualização
    const initialMapsNumber = await StorageService.getExtraMapsMaxNumber();
    
    const interval = setInterval(async () => {
      const currentMapsNumber = await checkMaxExtraMaps();
      console.log('Verificando mapas extras:', currentMapsNumber, 'inicial:', initialMapsNumber);
      
      if (currentMapsNumber > initialMapsNumber) {
        StorageService.setExtraMapsMaxNumber(currentMapsNumber);
        clearInterval(interval);
        setMaxExtraMaps(currentMapsNumber);
        setIsLoading(false);
        
        // Esconder o popup após 3 segundos
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      }
    }, 2000);

    setShowCreditsModal(false);
  };

  const handlePurchaseCancel = (failMessage) => {
    if (failMessage) {
      setFailMessage(failMessage);
      setShowErrorPopup(true);
      setTimeout(() => {
        handleCloseErrorPopup();
      }, 7000);
    }
  };

  const handleCloseErrorPopup = () => {
    setFailMessage(null);
    setShowErrorPopup(false);
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
                  Nenhum mapa astral adicional encontrado
                </Text>
              }
            />
          )}
        </View>

        <CustomButton
          title="Criar Novo Mapa Astral"
          onPress={handleCreateChart}
          style={[
            styles.customButton,
            !isInitialized && styles.disabledButton
          ]}
          textStyle={styles.customButtonText}
          icon="add-circle-outline"
          disabled={!isInitialized}
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
              <BuyExtraMapsButton
                amount={10.00}
                product_slug={'extra_map'}
                onSuccess={handlePurchaseSuccess}
                onCancel={handlePurchaseCancel}
                onStartProcessing={() => setIsAnyProcessing(true)}
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
                <BuyExtraMapsButton
                  amount={18.00}
                  product_slug={'two_extra_map_pack'}
                  onSuccess={handlePurchaseSuccess}
                  onCancel={handlePurchaseCancel}
                  onStartProcessing={() => setIsAnyProcessing(true)}
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
                <BuyExtraMapsButton
                  amount={40.00}
                  product_slug={'five_extra_map_pack'}
                  onSuccess={handlePurchaseSuccess}
                  onCancel={handlePurchaseCancel}
                  onStartProcessing={() => setIsAnyProcessing(true)}
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
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>

      <BuyMapsPopupMessage
        visible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        type="success"
        title="Compra Realizada!"
        message="Novo(s) mapa(s) extra(s) foram adicionado(s) à sua conta. Você já pode criá-lo(s) e realizar a sinastria com o seu mapa astral!"
      />

      <BuyMapsPopupMessage
        visible={showErrorPopup}
        onClose={() => handleCloseErrorPopup()}
        type="error"
        title="Erro na Compra!"
        message="Você pode tentar outros cartões ou tentar novamente quando a situação for resolvida. Caso queira mais informações sobre esta transação, acesse o menu 'Minhas Compras'."
        errorTitle="Retorno da operadora:"
        errorMessage={failMessage}
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
  customButton: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.6)',
  },
  customButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
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
});

export default SynastryScreen;
