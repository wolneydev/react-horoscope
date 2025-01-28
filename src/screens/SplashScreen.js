import React, { useEffect, useMemo} from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import AnimatedStars from '../Components/animation/AnimatedStars';
import Mandala from '../Components/Mandala';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Espera 3 segundos antes de navegar
        setTimeout(() => {
          navigation.replace('HomeScreen');
        }, 3000);
      } catch (error) {
        console.error('Erro ao verificar dados salvos:', error);
      }
    };

    checkInitialRoute();
  }, [navigation]);

  // Memoize AnimatedStars para evitar re-renderização
  const memoStars = useMemo(() => <AnimatedStars />, []);

  return (
    <View style={styles.container}>
      {memoStars}
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Mandala />
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B29',
  },
  content: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 32,
    marginBottom: 10,
    color: 'white',
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sectionDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#E0E0E0',
    textShadowColor: 'gray',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default SplashScreen;
