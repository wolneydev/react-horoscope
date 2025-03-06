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
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.infoIconContainer}>
              <Icon name="favorite" size={24} color="#6D44FF" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.infoCardTitle}>Sinastria Astrológica</Text>
              {isInitialized && (
                <Text style={styles.extraMapsText}>
                  Mapas Extras: {extraMapsUsed}/{maxExtraMaps}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => setIsInfoExpanded(!isInfoExpanded)}
              style={styles.expandButton}
            >
              <Icon 
                name={isInfoExpanded ? "keyboard-arrow-up" : "help-outline"} 
                size={24} 
                color="#7A708E" 
              />
            </TouchableOpacity>
          </View>

          {isInfoExpanded && (
            <View style={styles.expandedInfo}>
              <Text style={styles.infoCardDescription}>
                A sinastria é a arte de comparar dois mapas astrais para entender a 
                dinâmica do relacionamento. Ela revela as harmonias, desafios e o 
                potencial de crescimento entre duas pessoas.
              </Text>
              <Text style={styles.infoCardDescription}>
                Adicione novos mapas e verifique, através da sinastria, a compatibilidade deles com o seu mapa.
              </Text>
              <Text style={styles.infoCardDescription}>
                Inicialmente você possui 1 mapa extra disponível. Adquira mais mapas para continuar gerando comparações.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chartsSection}>
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
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  extraMapsText: {
    color: '#7A708E',
    fontSize: 14,
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
  expandButton: {
    padding: 8,
  },
  expandedInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 68, 255, 0.2)',
  },  
});

export default SynastryScreen;
