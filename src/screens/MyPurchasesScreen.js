import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import api from '../services/api';
import StorageService from '../store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StripeService from '../services/StripeService';
import BuyMapsPopupMessage from '../Components/BuyMapsPopupMessage';
import InfoCard from '../Components/InfoCard';
import MessageModal from '../Components/MessageModal';
import CustomButton from '../Components/CustomButton';
import { COLORS, SPACING, FONTS } from '../styles/theme';

const MyPurchasesScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [failMessage, setFailMessage] = useState(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
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
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const token = await StorageService.getAccessToken();
      const userData = await StorageService.getUserData();
      const response = await api.get(`orders/user/${userData.uuid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const filteredOrders = response.data.data.filter(order => order.status.name !== 'Cancelada');
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatStatus = (status) => {
    const statusMap = {
      'Pendente': 'Pendente',
      'Processando': 'Processando',
      'Finalizada com Sucesso': 'Concluído',
      'Finalizada com Erro': 'Finalizada com Erro'
    };
    return statusMap[status.name] || status.name;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'Pendente': '#FFD700',
      'Processando': '#6D44FF',
      'Finalizada com Sucesso': '#4CAF50',
      'Finalizada com Erro': '#FF4444'
    };
    return colorMap[status.name] || '#7A708E';
  };

  const handleRetryPayment = async (order) => {
    try {
      setLoading(true);
      
      // Exibir modal com loading
      setMessageModal({
        visible: true,
        title: 'Processando pagamento',
        message: 'Por favor, aguarde enquanto processamos seu pagamento...',
        type: 'info',
        loading: true
      });
      
      const result = await StripeService.reProcessPayment(order.total_amount, order.id);

      if (result.success) {
        // Atualizar modal para mostrar sucesso
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
        
        // Fechar automaticamente após 4 segundos
        setTimeout(() => {
          setMessageModal(prev => ({ ...prev, visible: false }));
        }, 4000);
      } else {
        // Atualizar modal para mostrar erro
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
          extraContent: result.message ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Último retorno da operadora:</Text>
              <Text style={styles.errorMessage}>{result.message}</Text>
            </View>
          ) : null
        });
        
        // Fechar automaticamente após 7 segundos
        setTimeout(() => {
          setMessageModal(prev => ({ ...prev, visible: false }));
        }, 7000);
      }

      loadOrders();

    } catch (error) {
      console.error('Erro na compra de créditos:', error);
      // Atualizar modal para mostrar erro genérico
      setMessageModal({
        visible: true,
        title: 'Erro na Compra!',
        message: 'Não foi possível processar seu pagamento. Tente novamente.',
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
      
      // Fechar automaticamente após 7 segundos
      setTimeout(() => {
        setMessageModal(prev => ({ ...prev, visible: false }));
      }, 7000);
    } finally {
      setLoading(false);
    }
  };

  const getLastFailedMessage = (paymentIntents) => {
    if (!paymentIntents || paymentIntents.length === 0) return null;
    
    // Ordena por data de criação (mais recente primeiro) e pega o primeiro
    const lastPaymentIntent = [...paymentIntents]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
    return lastPaymentIntent.failed_message;
  };

  return (
    <View style={styles.container}>
      {memoStars}
      
      <View style={styles.header}>
        <InfoCard
          title="Minhas Compras"
          description="Aqui você encontra todas as informações sobre suas compras realizadas, incluindo o status de cada uma delas e as mensagens das operadoras, caso tenha acontecido algum problema."
          icon="attach-money"
          isInfoExpanded={isInfoExpanded}
          setIsInfoExpanded={setIsInfoExpanded}
          expandable={true}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      ) : orders.length > 0 ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {orders.map((item) => (
            <TouchableOpacity 
              key={item.uuid} 
              style={styles.card}
              onPress={() => setExpandedOrder(expandedOrder === item.uuid ? null : item.uuid)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Icon name="description" size={24} color="#6D44FF" />
                </View>
                <View style={styles.headerContent}>
                  <View style={styles.mainInfo}>
                    <Text style={styles.orderTitle}>
                      {item.products[0]?.name || `Pedido ${item.id}`}
                    </Text>
                    <Text style={styles.orderAmount}>
                      R$ {parseFloat(item.total_amount).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
                  </View>
                </View>
                <Icon 
                  name={expandedOrder === item.uuid ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color="#7A708E" 
                />
              </View>

              {expandedOrder === item.uuid && (
                <View style={styles.expandedContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Pedido:</Text>
                    <Text style={styles.detailValue}>#{item.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Produto:</Text>
                    <Text style={styles.detailValue}>{item.products[0]?.name || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data do pedido:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.created_at)}</Text>
                  </View>

                  {item.paid_at && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pago em:</Text>
                      <Text style={styles.detailValue}>{formatDate(item.paid_at)}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(item.status) }]}>
                      {formatStatus(item.status)}
                    </Text>
                  </View>

                  {item.status.name === 'Finalizada com Erro' && getLastFailedMessage(item.payment_intents) && (
                    <View style={styles.errorMessageContainer}>
                      <Icon name="error-outline" size={20} color="#FF4444" />
                      <Text style={styles.errorMessage}>
                        {getLastFailedMessage(item.payment_intents)}
                      </Text>
                    </View>
                  )}

                  {item.status.name === 'Finalizada com Erro' && (
                    <CustomButton 
                      title="Tentar Pagamento Novamente"
                      onPress={() => handleRetryPayment(item)}
                      icon="refresh"
                      style={{ marginTop: SPACING.MEDIUM }}
                    />
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={64} color={COLORS.TEXT_TERTIARY} />
          <Text style={styles.emptyText}>Nenhuma compra realizada</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      )}

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
  header: {
    padding: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: SPACING.LARGE,
  },
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SPACING.MEDIUM,
    marginRight: SPACING.SMALL,
  },
  mainInfo: {
    flex: 1,
    marginRight: SPACING.MEDIUM,
  },
  expandedContent: {
    marginTop: SPACING.LARGE,
    paddingTop: SPACING.LARGE,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 68, 255, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  detailLabel: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
  },
  detailValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    marginTop: SPACING.MEDIUM,
  },
  retryButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.SMALL,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginLeft: SPACING.SMALL,
  },
  orderTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  orderAmount: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
    marginTop: SPACING.TINY,
  },
  statusBadge: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.TINY,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.TINY,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  emptyText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.MEDIUM,
    marginTop: SPACING.MEDIUM,
    textAlign: 'center',
  },
  errorMessageContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    padding: SPACING.MEDIUM,
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorMessage: {
    color: COLORS.ERROR || '#FF4444',
    fontSize: FONTS.SIZES.SMALL,
    flexWrap: 'wrap',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  errorContainer: {
    marginTop: SPACING.SMALL,
    padding: SPACING.MEDIUM,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4444',
    width: '100%',
  },
  errorTitle: {
    color: '#FF4444',
    fontWeight: FONTS.WEIGHTS.BOLD,
    fontSize: FONTS.SIZES.MEDIUM,
    marginBottom: SPACING.SMALL,
  },
});

export default MyPurchasesScreen;