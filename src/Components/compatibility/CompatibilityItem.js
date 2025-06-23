import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import StorageService from '../../../src/store/store';
import { useUser } from '../../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import MessageModal from '../MessageModal';

// Função para retornar um contexto resumido de cada entidade astral

const gerarLabelPorEntidadeAstral = (entidade) => {
  const labels = {
    'Sol': '🌟 Desvende sua Essência',
    'Lua': '🌙 Mergulhe nas Emoções',
    'Mercúrio': '💬 Conecte-se pela Comunicação',
    'Vênus': '💕 Descubra o Amor',
    'Marte': '⚡ Energia e Paixão',
    'Júpiter': '✨ Expansão e Sabedoria',
    'Saturno': '🏗️ Desafios e Crescimento',
    'Urano': '⚡ Revolução e Inovação',
    'Netuno': '🔮 Intuição e Sonhos',
    'Plutão': '🔄 Transformação Total',
    'Ascendente': '👤 Sua Máscara Social',
    'Descendente': '💑 Relacionamentos Íntimos',
    'Meio do céu': '🎯 Carreira e Propósito',
    'Fundo do céu': '🏠 Lar e Raízes',
  };

  return labels[entidade] || '✨ Relatório Personalizado';
};
const gerarContextoPorEntidadeAstral = (entidade) => {
  const entidades = { 
    'Sol': '',
    'Lua': '',
    'Mercúrio': '',
    'Vênus': '',
    'Marte': 'Adicione um grau de safadeza e aventura.',
    'Júpiter': '',
    'Saturno': '',
    'Urano': '',
    'Netuno': '',
    'Plutão': '',
    'Ascendente': '',
    'Descendente': '',
    'Meio do Ceu': '',
    'Fundo do Ceu': ''
  };

  return entidades[entidade] || '';
};

const gerarPromptCompatibilidade = (item) => {
  // Gera contexto automático e resumido com base na entidade astral
  const contexto = gerarContextoPorEntidadeAstral(item.astral_entity);
  let base = `Preciso de uma análise aprofundada sobre a interação da posição astral "${item.astral_entity}" nos signos "${item.signo1}" e "${item.signo2}" dentro de um mapa astral. Descreva como essa configuração pode influenciar a compatibilidade entre as duas pessoas, com base em princípios astrológicos. Já comece com uma breve descrição sobre a posição astral e como ela pode influenciar a compatibilidade. Já comece a resposta com o texto. `;
  if (contexto) base += contexto;
  return base;
};

const CompatibilityItem = ({
  item,
  astros,
  getCompatibilityColor,
  getAstroImage,
  onLoadingChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando ...');
  const { userData, refreshUserData } = useUser();
  const navigation = useNavigation();
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    actions: [],
    extraContent: null,
    loading: false
  });

  // Função para atualizar o loading no componente pai
  const updateLoading = (isLoading, message) => {
    setLoading(isLoading);
    setLoadingMessage(message);
    if (onLoadingChange) {
      onLoadingChange(isLoading, message);
    }
  };

  const handleSendPrompt = async () => {
    // Verifica se tem tokens suficientes
    if (!userData || userData.astral_tokens < 10) {
      setMessageModal({
        visible: true,
        title: 'Tokens Insuficientes',
        message: `Para obter a análise de "${gerarLabelPorEntidadeAstral(item.astral_entity)}", você precisa de 10 Astral Tokens. Adquira mais tokens para desbloquear essa funcionalidade incrível!`,
        type: 'error',
        loading: false,
        actions: [
          {
            text: 'Comprar Tokens',
            primary: true,
            onPress: () => {
              setMessageModal(prev => ({ ...prev, visible: false }));
              navigation.navigate('HomeScreen', {
                screen: 'Astral Tokens',
              });
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
              <View style={styles.currentTokensContainer}>
                <Text style={styles.tokensLabel}>Seu saldo atual</Text>
                <TouchableOpacity style={styles.tokensContainer}>
                  <Text style={styles.tokensText}>{userData?.astral_tokens || 0}</Text>
                  <Image 
                    source={require('../../assets/images/moeda.png')}
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
    setMessageModal({
      visible: true,
      title: 'Confirmar Análise',
      message: `Você irá gastar 10 Astral Tokens para obter uma análise mais aprofundada acerca da compatibilidade entre "${item.signo1}" e "${item.signo2}" sobre "${gerarLabelPorEntidadeAstral(item.astral_entity)}". Deseja continuar?`,
      type: 'info',
      loading: false,
      actions: [
        {
          text: 'Confirmar',
          primary: true,
          onPress: () => {
            setMessageModal(prev => ({ ...prev, visible: false }));
            processSendPrompt();
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
              <Text style={styles.tokensText}>{Math.max(0, (userData?.astral_tokens || 0) - 10)}</Text>
              <Image 
                source={require('../../assets/images/moeda.png')}
                style={styles.tokenIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )
    });
  };

  const processSendPrompt = async () => {
    console.log(item.astral_entity);
    const prompt = gerarPromptCompatibilidade(item);
    console.log(prompt);
    updateLoading(true, 'Estabelecendo comunicação astral...');
    
    try {
      const token = await StorageService.getAccessToken();

      updateLoading(true, 'Analisando compatibilidade astral...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await api.post(
        '/synastry/analyze-item',
        { mensagem: prompt },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Erro na requisição');
      }
      const data = response.data;
      console.log(data);
      const respostaIa = data.data.resposta_ia;

      updateLoading(true, 'Processando resposta...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Atualiza os dados do usuário para refletir o consumo de tokens
      await refreshUserData();
      
      // Exibe o modal com a resposta da IA
      setMessageModal({
        visible: true,
        title: 'Análise de Compatibilidade',
        message: respostaIa || 'Resposta não disponível.',
        type: 'info',
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    } catch (error) {
      setMessageModal({
        visible: true,
        title: 'Erro',
        message: error.message || 'Erro desconhecido',
        type: 'error',
        actions: [
          {
            text: 'OK',
            primary: true,
            onPress: () => setMessageModal(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    } finally {
      updateLoading(false, '');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardImageContainer}>
          <Image
            source={getAstroImage(item.astral_entity, astros)}
            style={styles.astroImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.entity}>
            {item.astral_entity || 'Entidade não definida'}
          </Text>
          <View style={styles.signsContainer}>
            <Text style={styles.signs}>
              {item.signo1} × {item.signo2} |
            </Text>
            <Text
              style={[
                styles.compatibilityValue,
                {
                  color: getCompatibilityColor(item.compatibilidade),
                  textShadowColor: `${getCompatibilityColor(item.compatibilidade)}50`,
                },
              ]}
            >
              {item.compatibilidade}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.description}>{item.descriptions}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendPrompt}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
               {gerarLabelPorEntidadeAstral(item.astral_entity)}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.tokenChip}>
          <Text style={styles.tokenChipText}>10</Text>
          <Image 
            source={require('../../assets/images/moeda.png')}
            style={styles.tokenIcon}
          />
        </View>
      </View>

      {/* Modal de tokens e confirmação */}
      <MessageModal
        visible={messageModal.visible}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        actions={messageModal.actions}
        extraContent={messageModal.extraContent}
        loading={messageModal.loading}
        onClose={() => setMessageModal(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  astroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    marginRight: 10,
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  entity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  signsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signs: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  compatibilityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'relative',
    margin: 16,
  },
  button: {
    padding: 12,
    backgroundColor: '#6D44FF',
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  tokenChip: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6D44FF',
  },
  tokenChipText: {
    color: '#6D44FF',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 2,
  },
  tokenIcon: {
    width: 16,
    height: 16,
  },
  // Modal de tokens
  modalTokensContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  tokensInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  currentTokensContainer: {
    alignItems: 'center',
    gap: 8,
  },
  tokensLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  tokensContainer: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    flexDirection: 'row',
    gap: 4,
  },
  tokensText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CompatibilityItem;
