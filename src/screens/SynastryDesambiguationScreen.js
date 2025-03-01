import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import StorageService from '../store/store';
import CustomButton from '../Components/CustomButton';
import BuyCreditsButton from '../Components/BuyCreditsButton';
import StripeService from '../services/StripeService';
import { formatNumber } from '../utils/helpers';

const SynastryScreen = () => {
  const navigation = useNavigation();
  const [extraCharts, setExtraCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [extraMapsUsed, setExtraMapsUsed] = useState(0);
  const [maxExtraMaps, setMaxExtraMaps] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);

  const memoStars = useMemo(() => <AnimatedStars />, []);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      let userData = await StorageService.getUserData();
      console.log('userData', userData.uuid);      
      await StripeService.initializeStripe();
      await loadChartInfo();
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar tela:', error);
    }
  };

  const loadChartInfo = async () => {
    try {
      const used = await StorageService.getExtraMapsUsed();
      const max = await StorageService.getExtraMapsMaxNumber();
      const charts = await StorageService.getExtraCharts();
      
      setExtraMapsUsed(used);
      setMaxExtraMaps(max);
      setExtraCharts(charts || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar informações dos mapas:', error);
      setIsLoading(false);
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

  const handlePurchaseSuccess = async (credits) => {
    try {
      await StorageService.updateUserCredits(credits);
      setShowCreditsModal(false);
      navigation.navigate('CreateExtraChartScreen');
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
    }
  };

  const handlePurchaseStart = () => {
    setIsAnyProcessing(true);
  };

  const handlePurchaseEnd = () => {
    setIsAnyProcessing(false);
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
        <View style={styles.header}>
          <Text style={styles.extraMapsText}>
            Mapas Extras: {extraMapsUsed}/{maxExtraMaps}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Icon name="favorite" size={24} color="#6D44FF" />
          </View>
          <Text style={styles.infoCardTitle}>Sinastria Astrológica</Text>
          <Text style={styles.infoCardDescription}>
            A sinastria é a arte de comparar dois mapas astrais para entender a 
            dinâmica do relacionamento. Ela revela as harmonias, desafios e o 
            potencial de crescimento entre duas pessoas.
          </Text>
          <Text style={styles.infoCardDescription}>
            Adicione novos mapas e verifique, através da sinastria, a compatibilidade deles com o seu mapa.
          </Text>
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

        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Mapas Astrais Salvos</Text>
          {isLoading ? (
            <ActivityIndicator color="#6D44FF" size="large" />
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
              <BuyCreditsButton
                amount={10.00}
                product_slug={'extra_map'}
                credits={1}
                onSuccess={handlePurchaseSuccess}
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
                <BuyCreditsButton
                  amount={18.00}
                  product_slug={'two_extra_map_pack'}
                  credits={2}
                  onSuccess={handlePurchaseSuccess}
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
                <BuyCreditsButton
                  amount={40.00}
                  product_slug={'five_extra_map_pack'}
                  credits={5}
                  onSuccess={handlePurchaseSuccess}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.15)',
  },

  chartsSection: {
    flex: 1, // Isso é importante para a FlatList se ajustar
  },

  chartsList: {
    flexGrow: 1, // Permite que a lista cresça, mas mantém a rolagem
    paddingBottom: 20, // Espaço extra no final da lista
  },

  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  customButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.6)',
    marginBottom: 20,
  },
  customButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  chartIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginRight: 15,
  },
  chartInfo: {
    flex: 1,
  },
  chartName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartDetails: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    color: '#7A708E',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  extraMapsText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#141527',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  creditsOptions: {
    gap: 15,
    marginBottom: 20,
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
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  discountBadge: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: '#FF4081',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'column',
    alignItems: 'center',
  },
  bestValueBadge: {
    backgroundColor: '#FFD700',
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pricePerUnit: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  bestValueFlag: {
    position: 'absolute',
    left: 10,
    top: -12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#141527',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonLabelContainer: {
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  bestValueLabel: {
    fontSize: 20,
    color: '#FFD700',
  },
  bestValueAmount: {
    fontSize: 18,
    color: '#FFD700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default SynastryScreen;
