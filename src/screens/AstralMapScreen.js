import React, { useEffect, useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import StorageService from '../store/store';
import AnimatedStars from '../Components/animation/AnimatedStars';
import CustomButton from '../Components/CustomButton';
import LoadingOverlay from '../Components/LoadingOverlay';
import EmailVerificationGuard from '../Components/EmailVerificationGuard';
import { COLORS } from '../styles/theme';

// Componentes refatorados
import InfoCard from '../Components/astralmap/InfoCard';
import AstralEntityCard from '../Components/astralmap/AstralEntityCard';

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

  // Usamos useMemo para não recriar a animação constantemente
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
        uuid2: astralMap2.uuid,
      });
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
    }
  };

  if (loading) {
    return (
      <EmailVerificationGuard>
        <View style={styles.container}>
          {memoizedStars}
          <View style={[styles.content, styles.centerContent]}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        </View>
      </EmailVerificationGuard>
    );
  }

  if (!astralMap) {
    return (
      <EmailVerificationGuard>
        <View style={styles.container}>
          {memoizedStars}
          <View style={[styles.content, styles.centerContent]}>
            <Text style={styles.errorText}>Não foi possível carregar o mapa astral</Text>
          </View>
        </View>
      </EmailVerificationGuard>
    );
  }

  return (
    <EmailVerificationGuard>
      <View style={styles.container}>
        {memoizedStars}

        {/* Botão Fixo (só exibe se não for o meu próprio mapa astral) */}
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
            {/* Componente InfoCard */}
            <InfoCard astralMap={astralMap} />

            {/* Lista de entidades astrais (usando AstralEntityCard) */}
            {astralMap?.astral_entities?.map((item) => (
              <AstralEntityCard
                key={item.id}
                item={item}
                imageMap={imageMap}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </EmailVerificationGuard>
  );
};

export default AstralMapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
  content: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
