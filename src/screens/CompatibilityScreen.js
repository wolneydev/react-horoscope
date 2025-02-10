import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import api from '../services/api';

export default function CompatibilityScreen({ route }) {
  // Componente de fundo com estrelas
  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  // Recebe os dois UUIDs via parâmetros da rota
  const uuid1 = route.params?.uuid1 || '';
  const uuid2 = route.params?.uuid2 || '';

  const [compatibilities, setCompatibilities] = useState([]);
  const [averageCompatibility, setAverageCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função que busca as compatibilidades entre os dois UUIDs
  const fetchCompatibility = async () => {
    if (!uuid1 || !uuid2) {
      alert('Por favor, insira o código correto');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('processcompatibilitiesmap', {
        params: { uuid1, uuid2 },
      });
      const { compatibilidades, compatibilidade_media } = response.data.data;
      setCompatibilities(compatibilidades || []);
      setAverageCompatibility(compatibilidade_media || null);
    } catch (error) {
      console.error('Erro ao buscar compatibilidades:', error);
      alert('Erro ao buscar compatibilidades. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Executa a busca assim que ambos os UUIDs estiverem disponíveis
  useEffect(() => {
    if (uuid1 && uuid2) {
      fetchCompatibility();
    }
  }, [uuid1, uuid2]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.entity}>
        {item.astral_entity || 'Entidade não definida'}
      </Text>
      <Text style={styles.details}>
        {item.signo1} x {item.signo2} - {item.compatibilidade}%
      </Text>
      <Text style={styles.details}>
        Descrição: {item.descriptions}
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.averageTitle}>
        Compatibilidade: {averageCompatibility !== null ? `${averageCompatibility.toFixed(2)}%` : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {memoizedStars}
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Card explicativo */}
            {/* <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>O que é Sinastria Astral?</Text>
              <Text style={styles.explanationText}>
                A sinastria astral é a análise comparativa dos mapas astrais de duas pessoas.
                Ela identifica pontos fortes, desafios e a dinâmica entre as energias individuais,
                revelando compatibilidades e influências que podem impactar relacionamentos.
              </Text>
            </View> */}

            <Text style={styles.title}>Sinastria</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
            ) : (
              <>
                <FlatList
                  data={compatibilities}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderItem}
                  contentContainerStyle={styles.flatListContent}
                />
                {renderFooter()}
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  explanationCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
  },
  flatListContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  entity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
  },
  details: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    alignItems: 'center',
  },
  averageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});


