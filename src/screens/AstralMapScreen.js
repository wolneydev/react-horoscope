import React, { useEffect, useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import StorageService from '../store/store';
import AnimatedStars from '../Components/animation/AnimatedStars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatBirthDate } from '../utils/helpers';
import CustomButton from '../Components/CustomButton';

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

const AstralMapScreen = ({ route }) => {
  const navigation = useNavigation();
  const [astralMap, setAstralMap] = useState(null);
  const [astralMap2, setAstralMap2] = useState(null);
  const [loading, setLoading] = useState(true);

  const memoizedStars = useMemo(() => <AnimatedStars />, []);

  useEffect(() => {
    const loadAstralMap = async () => {
      try {
        let mapData;
        if (route?.params?.astralMap) {
          mapData = route.params.astralMap;
          setAstralMap2(mapData);
        } else {
          mapData = await StorageService.getMyAstralMap();
        }
        if (mapData) {
          setAstralMap(mapData);
        } else {
          console.error('Nenhum mapa astral encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar mapa astral:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAstralMap();
  }, [route?.params?.astralMap]);

  // Função para navegar à tela de Compatibilidade passando os uuids
  const handleCompatibilityPress = async () => {
    try {
      const astralMapData = await StorageService.getMyAstralMap();
       navigation.navigate('CompatibilityScreen', { 
        uuid1: astralMapData.uuid, 
        uuid2: astralMap2.uuid
      });
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
    }
  };

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
      
      {/* Botão Fixo */}
      {astralMap && !astralMap.is_my_astral_map && (
        <View style={styles.stickyButtonContainer}>
          <CustomButton 
            title="Verificar Compatibilidade Astral"
            onPress={handleCompatibilityPress}
            style={styles.stickyButton}
            textStyle={styles.stickyButtonText}
            icon="favorite"
          />
        </View>
      )}

      <View style={[
        styles.mainContainer,
        (!astralMap?.is_my_astral_map) && styles.mainContainerWithButton
      ]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="auto-awesome" size={24} color="#6D44FF" />
            </View>
            <Text style={styles.infoCardTitle}>Mapa Astral de</Text>
            <Text style={styles.infoCardName}>{astralMap.astral_map_name}</Text>
            <Text style={styles.infoCardDescription}>
              O mapa astral, ou carta natal, é um retrato do céu no momento exato do seu nascimento. 
              Ele revela suas características pessoais, talentos naturais e desafios de vida.
            </Text>
            <Text style={styles.infoCardBirthData}>
              {formatBirthDate(astralMap)}
            </Text>
          </View>

          {astralMap?.astral_entities?.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.imageContainer}>
                  <Image source={imageMap[item.sign.name.toLowerCase()]} style={styles.image} />
                </View>
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
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141527',
  },
  mainContainer: {
    flex: 1,
  },
  mainContainerWithButton: {
    marginTop: 70,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stickyButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: '#141527',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(109, 68, 255, 0.2)',
  },
  card: {
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.3)',
  },
  content: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'left',
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
    borderWidth: 1,
    borderColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
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
  infoCardName: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  infoCardBirthData: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'right',
    fontStyle: 'italic',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  infoCardDescription: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  stickyButton: {
    backgroundColor: 'rgba(109, 68, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(109, 68, 255, 0.6)',
  },
  stickyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AstralMapScreen;
