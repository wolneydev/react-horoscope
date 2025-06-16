import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import api from '../../services/api';
import StorageService from '../../../src/store/store';

// Função para retornar um contexto resumido de cada entidade astral


const gerarLabelPorEntidadeAstral = (entidade) => {
  const labels = {
    'Sol': 'Relatório sobre a essência',
    'Lua': 'Relatório emocional',
    'Mercúrio': 'Relatório comunicativo',
    'Vênus': 'Relatório amoroso',
    'Marte': 'Relatório de energia e ação',
    'Júpiter': 'Relatório de expansão e fé',
    'Saturno': 'Relatório de desafios e estrutura',
    'Urano': 'Relatório de inovação e mudança',
    'Netuno': 'Relatório espiritual e intuitivo',
    'Plutão': 'Relatório de transformação',
    'Ascendente': 'Relatório de personalidade externa',
    'Descendente': 'Relatório sobre relacionamentos',
    'Meio do céu': 'Relatório de carreira e propósito',
    'Fundo do céu': 'Relatório de vida íntima'
  };

  return labels[entidade] || 'Relatório personalizado';
};
const gerarContextoPorEntidadeAstral = (entidade) => {
  const entidades = { 
    'Sol': 'O Sol mostra o centro da personalidade.',
    'Lua': 'A Lua indica as emoções e reações instintivas.',
    'Mercúrio': 'Mercúrio trata da comunicação e do raciocínio.',
    'Vênus': 'Vênus representa a forma de amar e de se relacionar.',
    'Marte': 'Marte simboliza a iniciativa e o desejo.',
    'Júpiter': 'Júpiter aponta para expansão e crenças.',
    'Saturno': 'Saturno lida com responsabilidades e limites.',
    'Urano': 'Urano rege a inovação, rebeldia e mudanças súbitas.',
    'Netuno': 'Netuno está ligado à espiritualidade, sonhos e ilusões.',
    'Plutão': 'Plutão representa transformação, poder e renascimento.',
    'Ascendente': 'O Ascendente revela como nos mostramos ao mundo e nossa abordagem inicial à vida.',
    'Descendente': 'O Descendente trata de relacionamentos íntimos e da forma como enxergamos o outro.',
    'Meio do Ceu': 'O Meio do Céu (MC) indica a vocação, imagem pública e objetivos de vida.',
    'Fundo do Ceu': 'O Fundo do Céu (IC ou Nadir) representa as raízes, o lar e a vida privada.'
  };

  return entidades[entidade] || 'Entidade astral não reconhecida.';
};

const gerarPromptCompatibilidade = (item) => {
  // Gera contexto automático e resumido com base na entidade astral
  const contexto = gerarContextoPorEntidadeAstral(item.astral_entity);
  let base = `Solicito uma análise aprofundada sobre a interação da posição astral "${item.astral_entity}" nos signos "${item.signo1}" e "${item.signo2}" dentro de um mapa astral. Descreva como essa configuração pode influenciar a compatibilidade entre as duas pessoas, com base em princípios astrológicos.`;
  if (contexto) base += ` Caso aplicável, foque em: ${contexto}.`;
  return base;
};

const CompatibilityItem = ({
  item,
  astros,
  getCompatibilityColor,
  getAstroImage,
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [iaResponse, setIaResponse] = useState('');

  const handleSendPrompt = async () => {
    console.log(item.astral_entity);
    const prompt = gerarPromptCompatibilidade(item);
    setLoading(true);
    try {
      const token = await StorageService.getAccessToken();
      const response = await api.post(
        '/gepeto',
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
      const respostaIa = data.resposta_ia;

      setIaResponse(respostaIa || 'Resposta não disponível.');
      setShowModal(true);
    } catch (error) {
      setIaResponse(error.message || 'Erro desconhecido');
      setShowModal(true);
    } finally {
      setLoading(false);
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

      {/* Modal customizado para resposta da IA */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Image
                source={getAstroImage(item.astral_entity, astros)}
                style={styles.modalAstroImage}
              />
              <Text style={styles.modalTitle}>Compatibilidade Astrológica</Text>
              <Text style={styles.modalSubTitle}>
                {item.astral_entity} em {item.signo1} × {item.signo2}
              </Text>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalResponse}>
                {iaResponse}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  button: {
    margin: 16,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 14, 53, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    maxHeight: '80%',
    backgroundColor: 'rgba(41, 16, 90, 0.97)',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#6D44FF',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  modalAstroImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#3a237e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1.2,
    marginBottom: 2,
    textShadowColor: '#fff5',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  modalSubTitle: {
    fontSize: 15,
    color: '#D6B0FF',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  modalScrollView: {
    maxHeight: 220,
    marginBottom: 14,
  },
  modalResponse: {
    color: '#FFF',
    fontSize: 15,
    textAlign: 'justify',
    lineHeight: 22,
    paddingHorizontal: 2,
  },
  modalButton: {
    marginTop: 5,
    paddingHorizontal: 36,
    paddingVertical: 10,
    backgroundColor: '#6D44FF',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.19,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7,
  },
  modalButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.4,
  },
});

export default CompatibilityItem;
