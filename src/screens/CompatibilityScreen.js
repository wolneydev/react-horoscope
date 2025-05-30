import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import LoadingOverlay from '../Components/LoadingOverlay';
import api from '../services/api';
import StorageService from '../store/store';
import CompatibilityHeader from '../Components/compatibility/CompatibilityHeader';
import CompatibilityItem from '../Components/compatibility/CompatibilityItem';
import { COLORS, SPACING, FONTS } from '../styles/theme';

export default function CompatibilityScreen({ route }) {
  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  // Recebe os dois UUIDs via parâmetros da rota
  const uuid1 = route.params?.uuid1 || '';
  const uuid2 = route.params?.uuid2 || '';

  const [compatibilities, setCompatibilities] = useState([]);
  const [averageCompatibility, setAverageCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Calculando compatibilidade...');
  const [isExpanded, setIsExpanded] = useState(false);

  // Lista de astros e imagens
  const astros = [
    { name: 'Sol', image: require('../assets/images/entities/sun.jpg') },
    { name: 'Ascendente', image: require('../assets/images/entities/ascendant.jpg') },
    { name: 'Descendente', image: require('../assets/images/entities/descendant.jpg') },
    {
      id: '3',
      name: 'Meio do céu',
      image: require('../assets/images/entities/midheaven.jpg'),
    },
    { name: 'Fundo do céu', image: require('../assets/images/entities/nadir.jpg') },
    { name: 'Júpiter', image: require('../assets/images/entities/jupiter.jpg') },
    { name: 'Netuno', image: require('../assets/images/entities/neptune.jpg') },
    { name: 'Saturno', image: require('../assets/images/entities/saturn.jpg') },
    { name: 'Marte', image: require('../assets/images/entities/mars.jpg') },
    { name: 'Vênus', image: require('../assets/images/entities/venus.jpg') },
    { name: 'Mercúrio', image: require('../assets/images/entities/mercury.jpg') },
    { name: 'Urano', image: require('../assets/images/entities/uranus.jpg') },
    { name: 'Plutão', image: require('../assets/images/entities/pluto.jpg') },
    { name: 'Lua', image: require('../assets/images/entities/moon.jpg') },
  ];

  // Busca as compatibilidades entre os dois UUIDs
  const fetchCompatibility = async () => {
    if (!uuid1 || !uuid2) {
      alert('Por favor, insira o código correto');
      return;
    }
    setLoading(true);
    setLoadingMessage('Calculando compatibilidade...');
    
    try {
      const accessToken = await StorageService.getAccessToken();

      setLoadingMessage('Analisando posições planetárias...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await api.post(
        'synastry',
        { map1_uuid: uuid1, map2_uuid: uuid2 },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setLoadingMessage('Processando resultados...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
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

  useEffect(() => {
    if (uuid1 && uuid2) {
      fetchCompatibility();
    }
  }, [uuid1, uuid2]);

  // Funções auxiliares (poderiam ser movidas para outro arquivo se preferir)
  const getCompatibilityColor = (value) => {
    if (value >= 80) return '#00FF00'; // Verde brilhante p/ alta compat.
    if (value >= 60) return '#90EE90'; // Verde claro
    if (value >= 40) return '#FFD700'; // Amarelo
    if (value >= 20) return '#FFA500'; // Laranja
    return '#FF4500'; // Vermelho-laranja
  };

  const getCompatibilityText = (value) => {
    if (value >= 90) {
      return 'União Celestial! Uma conexão extraordinariamente rara.';
    }
    if (value >= 80) {
      return 'Conexão Excepcional! Existe uma harmonia natural.';
    }
    if (value >= 70) {
      return 'Sintonia Elevada! A compatibilidade entre vocês é muito favorável.';
    }
    if (value >= 60) {
      return 'Ótima Compatibilidade! Vocês têm uma conexão positiva.';
    }
    if (value >= 50) {
      return 'Compatibilidade Favorável. Existe um bom equilíbrio entre.';
    }
    if (value >= 40) {
      return 'Compatibilidade Moderada. Existem áreas de harmonia e desafios.';
    }
    if (value >= 30) {
      return 'Compatibilidade Desafiadora. Há aspectos importantes.';
    }
    if (value >= 20) {
      return 'Compatibilidade Complexa. Existem desafios significativos.';
    }
    return 'Compatibilidade Muito Desafiadora. A relação apresenta aspectos.';
  };

  const getAstroImage = (astralEntity) => {
    const astro = astros.find((a) => a.name === astralEntity);
    return astro?.image;
  };

  // Renderiza cada item
  const renderItem = ({ item }) => (
    <CompatibilityItem
      item={item}
      astros={astros}
      getCompatibilityColor={getCompatibilityColor}
      getAstroImage={getAstroImage}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {memoizedStars}
      {loading && <LoadingOverlay message={loadingMessage} />}

      <View style={styles.content}>
        <FlatList
          data={compatibilities}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
          // ListHeaderComponent para exibir o componente de compat. total
          ListHeaderComponent={
            <CompatibilityHeader
              averageCompatibility={averageCompatibility}
              getCompatibilityColor={getCompatibilityColor}
              getCompatibilityText={getCompatibilityText}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LARGE,
    paddingTop: Platform.OS === 'android' ? SPACING.LARGE : 0,
  },
  flatListContent: {
    paddingBottom: SPACING.XLARGE,
    flexGrow: 1,
  },
});
