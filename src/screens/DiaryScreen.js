import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import CustomButton from '../Components/CustomButton';
import MessageModal from '../Components/MessageModal';
import { COLORS, SPACING, FONTS, CARD_STYLES } from '../styles/theme';
import StorageService from '../store/store';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import UserInfoHeader from '../Components/UserInfoHeader';
import InfoCard from '../Components/InfoCard';
import LoadingOverlay from '../Components/LoadingOverlay';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function DiaryScreen() {
  const navigation = useNavigation();
  const { userData, refreshUserData } = useUser();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');
  const [aiResponse, setAiResponse] = useState('');
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [modal, setModal] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'info',
    actions: [],
    extraContent: null,
    loading: false
  });
  const [history, setHistory] = useState([]);

  // Animação de fundo (memoizada)
  const memoStars = useMemo(() => <AnimatedStars />, []);

  // Buscar histórico ao abrir a tela
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await StorageService.getAccessToken();
      const response = await api.get('/diario', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistory(response.data);
    } catch (error) {
      setModal({ visible: true, title: 'Erro', message: 'Erro ao buscar histórico do diário.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setModal({ 
        visible: true, 
        title: 'Atenção', 
        message: 'Conte um pouco do seu dia!', 
        type: 'warning',
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
      return;
    }

    // Verifica se tem tokens suficientes
    if (!userData || userData.astral_tokens < 20) {
      setModal({
        visible: true,
        title: 'Tokens Insuficientes',
        message: 'Para usar o diário, você precisa de 20 Astral Tokens. Adquira mais tokens para desbloquear essa funcionalidade incrível!',
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'Comprar Tokens',
            primary: true,
            onPress: () => {
              setModal(prev => ({ ...prev, visible: false }));
              navigation.navigate('HomeScreen', {
                screen: 'Astral Tokens',
              });
            }
          },
          {
            text: 'Cancelar',
            onPress: () => setModal(prev => ({ ...prev, visible: false }))
          }
        ],
        extraContent: (
          <View style={styles.modalTokensContainer}>
            <View style={styles.tokensInfo}>
              <View style={styles.currentTokensContainer}>
                <Text style={styles.tokensLabel}>Seu saldo atual</Text>
                <TouchableOpacity style={styles.tokensContainer}>
                  <Text style={styles.tokensText}>{userData?.astral_tokens || 0}</Text>
                  <Image 
                    source={require('../assets/images/moeda.png')}
                    style={styles.tokenIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      });
      return;
    }

    // Confirma o consumo de tokens
    setModal({
      visible: true,
      title: 'Confirmar Envio',
      message: 'Você irá gastar 20 Astral Tokens para enviar sua mensagem. Deseja continuar?',
      type: 'info',
      loading: false,
      actions: [
        {
          text: 'Confirmar',
          primary: true,
          onPress: () => {
            setModal(prev => ({ ...prev, visible: false }));
            processSendMessage();
          }
        },
        {
          text: 'Cancelar',
          onPress: () => setModal(prev => ({ ...prev, visible: false }))
        }
      ],
      extraContent: (
        <View style={styles.modalTokensContainer}>
          <View style={styles.tokensInfo}>
            <Text style={styles.tokensLabel}>Seu novo saldo será de</Text>
            <TouchableOpacity style={styles.tokensContainer}>
              <Text style={styles.tokensText}>{Math.max(0, (userData?.astral_tokens || 0) - 20)}</Text>
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

  const processSendMessage = async () => {
    setLoading(true);
    setLoadingMessage('Canalizando a energia astral...');
    setAiResponse('');
    try {
      const token = await StorageService.getAccessToken();
      const data = new URLSearchParams();
      data.append('message', message);

      const response = await api.post('/diario', data.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      const dataResponse = response.data?.data;
      setAiResponse(dataResponse?.resposta_ia || 'Não foi possível obter uma resposta da IA.');

      // Exibe o modal com a resposta da IA
      setModal({
        visible: true,
        title: 'Resposta da Luna',
        message: dataResponse?.resposta_ia || 'Não foi possível obter uma resposta da IA.',
        type: 'info',
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });

      // Atualiza histórico e tokens
      await refreshUserData();
      setHistory((prev) => [
        {
          id: dataResponse.id,
          mensagem_usuario: dataResponse.mensagem_usuario,
          resposta_ia: dataResponse.resposta_ia,
          created_at: dataResponse.created_at,
        },
        ...prev,
      ]);
      setMessage('');
    } catch (error) {
      console.log(error);
      console.log(error.response.data);
      setModal({ 
        visible: true, 
        title: 'Erro', 
        message: 'Erro ao enviar para a IA.', 
        type: 'error',
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text>
      <Text style={styles.historyUserMsg}>{item.mensagem_usuario}</Text>
      <Text style={styles.historyIaTitle}>Resposta da Luna:</Text>
      <Text style={styles.historyIaMsg}>{item.resposta_ia}</Text>
    </View>
  );

  // Cabeçalho do diário (input, botão, resposta da IA)
  const renderHeader = () => (
    <View style={styles.headerContent}>
      <InfoCard
        title="Meu Diário Astral"
        description="Conte um pouco do seu dia e receba insights astrológicos personalizados. Nossa IA, a Luna, analisará sua mensagem e fornecerá uma interpretação baseada em seu mapa astral, ajudando você a entender melhor os aspectos cósmicos que influenciam seu dia a dia."
        icon="auto-awesome"
        isInfoExpanded={isInfoExpanded}
        setIsInfoExpanded={setIsInfoExpanded}
        expandable={true}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={t => t.length <= 250 && setMessage(t)}
          placeholder="Escreva aqui sua mensagem para a Luna..."
          placeholderTextColor={COLORS.TEXT_TERTIARY}
          multiline
          maxLength={250}
        />
      </View>
      <Text style={styles.charCount}>{message.length}/250</Text>
      <View style={styles.buttonContainer}>
        <View style={{ flex: 1 }}>
          <CustomButton
            title="Enviar"
            onPress={handleSend}
            loading={loading}
            icon="send"
            style={styles.buttonStyle}
            textStyle={styles.buttonText}
          />
        </View>
        <View style={styles.tokenChip}>
          <Text style={styles.tokenChipText}>20</Text>
          <Image 
            source={require('../assets/images/moeda.png')}
            style={styles.tokenIcon}
          />
        </View>
      </View>
      <TouchableOpacity 
        style={styles.historyHeader}
        onPress={() => setIsHistoryExpanded(!isHistoryExpanded)}
      >
        <View style={styles.historyHeaderContent}>
          <Icon name="history" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.historyTitle}>Histórico</Text>
        </View>
        <Icon 
          name={isHistoryExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={20} 
          color={COLORS.TEXT_TERTIARY} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {memoStars}
      <UserInfoHeader />
      <View style={styles.mainContainer}>
        <FlatList
          data={isHistoryExpanded ? history : []}
          keyExtractor={item => String(item.id)}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.content}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={isHistoryExpanded ? <Text style={styles.emptyHistory}>Nenhuma mensagem enviada ainda.</Text> : null}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      <MessageModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        actions={modal.actions}
        extraContent={modal.extraContent}
        loading={modal.loading}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
      />
      {loading && <LoadingOverlay message={loadingMessage} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
  },
  content: {
    flexGrow: 1,
    padding: SPACING.LARGE,
    width: '100%',
  },
  title: {
    fontSize: FONTS.SIZES.XLARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.SMALL,
    alignSelf: 'stretch',
  },
  input: {
    width: '100%',
    minHeight: 120,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.SMALL,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: COLORS.TEXT_TERTIARY,
    marginBottom: SPACING.LARGE,
    fontSize: FONTS.SIZES.SMALL,
  },
  responseBox: {
    marginTop: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    padding: SPACING.MEDIUM,
    width: '100%',
  },
  responseTitle: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginBottom: SPACING.SMALL,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  responseText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  historyTitle: {
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.SMALL,
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
    alignSelf: 'flex-start',
  },
  historyItem: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  historyDate: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.SMALL,
    marginBottom: SPACING.TINY,
    textAlign: 'right',
  },
  historyUserMsg: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    marginBottom: SPACING.TINY,
    fontWeight: FONTS.WEIGHTS.MEDIUM,
  },
  historyIaTitle: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.WEIGHTS.BOLD,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.TINY,
    fontSize: FONTS.SIZES.SMALL,
  },
  historyIaMsg: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.MEDIUM,
  },
  emptyHistory: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: FONTS.SIZES.MEDIUM,
    textAlign: 'center',
    marginTop: SPACING.LARGE,
  },
  headerContent: {
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingBottom: SPACING.LARGE,
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
  currentTokensContainer: {
    alignItems: 'center',
    gap: SPACING.SMALL,
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
  tokenIcon: {
    width: 14,
    height: 14,
  },
  buttonContainer: {
    position: 'relative',
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: SPACING.TINY,
    flexDirection: 'row',
  },
  buttonStyle: {
    flex: 1,
    height: 55,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.SMALL,
  },
  buttonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.MEDIUM,
    fontWeight: FONTS.WEIGHTS.BOLD,
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
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MEDIUM,
    marginTop: SPACING.LARGE,
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderRadius: CARD_STYLES.DEFAULT.borderRadius,
    paddingHorizontal: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.2)',
  },
  historyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  historyTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONTS.SIZES.LARGE,
    fontWeight: FONTS.WEIGHTS.BOLD,
  },
}); 