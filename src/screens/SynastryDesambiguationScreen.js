import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import StorageService from '../store/store';
import CustomButton from '../Components/CustomButton';
import { useUser } from '../contexts/UserContext';
import { formatNumber } from '../utils/helpers';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import MessageModal from '../Components/MessageModal';
import InfoCardSinastria from '../Components/InfoCardSinastria';
import LoadingOverlay from '../Components/LoadingOverlay';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import EmailVerificationGuard from '../Components/emailVerification/EmailVerificationGuard';
import UserInfoHeader from '../Components/UserInfoHeader';

const SynastryScreen = () => {
  const navigation = useNavigation();
  const { userData, refreshUserData } = useUser();
  const [extraCharts, setExtraCharts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const loadExtraCharts = async () => {
    try {
      const extraCharts = await StorageService.getExtraCharts();
      setExtraCharts(extraCharts || []);
      
    } catch (error) {
      console.error('Erro ao carregar mapas extras:', error);
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível carregar seus mapas extras. Por favor, tente novamente.',
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
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initializeScreen();
    }, [])
  );

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      await refreshUserData();
      await loadExtraCharts();
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar tela:', error);
      setIsLoading(false);
    }
  };

  const handleCreateChart = async () => {
    if (!userData || userData.astral_tokens < 50) {
      setMessageModal({
        visible: true,
        title: 'Tokens Insuficientes',
        message: 'Você precisa de 50 Astral Tokens para criar um mapa extra.',
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'Comprar Tokens',
            primary: true,
            onPress: () => {
              setMessageModal(prev => ({ ...prev, visible: false }));
              navigation.navigate('AstralTokens');
            }
          },
          {
            text: 'Cancelar',
            onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
      return;
    }

    setMessageModal({
      visible: true,
      title: 'Confirmar Criação',
      message: 'Você irá gastar 50 Astral Tokens para criar um novo mapa astral. Deseja continuar?',
      type: 'info',
      loading: false,
      actions: [
        {
          text: 'Confirmar',
          primary: true,
          onPress: () => {
            setMessageModal(prev => ({ ...prev, visible: false }));
            processCreateChart();
          }
        },
        {
          text: 'Cancelar',
          onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
        }
      ],
      extraContent: (
        <View style={styles.modalTokensContainer}>
          <View style={styles.tokensInfo}>
            <Text style={styles.tokensLabel}>Seu novo saldo será de</Text>
            <TouchableOpacity style={styles.tokensContainer}>
              <Text style={styles.tokensText}>{Math.max(0, (userData?.astral_tokens || 0) - 50)}</Text>
              <Image 
                source={require('../assets/images/moeda.png')}
                style={styles.tokenIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )
    });
  };

  const processCreateChart = async () => {
    setIsAnyProcessing(true);
    setLoadingMessage('Processando...');

    try {
      const token = await StorageService.getAccessToken();
      const response = await api.post('users/use-extra-map', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        await refreshUserData();
        await loadExtraCharts();
        navigation.navigate('HomeScreen', { 
          screen: 'Mapa Extra', 
        });
      } else {
        throw new Error(response.data.message || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
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
    } finally {
      setIsAnyProcessing(false);
      setLoadingMessage('');
    }
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
        <UserInfoHeader />
        
        <View style={styles.content}>
          <InfoCardSinastria 
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

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Criar Novo Mapa Astral"
              onPress={handleCreateChart}
              icon="add-circle-outline"
              disabled={!isInitialized || isLoading}
            />
            <View style={styles.tokenChip}>
              <Text style={styles.tokenChipText}>50</Text>
              <Image 
                source={require('../assets/images/moeda.png')}
                style={styles.tokenIcon}
              />
            </View>
          </View>
        </View>

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
  modalTokensContainer: {
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  tokensInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.MEDIUM,
  },
  tokensContainer: {
    backgroundColor: '#2A2A2A',
    padding: SPACING.MEDIUM,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    flexDirection: 'row',
    gap: 4,
  },
  tokensText: {
    color: '#FFD700',
    fontSize: FONTS.SIZES.XLARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  tokensLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONTS.SIZES.MEDIUM,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'relative',
  },
  tokenChip: {
    position: 'absolute',
    right: SPACING.MEDIUM,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: '#2A2A2A',
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.TINY,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tokenChipText: {
    color: '#FFD700',
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  tokenIcon: {
    width: 14,
    height: 14,
  },
});

export default SynastryScreen;
