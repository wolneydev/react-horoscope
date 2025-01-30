import React, { useEffect, useState, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, BackHandler, Image } from 'react-native';
import StorageService from '../store/store';
import AnimatedStars from '../Components/animation/AnimatedStars';
import RightMandala from '../Components/mandalas/RightMandala';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mapeamento de imagens baseado nos nomes dos signos
const imageMap = {
  áries: require('../assets/images/sign/aries.jpg'),
  touro: require('../assets/images/sign/taurus.jpg'),
  gêmeos: require('../assets/images/sign/gemini.jpg'),
  câncer: require('../assets/images/sign/cancer.jpg'),
  leão: require('../assets/images/sign/leo.jpg'),
  virgem: require('../assets/images/sign/virgo.jpg'),
  libra: require('../assets/images/sign/libra.jpg'),
  escorpião: require('../assets/images/sign/scorpio.jpg'),
  sagitário: require('../assets/images/sign/sagittarius.jpg'),
  capricórnio: require('../assets/images/sign/capricorn.jpg'),
  aquário: require('../assets/images/sign/aquarius.jpg'),
  peixes: require('../assets/images/sign/pisces.jpg'),
};

const AstralMapScreen = () => {
  const navigation = useNavigation();
  const [astralMap, setAstralMap] = useState(null);
  const [loading, setLoading] = useState(true);

  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        navigation.navigate('HomeScreen');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      return () => backHandler.remove();
    }, [navigation])
  );

  useEffect(() => {
    const loadAstralMap = async () => {
      try {
        const savedAstralMap = await StorageService.getAstralMap();
        setAstralMap(savedAstralMap);
      } catch (error) {
        console.error('Erro ao carregar mapa astral:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAstralMap();
  }, []);

  const renderItem = ({ item }) => {
    const signName = item.sign.name.toLowerCase();
    const imageSource = imageMap[signName];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <Text style={styles.missingImageText}>Imagem não disponível</Text>
          )}
          <View style={styles.headerTexts}>
            <Text style={styles.astroName}>{item.astral_entity.name}</Text>
            <Text style={styles.horoscopeName}>
              {item.sign.name} - {item.degree}º
            </Text>
          </View>
        </View>
        {item.astral_entity.explanation && (
          <Text style={styles.explanation}>{item.astral_entity.explanation}</Text>
        )}        
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  // Componente para o header da FlatList
  const ListHeader = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <Icon name="auto-awesome" size={24} color="#6D44FF" />
      </View>
      <Text style={styles.infoCardTitle}>Mapa Astral</Text>
      <Text style={styles.infoCardDescription}>
        O mapa astral, ou carta natal, é um retrato do céu no momento exato do seu nascimento. 
        Ele revela suas características pessoais, talentos naturais e desafios de vida.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {memoizedStars}
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </View>
    );
  }

  if (!astralMap) {
    return (
      <View style={styles.container}>
        {memoizedStars}
        <View style={[styles.content, styles.centerContent]}>
          <Text style={styles.errorText}>Não foi possível carregar o mapa astral</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {memoizedStars}
      <View style={styles.content}>
        <FlatList
          data={astralMap?.astral_entities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          style={styles.flatList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
    padding: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
  card: {
    marginBottom: 14,
    padding: 20,
    backgroundColor: 'rgba(8, 20, 29, 0.4)',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#FFD700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,    
  },
  headerTexts: {
    flex: 1,
    justifyContent: 'center',
  },
  astroName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  horoscopeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'lightblue',
  },
  explanation: {
    fontSize: 12,
    color: 'lightblue',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  missingImageText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(109, 68, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
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
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
});

export default AstralMapScreen;