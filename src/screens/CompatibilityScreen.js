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
  const [isExpanded, setIsExpanded] = useState(false);

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
      console.log('uuid1:', uuid1);
      console.log('uuid2:', uuid2);
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
    if (value >= 90) {
      return "União Celestial! Uma conexão extraordinariamente rara e poderosa. Existe uma sintonia natural tão profunda que parece predestinada. Esta combinação tem potencial para uma relação transformadora e duradoura, com grande capacidade de evolução mútua.";
    }
    if (value >= 80) {
      return "Conexão Excepcional! Existe uma harmonia natural e profunda entre vocês. Esta é uma combinação especial, com grande potencial para um relacionamento significativo e enriquecedor. As energias se complementam de maneira muito positiva.";
    }
    if (value >= 70) {
      return "Sintonia Elevada! A compatibilidade entre vocês é muito favorável, indicando uma conexão forte e promissora. Compartilham valores similares e têm potencial para crescer juntos, apoiando um ao outro em suas jornadas.";
    }
    if (value >= 60) {
      return "Ótima Compatibilidade! Vocês têm uma conexão positiva, com bom entendimento mútuo e potencial para desenvolvimento conjunto. As diferenças tendem a se complementar, criando uma dinâmica interessante e construtiva.";
    }
    if (value >= 50) {
      return "Compatibilidade Favorável. Existe um bom equilíbrio entre semelhanças e diferenças. Com comunicação e compreensão, podem construir uma relação sólida e gratificante, aprendendo muito um com o outro.";
    }
    if (value >= 40) {
      return "Compatibilidade Moderada. Existem áreas de harmonia e desafios a serem trabalhados. Com diálogo, paciência e compreensão mútua, podem desenvolver uma relação equilibrada e crescer juntos.";
    }
    if (value >= 30) {
      return "Compatibilidade Desafiadora. Há aspectos importantes que precisam de atenção e trabalho. A relação exigirá esforço mútuo, mas pode ser enriquecedora se houver disposição para aprender com as diferenças.";
    }
    if (value >= 20) {
      return "Compatibilidade Complexa. Existem desafios significativos que precisarão ser enfrentados. Será necessário muito diálogo, compreensão e disposição para adaptar-se. O crescimento pessoal pode ser intenso.";
    }
    return "Compatibilidade Muito Desafiadora. A relação apresenta aspectos bastante complexos que demandarão grande esforço de ambas as partes. Se houver real interesse, será preciso muito trabalho, paciência e compreensão para harmonizar as diferenças.";
  };

  const getAstroImage = (astralEntity) => {
    const astro = astros.find(a => a.name === astralEntity);
    return astro?.image;
  };

  const renderHeader = () => (
    <>
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View>
            <View style={styles.titleContainer}>
              <View style={styles.infoIconContainer}>
                <Icon name="favorite" size={24} color="#6D44FF" />
              </View>
              <Text style={styles.averageTitle}>
                Compatibilidade Total
              </Text>
            </View>
            <Text style={[
              styles.averageValue,
              averageCompatibility && {
                color: getCompatibilityColor(averageCompatibility),
                textShadowColor: `${getCompatibilityColor(averageCompatibility)}50`
              }
            ]}>
              {averageCompatibility !== null ? `${averageCompatibility.toFixed(2)}%` : ''}
            </Text>
          </View>
        </View>
        {averageCompatibility !== null && (
          <Text style={styles.infoDescription}>
            {getCompatibilityText(averageCompatibility)}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.infoCard} 
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.infoHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.infoIconContainer}>
              <Icon name="help-outline" size={24} color="#6D44FF" />
            </View>
            <Text style={styles.infoTitle}>Como funciona?</Text>
            <Icon 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={24} 
              color="#6D44FF" 
            />
          </View>
        </View>
        {isExpanded && (
          <View>
            <Text style={styles.infoDescription}>
              A compatibilidade total é uma medida de quão bem os dois indivíduos se encaixam em termos de personalidade, valores e expectativas.
            </Text>
            <Text style={styles.infoDescription}>
              Ela é calculada com base em vários aspectos astrológicos, como signos, planetas e ascendentes. É uma média ponderada de todos os aspectos analisados.
            </Text>
            <Text style={styles.infoDescription}>
              Um valor alto indica uma boa compatibilidade, enquanto um valor baixo pode sugerir desafios e dificuldades.
            </Text>
            <Text style={styles.infoDescription}>
              Abaixo estão os aspectos analisados para o cálculo da compatibilidade total.
            </Text>
          </View>
        )}
      </TouchableOpacity>
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
        <Text style={[
          styles.compatibilityValue,
          { 
            color: getCompatibilityColor(item.compatibilidade),
            textShadowColor: `${getCompatibilityColor(item.compatibilidade)}50`
          }
        ]}>
          {item.compatibilidade}%
        </Text>
      </View>
      <View style={styles.cardContent}>
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    backgroundColor: 'rgba(109, 68, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  infoTitle: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
  },
  infoDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 22,
    marginTop: 12,
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
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    backgroundColor: 'rgba(109, 68, 255, 0.15)',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
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


