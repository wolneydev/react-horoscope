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

const MyPurchasesScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [failMessage, setFailMessage] = useState(null);
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
      const result = await StripeService.reProcessPayment(order.total_amount, order.id);

      if (result.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 4000);
      } else {
        setFailMessage(result.message);        
        setShowErrorPopup(true);
        setTimeout(() => {
          handleCloseErrorPopup();
        }, 7000);
      }

      loadOrders();

    } catch (error) {
      console.error('Erro na compra de créditos:', error);
      setFailMessage('Não foi possível processar seu pagamento. Tente novamente.');
      setShowErrorPopup(true);
      setTimeout(() => {
        handleCloseErrorPopup();
      }, 7000);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseErrorPopup = () => {
    setFailMessage(null);
    setShowErrorPopup(false);
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
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Icon name="shopping-cart" size={24} color="#6D44FF" />
          </View>
          <Text style={styles.infoCardTitle}>Histórico de Compras</Text>
          <Text style={styles.infoCardDescription}>
            Aqui você encontra todo o seu histórico de compras realizadas.
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6D44FF" />
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
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => handleRetryPayment(item)}
                    >
                      <Icon name="refresh" size={20} color="#FFFFFF" />
                      <Text style={styles.retryButtonText}>Tentar Pagamento Novamente</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={64} color="#7A708E" />
          <Text style={styles.emptyText}>Nenhuma compra realizada</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6D44FF" />
        </View>
      )}

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
        message="Você pode tentar outros cartões ou tentar novamente quando a situação for resolvida."
        errorTitle="Último retorno da operadora:"
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
  },
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoCardDescription: {
    fontSize: 14,
    color: '#7A708E',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
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
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
    marginRight: 8,
  },
  mainInfo: {
    flex: 1,
    marginRight: 12,
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 68, 255, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#7A708E',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D44FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderAmount: {
    color: '#7A708E',
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#7A708E',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessageContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorMessage: {
    color: '#FF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
});

export default MyPurchasesScreen;