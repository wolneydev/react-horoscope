import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import api from '../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CompatibilityScreen({ route }) {

  const astros = [
    {
      name: 'Sol',
      image: require('../assets/images/entities/sun.jpg'),
    },    
    {
      name: 'Ascendente',
      image: require('../assets/images/entities/ascendant.jpg'),
    },
    {
      name: 'Descendente',
      image: require('../assets/images/entities/descendant.jpg'),
    },
    {
      id: '3',
      name: 'Meio do céu',
      image: require('../assets/images/entities/midheaven.jpg'),
    },
    {
      name: 'Fundo do céu',
      image: require('../assets/images/entities/nadir.jpg'),
    },
    {
      name: 'Júpiter',
      image: require('../assets/images/entities/jupiter.jpg'),
    },
    {
      name: 'Netuno',
      image: require('../assets/images/entities/neptune.jpg'),
    },
    {
      name: 'Saturno',
      image: require('../assets/images/entities/saturn.jpg'),
    },
    {
      name: 'Marte',
      image: require('../assets/images/entities/mars.jpg'),
    },
    {
      name: 'Vênus',
      image: require('../assets/images/entities/venus.jpg'),
    },
    {
      name: 'Mercúrio',
      image: require('../assets/images/entities/mercury.jpg'),
    },
    {
      name: 'Urano',
      image: require('../assets/images/entities/uranus.jpg'),
    },
    {
      name: 'Plutão',
      image: require('../assets/images/entities/pluto.jpg'),
    },
    {
      name: 'Lua',
      image: require('../assets/images/entities/moon.jpg'),
    },
  ];

  const navigation = useNavigation();
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

  const getCompatibilityColor = (value) => {
    if (value >= 80) return '#00FF00'; // Verde brilhante para alta compatibilidade
    if (value >= 60) return '#90EE90'; // Verde claro
    if (value >= 40) return '#FFD700'; // Amarelo
    if (value >= 20) return '#FFA500'; // Laranja
    return '#FF4500'; // Vermelho-laranja para baixa compatibilidade
  };

  const getCompatibilityText = (value) => {
    if (value >= 80) {
      return "Conexão Excepcional! Existe uma harmonia natural e profunda entre vocês. Esta é uma combinação rara e especial, com grande potencial para um relacionamento duradouro e significativo.";
    }
    if (value >= 60) {
      return "Ótima Compatibilidade! Vocês têm uma conexão muito positiva, com bom entendimento mútuo e potencial para crescimento conjunto. As diferenças tendem a se complementar.";
    }
    if (value >= 40) {
      return "Compatibilidade Moderada. Existem áreas de harmonia e desafios a serem trabalhados. Com diálogo e compreensão, podem desenvolver uma relação equilibrada.";
    }
    if (value >= 20) {
      return "Compatibilidade Desafiadora. Há aspectos que precisam de atenção e trabalho. A relação exigirá esforço mútuo para superar as diferenças naturais.";
    }
    return "Compatibilidade Complexa. Existem desafios significativos na relação. Será necessário muito diálogo e compreensão para harmonizar as diferenças.";
  };

  const getAstroImage = (astralEntity) => {
    const astro = astros.find(a => a.name === astralEntity);
    return astro?.image;
  };

  const renderHeader = () => (
    <>
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Icon name="favorite" size={24} color="#6D44FF" />
        </View>
        <Text style={styles.averageTitle}>
          Compatibilidade Total
        </Text>
        <Text style={[
          styles.averageValue,
          averageCompatibility && {
            color: getCompatibilityColor(averageCompatibility),
            textShadowColor: `${getCompatibilityColor(averageCompatibility)}50`
          }
        ]}>
          {averageCompatibility !== null ? `${averageCompatibility.toFixed(2)}%` : ''}
        </Text>
        {averageCompatibility !== null && (
          <Text style={styles.infoDescription}>
            {getCompatibilityText(averageCompatibility)}
          </Text>
        )}
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Aspectos Analisados</Text>
      </View>
    </>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardImageContainer}>
          <Image 
            source={getAstroImage(item.astral_entity)} 
            style={styles.astroImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.entity}>
            {item.astral_entity || 'Entidade não definida'}
          </Text>
          <Text style={styles.signs}>
            {item.signo1} × {item.signo2}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.compatibility}>
          <Text style={[
            styles.compatibilityValue,
            { 
              color: getCompatibilityColor(item.compatibilidade),
              textShadowColor: `${getCompatibilityColor(item.compatibilidade)}50`
            }
          ]}>
            {item.compatibilidade}%
          </Text>  de compatibilidade.
        </Text>
        <Text style={styles.description}>
          {item.descriptions}
        </Text>
      </View>
    </View>
  );

  const renderNavigationHeader = () => (
    <View style={styles.navigationHeader}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back-ios" size={24} color="#FFD700" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {memoizedStars}
      {renderNavigationHeader()}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Calculando compatibilidade...</Text>
          </View>
        ) : (
          <FlatList
            data={compatibilities}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            overScrollMode="always"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  infoDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    opacity: 0.9,
  },
  headerContainer: {
    marginBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 16,
    fontSize: 16,
  },
  flatListContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
    backgroundColor: 'rgba(109, 68, 255, 0.05)',
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  cardImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  astroImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 16,
  },
  entity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  compatibility: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  compatibilityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  signs: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(109, 68, 255, 0.15)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
    alignItems: 'center',
  },
  averageTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  navigationHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  compatibilityDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});


