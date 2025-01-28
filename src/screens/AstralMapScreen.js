import React, { useEffect, useState, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, BackHandler, Image } from 'react-native';
import StorageService from '../store/store';
import Header from '../Components/Header';
import AnimatedStars from '../Components/animation/AnimatedStars';
import RightMandala from '../Components/mandalas/RightMandala';

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

export default function AstralMapScreen() {
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
        <RightMandala/>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} />
        ) : (
          <Text style={styles.missingImageText}>Imagem não disponível</Text>
        )}
        <Text style={styles.horoscopeName}>
          {item.sign.name} - {item.degree}º
        </Text>
        {item.astral_entity.explanation && (
          <Text style={styles.explanation}>{item.astral_entity.explanation}</Text>
        )}        
        <Text style={styles.astroName}>{item.astral_entity.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {memoizedStars}
        <Header />
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
        <Header />
        <View style={[styles.content, styles.centerContent]}>
          <Text style={styles.errorText}>Não foi possível carregar o mapa astral</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {memoizedStars}
      <Header />
      <View style={styles.content}>
        <FlatList
          data={astralMap.astral_entities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          style={styles.flatList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08141d',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
    marginTop: 16,
  },
  card: {
    marginBottom: 6,
    padding: 50,
    backgroundColor: '#141527',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#FFD700',
  },
  astroName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  horoscopeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'lightblue',
    marginBottom: 4,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  missingImageText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
  },
});